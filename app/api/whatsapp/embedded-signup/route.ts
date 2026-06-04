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

  let body: { code: string; waba_id: string; phone_number_id: string; business_id?: string; redirect_uri?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ success: false, error: "Invalid request body" }, { status: 400 });
  }

  const { code, waba_id: bodyWabaId, phone_number_id: bodyPhoneNumberId, business_id, redirect_uri } = body;

  if (!code) {
    return Response.json({ success: false, error: "Missing required field: code" }, { status: 400 });
  }

  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;

  if (!appId || !appSecret) {
    return Response.json({ success: false, error: "Meta app not configured on server" }, { status: 500 });
  }

  // Exchange the authorization code for an access token
  try {
    // JS SDK popup: redirect_uri must be present but empty (redirect_uri=).
    // Fallback redirect: must be the exact page URL byte-for-byte.
    const tokenParams = new URLSearchParams({
      client_id: appId,
      client_secret: appSecret,
      code,
      redirect_uri: redirect_uri || "",
    });

    // DEBUG CHECKPOINT 1: exact payload being sent to Meta
    console.log("========================================");
    console.log("🔥 [DEBUG] OUTGOING TOKEN EXCHANGE TO META:");
    console.log(`URL: ${GRAPH_API_BASE}/oauth/access_token`);
    console.log(`PAYLOAD: ${tokenParams.toString()}`);
    console.log("========================================");

    const tokenRes = await fetch(
      `${GRAPH_API_BASE}/oauth/access_token?${tokenParams.toString()}`,
    );

    if (!tokenRes.ok) {
      // DEBUG CHECKPOINT 2: exact raw error from Meta
      const errText = await tokenRes.text();
      console.error("========================================");
      console.error("❌ [FATAL] META REJECTED THE EXCHANGE:");
      console.error(`RAW RESPONSE: ${errText}`);
      console.error("========================================");
      return Response.json({ success: false, error: `Failed to exchange authorization code: ${errText}` }, { status: 502 });
    }

    const tokenData = await tokenRes.json();
    const shortLivedToken = tokenData.access_token as string;

    if (!shortLivedToken) {
      return Response.json({ success: false, error: "No access token in response" }, { status: 502 });
    }

    // Exchange short-lived token for a long-lived token (~60 days)
    const longLivedParams = new URLSearchParams({
      grant_type: "fb_exchange_token",
      client_id: appId,
      client_secret: appSecret,
      fb_exchange_token: shortLivedToken,
    });

    const longLivedRes = await fetch(
      `${GRAPH_API_BASE}/oauth/access_token?${longLivedParams.toString()}`,
    );

    let accessToken = shortLivedToken;
    let tokenExpiresAt: string | null = null;

    if (longLivedRes.ok) {
      const longLivedData = await longLivedRes.json();
      if (longLivedData.access_token) {
        accessToken = longLivedData.access_token as string;
        if (longLivedData.expires_in) {
          const expiresInSeconds = Number(longLivedData.expires_in);
          if (!Number.isNaN(expiresInSeconds)) {
            tokenExpiresAt = new Date(Date.now() + expiresInSeconds * 1000).toISOString();
          }
        }
      }
    }

    let waba_id = bodyWabaId || "";
    let phone_number_id = bodyPhoneNumberId || "";
    let displayPhoneNumber: string | null = null;

    // If waba_id or phone_number_id missing (fallback redirect case), resolve via Graph API
    if (!waba_id || !phone_number_id) {
      try {
        const accountsRes = await fetch(
          `${GRAPH_API_BASE}/me/assigned_whatsapp_business_accounts`,
          { headers: { Authorization: `Bearer ${accessToken}` } },
        );
        if (accountsRes.ok) {
          const accountsData = await accountsRes.json();
          const account = accountsData.data?.[0];
          if (account) {
            waba_id = waba_id || account.id;

            const phonesRes = await fetch(
              `${GRAPH_API_BASE}/${waba_id}/phone_numbers`,
              { headers: { Authorization: `Bearer ${accessToken}` } },
            );
            if (phonesRes.ok) {
              const phonesData = await phonesRes.json();
              const phone = phonesData.data?.[0];
              if (phone) {
                phone_number_id = phone_number_id || phone.id;
                displayPhoneNumber = phone.display_phone_number || null;
              }
            }
          }
        }
      } catch (err) {
        console.error("WABA lookup failed:", err);
      }
    }

    if (!waba_id || !phone_number_id) {
      return Response.json({
        success: false,
        error: "Could not resolve WhatsApp Business Account. Please try connecting again.",
      }, { status: 400 });
    }

    // Fetch phone details: display number, verification status, name approval, quality
    let phoneVerified = false;
    let nameApproved = false;
    let qualityRating: string | null = null;

    const phoneRes = await fetch(
      `${GRAPH_API_BASE}/${phone_number_id}?fields=display_phone_number,code_verification_status,name_status,quality_rating`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    if (phoneRes.ok) {
      const phoneData = await phoneRes.json();
      displayPhoneNumber = phoneData.display_phone_number || displayPhoneNumber || null;
      phoneVerified = phoneData.code_verification_status === "VERIFIED";
      nameApproved = phoneData.name_status === "APPROVED";
      qualityRating = phoneData.quality_rating || null;
    }

    // Only activate if Meta has fully approved the phone number
    const connectionStatus = (phoneVerified && nameApproved) ? "active" : "pending_meta_verification";

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
        status: connectionStatus,
        quality_rating: qualityRating,
        token_expires_at: tokenExpiresAt,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: "clinic_id",
      });

    if (upsertError) {
      console.error("Failed to store WhatsApp connection:", upsertError);
      return Response.json({ success: false, error: "Failed to store connection" }, { status: 500 });
    }

    // Only request verification code if phone is not yet verified
    let needsVerification = false;
    if (!phoneVerified) {
      try {
        const codeRes = await fetch(
          `${GRAPH_API_BASE}/${phone_number_id}/request_code`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ messaging_product: "whatsapp", method: "SMS" }),
          },
        );
        if (codeRes.ok) {
          needsVerification = true;
        } else {
          const err = await codeRes.text();
          console.error("request_code failed:", err);
        }
      } catch (codeError) {
        console.error("request_code error:", codeError);
      }
    }

    return Response.json({
      success: true,
      phone_number: displayPhoneNumber,
      needs_verification: needsVerification,
      status: connectionStatus,
      name_approved: nameApproved,
      quality_rating: qualityRating,
    });
  } catch (error) {
    console.error("Embedded signup error:", error);
    return Response.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
