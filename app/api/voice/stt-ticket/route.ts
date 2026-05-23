// POST /api/voice/stt-ticket
//
// Issues a short-lived, single-use ticket for WebSocket STT proxy authentication.
// The client passes this ticket (not the raw JWT) in the WebSocket query string.
//
// Tickets are HMAC-signed with a 30-second TTL — no database storage needed,
// and the proxy can verify them without a roundtrip to Supabase.

import { createHmac } from "node:crypto";
import { createServerSupabase } from "@/integrations/supabase/server";

const TICKET_TTL_SECONDS = 30;

function signTicket(payload: { uid: string; exp: number }): string {
  const secret = process.env.SARVAM_API_KEY;
  if (!secret) throw new Error("SARVAM_API_KEY not configured");

  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", secret).update(data).digest("base64url");
  return `${data}.${sig}`;
}

export async function POST() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = {
    uid: user.id,
    exp: Math.floor(Date.now() / 1000) + TICKET_TTL_SECONDS,
  };

  const ticket = signTicket(payload);

  return Response.json({ ticket });
}
