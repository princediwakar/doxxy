// components/settings/WhatsAppConnection.tsx
"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Script from "next/script";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/loading";
import { useAppState } from "@/contexts/AppStateContext";
import { getSupabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { MessageCircle, CheckCircle } from "lucide-react";

declare global {
  interface Window {
    fbAsyncInit?: () => void;
    FB?: {
      init: (params: Record<string, unknown>) => void;
      login: (
        cb: (r: { authResponse?: { code: string } }) => void,
        opts: Record<string, unknown>,
      ) => void;
    };
  }
}

interface WhatsAppConnectionRow {
  id: string;
  waba_id: string;
  phone_number_id: string;
  display_phone_number: string | null;
  status: "active" | "expired" | "disconnected" | "pending_meta_verification";
  quality_rating: string | null;
  created_at: string;
}

interface SignupPayload {
  code: string;
  waba_id: string;
  phone_number_id: string;
  business_id: string;
  redirect_uri?: string;
}

export default function WhatsAppConnection() {
  const { activeClinicId, activeClinicRole } = useAppState();
  const queryClient = useQueryClient();
  const supabase = getSupabase();
  const searchParams = useSearchParams();
  const [action, setAction] = useState<"idle" | "connecting" | "disconnecting" | "verifying">("idle");
  const [needsVerification, setNeedsVerification] = useState(false);
  const [nameApproved, setNameApproved] = useState(true);
  const [verificationCode, setVerificationCode] = useState("");
  const signupRef = useRef<{ code?: string; waba_id?: string; phone_number_id?: string; business_id?: string; submitting?: boolean }>({});
  const urlParamsProcessed = useRef(false);

  const { data: connection, isLoading } = useQuery({
    queryKey: ["clinic", "whatsapp-connection", activeClinicId],
    queryFn: async () => {
      if (!activeClinicId) return null;
      const { data, error } = await supabase
        .from("clinic_whatsapp_connections")
        .select("id, waba_id, phone_number_id, display_phone_number, status, quality_rating, created_at")
        .eq("clinic_id", activeClinicId)
        .maybeSingle();
      if (error || !data) return null;
      return data as WhatsAppConnectionRow;
    },
    enabled: !!activeClinicId && activeClinicRole === "superadmin",
  });

  const completeSignup = useCallback(
    async (data: SignupPayload) => {
      try {
        const payload: Record<string, unknown> = {
          code: data.code,
          waba_id: data.waba_id,
          phone_number_id: data.phone_number_id,
          business_id: data.business_id,
          redirect_uri: data.redirect_uri,
        };



        const res = await fetch("/api/whatsapp/embedded-signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const result = await res.json();
        if (result.success) {
          queryClient.invalidateQueries({
            queryKey: ["clinic", "whatsapp-connection", activeClinicId],
          });
          setNameApproved(result.name_approved !== false);
          if (result.needs_verification) {
            setNeedsVerification(true);
          }
          if (result.status === "pending_meta_verification") {
            toast.warning("WhatsApp connected but not fully verified. Complete the steps below to send messages.");
          } else {
            toast.success("WhatsApp connected successfully");
            setAction("idle");
          }
        } else {
          toast.error(result.error || "Failed to connect WhatsApp");
          setAction("idle");
        }
      } catch {
        toast.error("Failed to complete connection");
        setAction("idle");
      }
    },
    [activeClinicId, queryClient],
  );

  const handleVerifyCode = useCallback(async () => {
    if (verificationCode.length !== 6) return;
    setAction("verifying");
    try {
      const res = await fetch("/api/whatsapp/verify-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: verificationCode }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Phone number verified");
        setNeedsVerification(false);
        setVerificationCode("");
        queryClient.invalidateQueries({
          queryKey: ["clinic", "whatsapp-connection", activeClinicId],
        });
      } else {
        toast.error(result.error || "Verification failed. Check the code and try again.");
      }
    } catch {
      toast.error("Verification failed");
    } finally {
      setAction("idle");
    }
  }, [verificationCode, activeClinicId, queryClient]);

  // Listen for WA_EMBEDDED_SIGNUP postMessage events from the JS SDK popup.
  // Meta delivers waba_id, phone_number_id, business_id via this channel.
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (
        event.origin !== "https://www.facebook.com" &&
        event.origin !== "https://web.facebook.com"
      )
        return;

      let data: {
        type?: string;
        event?: string;
        data?: { waba_id?: string; phone_number_id?: string; business_id?: string };
      };
      try {
        data = JSON.parse(event.data);
      } catch {
        return;
      }

      if (data.type !== "WA_EMBEDDED_SIGNUP") return;

      if (data.event === "FINISH") {
        const { waba_id, phone_number_id, business_id } = data.data || {};
        signupRef.current = {
          ...signupRef.current,
          waba_id: waba_id || "",
          phone_number_id: phone_number_id || "",
          business_id: business_id || "",
        };

        // If FB.login callback already gave us the code, complete now
        if (signupRef.current.code && !signupRef.current.submitting) {
          signupRef.current.submitting = true;
          completeSignup({
            code: signupRef.current.code,
            waba_id: signupRef.current.waba_id || "",
            phone_number_id: signupRef.current.phone_number_id || "",
            business_id: signupRef.current.business_id || "",
          });
        }
      }

      if (data.event === "CANCEL") {
        setAction("idle");
        signupRef.current = {};
        toast.error("WhatsApp connection was cancelled");
      }

      if (data.event === "ERROR") {
        setAction("idle");
        signupRef.current = {};
        toast.error("WhatsApp connection failed. Please try again.");
      }
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [completeSignup]);

  // Handle fallback redirect: when popup is blocked, Meta redirects the
  // full page with ?code=... in the URL.
  useEffect(() => {
    if (urlParamsProcessed.current) return;

    const code = searchParams.get("code");
    if (!code) return;

    urlParamsProcessed.current = true;

    const redirectUri = window.location.origin + window.location.pathname;

    completeSignup({
      code,
      waba_id: searchParams.get("waba_id") || "",
      phone_number_id: searchParams.get("phone_number_id") || "",
      business_id: searchParams.get("business_id") || "",
      redirect_uri: redirectUri,
    });

    setAction("connecting");
  }, [searchParams, completeSignup]);

  // Timeout: reset hung "connecting" state after 5 minutes
  useEffect(() => {
    if (action !== "connecting") return;

    const timeout = setTimeout(() => {
      setAction("idle");
      toast.error("WhatsApp connection timed out. Please try again.");
    }, 5 * 60 * 1000);

    return () => clearTimeout(timeout);
  }, [action]);

  const launchWhatsAppSignup = useCallback(() => {
    if (!window.FB) {
      toast.error("Facebook SDK not loaded. Please refresh the page.");
      return;
    }

    const configId = process.env.NEXT_PUBLIC_WHATSAPP_CONFIG_ID;
    if (!configId) {
      toast.error("WhatsApp Embedded Signup is not configured yet");
      return;
    }

    setAction("connecting");
    signupRef.current = {};



    window.FB.login(
      (response) => {
        if (response.authResponse?.code) {
          signupRef.current.code = response.authResponse.code;

          // If WA_EMBEDDED_SIGNUP postMessage already delivered WABA IDs, complete now.
          // Otherwise the postMessage handler will trigger completion when it fires.
          if (signupRef.current.waba_id && !signupRef.current.submitting) {
            signupRef.current.submitting = true;
            completeSignup({
              code: signupRef.current.code,
              waba_id: signupRef.current.waba_id,
              phone_number_id: signupRef.current.phone_number_id || "",
              business_id: signupRef.current.business_id || "",
            });
          }
        } else {
          setAction("idle");
          signupRef.current = {};
          toast.error("WhatsApp connection was cancelled or failed");
        }
      },
      {
        config_id: configId,
        response_type: "code",
        override_default_response_type: true,
        extras: {
          version: "v4",
        },
      },
    );
  }, [completeSignup]);

  const handleDisconnect = useCallback(async () => {
    if (!activeClinicId) return;
    setAction("disconnecting");
    const { error } = await supabase
      .from("clinic_whatsapp_connections")
      .update({ status: "disconnected", updated_at: new Date().toISOString() })
      .eq("clinic_id", activeClinicId);

    if (error) {
      toast.error("Failed to disconnect");
    } else {
      toast.success("WhatsApp disconnected");
      queryClient.invalidateQueries({
        queryKey: ["clinic", "whatsapp-connection", activeClinicId],
      });
    }
    setAction("idle");
  }, [activeClinicId, supabase, queryClient]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Spinner size="md" />
        </CardContent>
      </Card>
    );
  }

  const isConnected = connection?.status === "active" || connection?.status === "pending_meta_verification";
  const isPending = connection?.status === "pending_meta_verification";

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-green-600" />
            WhatsApp Business
          </CardTitle>
          <CardDescription>
            Connect your clinic&apos;s WhatsApp Business Account to send messages from your own
            number. Patients will see your clinic&apos;s name and number on all messages.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isConnected ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">Status</p>
                  {isPending ? (
                    <Badge className="mt-1 bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Pending Verification
                    </Badge>
                  ) : (
                    <Badge className="mt-1 bg-green-100 text-green-700 hover:bg-green-100">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Connected
                    </Badge>
                  )}
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">Phone Number</p>
                  <p className="mt-1 text-lg font-semibold">
                    {connection.display_phone_number || "Unknown"}
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">Quality Rating</p>
                  <p className="mt-1 font-medium">
                    {connection.quality_rating || "Pending"}
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">Connected Since</p>
                  <p className="mt-1 font-medium">
                    {new Date(connection.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {isPending && (
                <div className="rounded-lg border p-4 space-y-2 bg-yellow-50">
                  <p className="text-sm font-medium text-yellow-800">
                    Your WhatsApp setup is incomplete
                  </p>
                  {(!needsVerification && nameApproved) ? (
                    <p className="text-sm text-yellow-700">
                      Additional verification is required by Meta before messages can be sent.
                      This may include phone number verification or display name approval.
                      Try reconnecting if this persists.
                    </p>
                  ) : (
                    <ul className="text-sm text-yellow-700 list-disc list-inside space-y-1">
                      {needsVerification && (
                        <li>Phone number must be verified via SMS code from Meta.</li>
                      )}
                      {!nameApproved && (
                        <li>Your display name is pending approval by Meta. This can take up to 24 hours.</li>
                      )}
                    </ul>
                  )}
                  <p className="text-xs text-yellow-600">
                    Messages cannot be sent until all requirements are met.
                  </p>
                </div>
              )}
              {needsVerification && (
                <div className="rounded-lg border p-4 space-y-3 bg-amber-50">
                  <p className="text-sm font-medium text-amber-800">
                    Phone number pending verification
                  </p>
                  <p className="text-sm text-amber-700">
                    A 6-digit code was sent via SMS. Enter it below to activate your number.
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="000000"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                      className="w-32 px-3 py-2 text-center text-lg tracking-widest border rounded-md"
                    />
                    <Button
                      onClick={handleVerifyCode}
                      disabled={action === "verifying" || verificationCode.length !== 6}
                    >
                      {action === "verifying" ? "Verifying..." : "Verify"}
                    </Button>
                  </div>
                </div>
              )}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={launchWhatsAppSignup}
                  disabled={action === "connecting"}
                >
                  {action === "connecting" ? "Connecting..." : "Reconnect"}
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDisconnect}
                  disabled={action === "disconnecting"}
                >
                  {action === "disconnecting" ? "Disconnecting..." : "Disconnect"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border p-6 text-center">
              <MessageCircle className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
              <h3 className="text-lg font-semibold mb-1">Not Connected</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Connect your WhatsApp Business Account to send review requests, bills, and
                prescriptions from your clinic&apos;s own number.
              </p>
              <Button onClick={launchWhatsAppSignup} disabled={action === "connecting"}>
                <MessageCircle className="mr-2 h-4 w-4" />
                {action === "connecting" ? "Connecting..." : "Connect WhatsApp"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      <Script
        src="https://connect.facebook.net/en_US/sdk.js"
        strategy="afterInteractive"
        onLoad={() => {
          window.FB?.init({
            appId: process.env.NEXT_PUBLIC_META_APP_ID!,
            autoLogAppEvents: true,
            xfbml: false,
            version: "v25.0",
          });
        }}
      />
    </>
  );
}
