// server.ts
//
// Custom Next.js server with WebSocket proxy for Sarvam STT.
//
// WHY A CUSTOM SERVER:
//   Next.js 16 App Router (and Pages Router) do not expose the HTTP server's
//   `upgrade` event to route handlers. The Sarvam STT endpoint requires an
//   `Api-Subscription-Key` header that browsers cannot set on WebSocket
//   connections. This proxy intercepts the WS upgrade before Next.js routing,
//   opens a second WS to Sarvam with the key, and bidirectionally relays
//   application-level messages between browser and Sarvam.
//
//   Using the `ws` library on both ends means proper WebSocket frame
//   encoding/decoding — no manual frame parsing needed.

import { createServer } from "node:http";
import { parse } from "node:url";
import next from "next";
import { WebSocketServer, WebSocket } from "ws";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = Number.parseInt(process.env.PORT || "3000", 10);

const SARVAM_WS_URL = "wss://api.sarvam.ai/speech-to-text/ws";
const PROXY_PATH = "/api/voice/stt-proxy";

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

function log(msg: string) {
  const ts = new Date().toISOString().split("T")[1]?.slice(0, 12) ?? "";
  console.log(`[stt-proxy ${ts}] ${msg}`);
}

app.prepare().then(() => {
  const server = createServer(handle);

  const wss = new WebSocketServer({ noServer: true });

  // ── WebSocket upgrade interceptor ──────────────────────────────────────────
  server.on("upgrade", (req, socket, head) => {
    const url = new URL(req.url || "/", `http://${hostname}:${port}`);

    if (url.pathname !== PROXY_PATH) {
      // Let Next.js handle other upgrade requests (HMR uses WS)
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

    // Build Sarvam WS URL — forward query params verbatim
    const sarvamUrl = new URL(SARVAM_WS_URL);
    url.searchParams.forEach((value, key) => {
      sarvamUrl.searchParams.set(key, value);
    });

    log(`upgrade request — forwarding to Sarvam`);

    wss.handleUpgrade(req, socket, head, (browserWs) => {
      log("browser connected, opening Sarvam connection");

      const sarvamWs = new WebSocket(sarvamUrl.toString(), {
        headers: { "Api-Subscription-Key": apiKey },
      });

      // ── Sarvam → Browser ──────────────────────────────────────────────────
      sarvamWs.on("message", (data: Buffer) => {
        if (browserWs.readyState === WebSocket.OPEN) {
          browserWs.send(data.toString());
        }
      });

      sarvamWs.on("error", (err) => {
        log(`Sarvam WS error: ${err.message}`);
        if (browserWs.readyState === WebSocket.OPEN) {
          browserWs.close(1011, "Upstream error");
        }
      });

      sarvamWs.on("close", (code, reason) => {
        log(`Sarvam closed: ${code} "${reason}"`);
        if (browserWs.readyState === WebSocket.OPEN) {
          browserWs.close(code, reason.toString());
        }
      });

      // ── Browser → Sarvam ──────────────────────────────────────────────────
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
        log(`Browser closed: ${code} "${reason}"`);
        if (sarvamWs.readyState === WebSocket.OPEN) {
          sarvamWs.close(1000, "Client disconnected");
        }
      });
    });
  });

  server.on("error", (err) => {
    console.error("[server] Fatal:", err);
    process.exit(1);
  });

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
    if (dev) console.log(`> STT proxy: ws://${hostname}:${port}${PROXY_PATH}`);
  });
});
