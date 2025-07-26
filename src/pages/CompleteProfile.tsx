import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getSupabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
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
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState<ProfileForm>({ name: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [processingMessage, setProcessingMessage] = useState<string>("");
  const [email, setEmail] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  useEffect(() => {
    if (!user) return;
    // Prefill from location state (invite flow), user object, or profile
    const prefillName = location.state?.prefillName || user.user_metadata?.name || "";
    const prefillEmail = location.state?.prefillEmail || user.email || "";
    setEmail(prefillEmail);
    
    // Fetch profile from Supabase
    supabase
      .from("profiles")
      .select("name, phone")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!error && data) {
          setForm({
            name: data.name || prefillName,
            phone: data.phone || "",
          });
        } else {
          setForm({
            name: prefillName,
            phone: "",
          });
        }
      });
  }, [user, location.state]);

  if (!user) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // For phone, strip all non-digit characters
    const sanitizedValue = name === 'phone' 
      ? value.replace(/[^\d]/g, '')
      : value;
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
      // First update auth.users if phone is provided
      if (form.phone) {
        const { error: authUpdateError } = await supabase.auth.updateUser({
          data: {
            phone: form.phone
          }
        });
        
        if (authUpdateError) {
          console.warn("CompleteProfile: Could not update auth.users phone:", authUpdateError.message);
          // Don't fail the whole operation for this
        }
      }

      // Update the profiles table - try UPDATE first, then INSERT if it doesn't exist
      let { error } = await supabase
        .from('profiles')
        .update({
          name: form.name,
          phone: form.phone || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      // If update failed because profile doesn't exist, try to insert
      if (error && error.code === 'PGRST116') {
        console.log("CompleteProfile: Profile doesn't exist, creating new one");
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            name: form.name,
            phone: form.phone || null,
            email: user.email,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        error = insertError;
      }
      
      if (error) {
        console.error("CompleteProfile: Error updating profile:", error);
        
        // Handle specific error cases
        if (error.code === '23505' && error.message.includes('unique_email')) {
          console.warn("CompleteProfile: Email conflict detected, but continuing as profile may exist");
          // Don't fail for email conflicts - the profile might already exist with this email
        } else if (retryCount < MAX_RETRIES && (error.message.includes('profile not found') || error.code === 'PGRST116')) {
          setRetryCount(prev => prev + 1);
          // Wait briefly before retry
          await new Promise(resolve => setTimeout(resolve, 1000));
          handleSubmit(e);
          return;
        } else {
          toast.error("Failed to save profile: " + error.message);
          return;
        }
      }

      // Mark profile as complete in auth context
      await markProfileComplete();
      
      console.log("CompleteProfile: Profile completed successfully, processing invitations");
      
      // Process any pending invitations explicitly
      setProcessingMessage("Processing your invitation...");
      const invitationResult = await processInvitationsOnProfileComplete(
        user, 
        form.name, 
        form.phone || undefined
      );
      
      console.log("CompleteProfile: Invitation processing result:", invitationResult);
      
      if (invitationResult.shouldNavigateToDashboard) {
        setProcessingMessage("Loading your clinic data...");
        await fetchUserAndClinicData(user);
        toast.success(invitationResult.message || "Profile completed!");
        navigate("/dashboard", { replace: true });
      } else if (invitationResult.shouldNavigateToCreateClinic) {
        toast.success("Profile completed! Let's set up your clinic.");
        navigate("/create-clinic", { replace: true });
      } else {
        // This shouldn't happen with the new explicit processing, but just in case
        setProcessingMessage("Loading your clinic data...");
        await fetchUserAndClinicData(user);
        toast.success("Profile completed!");
        navigate("/dashboard", { replace: true });
      }
      
    } catch (error) {
      console.error("CompleteProfile: Exception during profile update:", error);
      toast.error("An error occurred while updating your profile.");
    } finally {
      setLoading(false);
      setProcessingMessage("");
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
              <Input 
                name="name" 
                value={form.name} 
                onChange={handleChange} 
                disabled={loading} 
                required 
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Phone</label>
              <Input 
                name="phone" 
                value={form.phone || ''} 
                onChange={handleChange} 
                disabled={loading} 
                placeholder="9876543210"
              />
              
            </div>
            {email && (
              <div>
                <label className="block mb-1 font-medium">Email</label>
                <Input name="email" value={email} disabled readOnly />
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (processingMessage || "Saving...") : "Save & Continue"}
            </Button>
            {processingMessage && (
              <div className="mt-2 text-center text-sm text-muted-foreground">
                {processingMessage}
              </div>
            )}
          </form>
        </CardContent>
        <CardFooter className="flex-col">
          <Button variant="ghost" onClick={signOut} className="w-full mt-2">Logout</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CompleteProfile; 