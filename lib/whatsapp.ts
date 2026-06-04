// Shared WhatsApp messaging client — eliminates fetch boilerplate across callers.

type SendDocumentBody = {
  type: "document";
  to: string | null;
  base64Pdf: string;
  filename: string;
  caption?: string;
  clinicId?: string;
  patientId?: string;
};

type SendTemplateBody = {
  type: "template";
  to: string | null;
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
};

export type WhatsAppMessageBody = SendDocumentBody | SendTemplateBody;

export interface WhatsAppResult {
  success: boolean;
  messageId?: string;
  code?: string;
  error?: string;
  statusCode: number;
}

const FUNCTION_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/whatsapp-messaging`;

export async function sendWhatsAppMessage(
  body: WhatsAppMessageBody,
): Promise<WhatsAppResult> {
  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  return { ...json, statusCode: res.status };
}

/** Detects Meta Graph API errors that indicate the WhatsApp Business Account
 * is not fully registered/verified — these are client configuration faults,
 * not transient server errors. */
export function isMetaConfigError(result: WhatsAppResult): boolean {
  if (result.success) return false;
  const msg = (result.error || "").toLowerCase();
  return msg.includes("(#133010)") ||
    msg.includes("account not registered") ||
    msg.includes("not registered") ||
    msg.includes("whatsapp setup incomplete") ||
    msg.includes("verify your number");
}
