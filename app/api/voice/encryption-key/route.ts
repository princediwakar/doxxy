// app/api/voice/encryption-key/route.ts
//
// POST — returns a deterministic seed used to derive the Key Encryption Key
// (KEK) for wrapping/unwrapping the Data Encryption Key (DEK).
//
// The seed is HMAC-SHA256(user.id, server_secret). The same user always
// produces the same seed, enabling DEK recovery across sessions.
//
// Auth is cookie-based (same as stt-ticket) — the browser sends Supabase
// session cookies automatically on same-origin fetch.
//
// If the session is invalid or expired → 401. The client will generate a
// new DEK and clean up unrecoverable ciphertext from IndexedDB.

import { createServerSupabase } from "@/integrations/supabase/server";

export async function POST(): Promise<Response> {
  const supabase = await createServerSupabase();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const encoder = new TextEncoder();
  const secret = process.env.SUPABASE_SECRET_KEY!;

  const keyData = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign(
    { name: "HMAC", hash: "SHA-256" },
    keyData,
    encoder.encode(`user:${user.id}`),
  );
  const seed = Buffer.from(sig).toString("base64");

  return Response.json({ seed });
}
