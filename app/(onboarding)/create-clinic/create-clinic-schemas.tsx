// Path: app/(onboarding)/create-clinic/create-clinic-schemas.tsx
import * as z from "zod";
import { googlePlaceDataSchema } from "@/types/google-places";

export const clinicDetailsSchema = z.object({
  name: z.string().min(2, { message: "Clinic name must be at least 2 characters." }),
  address: z.string().optional(),
  email: z.string().email({ message: "Invalid email address." }).optional().or(z.literal("")),
  phone: z.string().optional(),
  website: z.string().optional().or(z.literal("")).refine((val) => {
    if (!val || val === "") return true;
    const websitePattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i;
    const domainPattern = /^[\da-z.-]+\.([a-z.]{2,6})$/i;
    return websitePattern.test(val) || domainPattern.test(val);
  }, { message: "Please enter a valid website (example.com or https://example.com)" }),
  google_place_id: z.string().optional(),
  google_place_data: googlePlaceDataSchema.optional(),
});
export type ClinicDetailsForm = z.infer<typeof clinicDetailsSchema>;

export const departmentsSchema = z.object({
  departments: z.array(z.string()).min(1, { message: "Select at least one department." }),
});
export type DepartmentsForm = z.infer<typeof departmentsSchema>;

export const doctorProfileSchema = z.object({
  isDoctor: z.enum(['yes', 'no'], { required_error: 'Please specify your role.' }),
  selectedDepartment: z.string().optional(),
  consultationFee: z.coerce.number().min(0).optional(),
  invitedDoctorEmail: z.string().email({ message: "Valid email required." }).optional(),
}).superRefine((data, ctx) => {
  if (data.isDoctor === 'yes') {
    if (!data.selectedDepartment || data.selectedDepartment.trim() === '') {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Primary department is required.", path: ["selectedDepartment"] });
    }
  }
  if (data.isDoctor === 'no') {
    if (!data.invitedDoctorEmail || data.invitedDoctorEmail.trim() === '') {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "You must invite at least one doctor to create a clinic.", path: ["invitedDoctorEmail"] });
    }
  }
});
export type DoctorProfileForm = z.infer<typeof doctorProfileSchema>;