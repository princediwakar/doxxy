import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database, Constants } from '@/integrations/supabase/types';
import { useAuth } from '@/contexts/AuthContext';

// Type for the return of the get_doctors_by_clinic RPC from generated types.ts
type RpcDoctorDetails = Database['public']['Functions']['get_doctors_by_clinic']['Returns'][0];

// Define a local type for the Doctor object used within this modal.
// It extends the RPC return type (which only includes department_name)
// to explicitly include department_id, as the current generated types.ts
// does not reflect the RPC change to return department_id.
// This is a necessary workaround until the Supabase type generation is corrected.
interface ModalDoctorDetails extends RpcDoctorDetails {
  department_id: string | null; // Explicitly added because generated types are outdated
}

// Type for clinic departments
type ClinicDepartment = Database['public']['Tables']['clinic_departments']['Row'];
// Type for department types (Neurology, Ophthalmology) - used for department name display
type DepartmentType = Database['public']['Tables']['department_types']['Row'];

// Get the valid user roles from the generated types for use in Zod and the form.
// This ensures consistency with the database enum definition.
type DbUserRole = Database['public']['Enums']['user_role'];
// Explicitly define the valid roles as a readonly tuple using 'as const'.
// This provides the specific string literal types required by z.enum.
const DbUserRoles = ['staff', 'doctor', 'superadmin'] as const;

// Zod schema for doctor form validation
const doctorFormSchema = z.object({
  name: z.string().nonempty('Name is required'),
  email: z.string().email('Invalid email format').nullable().optional().transform(e => e === '' ? null : e),
  phone: z.string().nullable().optional().transform(e => e === '' ? null : e),
  availability: z.string().nullable().optional().transform(e => e === '' ? null : e),
  bio: z.string().nullable().optional().transform(e => e === '' ? null : e),
  // Use the generated enum values directly for Zod validation
  role: z.enum(DbUserRoles, { required_error: 'Role is required' }), // Use the readonly tuple directly
  department_id: z.string().uuid('Invalid department ID').nullable(), // Can be null
});

type DoctorFormValues = z.infer<typeof doctorFormSchema>;

interface DoctorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Doctor prop uses the local type with explicit department_id for modal functionality
  doctor: ModalDoctorDetails | null; // Null for adding a new doctor (existing user)
}

const DoctorModal: React.FC<DoctorModalProps> = ({
  open,
  onOpenChange,
  doctor,
}) => {
  const queryClient = useQueryClient();
  const { activeClinic } = useAuth();

  // Helper to safely get a role from the doctor object that is compatible with DbUserRole
  const getSafeDoctorRole = (doctor: ModalDoctorDetails | null): DbUserRole => {
      // Cast DbUserRoles to a standard array for the includes check.
      const validRolesArray = Array.from(DbUserRoles);
      const defaultRole = validRolesArray[0]; // Default to the first role (should be 'staff' based on enum order)

      if (!doctor?.role) return defaultRole;
      // Check if the doctor's role is included in the valid database roles.
      if (validRolesArray.includes(doctor.role as DbUserRole)) { // Cast doctor.role to the expected union type
          return doctor.role as DbUserRole;
      }
      return defaultRole;
  };

  const form = useForm<DoctorFormValues>({
    resolver: zodResolver(doctorFormSchema),
    defaultValues: {
      name: doctor?.name || '',
      email: doctor?.email || '',
      phone: doctor?.phone || '',
      availability: doctor?.availability || '',
      bio: doctor?.bio || '',
      // Default role is 'doctor' for new users, otherwise use existing doctor's role safely
      role: doctor ? getSafeDoctorRole(doctor) : 'doctor', // Explicitly default to 'doctor' for add mode
      department_id: doctor?.department_id || null,
    },
  });

  // Effect to update form defaults if doctor prop changes while modal is open
  useEffect(() => {
    if (open) {
        form.reset({
            name: doctor?.name || '',
            email: doctor?.email || '',
            phone: doctor?.phone || '',
            availability: doctor?.availability || '',
            bio: doctor?.bio || '',
            // Default role is 'doctor' for new users, otherwise use existing doctor's role safely
            role: doctor ? getSafeDoctorRole(doctor) : 'doctor', // Explicitly default to 'doctor' for add mode
            department_id: doctor?.department_id || null,
        });
    }
  }, [open, doctor, form]); // Add DbUserRoles to dependency array

  // Fetch clinic departments and their types for the dropdown
  const { data: clinicDepartments, isLoading: isLoadingDepartments } = useQuery({
    queryKey: ['clinicDepartments', activeClinic?.clinic_id],
    queryFn: async () => {
      if (!activeClinic?.clinic_id) return [];
      // Fetch clinic departments and join with department_types to get names
      const { data, error } = await supabase
        .from('clinic_departments')
        .select('id, department_types(name)')
        .eq('clinic_id', activeClinic.clinic_id);

      if (error) throw error;

      // Map results to include department id and name
      return data.map(cd => ({
        id: cd.id,
        name: (cd.department_types as DepartmentType | null)?.name || 'Unknown Department',
      })) || [];
    },
    enabled: open && !!activeClinic?.clinic_id,
  });

  // Mutation for updating doctor and clinic member details
  const updateMutation = useMutation({ // Renamed to updateMutation for clarity
    mutationFn: async (values: DoctorFormValues) => {
      // Doctor.id from the RPC is the user_id (profiles.id) and also the doctors.id
      if (!activeClinic?.clinic_id || !doctor?.id) {
         throw new Error('Invalid state: Cannot update doctor without active clinic or doctor ID.');
      }

      // 1. Update the 'doctors' table using doctor.id (which is the doctors.id)
      const { error: doctorUpdateError } = await supabase
         .from('doctors')
         .update({
            name: values.name || null,
            email: values.email || null,
            phone: values.phone || null,
            availability: values.availability || null,
            bio: values.bio || null,
          })
         .eq('id', doctor.id); // Use doctor.id directly

      if (doctorUpdateError) throw doctorUpdateError;

      // 2. Update the 'clinic_members' table using the RPC
      const { error: memberUpdateError } = await supabase.rpc('update_clinic_member_details', {
         member_user_id: doctor.id, // Use doctor.id (which is the user_id)
         target_clinic_id: activeClinic.clinic_id,
         updated_role: values.role, // Use role from form values - This now aligns with DbUserRole
         updated_department_id: values.department_id, // Use department_id from form values
      });

      if (memberUpdateError) throw memberUpdateError;

       return doctor; // Return the original doctor object on success
    },
    onSuccess: () => {
      toast.success('Doctor details updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['doctors', activeClinic?.clinic_id] });
      queryClient.invalidateQueries({ queryKey: ['dashboardData', activeClinic?.clinic_id] });
      onOpenChange(false);
    },
    onError: (error) => {
      console.error('Doctor update mutation error:', error);
      toast.error('Failed to update doctor details.', {
        description: error.message,
      });
    },
   });

   // Mutation for adding an existing user as a doctor to the clinic
   const addMutation = useMutation({
    mutationFn: async (values: DoctorFormValues) => {
       if (!activeClinic?.clinic_id) throw new Error('No active clinic selected.');
       if (!values.email) throw new Error('Email is required to add a doctor.');

       let existingUserId = null;
       let profileError = null;

       try {
           const { data: profileData, error: fetchError } = await supabase
               .from('profiles')
               .select('id')
               .eq('email', values.email)
               .single();

           if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 means no rows found, which is expected
               // Catch other errors like RLS errors here
               profileError = fetchError;
               console.error("DoctorModal: Profile lookup failed with error:", fetchError);
           } else if (profileData) {
               // User found
               existingUserId = profileData.id;
               console.log("DoctorModal: Found existing user with ID:", existingUserId);
           } else { // profileData is null and error is PGRST116
               // User not found (expected case for new user)
               console.log("DoctorModal: User not found by email, proceeding to Edge Function.");
           }
       } catch (error) {
           // Catch any unexpected errors during the fetch
           profileError = error;
           console.error("DoctorModal: Unexpected error during profile lookup:", error);
       }

       if (existingUserId) {
           // Scenario 1: User exists and was found by the client-side query (unlikely with RLS)
           console.log("DoctorModal: Processing existing user found via client-side query.");
           // Check if the user is already a member of this clinic
           const { data: memberData, error: memberCheckError } = await supabase
             .from('clinic_members')
             .select('id')
             .eq('clinic_id', activeClinic.clinic_id)
             .eq('user_id', existingUserId)
             .single();

           if (memberCheckError && memberCheckError.code !== 'PGRST116') { throw memberCheckError; }

           if (memberData) {
               throw new Error(`User with email ${values.email} is already a member of this clinic.`);
           }

           // Add the existing user as a clinic member using the RPC
           const { error: addMemberError } = await supabase.rpc('add_clinic_member', {
               new_user_id: existingUserId,
               target_clinic_id: activeClinic.clinic_id,
               new_role: 'doctor', // Explicitly set role to 'doctor'
               new_department_id: values.department_id,
           });

           if (addMemberError) { throw addMemberError; }

           // Also ensure entry in doctors table if not exists (based on our previous fix)
           const { data: doctorData, error: doctorCheckError } = await supabase
              .from('doctors')
              .select('id')
              .eq('id', existingUserId)
              .single();

           if (doctorCheckError && doctorCheckError.code !== 'PGRST116') { throw doctorCheckError; }

           if (!doctorData) {
              const { error: insertDoctorError } = await supabase
                 .from('doctors')
                 .insert({
                    id: existingUserId,
                    name: values.name,
                 });
              if (insertDoctorError) { throw insertDoctorError; }
           }

           // Return partial info, invalidate queries will refetch
           return { id: existingUserId, name: values.name || '' } as ModalDoctorDetails;

       } else { // Scenario 2: User not found by client-side query or lookup failed (use Edge Function)
            console.log("DoctorModal: Using invite-doctor Edge Function.");
            if (!values.name) throw new Error('Name is required to invite or add a doctor.');
            // Assuming invite-doctor Edge Function handles both new user creation and adding existing users to clinic
            const { data: edgeFunctionData, error: edgeFunctionError } = await supabase.functions.invoke('invite-doctor', {
               body: {
                   email: values.email,
                   name: values.name, // Pass name for new user creation or updating doctors table
                   role: 'doctor', // Edge Function should handle setting the role in clinic_members
                   department_id: values.department_id, // Pass department_id
                   clinic_id: activeClinic.clinic_id,
               },
               method: 'POST', // Assuming invite-doctor is a POST function
            });

            if (edgeFunctionError) { throw edgeFunctionError; }

            // The Edge Function is responsible for creating the user (if new),
            // adding them to clinic_members, and adding/updating the doctors table entry.
            // We can assume success if no edgeFunctionError.
            // The response from the Edge Function might contain relevant data like the new user ID.
            // For now, we'll return a simple success indicator.
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return { message: 'Doctor added/invited successfully!', result: edgeFunctionData } as any; // Use any temporarily based on unknown EF return type
       }
    },
     onSuccess: () => {
       toast.success('Doctor added successfully!');
       queryClient.invalidateQueries({ queryKey: ['doctors', activeClinic?.clinic_id] });
       queryClient.invalidateQueries({ queryKey: ['dashboardData', activeClinic?.clinic_id] });
       onOpenChange(false);
     },
     onError: (error) => {
       console.error('Add Doctor mutation error:', error);
       console.error('Add Doctor mutation full error object:', JSON.stringify(error, null, 2));
       toast.error('Failed to add doctor.', {
         description: error.message,
       });
     },
   });


  const onSubmit = (values: DoctorFormValues) => {
     if (doctor) {
       updateMutation.mutate(values); // Use updateMutation for editing
     } else {
       addMutation.mutate(values); // Use addMutation for adding
     }
  };

  const isSubmitting = updateMutation.isPending || addMutation.isPending;
  const modalTitle = doctor ? 'Edit Doctor' : 'New Doctor';
  const submitButtonText = doctor ? 'Save Changes' : 'Add Doctor';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* DialogContent handles responsiveness */}
      <DialogContent className="sm:max-w-[425px]"> {/* Reduced max width */}
        <DialogHeader>
          <DialogTitle>{modalTitle}</DialogTitle>
          <DialogDescription>
            Fill in the details to {doctor ? 'edit' : 'add'} doctor information.
          </DialogDescription>
        </DialogHeader>

        {/* Redesigned Form Layout */}
        <Form {...form}> {/* Wrap form with Form component */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">

            {/* Name - Spans full width */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="md:col-span-2"> {/* Name spans full width */}
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={!!doctor} />
                  </FormControl>
                  {!!doctor && <FormDescription>Name cannot be changed for existing doctors.</FormDescription>}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} disabled={!!doctor} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Phone */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input type="tel" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Role */}

            {/* Department */}
            <FormField
              control={form.control}
              name="department_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <Select
                     onValueChange={(value) => field.onChange(value === 'no-department' ? null : value)}
                     value={field.value || 'no-department'}
                     disabled={isLoadingDepartments}
                   >
                     <FormControl>
                       <SelectTrigger><SelectValue placeholder={isLoadingDepartments ? "Loading..." : "Select a department"} /></SelectTrigger>
                     </FormControl>
                     <SelectContent>
                        <SelectItem value="no-department">No Department</SelectItem>
                        {(clinicDepartments || []).map(department => (
                          <SelectItem key={department.id} value={department.id}>{department.name}</SelectItem>
                        ))}
                     </SelectContent>
                   </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Availability - Spans full width */}
            <FormField
               control={form.control}
               name="availability"
               render={({ field }) => (
                 <FormItem className="md:col-span-2"> {/* Spans full width */}
                   <FormLabel>Availability (Optional)</FormLabel>
                   <FormControl>
                     <Input {...field} />
                   </FormControl>
                   <FormMessage />
                 </FormItem>
               )}
             />

            {/* Bio - Spans full width */}
            <FormField
               control={form.control}
               name="bio"
               render={({ field }) => (
                 <FormItem className="md:col-span-2"> {/* Spans full width */}
                   <FormLabel>Bio (Optional)</FormLabel>
                   <FormControl>
                     <Textarea {...field} />
                   </FormControl>
                   <FormMessage />
                 </FormItem>
               )}
             />

            {/* Dialog Footer - Spans full width */}
            <DialogFooter className="md:col-span-2"> {/* Footer spans full width */}
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (doctor ? 'Saving...' : 'Adding...') : submitButtonText}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export { DoctorModal };
