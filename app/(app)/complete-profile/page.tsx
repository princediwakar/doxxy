// File: app/(app)/complete-profile/page.tsx
"use client";
import { logger } from "@/lib/logger";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext";
import { getSupabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Spinner } from "@/components/ui/loading"; // Added missing import
import { z } from "zod";
import { toast } from "sonner";
import { processInvitationsOnProfileComplete } from "@/lib/invitation-utils";

const supabase = getSupabase();

const profileSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  phone: z.string()
    .refine((val) => !val || (val.length >= 10 && val.length <= 15 && /^[0-9]+$/.test(val)), {
      message: "Phone number must be 10-15 digits"
    })
    .optional()
    .nullable(),
});

type ProfileForm = z.infer<typeof profileSchema>;

const CompleteProfile = () => {
  const { user, signOut, markProfileComplete, fetchUserAndClinicData } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState<ProfileForm>({ name: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [processingMessage, setProcessingMessage] = useState<string>("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!user) return;
    const invitationDataStr = sessionStorage.getItem('invitation_data');
    const invitationData = invitationDataStr ? JSON.parse(invitationDataStr) : null;
    const prefillName = invitationData?.name || user.user_metadata?.name || "";
    const prefillEmail = invitationData?.email || user.email || "";
    setEmail(prefillEmail);

    supabase.from("profiles").select("name, phone").eq("id", user.id).maybeSingle()
      .then(({ data }) => {
        if (data) setForm({ name: data.name || prefillName, phone: data.phone || "" });
        else setForm({ name: prefillName, phone: "" });
      });
  }, [user]);

  if (!user) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const sanitizedValue = name === 'phone' ? value.replace(/[^\d]/g, '') : value;
    setForm({ ...form, [name]: sanitizedValue });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = profileSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    
    setLoading(true);
    setProcessingMessage("Saving your profile...");
    
    try {
      // 1. Update Auth User
      if (form.phone) {
        await supabase.auth.updateUser({ data: { phone: form.phone } });
      }

      // 2. Update/Insert Profile in DB
      let { error } = await supabase
        .from('profiles')
        .update({
          name: form.name,
          phone: form.phone || null,
          avatar_url: user.user_metadata?.avatar_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error && error.code === 'PGRST116') {
        const { error: insertError } = await supabase.from('profiles').insert({
          id: user.id,
          name: form.name,
          phone: form.phone || null,
          email: user.email,
          avatar_url: user.user_metadata?.avatar_url,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        error = insertError;
      }
      
      if (error) throw error;

      // ------------------------------------------------------------------
      // CRITICAL STEP: Process Invitation BEFORE marking profile complete
      // ------------------------------------------------------------------
      
      setProcessingMessage("Checking for invitations...");
      
      // Use strictly undefined if phone is empty string to match TS types
      const invitationResult = await processInvitationsOnProfileComplete(
        user,
        form.name,
        form.phone || undefined
      );

      // 3. If invitation was processed successfully, REFRESH CLINIC DATA immediately
      if (invitationResult.hasClinics || invitationResult.shouldNavigateToDashboard) {
        setProcessingMessage("Setting up your dashboard...");
        // This ensures 'activeClinic' becomes true inside AuthContext
        await fetchUserAndClinicData(user);
      }

      // 4. NOW mark profile as complete.
      // Because we fetched clinic data in step 3, activeClinic is likely true now.
      // PrivateRoute will see: (!needsProfileCompletion && activeClinic) -> Dashboard
      await markProfileComplete();

      // Clear tokens
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('invitation_token');
        localStorage.removeItem('invitation_data');
      }

      // 5. Navigate
      if (invitationResult.shouldNavigateToCreateClinic) {
        toast.success("Profile updated! Let's set up your clinic.");
        router.replace("/create-clinic");
      } else {
        toast.success(invitationResult.message || "Welcome!");
        router.replace("/dashboard");
      }
      
    } catch (error: any) {
      logger.error("Profile Error:", error);
      toast.error("Error: " + (error.message || "Something went wrong"));
      // Even on error, if we saved profile, we allow them to proceed
      // But we still mark complete so they aren't stuck loop
      await markProfileComplete();
      router.replace("/create-clinic");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Complete Your Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block mb-1 font-medium">Full Name</label>
              <Input name="name" value={form.name} onChange={handleChange} disabled={loading} required />
            </div>
            <div>
              <label className="block mb-1 font-medium">Phone</label>
              <Input name="phone" value={form.phone || ''} onChange={handleChange} disabled={loading} placeholder="9876543210" />
            </div>
            {email && (
              <div>
                <label className="block mb-1 font-medium">Email</label>
                <Input name="email" value={email} disabled readOnly />
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Spinner size="sm" className="text-white" /> 
                  {processingMessage}
                </span>
              ) : "Save & Continue"}
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <Button variant="ghost" onClick={signOut} className="w-full">Logout</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CompleteProfile;