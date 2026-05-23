// lib/voice/streamingStt.ts
//
// Real-time streaming STT via Sarvam WebSocket (Saaras v3).
//
// AUTH NOTE: The Sarvam WS endpoint requires "Api-Subscription-Key" as an
// HTTP *header* on the handshake request. Browsers cannot set custom headers
// on a WebSocket connection. We therefore proxy through our own Next.js WS
// route (/api/voice/stt-proxy) which attaches the key server-side before
// forwarding to Sarvam. The query params (language, model, VAD options) are
// passed through the proxy URL so the proxy can forward them verbatim.
//
// Wire protocol (source: https://docs.sarvam.ai/api-reference-docs/speech-to-text/transcribe/ws)
//
//   CLIENT → SERVER  (audio chunk):
//     {
//       "audio": {
//         "data": "<base64-encoded PCM>",
//         "sample_rate": "16000",
//         "encoding": "audio/wav"
//       }
//     }
//
//   CLIENT → SERVER  (flush — force-process buffered audio immediately):
//     { "type": "flush" }
//
//   SERVER → CLIENT  (transcript):
//     {
//       "type": "data",
//       "data": {
//         "request_id": "...",
//         "transcript": "...",
//         "metrics": { "audio_duration": 1.1, "processing_latency": 1.1 }
//       }
//     }
//
//   SERVER → CLIENT  (VAD events, only when vad_signals=true):
//     { "type": "events", "data": { "signal_type": "speech_start" | "speech_end" } }
//
//   SERVER → CLIENT  (error):
//     { "type": "error", "data": { "error": "...", "code": "..." } }

import { logger } from "@/lib/logger";

const STT_PROXY_PATH = "/api/voice/stt-proxy";

// ─── Public types ────────────────────────────────────────────────────────────

export interface StreamingSttCallbacks {
  onOpen?: () => void;
  onTranscript: (text: string, isFinal: boolean) => void;
  onError: (error: Error) => void;
  onClose: (code: number, reason: string) => void;
}

export interface StreamingSttConnection {
  /** Send a raw PCM (Int16) audio chunk. Buffered if socket not yet open. */
  send: (audioChunk: ArrayBuffer) => void;
  /** Force-flush the server-side buffer — call just before close() for clean
   *  final-utterance processing. */
  flush: () => void;
  /** Graceful shutdown: flush → close(1000). Safe to call multiple times. */
  close: () => void;
  pause: () => void;
  resume: () => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 8192;
  const parts: string[] = [];
  for (let i = 0; i < bytes.length; i += chunkSize) {
    parts.push(String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunkSize)) as number[]));
  }
  return btoa(parts.join(""));
}

// ─── Ticket fetching ──────────────────────────────────────────────────────────
//
// Before opening the WebSocket, the client calls POST /api/voice/stt-ticket
// (JWT in the standard Authorization header) to obtain a short-lived ticket.
// Only this ticket — not the raw JWT — is placed in the WebSocket URL.

async function fetchSttTicket(): Promise<string> {
  const res = await fetch("/api/voice/stt-ticket", { method: "POST" });
  if (!res.ok) {
    throw new Error(`Failed to fetch STT ticket: ${res.status}`);
  }
  const { ticket } = await res.json();
  if (!ticket) {
    throw new Error("No ticket in STT ticket response");
  }
  return ticket as string;
}

function buildProxyUrl(ticket: string): string {
  const params = new URLSearchParams({
    "language-code": "en-IN",
    model: "saaras:v3",
    mode: "transcribe",
    sample_rate: "16000",
    input_audio_codec: "pcm_s16le",
    high_vad_sensitivity: "true",
    vad_signals: "true",
    flush_signal: "true",
  });

  params.set("ticket", ticket);

  const wsProto = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${wsProto}//${window.location.host}${STT_PROXY_PATH}?${params.toString()}`;
}

// ─── Factory ─────────────────────────────────────────────────────────────────

export function createStreamingSttConnection(
  callbacks: StreamingSttCallbacks,
): StreamingSttConnection {
  let socket: WebSocket | null = null;
  let paused = false;
  let closed = false;

  // Chunks that arrive while the socket is still in CONNECTING state
  const preOpenQueue: ArrayBuffer[] = [];

  // ── Internal send helpers ──────────────────────────────────────────────────

  function sendRaw(payload: object) {
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(payload));
    }
  }

  function sendChunk(chunk: ArrayBuffer) {
    sendRaw({
      audio: {
        data: arrayBufferToBase64(chunk),
        sample_rate: "16000",
        encoding: "audio/wav",
      },
    });
  }

  function drainQueue() {
    while (preOpenQueue.length > 0 && socket?.readyState === WebSocket.OPEN) {
      sendChunk(preOpenQueue.shift()!);
    }
  }

  // ── WebSocket lifecycle ────────────────────────────────────────────────────

  async function connect() {
    let ticket: string;
    try {
      ticket = await fetchSttTicket();
    } catch (err) {
      logger.error("[streamingStt] failed to fetch auth ticket, aborting connect");
      callbacks.onError(new Error("Failed to authenticate STT connection"));
      return;
    }

    if (closed) return;

    const ws = new WebSocket(buildProxyUrl(ticket));
    socket = ws;

    ws.onopen = () => {
      logger.log("[streamingStt] connected");
      callbacks.onOpen?.();
      drainQueue();
    };

    ws.onmessage = (event: MessageEvent) => {
      let msg: { type: string; data?: Record<string, unknown> };
      try {
        msg = JSON.parse(event.data as string);
      } catch {
        logger.warn("[streamingStt] unparseable message, ignoring");
        return;
      }

      switch (msg.type) {
        case "data": {
          const transcript = msg.data?.transcript;
          if (typeof transcript === "string" && transcript.trim()) {
            callbacks.onTranscript(transcript.trim(), /* isFinal */ true);
          }
          break;
        }

        case "events": {
          // VAD signals — useful for future UI polish (e.g. mic animation)
          logger.log(`[streamingStt] VAD: ${msg.data?.signal_type}`);
          break;
        }

        case "error": {
          const errMsg = (msg.data?.error as string) ?? "Unknown Sarvam error";
          const errCode = (msg.data?.code as string) ?? "";
          logger.error(`[streamingStt] server error [${errCode}]: ${errMsg}`);
          if (!closed) {
            callbacks.onError(new Error(`Sarvam STT [${errCode}]: ${errMsg}`));
          }
          break;
        }

        default:
          logger.warn(`[streamingStt] unknown message type "${msg.type}"`);
      }
    };

    ws.onerror = () => {
      // The browser intentionally withholds error details from onerror.
      // onclose fires immediately after with code + reason — handle it there.
      logger.error("[streamingStt] socket error — see onclose for detail");
    };

    ws.onclose = (event: CloseEvent) => {
      socket = null;

      const reason =
        event.reason?.trim() ||
        (event.code === 1006
          ? "Abnormal closure (network drop or server reject)"
          : `Code ${event.code}`);

      logger.log(
        `[streamingStt] closed: ${event.code} "${reason}" clean=${event.wasClean}`,
      );

      if (!closed) {
        closed = true;
        if (!event.wasClean) {
          callbacks.onError(
            new Error(`STT connection closed unexpectedly: ${reason}`),
          );
        }
        callbacks.onClose(event.code, reason);
      }
    };

    return ws;
  }

  connect();

  // ── Public interface ───────────────────────────────────────────────────────

  return {
    send(audioChunk: ArrayBuffer) {
      if (paused || closed) return;

      if (!socket || socket.readyState === WebSocket.CONNECTING) {
        preOpenQueue.push(audioChunk);
        return;
      }

      if (socket.readyState === WebSocket.OPEN) {
        if (socket.bufferedAmount > 256 * 1024) {
          logger.warn("[streamingStt] dropping chunk to prevent memory bloat");
          return;
        }
        sendChunk(audioChunk);
      }
    },

    flush() {
      if (closed) return;
      sendRaw({ type: "flush" });
    },

    close() {
      if (closed) return;
      closed = true;
      preOpenQueue.length = 0;
      if (socket && socket.readyState === WebSocket.OPEN) {
        // Flush first so the server processes any buffered audio before we hang up
        socket.send(JSON.stringify({ type: "flush" }));
        socket.close(1000, "User stopped dictation");
      }
    },

    pause() {
      paused = true;
    },

    resume() {
      paused = false;
      drainQueue();
    },
  };
}