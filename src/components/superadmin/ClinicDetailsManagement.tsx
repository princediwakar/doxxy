import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { z } from "zod";
import { toast } from "sonner";

const clinicDetailsSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone is required"),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
});

type ClinicDetailsForm = z.infer<typeof clinicDetailsSchema>;

const ClinicDetailsManagement = () => {
  const { activeClinic } = useAuth();
  const clinic = activeClinic?.clinics as Tables<'clinics'> | null;
  const [form, setForm] = useState<ClinicDetailsForm>({
    name: clinic?.name || "",
    address: clinic?.address || "",
    email: clinic?.email || "",
    phone: clinic?.phone || "",
    website: clinic?.website || "",
  });
  const [loading, setLoading] = useState(false);

  if (!clinic) {
    return <div className="text-center text-muted-foreground">No clinic selected.</div>;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = clinicDetailsSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setLoading(true);
    const { name, address, email, phone, website } = parsed.data;
    const { error } = await supabase
      .from("clinics")
      .update({ name, address, email, phone, website: website || null })
      .eq("id", clinic.id);
    setLoading(false);
    if (error) {
      toast.error("Failed to update clinic details: " + error.message);
    } else {
      toast.success("Clinic details updated successfully.");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Clinic Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4 max-w-lg" onSubmit={handleSubmit}>
          <div>
            <label className="block mb-1 font-medium">Name</label>
            <Input name="name" value={form.name} onChange={handleChange} disabled={loading} required />
          </div>
          <div>
            <label className="block mb-1 font-medium">Address</label>
            <Input name="address" value={form.address} onChange={handleChange} disabled={loading} required />
          </div>
          <div>
            <label className="block mb-1 font-medium">Email</label>
            <Input name="email" type="email" value={form.email} onChange={handleChange} disabled={loading} required />
          </div>
          <div>
            <label className="block mb-1 font-medium">Phone</label>
            <Input name="phone" value={form.phone} onChange={handleChange} disabled={loading} required />
          </div>
          <div>
            <label className="block mb-1 font-medium">Website</label>
            <Input name="website" value={form.website} onChange={handleChange} disabled={loading} placeholder="https://example.com" />
          </div>
          <Button type="submit" disabled={loading} className="mt-2 w-full">
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ClinicDetailsManagement; 