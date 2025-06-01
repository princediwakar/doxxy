import { useEffect } from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
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
import { Tables, Enums, Database, Constants, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { useAuth } from '@/contexts/AuthContext';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

// Define types for convenience
type Appointment = Tables<'appointments'>;
type Patient = Tables<'patients'>;
// Use the return type of the RPC for doctors, as it includes name which is needed for the select
type Doctor = Database['public']['Functions']['get_doctors_by_clinic']['Returns'][0];

// Define JS enums for Zod validation
enum AppointmentTypeEnum {
  "Walk-in" = "Walk-in",
  "Digital" = "Digital",
}

enum AppointmentStatusEnum {
  "Scheduled" = "Scheduled",
  "In Progress" = "In Progress",
  "Completed" = "Completed",
  "Cancelled" = "Cancelled",
}

// Zod schema for appointment form validation
const appointmentFormSchema = z.object({
  date: z.date({ required_error: 'Date is required' }),
  time: z.string().nullable().optional().transform(e => e === "" ? null : e),
  patient_id: z.string().nonempty('Patient is required'),
  doctor_id: z.string().nonempty('Doctor is required'),
  type: z.nativeEnum(AppointmentTypeEnum, {
    required_error: 'Appointment type is required',
  }),
  status: z.nativeEnum(AppointmentStatusEnum, {
    required_error: 'Status is required',
  }),
  notes: z.string().nullable().optional().transform(e => (e === "" ? null : e)),
});

type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;

interface AppointmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment | null; // Null for creating a new appointment
  patient?: Patient | null; // Optional: pre-select a patient if modal is opened from patient context
}

const AppointmentModal: React.FC<AppointmentModalProps> = ({
  open,
  onOpenChange,
  appointment,
  patient,
}) => {
  const queryClient = useQueryClient();
  const { activeClinic } = useAuth();

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      date: appointment ? new Date(appointment.date) : new Date(),
      time: appointment?.time || '',
      patient_id: appointment?.patient_id || patient?.id || '',
      doctor_id: appointment?.doctor_id || '',
      type: appointment ? (appointment.type as AppointmentTypeEnum) : AppointmentTypeEnum['Walk-in'],
      status: appointment ? (appointment.status as AppointmentStatusEnum) : AppointmentStatusEnum.Scheduled,
      notes: appointment?.notes || '',
    },
  });

  // Effect to update form defaults if appointment or patient props change while modal is open
  useEffect(() => {
    if (open) {
        console.log("AppointmentModal: Modal opened.", { activeClinicId: activeClinic?.clinic_id });
        const defaultDate = appointment ? new Date(appointment.date) : new Date();
        const defaultTime = appointment?.time || format(new Date(), 'HH:mm');

        form.reset({
            date: defaultDate,
            time: appointment?.time || '',
            patient_id: appointment?.patient_id || patient?.id || '',
            doctor_id: appointment?.doctor_id || '',
            type: appointment?.type as AppointmentTypeEnum | undefined,
            status: appointment?.status as AppointmentStatusEnum | undefined,
            notes: appointment?.notes || '',
        });
    }
  }, [open, appointment, patient, form]);

  // Helper function to determine badge variant based on appointment type
  const getTypeBadgeVariant = (type: AppointmentTypeEnum) => {
    switch (type) {
      case AppointmentTypeEnum['Walk-in']:
        return 'default'; // Or another suitable variant
      case AppointmentTypeEnum.Digital:
        return 'secondary'; // Or another suitable variant
      default:
        return 'outline';
    }
  };

  // Fetch patients for the dropdown
  const { data: patients, isLoading: isLoadingPatients } = useQuery({
    queryKey: ['patients', activeClinic?.clinic_id],
    queryFn: async () => {
      if (!activeClinic?.clinic_id) return [];
      const { data, error } = await supabase
        .from('patients')
        .select('id, name')
        .eq('clinic_id', activeClinic.clinic_id)
        .order('name');
      if (error) throw error;
      return data || [];
    },
    enabled: open && !!activeClinic?.clinic_id, // Only fetch when modal is open and clinic is active
  });

  // Fetch doctors (clinic members with role 'doctor') for the dropdown
  const { data: doctors, isLoading: isLoadingDoctors } = useQuery({
    queryKey: ['doctors', activeClinic?.clinic_id],
    queryFn: async () => {
      if (!activeClinic?.clinic_id) return [];
      console.log("AppointmentModal: Fetching doctors for clinic:", activeClinic.clinic_id);
      const { data, error } = await supabase
        .rpc('get_doctors_by_clinic', { clinic_id: activeClinic.clinic_id }); // Using the RPC here
      if (error) throw error;
      console.log("AppointmentModal: Doctors fetched:", data);
      return data || [];
    },
    enabled: open && !!activeClinic?.clinic_id, // Only fetch when modal is open and clinic is active
  });

  // Mutation for creating or updating an appointment
  const mutation = useMutation({
    mutationFn: async (values: AppointmentFormValues) => {
      if (!activeClinic?.clinic_id) throw new Error('No active clinic selected.');

      // Ensure types match Supabase expectations
      const appointmentData: TablesInsert<'appointments'> = {
        clinic_id: activeClinic.clinic_id,
        date: format(values.date as Date, 'yyyy-MM-dd'), // Cast date to Date
        time: values.time || null, // Ensure null for empty time
        patient_id: values.patient_id,
        doctor_id: values.doctor_id,
        type: values.type as Database['public']['Enums']['appointment_type'], // Cast through unknown
        status: values.status as Database['public']['Enums']['appointment_status'], // Cast through unknown
        notes: values.notes || null, // Ensure null for empty notes
      };

      if (appointment) {
        // Update existing appointment
        const updateData: TablesUpdate<'appointments'> = appointmentData; // Use update type
        const { data, error } = await supabase
          .from('appointments')
          .update(updateData)
          .eq('id', appointment.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        // Create new appointment
        const insertData: TablesInsert<'appointments'> = appointmentData; // Use insert type
        const { data, error } = await supabase
          .from('appointments')
          .insert(insertData)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      toast.success(
        appointment
          ? 'Appointment updated successfully!'
          : 'Appointment created successfully!'
      );
      // Invalidate relevant queries to refetch data after mutation
      queryClient.invalidateQueries({ queryKey: ['appointments', activeClinic?.clinic_id] });
      queryClient.invalidateQueries({ queryKey: ['dashboardData', activeClinic?.clinic_id] });
      onOpenChange(false); // Close modal on success
    },
    onError: (error) => {
      console.error('Appointment mutation error:', error);
      console.error('AppointmentModal: Doctor fetch error:', error);
      toast.error(
        appointment
          ? 'Failed to update appointment.'
          : 'Failed to create appointment.',
        {
          description: error.message,
        }
      );
    },
  });

  const onSubmit = (values: AppointmentFormValues) => {
    mutation.mutate(values);
  };

  const isSubmitting = mutation.isPending; // Use isPending instead of isLoading
  const modalTitle = appointment ? 'Edit Appointment' : 'New Appointment';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{modalTitle}</DialogTitle>
          <DialogDescription>
            Fill in the details to {appointment ? 'edit' : 'create'} an appointment.
          </DialogDescription>
        </DialogHeader>

        {/* Redesigned Form Layout */}
        <Form {...form}> {/* Wrap form with Form component */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">

            {/* Date and Time Row */}
            {/* Date Picker */}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col"> {/* Date field within the two-column grid */}
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                        disabled={(date) => date < new Date("1900-01-01")} // Example disable past dates if needed
                        captionLayout="dropdown"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Time Input */}
            <FormField
              control={form.control}
              name="time"
              render={({ field }) => (
                <FormItem className="flex flex-col"> {/* Time field, ensuring flex-col for alignment consistency */}
                  <FormLabel>Time</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Patient Select */}
            <FormField
              control={form.control}
              name="patient_id"
              render={({ field }) => (
                <FormItem className="md:col-span-2"> {/* Patient and Doctor can be side-by-side or stacked, or span full width */}
                  <FormLabel>Patient</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingPatients || !!patient}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={isLoadingPatients ? "Loading patients..." : "Select a patient"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(patients || []).map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Doctor Select */}
            <FormField
              control={form.control}
              name="doctor_id"
              render={({ field }) => (
                <FormItem className="md:col-span-2"> {/* Patient and Doctor can be side-by-side or stacked, or span full width */}
                  <FormLabel>Doctor</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingDoctors}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={isLoadingDoctors ? "Loading doctors..." : "Select a doctor"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(doctors || []).map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Type Selection (Chips/Badge) */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem> {/* Type and Status can be side-by-side */}
                  <FormLabel>Type</FormLabel>
                   <FormControl>
                     {appointment ? (
                       // Display chips when editing existing appointment
                       <div className="flex flex-wrap gap-2"> {/* Container for chips */}
                         {Object.values(AppointmentTypeEnum).map(typeOption => (
                           <Button
                             key={typeOption}
                             type="button" // Prevent form submission
                             variant={field.value === typeOption ? "default" : "outline"} // Highlight selected chip
                             onClick={() => field.onChange(typeOption)} // Update form value on click
                             className={cn(
                               "rounded-full px-4 py-2 text-sm",
                               field.value !== typeOption && "hover:bg-accent hover:text-accent-foreground"
                             )} // Chip styling
                           >
                             {typeOption}
                           </Button>
                         ))}
                       </div>
                     ) : (
                        // Display badge with default 'Walk-in' when creating new appointment
                        <Badge variant={getTypeBadgeVariant(field.value)}>{field.value}</Badge>
                     )}
                   </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Status Selection (Badge) */}
            {appointment && (
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem> {/* Type and Status can be side-by-side */}
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                       <Badge variant={
                         field.value === "Scheduled" ? "outline" :
                         field.value === "In Progress" ? "default" :
                         field.value === "Completed" ? "success" : "destructive" // Add 'success' variant or use base color classes
                       }> {/* Use Badge component */}
                         {field.value}
                       </Badge>
                     </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Notes Textarea - Spans full width */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem className="md:col-span-2"> {/* Spans full width */}
                  <FormLabel>Notes (Optional)</FormLabel>
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
                {isSubmitting
                  ? appointment
                    ? 'Saving...'
                    : 'Creating...'
                  : appointment
                  ? 'Save Changes'
                  : 'Create Appointment'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export { AppointmentModal };
