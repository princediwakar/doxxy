// POST /api/meta/data-deletion
//
// Meta Data Deletion Callback — called when a Facebook user requests
// deletion of their data from our app. Verifies the signed_request and
// returns a confirmation code as required by Meta Platform Terms §3(d)(i).

import * as crypto from "crypto";

function base64URLToBase64(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  // Restore padding removed by base64url encoding
  while (base64.length % 4 !== 0) base64 += "=";
  return base64;
}

function verifySignedRequest(signedRequest: string, appSecret: string): Record<string, unknown> | null {
  const [signature, payload] = signedRequest.split(".");
  if (!signature || !payload) return null;

  const expectedSig = crypto
    .createHmac("sha256", appSecret)
    .update(payload)
    .digest("base64url");

  // timingSafeEqual requires equal-length buffers
  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expBuf.length) return null;

  if (!crypto.timingSafeEqual(sigBuf, expBuf)) return null;

  return JSON.parse(Buffer.from(base64URLToBase64(payload), "base64").toString("utf-8"));
}

export async function POST(req: Request) {
  const body = await req.formData();
  const signedRequest = body.get("signed_request") as string | null;

  if (!signedRequest) {
    return Response.json({ error: "Missing signed_request" }, { status: 400 });
  }

  const appSecret = process.env.META_APP_SECRET;
  if (!appSecret) {
    console.error("META_APP_SECRET not configured for data deletion callback");
    return Response.json({ error: "Server misconfiguration" }, { status: 500 });
  }

  const decoded = verifySignedRequest(signedRequest, appSecret);
  if (!decoded) {
    return Response.json({ error: "Invalid signed_request" }, { status: 403 });
  }

  const userId = decoded.user_id as string | undefined;
  console.log(`Meta data deletion requested for user: ${userId || "unknown"}`);

  // Doxxy does not store Facebook user IDs — patients are identified
  // by phone number, not Facebook account. No data to scrub.

  const confirmationCode = crypto.randomUUID();

  return Response.json({
    url: `https://www.doxxy.in/data-deletion?code=${confirmationCode}`,
    confirmation_code: confirmationCode,
  });
}
