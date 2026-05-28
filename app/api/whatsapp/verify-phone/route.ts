// POST /api/whatsapp/verify-phone
//
// Completes phone number registration by verifying the SMS code Meta sent.

import { createServerSupabase } from "@/integrations/supabase/server";
import { getActiveClinic } from "@/lib/auth-server";

const GRAPH_API_BASE = "https://graph.facebook.com/v25.0";

export async function POST(req: Request) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const clinic = await getActiveClinic(user.id);
  if (!clinic || clinic.role !== "superadmin") {
    return Response.json({ success: false, error: "Only clinic superadmins can verify the phone" }, { status: 403 });
  }

  let body: { code: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ success: false, error: "Invalid request body" }, { status: 400 });
  }

  if (!body.code || body.code.length !== 6) {
    return Response.json({ success: false, error: "A 6-digit verification code is required" }, { status: 400 });
  }

  // Look up the clinic's WhatsApp connection
  const { data: connection, error: connError } = await supabase
    .from("clinic_whatsapp_connections")
    .select("phone_number_id, access_token")
    .eq("clinic_id", clinic.clinic_id)
    .single();

  if (connError || !connection) {
    return Response.json({ success: false, error: "No WhatsApp connection found. Connect WhatsApp first." }, { status: 400 });
  }

  const { phone_number_id, access_token } = connection;

  // Verify the code with Meta
  try {
    const verifyRes = await fetch(
      `${GRAPH_API_BASE}/${phone_number_id}/verify_code`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          code: body.code,
        }),
      },
    );

    const verifyData = await verifyRes.json();

    if (!verifyRes.ok) {
      return Response.json({
        success: false,
        error: verifyData?.error?.error_user_msg || verifyData?.error?.message || "Verification failed",
      }, { status: 400 });
    }

    // Re-check phone status — if name is also approved, promote to active
    try {
      const phoneRes = await fetch(
        `${GRAPH_API_BASE}/${phone_number_id}?fields=name_status,quality_rating`,
        { headers: { Authorization: `Bearer ${access_token}` } },
      );
      if (phoneRes.ok) {
        const phoneData = await phoneRes.json();
        const nameApproved = phoneData.name_status === "APPROVED";
        if (nameApproved) {
          await supabase
            .from("clinic_whatsapp_connections")
            .update({
              status: "active",
              quality_rating: phoneData.quality_rating || null,
              updated_at: new Date().toISOString(),
            })
            .eq("clinic_id", clinic.clinic_id);
        }
      }
    } catch (err) {
      console.error("Failed to re-check phone status after verification:", err);
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Phone verification error:", error);
    return Response.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
