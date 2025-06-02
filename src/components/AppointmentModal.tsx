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
import { Database } from '@/integrations/supabase/types';
import { useAuth } from '@/contexts/AuthContext';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

// Define types for convenience
type Appointment = Database['public']['Tables']['appointments']['Row'];
type Patient = Database['public']['Tables']['patients']['Row'];
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
  notes: z.string().nullable().optional().transform(e => e === "" ? null : e),
});

type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;

interface AppointmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment | null;
  patient?: Patient | null;
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

  // Effect to reset form when modal opens or props change
  useEffect(() => {
    if (open) {
      console.log("AppointmentModal: Modal opened", { activeClinicId: activeClinic?.clinic_id });
      const defaultDate = appointment ? new Date(appointment.date) : new Date();
      const defaultValues = {
        date: isNaN(defaultDate.getTime()) ? new Date() : defaultDate,
        time: appointment?.time || '',
        patient_id: appointment?.patient_id || patient?.id || '',
        doctor_id: appointment?.doctor_id || '',
        type: appointment ? (appointment.type as AppointmentTypeEnum) : AppointmentTypeEnum['Walk-in'],
        status: appointment ? (appointment.status as AppointmentStatusEnum) : AppointmentStatusEnum.Scheduled,
        notes: appointment?.notes || '',
      };
      console.log("AppointmentModal: Resetting form with defaults", defaultValues);
      form.reset(defaultValues);
    }
  }, [open, appointment, patient, form, activeClinic?.clinic_id]);

  // Helper function for badge variant
  const getTypeBadgeVariant = (type: AppointmentTypeEnum) => {
    switch (type) {
      case AppointmentTypeEnum['Walk-in']: return 'default';
      case AppointmentTypeEnum.Digital: return 'secondary';
      default: return 'outline';
    }
  };

  // Fetch patients
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
    enabled: open && !!activeClinic?.clinic_id,
  });

  // Fetch doctors
  const { data: doctors, isLoading: isLoadingDoctors } = useQuery<Doctor[], Error>({
    queryKey: ['doctors', activeClinic?.clinic_id],
    queryFn: async () => {
      if (!activeClinic?.clinic_id) return [];
      console.log("AppointmentModal: Fetching doctors for clinic:", activeClinic.clinic_id);
      const { data, error } = await supabase
        .rpc('get_doctors_by_clinic', { clinic_id: activeClinic.clinic_id });
      if (error) throw error;
      console.log("AppointmentModal: Doctors fetched:", data);
      return data || [];
    },
    enabled: open && !!activeClinic?.clinic_id,
  });

  // Mutation for creating/updating appointment
  const mutation = useMutation({
    mutationFn: async (values: AppointmentFormValues) => {
      if (!activeClinic?.clinic_id) throw new Error('No active clinic selected.');
      const baseAppointmentData = {
        clinic_id: activeClinic.clinic_id,
        date: format(values.date, 'yyyy-MM-dd'),
        time: values.time || null,
        patient_id: values.patient_id,
        doctor_id: values.doctor_id,
        type: values.type as Database['public']['Enums']['appointment_type'],
        status: values.status as Database['public']['Enums']['appointment_status'],
        notes: values.notes || null,
      };
      console.log("AppointmentModal: Sending to Supabase:", baseAppointmentData);
      const timeout = setTimeout(() => {
        throw new Error('Supabase mutation timed out');
      }, 10000); // 10-second timeout
      try {
        let result;
        if (appointment) {
          const updateData: Database['public']['Tables']['appointments']['Update'] = baseAppointmentData;
          result = await supabase
            .from('appointments')
            .update(updateData)
            .eq('id', appointment.id)
            .select()
            .single();
        } else {
          const insertData: Database['public']['Tables']['appointments']['Insert'] = baseAppointmentData;
          result = await supabase
            .from('appointments')
            .insert(insertData)
            .select()
            .single();
        }
        if (result.error) throw result.error;
        clearTimeout(timeout);
        console.log("AppointmentModal: Supabase response:", result.data);
        return result.data;
      } catch (error) {
        clearTimeout(timeout);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success(appointment ? 'Appointment updated!' : 'Appointment created!');
      queryClient.invalidateQueries({ queryKey: ['appointments', activeClinic?.clinic_id] });
      queryClient.invalidateQueries({ queryKey: ['dashboardData', activeClinic?.clinic_id] });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      console.error("AppointmentModal: Mutation error:", error);
      toast.error(appointment ? 'Failed to update appointment.' : 'Failed to create appointment.', {
        description: error.message,
      });
    },
  });

  const onSubmit = (values: AppointmentFormValues) => {
    console.log("AppointmentModal: onSubmit triggered with values:", values);
    console.log("AppointmentModal: Form state errors:", form.formState.errors);
    if (Object.keys(form.formState.errors).length > 0) {
      toast.error("Please fix form errors before submitting.");
      return;
    }
    mutation.mutate(values);
  };

  const isSubmitting = mutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{appointment ? 'Edit Appointment' : 'New Appointment'}</DialogTitle>
          <DialogDescription>
            Fill in the details to {appointment ? 'edit' : 'create'} an appointment.
          </DialogDescription>
        </DialogHeader>



        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            {/* Date Picker */}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                        disabled={(date) => date < new Date("1900-01-01")}
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
                <FormItem className="flex flex-col">
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
                <FormItem className="md:col-span-2">
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
                <FormItem className="md:col-span-2">
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

            {/* Type Selection */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <FormControl>
                    {appointment ? (
                      <div className="flex flex-wrap gap-2">
                        {Object.values(AppointmentTypeEnum).map(typeOption => (
                          <Button
                            key={typeOption}
                            type="button"
                            variant={field.value === typeOption ? "default" : "outline"}
                            onClick={() => field.onChange(typeOption)}
                            className={cn("rounded-full px-4 py-2 text-sm", field.value !== typeOption && "hover:bg-accent hover:text-accent-foreground")}
                          >
                            {typeOption}
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <Badge variant={getTypeBadgeVariant(field.value)}>{field.value}</Badge>
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Status Selection */}
            {appointment && (
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <Badge
                        variant={
                          field.value === "Scheduled" ? "outline" :
                          field.value === "In Progress" ? "default" :
                          field.value === "Completed" ? "default" : "destructive"
                        }
                      >
                        {field.value}
                      </Badge>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Notes Textarea */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Dialog Footer */}
            <DialogFooter className="md:col-span-2">
              <Button
                type="submit"
                disabled={isSubmitting || Object.keys(form.formState.errors).length > 0}
                onClick={() => console.log("AppointmentModal: Submit button clicked")}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8v-8H4z" />
                    </svg>
                    {appointment ? 'Saving...' : 'Creating...'}
                  </span>
                ) : (
                  appointment ? 'Save Changes' : 'Create Appointment'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export { AppointmentModal };