// /api/webhooks/whatsapp
//
// Meta WhatsApp Cloud API webhook handler.
// GET:  Webhook verification (Meta calls this when registering the webhook URL).
// POST: Incoming message notifications — delivery status, opt-out requests, etc.

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { normalizeIndianPhone } from "@/lib/utils";

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient<Database>(url, key);
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;
  if (!verifyToken) {
    return new Response("Webhook verify token not configured", { status: 500 });
  }

  if (mode === "subscribe" && token === verifyToken && challenge) {
    return new Response(challenge, { status: 200, headers: { "Content-Type": "text/plain" } });
  }

  return new Response("Forbidden", { status: 403 });
}

interface WebhookValue {
  messaging_product: string;
  metadata: { display_phone_number: string; phone_number_id: string };
  messages?: Array<{
    from: string;
    id: string;
    type: "text" | "interactive" | "button" | "order";
    text?: { body: string };
    interactive?: {
      type: "button_reply";
      button_reply: { id: string; title: string };
    };
  }>;
  statuses?: Array<{
    id: string;
    status: "sent" | "delivered" | "read" | "failed";
    timestamp: string;
  }>;
}

export async function POST(req: Request) {
  const supabase = getServiceClient();
  if (!supabase) {
    return new Response("Server misconfiguration", { status: 500 });
  }

  let body: { entry?: Array<{ changes?: Array<{ value?: WebhookValue }> }> };
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid body", { status: 400 });
  }

  if (!body.entry) {
    return new Response("OK", { status: 200 });
  }

  for (const entry of body.entry) {
    if (!entry.changes) continue;
    for (const change of entry.changes) {
      const value = change.value;
      if (!value) continue;

      // Skip status updates (delivery receipts) — no action needed for now
      if (value.statuses) continue;

      // Process incoming messages for opt-out
      if (value.messages) {
        const phoneNumberId = value.metadata?.phone_number_id;
        if (!phoneNumberId) continue;

        for (const msg of value.messages) {
          const isOptOut = detectOptOut(msg);
          if (!isOptOut) continue;

          const normalizedPhone = normalizeIndianPhone(msg.from);

          // Find the clinic by phone_number_id and update patient opt-out
          const { data: connection } = await supabase
            .from("clinic_whatsapp_connections")
            .select("clinic_id")
            .eq("phone_number_id", phoneNumberId)
            .eq("status", "active")
            .single();

          if (!connection) continue;

          // Try matching with and without country code prefix
          await supabase
            .from("patients")
            .update({ whatsapp_opt_out: true })
            .eq("clinic_id", connection.clinic_id)
            .or(`phone.eq.${normalizedPhone},phone.eq.${msg.from},phone.eq.${msg.from.replace(/\D/g, "")}`)
            .not("phone", "is", null);

          console.log(`Opt-out processed: ${msg.from} for clinic ${connection.clinic_id}`);
        }
      }
    }
  }

  return new Response("OK", { status: 200 });
}

function detectOptOut(msg: { type: string; text?: { body: string }; interactive?: { button_reply?: { id?: string; title?: string } } }): boolean {
  // Text message containing stop keywords
  if (msg.type === "text" && msg.text?.body) {
    const body = msg.text.body.trim().toLowerCase();
    const stopWords = ["stop", "unsubscribe", "cancel", "opt out", "opt-out", "no thanks", "don't send"];
    return stopWords.some((w) => body === w || body.startsWith(w));
  }

  // Interactive button reply (e.g. "Stop reminders" quick reply)
  if (msg.type === "interactive" && msg.interactive?.button_reply) {
    const title = msg.interactive.button_reply.title?.toLowerCase() || "";
    const id = msg.interactive.button_reply.id?.toLowerCase() || "";
    return title.includes("stop") || id.includes("stop") || title.includes("unsubscribe");
  }

  return false;
}

export const dynamic = "force-dynamic";
