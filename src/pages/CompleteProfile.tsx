import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getSupabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { z } from "zod";
import { toast } from "sonner";
import { zodResolver } from '@hookform/resolvers/zod';

const supabase = getSupabase();

const profileSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  phone: z.string().min(6, "Phone is required"),
});

type ProfileForm = z.infer<typeof profileSchema>;

const CompleteProfile = () => {
  const { user, signOut, markProfileComplete } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState<ProfileForm>({ name: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

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
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = profileSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setLoading(true);
    
    try {
      // Update profile
      const { error } = await supabase
        .from("profiles")
        .update({ name: form.name, phone: form.phone })
        .eq("id", user.id);
      
      if (error) {
        console.error("CompleteProfile: Error updating profile:", error);
        toast.error("Failed to update profile: " + error.message);
        return;
      }

      // Mark profile as complete in auth context
      await markProfileComplete();
      
      toast.success("Profile completed!");
      console.log("CompleteProfile: Profile completed successfully, navigating to dashboard");
      
      // Add a small delay to ensure state update propagates before navigation
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 100);
      
    } catch (error) {
      console.error("CompleteProfile: Exception during profile update:", error);
      toast.error("An error occurred while updating your profile.");
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
              <Input name="phone" value={form.phone} onChange={handleChange} disabled={loading} required />
            </div>
            {email && (
              <div>
                <label className="block mb-1 font-medium">Email</label>
                <Input name="email" value={email} disabled readOnly />
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Saving..." : "Save & Continue"}
            </Button>
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