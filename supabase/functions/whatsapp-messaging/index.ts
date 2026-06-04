// supabase/functions/whatsapp-messaging/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const GRAPH_API_BASE = "https://graph.facebook.com/v25.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DocumentRequest {
  type: "document";
  to: string;
  base64Pdf: string;
  filename: string;
  caption?: string;
  clinicId?: string;
}

interface TemplateRequest {
  type: "template";
  to: string;
  templateName: string;
  doctorId?: string;
  appointmentId?: string;
  patientId?: string;
  clinicId?: string;
  bodyParams?: Array<{ type: "text"; text: string }>;
  buttonParams?: Array<{
    sub_type: "url";
    index: string;
    parameters: Array<{ type: "text"; text: string }>;
  }>;
}

type WhatsAppRequest = DocumentRequest | TemplateRequest;

function normalizeIndianPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  return digits;
}

// ---------------------------------------------------------------------------
// Database helpers
// ---------------------------------------------------------------------------

interface ClinicWhatsAppCredentials {
  phoneNumberId: string;
  token: string;
  status: string;
}

async function resolveClinicCredentials(
  supabase: ReturnType<typeof createClient>,
  clinicId: string,
): Promise<ClinicWhatsAppCredentials | null> {
  const { data, error } = await supabase
    .from("clinic_whatsapp_connections")
    .select("phone_number_id, access_token, status")
    .eq("clinic_id", clinicId)
    .in("status", ["active", "pending_meta_verification"])
    .single();

  if (error || !data) return null;
  return { phoneNumberId: data.phone_number_id, token: data.access_token, status: data.status };
}

async function checkPatientOptOut(
  supabase: ReturnType<typeof createClient>,
  patientId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("patients")
    .select("whatsapp_opt_out")
    .eq("id", patientId)
    .single();

  if (error || !data) return false;
  return data.whatsapp_opt_out === true;
}

async function resolveReviewUrl(
  supabase: ReturnType<typeof createClient>,
  doctorId: string,
): Promise<string | null> {
  const { data: doctor, error: doctorError } = await supabase
    .from("doctors")
    .select("google_place_id, clinic_id")
    .eq("id", doctorId)
    .single();

  if (doctorError || !doctor) return null;

  if (doctor.google_place_id) {
    return `https://search.google.com/local/writereview?placeid=${doctor.google_place_id}`;
  }

  const { data: clinic, error: clinicError } = await supabase
    .from("clinics")
    .select("google_place_id")
    .eq("id", doctor.clinic_id)
    .single();

  if (clinicError || !clinic?.google_place_id) return null;

  return `https://search.google.com/local/writereview?placeid=${clinic.google_place_id}`;
}

// ---------------------------------------------------------------------------
// Media helpers
// ---------------------------------------------------------------------------

function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function uploadMedia(
  phoneNumberId: string,
  token: string,
  pdfBytes: Uint8Array,
  filename: string,
): Promise<string> {
  const formData = new FormData();
  formData.append("messaging_product", "whatsapp");
  formData.append("file", new Blob([pdfBytes], { type: "application/pdf" }), filename);
  formData.append("type", "application/pdf");

  const res = await fetch(`${GRAPH_API_BASE}/${phoneNumberId}/media`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || data?.error?.error_user_msg || "Media upload failed");
  }
  return data.id as string;
}

// ---------------------------------------------------------------------------
// Message senders
// ---------------------------------------------------------------------------

async function sendDocumentMessage(
  phoneNumberId: string,
  token: string,
  to: string,
  mediaId: string,
  filename: string,
  caption?: string,
) {
  const body: Record<string, unknown> = {
    messaging_product: "whatsapp",
    to,
    type: "document",
    document: { id: mediaId, filename },
  };
  if (caption) (body.document as Record<string, unknown>).caption = caption;

  const res = await fetch(`${GRAPH_API_BASE}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || data?.error?.error_user_msg || "Failed to send document");
  }
  return data;
}

async function sendTemplateMessage(
  phoneNumberId: string,
  token: string,
  to: string,
  templateName: string,
  bodyParams?: Array<{ type: "text"; text: string }>,
  buttonParams?: Array<{
    sub_type: "url";
    index: string;
    parameters: Array<{ type: "text"; text: string }>;
  }>,
) {
  const components: Array<Record<string, unknown>> = [];
  if (bodyParams && bodyParams.length > 0) {
    components.push({ type: "body", parameters: bodyParams });
  }
  if (buttonParams && buttonParams.length > 0) {
    components.push({ type: "button", sub_type: "url", index: buttonParams[0].index, parameters: buttonParams[0].parameters });
  }

  const res = await fetch(`${GRAPH_API_BASE}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "template",
      template: {
        name: templateName,
        language: { code: "en_US" },
        components: components.length > 0 ? components : undefined,
      },
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || data?.error?.error_user_msg || "Failed to send template");
  }
  return data;
}

// ---------------------------------------------------------------------------
// Review template handler — auto-constructs review URL, dedup, then sends
// ---------------------------------------------------------------------------

async function handleReviewTemplate(
  supabase: ReturnType<typeof createClient> | null,
  body: TemplateRequest,
): Promise<{
  buttonParams?: TemplateRequest["buttonParams"];
  errorResponse?: Response;
}> {
  // Only auto-construct for review_request templates without explicit button params
  if (body.templateName !== "review_request" || !body.doctorId || body.buttonParams) {
    return { buttonParams: body.buttonParams };
  }

  if (!supabase) {
    return {
      errorResponse: new Response(
        JSON.stringify({ success: false, error: "Server misconfiguration: missing Supabase credentials" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      ),
    };
  }

  const reviewUrl = await resolveReviewUrl(supabase, body.doctorId);
  if (!reviewUrl) {
    return {
      errorResponse: new Response(
        JSON.stringify({ success: false, error: "No Google Place ID found for this doctor or clinic" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      ),
    };
  }

  // Dedup: atomically insert before sending (UNIQUE on patient_id, google_place_id)
  const placeId = new URL(reviewUrl).searchParams.get("placeid");
  if (placeId && body.patientId) {
    const { error: insertError } = await supabase
      .from("review_requests")
      .insert({
        patient_id: body.patientId,
        google_place_id: placeId,
        appointment_id: body.appointmentId,
      });

    if (insertError) {
      if (insertError.code === "23505") {
        return {
          errorResponse: new Response(
            JSON.stringify({ success: false, code: "DUPLICATE_REVIEW_REQUEST", error: "Review request already sent to this patient for this place" }),
            { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } },
          ),
        };
      }
      console.error("Failed to record review_request:", insertError);
    }
  }

  return {
    buttonParams: [{
      sub_type: "url" as const,
      index: "0",
      parameters: [{ type: "text" as const, text: reviewUrl }],
    }],
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isAuthError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const msg = error.message.toLowerCase();
  return msg.includes("(#133010)") ||
    msg.includes("account not registered") ||
    msg.includes("permission") ||
    msg.includes("auth") ||
    msg.includes("unauthorized") ||
    msg.includes("forbidden") ||
    msg.includes("access token") ||
    msg.includes("invalid token") ||
    msg.includes("expired token") ||
    msg.includes("authentication") ||
    msg.includes("credentials") ||
    msg.includes("not authorized") ||
    msg.includes("insufficient permission");
}

// ---------------------------------------------------------------------------
// Outbound message logging
// ---------------------------------------------------------------------------

async function logOutboundMessage(
  supabase: ReturnType<typeof createClient> | null,
  params: {
    clinicId?: string;
    patientId?: string;
    phoneNumberId: string;
    toPhone: string;
    direction: "outbound";
    text: string;
    whatsappMessageId: string;
  },
) {
  if (!supabase || !params.clinicId) return;
  const { error } = await supabase
    .from("whatsapp_messages")
    .insert({
      clinic_id: params.clinicId,
      patient_id: params.patientId || null,
      phone_number_id: params.phoneNumberId,
      from_phone: params.toPhone,
      direction: "outbound",
      text: params.text,
      whatsapp_message_id: params.whatsappMessageId,
      status: "sent",
    });
  if (error) console.error("Failed to log outbound WhatsApp message:", error);
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const supabase = (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY)
      ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
      : null;

    const body: WhatsAppRequest = await req.json();
    if (!body.type || !body.to) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields: type, to" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Resolve credentials: per-clinic takes priority, fall back to env vars
    let token: string;
    let phoneNumberId: string;
    let usedClinicCreds = false;
    const envToken = Deno.env.get("WHATSAPP_ACCESS_TOKEN") || "";
    const envPhoneNumberId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID") || "";

    if (body.clinicId && supabase) {
      const clinicCreds = await resolveClinicCredentials(supabase, body.clinicId);
      if (clinicCreds) {
        if (clinicCreds.status === "pending_meta_verification") {
          return new Response(
            JSON.stringify({ success: false, error: "WhatsApp setup incomplete. Add a payment method and verify your number in the Meta Business dashboard to send messages." }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
        }
        phoneNumberId = clinicCreds.phoneNumberId;
        token = clinicCreds.token;
        usedClinicCreds = true;
      } else {
        return new Response(
          JSON.stringify({ success: false, error: "Clinic has no active WhatsApp connection. Please connect a WhatsApp Business account in clinic settings." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    } else {
      token = envToken;
      phoneNumberId = envPhoneNumberId;
    }

    if (!token || !phoneNumberId) {
      return new Response(
        JSON.stringify({ success: false, error: "WhatsApp not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Check opt-out for template messages
    if (body.type === "template" && body.patientId && supabase) {
      const optedOut = await checkPatientOptOut(supabase, body.patientId);
      if (optedOut) {
        return new Response(
          JSON.stringify({ success: false, error: "Patient has opted out of WhatsApp messages" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    }

    const normalizedTo = normalizeIndianPhone(body.to);

    // --- Document (PDF) ---
    if (body.type === "document") {
      if (!body.base64Pdf || !body.filename) {
        return new Response(
          JSON.stringify({ success: false, error: "Missing required fields: base64Pdf, filename" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      let pdfBytes: Uint8Array;
      try {
        pdfBytes = base64ToUint8Array(body.base64Pdf);
      } catch {
        return new Response(
          JSON.stringify({ success: false, error: "Invalid base64Pdf encoding" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      try {
        const mediaId = await uploadMedia(phoneNumberId, token, pdfBytes, body.filename);
        const result = await sendDocumentMessage(phoneNumberId, token, normalizedTo, mediaId, body.filename, body.caption);

        const docMsgId = result.messages?.[0]?.id;
        await logOutboundMessage(supabase, {
          clinicId: body.clinicId,
          phoneNumberId,
          toPhone: normalizedTo,
          direction: "outbound",
          text: `Document: ${body.filename}${body.caption ? ` - ${body.caption}` : ""}`,
          whatsappMessageId: docMsgId,
        });

        return new Response(
          JSON.stringify({ success: true, messageId: docMsgId }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      } catch (docError) {
        // If clinic token fails with auth error, fall back to env var token
        if (usedClinicCreds && isAuthError(docError) && envToken && envPhoneNumberId) {
          console.warn("Clinic token failed, falling back to env token:", (docError as Error).message);
          const mediaId = await uploadMedia(envPhoneNumberId, envToken, pdfBytes, body.filename);
          const result = await sendDocumentMessage(envPhoneNumberId, envToken, normalizedTo, mediaId, body.filename, body.caption);

          const fbMsgId = result.messages?.[0]?.id;
          await logOutboundMessage(supabase, {
            clinicId: body.clinicId,
            phoneNumberId: envPhoneNumberId,
            toPhone: normalizedTo,
            direction: "outbound",
            text: `Document: ${body.filename}${body.caption ? ` - ${body.caption}` : ""}`,
            whatsappMessageId: fbMsgId,
          });

          return new Response(
            JSON.stringify({ success: true, messageId: fbMsgId, fallback: true }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
        }
        throw docError;
      }
    }

    // --- Template ---
    if (body.type === "template") {
      if (!body.templateName) {
        return new Response(
          JSON.stringify({ success: false, error: "Missing required field: templateName" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      const { buttonParams, errorResponse } = await handleReviewTemplate(supabase, body);
      if (errorResponse) return errorResponse;

      try {
        const result = await sendTemplateMessage(
          phoneNumberId, token, normalizedTo,
          body.templateName, body.bodyParams, buttonParams,
        );

        const tplMsgId = result.messages?.[0]?.id;
        await logOutboundMessage(supabase, {
          clinicId: body.clinicId,
          patientId: body.patientId,
          phoneNumberId,
          toPhone: normalizedTo,
          direction: "outbound",
          text: `Template: ${body.templateName}`,
          whatsappMessageId: tplMsgId,
        });

        return new Response(
          JSON.stringify({ success: true, messageId: tplMsgId }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      } catch (templateError) {
        // If clinic token fails with auth error, fall back to env var token
        if (usedClinicCreds && isAuthError(templateError) && envToken && envPhoneNumberId) {
          console.warn("Clinic token failed, falling back to env token:", (templateError as Error).message);
          const result = await sendTemplateMessage(
            envPhoneNumberId, envToken, normalizedTo,
            body.templateName, body.bodyParams, buttonParams,
          );

          const fbTplMsgId = result.messages?.[0]?.id;
          await logOutboundMessage(supabase, {
            clinicId: body.clinicId,
            patientId: body.patientId,
            phoneNumberId: envPhoneNumberId,
            toPhone: normalizedTo,
            direction: "outbound",
            text: `Template: ${body.templateName}`,
            whatsappMessageId: fbTplMsgId,
          });

          return new Response(
            JSON.stringify({ success: true, messageId: fbTplMsgId, fallback: true }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
        }
        throw templateError;
      }
    }

    return new Response(
      JSON.stringify({ success: false, error: `Unknown type: ${(body as WhatsAppRequest).type}` }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("WhatsApp messaging error:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";

    // Meta configuration / auth errors are client faults, not server faults
    const statusCode = isAuthError(error) || errorMessage.includes("(#133010)") || errorMessage.includes("not registered")
      ? 400
      : 500;

    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: statusCode, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
