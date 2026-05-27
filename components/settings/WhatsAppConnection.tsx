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

// Must be set before the FB SDK loads — the SDK checks for this
// function when it initializes. Using onLoad/Script callbacks is too late.
window.fbAsyncInit = function () {
  window.FB?.init({
    appId: process.env.NEXT_PUBLIC_META_APP_ID || "",
    autoLogAppEvents: true,
    xfbml: true,
    version: "v25.0",
  });
};

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
  status: "active" | "expired" | "disconnected";
  quality_rating: string | null;
  created_at: string;
}

interface SignupData {
  code: string;
  waba_id: string;
  phone_number_id: string;
  business_id: string;
}

export default function WhatsAppConnection() {
  const { activeClinicId, activeClinicRole } = useAppState();
  const queryClient = useQueryClient();
  const supabase = getSupabase();
  const searchParams = useSearchParams();
  const [action, setAction] = useState<"idle" | "connecting" | "disconnecting" | "verifying">("idle");
  const [needsVerification, setNeedsVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const signupRef = useRef<Partial<SignupData>>({});
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

  // Send combined signup data to backend
  const completeSignup = useCallback(
    async (data: SignupData) => {
      try {
        const res = await fetch("/api/whatsapp/embedded-signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const result = await res.json();
        if (result.success) {
          queryClient.invalidateQueries({
            queryKey: ["clinic", "whatsapp-connection", activeClinicId],
          });
          if (result.needs_verification) {
            setNeedsVerification(true);
            toast.success("WhatsApp connected. Enter the 6-digit code sent to your phone.");
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
      } finally {
        signupRef.current = {};
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

  // Listen for Embedded Signup postMessage events (waba_id, phone_number_id)
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
        if (signupRef.current.code && signupRef.current.waba_id && signupRef.current.phone_number_id) {
          completeSignup(signupRef.current as SignupData);
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

  // Handle fallback redirect: when popup is blocked, Facebook redirects the
  // full page to the fallback_redirect_uri with the OAuth code in the URL.
  useEffect(() => {
    if (urlParamsProcessed.current) return;

    const code = searchParams.get("code");
    if (!code) return;

    urlParamsProcessed.current = true;

    const wabaId = searchParams.get("waba_id");
    const phoneNumberId = searchParams.get("phone_number_id");
    const businessId = searchParams.get("business_id");

    signupRef.current = {
      code,
      waba_id: wabaId || "",
      phone_number_id: phoneNumberId || "",
      business_id: businessId || "",
    };

    // Always attempt — server resolves WABA info via Graph API if needed
    setAction("connecting");
    completeSignup(signupRef.current as SignupData);
  }, [searchParams, completeSignup]);

  // Timeout: reset hung "connecting" state after 5 minutes
  useEffect(() => {
    if (action !== "connecting") return;

    const timeout = setTimeout(() => {
      setAction("idle");
      signupRef.current = {};
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

          // If postMessage already gave us waba_id and phone_number_id, complete now
          if (signupRef.current.waba_id && signupRef.current.phone_number_id) {
            completeSignup(signupRef.current as SignupData);
          }
          // Otherwise the postMessage handler will call completeSignup when it fires
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
          sessionInfoVersion: "3",
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

  const isConnected = connection?.status === "active";

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
                <Badge className="mt-1 bg-green-100 text-green-700 hover:bg-green-100">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Connected
                </Badge>
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
      />
    </>
  );
}
