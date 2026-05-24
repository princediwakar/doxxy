// POST /api/whatsapp/embedded-signup
//
// Exchanges the OAuth authorization code from Facebook Embedded Signup for an
// access token and stores the clinic's WhatsApp Business Account credentials.

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
    return Response.json({ success: false, error: "Only clinic superadmins can connect WhatsApp" }, { status: 403 });
  }

  let body: { code: string; waba_id: string; phone_number_id: string; business_id?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ success: false, error: "Invalid request body" }, { status: 400 });
  }

  const { code, waba_id, phone_number_id, business_id } = body;

  if (!code || !waba_id || !phone_number_id) {
    return Response.json({ success: false, error: "Missing required fields: code, waba_id, phone_number_id" }, { status: 400 });
  }

  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;

  if (!appId || !appSecret) {
    return Response.json({ success: false, error: "Meta app not configured on server" }, { status: 500 });
  }

  // Exchange the authorization code for an access token
  try {
    const tokenRes = await fetch(
      `${GRAPH_API_BASE}/oauth/access_token?client_id=${appId}&client_secret=${appSecret}&code=${code}`,
      { method: "GET" },
    );

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      console.error("OAuth token exchange failed:", err);
      return Response.json({ success: false, error: "Failed to exchange authorization code" }, { status: 502 });
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token as string;

    if (!accessToken) {
      return Response.json({ success: false, error: "No access token in response" }, { status: 502 });
    }

    // Get the display phone number from the phone_number_id
    let displayPhoneNumber: string | null = null;
    const phoneRes = await fetch(`${GRAPH_API_BASE}/${phone_number_id}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (phoneRes.ok) {
      const phoneData = await phoneRes.json();
      displayPhoneNumber = phoneData.display_phone_number || null;
    }

    // Upsert the clinic WhatsApp connection
    const { error: upsertError } = await supabase
      .from("clinic_whatsapp_connections")
      .upsert({
        clinic_id: clinic.clinic_id,
        waba_id,
        phone_number_id,
        display_phone_number: displayPhoneNumber,
        access_token: accessToken,
        business_id: business_id || null,
        status: "active",
        token_expires_at: null, // System user tokens from ES don't expire
        updated_at: new Date().toISOString(),
      }, {
        onConflict: "clinic_id",
      });

    if (upsertError) {
      console.error("Failed to store WhatsApp connection:", upsertError);
      return Response.json({ success: false, error: "Failed to store connection" }, { status: 500 });
    }

    return Response.json({
      success: true,
      phone_number: displayPhoneNumber,
    });
  } catch (error) {
    console.error("Embedded signup error:", error);
    return Response.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
