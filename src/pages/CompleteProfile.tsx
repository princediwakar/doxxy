import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { z } from "zod";
import { toast } from "sonner";

const profileSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(6, "Phone is required"),
});

type ProfileForm = z.infer<typeof profileSchema>;

const CompleteProfile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<ProfileForm>({ name: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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
    if (!password || !confirmPassword) {
      toast.error("Please enter and confirm your password.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    // Update password
    const { error: pwError } = await supabase.auth.updateUser({ password });
    if (pwError) {
      setLoading(false);
      toast.error("Failed to set password: " + pwError.message);
      return;
    }
    // Update profile
    const { error } = await supabase
      .from("profiles")
      .update({ name: form.name, phone: form.phone })
      .eq("id", user.id);
    setLoading(false);
    if (error) {
      toast.error("Failed to update profile: " + error.message);
    } else {
      toast.success("Profile completed!");
      navigate("/dashboard");
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
            <div>
              <label className="block mb-1 font-medium">Password</label>
              <Input name="password" type="password" value={password} onChange={e => setPassword(e.target.value)} disabled={loading} required />
            </div>
            <div>
              <label className="block mb-1 font-medium">Confirm Password</label>
              <Input name="confirmPassword" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} disabled={loading} required />
            </div>
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