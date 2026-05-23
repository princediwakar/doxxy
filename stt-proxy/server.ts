// server.ts — Standalone WebSocket proxy for Sarvam STT
//
// Deploy to Render (or any Node.js host) alongside the Vercel-hosted Next.js app.
//
// Flow:
//   1. Browser gets an HMAC-signed ticket from the Next.js /api/voice/stt-ticket route
//   2. Browser opens a WebSocket to this proxy, passing the ticket as a query param
//   3. Proxy verifies the ticket, then opens a WS to Sarvam with the Api-Subscription-Key header
//   4. Proxy relays messages bidirectionally between browser and Sarvam
//
// WHY A SEPARATE SERVICE:
//   Vercel's serverless architecture cannot handle WebSocket upgrades. Sarvam's STT
//   endpoint requires an Api-Subscription-Key header that browsers cannot set on
//   WebSocket handshakes. This proxy bridges the gap.

import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { parse } from "node:url";
import { createHmac, timingSafeEqual } from "node:crypto";
import { WebSocketServer, WebSocket } from "ws";

const PORT = Number.parseInt(process.env.PORT || "3001", 10);
const SARVAM_WS_URL = "wss://api.sarvam.ai/speech-to-text/ws";
const PROXY_PATH = "/api/voice/stt-proxy";
const TICKET_TTL_SECONDS = 30;

function log(msg: string) {
  const ts = new Date().toISOString().split("T")[1]?.slice(0, 12) ?? "";
  console.log(`[stt-proxy ${ts}] ${msg}`);
}

// ── Ticket verification ────────────────────────────────────────────────────────
// Mirrors the logic in app/api/voice/stt-ticket/route.ts

function verifyTicket(ticket: string): { uid: string } | null {
  try {
    const lastDot = ticket.lastIndexOf(".");
    if (lastDot === -1) return null;

    const data = ticket.slice(0, lastDot);
    const sig = ticket.slice(lastDot + 1);

    const secret = process.env.SARVAM_API_KEY;
    if (!secret) return null;

    const expectedSig = createHmac("sha256", secret)
      .update(data)
      .digest("base64url");
    if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) {
      return null;
    }

    const payload = JSON.parse(
      Buffer.from(data, "base64url").toString("utf8"),
    );
    if (!payload.uid || typeof payload.exp !== "number") return null;

    if (Date.now() / 1000 > payload.exp) {
      log("ticket expired");
      return null;
    }

    return { uid: payload.uid };
  } catch {
    return null;
  }
}

// ── Health check ────────────────────────────────────────────────────────────────
// Render pings this to determine service health. Also useful for cron-job.org
// keep-warm pings.

function healthCheck(_req: IncomingMessage, res: ServerResponse) {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ status: "ok", timestamp: Date.now() }));
}

// ── Server ──────────────────────────────────────────────────────────────────────

const server = createServer((req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

  // CORS headers for health check
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === "GET" && url.pathname === "/health") {
    healthCheck(req, res);
    return;
  }

  // Everything else → 404
  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Not Found");
});

const wss = new WebSocketServer({ noServer: true });

// ── WebSocket upgrade handler ───────────────────────────────────────────────────

server.on("upgrade", (req, socket, head) => {
  const url = new URL(
    req.url || "/",
    `http://${req.headers.host || "localhost"}`,
  );

  if (url.pathname !== PROXY_PATH) {
    socket.write("HTTP/1.1 404 Not Found\r\nContent-Length: 0\r\n\r\n");
    socket.destroy();
    return;
  }

  const apiKey = process.env.SARVAM_API_KEY;
  if (!apiKey) {
    log("SARVAM_API_KEY not set — rejecting upgrade");
    socket.write(
      "HTTP/1.1 500 Internal Server Error\r\nContent-Length: 0\r\n\r\n",
    );
    socket.destroy();
    return;
  }

  const ticket = url.searchParams.get("ticket");
  if (!ticket) {
    log("Missing ticket — rejecting upgrade");
    socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
    socket.destroy();
    return;
  }

  const ticketPayload = verifyTicket(ticket);
  if (!ticketPayload) {
    log("Invalid or expired ticket — rejecting upgrade");
    socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
    socket.destroy();
    return;
  }

  log(`ticket valid for user ${ticketPayload.uid}`);

  // Remove ticket from URL before forwarding to Sarvam
  url.searchParams.delete("ticket");

  // Build Sarvam WS URL with all remaining query params forwarded verbatim
  const sarvamUrl = new URL(SARVAM_WS_URL);
  url.searchParams.forEach((value, key) => {
    sarvamUrl.searchParams.set(key, value);
  });

  wss.handleUpgrade(req, socket, head, (browserWs) => {
    log("browser connected, opening Sarvam connection");

    const sarvamWs = new WebSocket(sarvamUrl.toString(), {
      headers: { "Api-Subscription-Key": apiKey },
    });

    // ── Sarvam → Browser ──────────────────────────────────────────────────────
    sarvamWs.on("message", (data: Buffer) => {
      if (browserWs.readyState === WebSocket.OPEN) {
        browserWs.send(data.toString());
        if (browserWs.bufferedAmount > 512 * 1024) {
          sarvamWs.pause();
          browserWs.once("drain", () => {
            sarvamWs.resume();
          });
        }
      }
    });

    sarvamWs.on("error", (err) => {
      log(`Sarvam WS error: ${err.message}`);
      if (browserWs.readyState === WebSocket.OPEN) {
        browserWs.close(1011, "Upstream error");
      }
    });

    sarvamWs.on("close", (code, reason) => {
      log(`Sarvam closed: ${code} "${reason.toString()}"`);
      if (browserWs.readyState === WebSocket.OPEN) {
        browserWs.close(code, reason.toString());
      }
    });

    // ── Browser → Sarvam ──────────────────────────────────────────────────────
    browserWs.on("message", (data: Buffer) => {
      if (sarvamWs.readyState === WebSocket.OPEN) {
        sarvamWs.send(data.toString());
      }
    });

    browserWs.on("error", (err) => {
      log(`Browser WS error: ${err.message}`);
      if (sarvamWs.readyState === WebSocket.OPEN) {
        sarvamWs.close(1011, "Client error");
      }
    });

    browserWs.on("close", (code, reason) => {
      log(`Browser closed: ${code} "${reason.toString()}"`);
      if (sarvamWs.readyState === WebSocket.OPEN) {
        sarvamWs.close(1000, "Client disconnected");
      }
    });
  });
});

server.on("error", (err) => {
  console.error("[stt-proxy] Fatal:", err);
  process.exit(1);
});

server.listen(PORT, () => {
  console.log(`[stt-proxy] Listening on port ${PORT}`);
  console.log(`[stt-proxy] Health: http://localhost:${PORT}/health`);
  console.log(`[stt-proxy] Proxy: ws://localhost:${PORT}${PROXY_PATH}`);
});
