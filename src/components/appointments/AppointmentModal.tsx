import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, Plus } from 'lucide-react';
import { useForm, ControllerRenderProps } from 'react-hook-form';
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
import { getSupabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { useAuth } from '@/contexts/AuthContext';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PatientModal } from "@/components/patients/PatientModal";

// Define types for convenience
type Appointment = Database['public']['Tables']['appointments']['Row'];
type Patient = Database['public']['Tables']['patients']['Row'];
type Doctor = Database['public']['Functions']['get_doctors_by_clinic']['Returns'][0];
type RpcPatient = Database['public']['Functions']['get_patients_by_clinic']['Returns'][0];

// Using the Supabase enum types directly in the component


const supabase = getSupabase();
// Zod schema for appointment form validation
const appointmentFormSchema = z.object({
  date: z.date({ required_error: 'Date is required' }),
  time: z.string().nullable().optional().transform(e => e === "" ? null : e),
  patient_id: z.string().nonempty('Patient is required'),
  doctor_id: z.string().nonempty('Doctor is required'),
  type: z.enum(['Walk-in', 'Digital'], {
    required_error: 'Appointment type is required',
  }),
  status: z.enum(['Scheduled', 'In Progress', 'Completed', 'Cancelled'], {
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

// Helper function to get the next 15-minute time slot from current time
const getNextTimeSlot = (): string => {
  const now = new Date();

  // Use local time directly (no timezone conversion needed)
  const minutes = now.getMinutes();
  const hours = now.getHours();

  // Round up to the next 15-minute interval
  const roundedMinutes = Math.ceil(minutes / 15) * 15;

  if (roundedMinutes === 60) {
    // If rounded to 60 minutes, go to next hour
    const nextHour = (hours + 1) % 24;
    return `${nextHour.toString().padStart(2, '0')}:00`;
  } else {
    return `${hours.toString().padStart(2, '0')}:${roundedMinutes.toString().padStart(2, '0')}`;
  }
};

// Helper function to generate 24-hour time slots with 15-minute intervals
const generateTimeSlots = () => {
  const slots = [];
  // Generate time slots for 24 hours (0:00 to 23:45)
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const time24h = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      const period = hour >= 12 ? 'PM' : 'AM';
      const time12h = `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
      
      slots.push({ value: time24h, display: time12h });
    }
  }
  return slots;
};

const AppointmentModal: React.FC<AppointmentModalProps> = ({
  open,
  onOpenChange,
  appointment,
  patient,
}) => {
  const queryClient = useQueryClient();
  const { activeClinic } = useAuth();
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [patientSearch, setPatientSearch] = useState("");
  const [newlyCreatedPatient, setNewlyCreatedPatient] = useState<Patient | null>(null);
  const [pendingPatientId, setPendingPatientId] = useState<string | null>(null);

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      date: appointment?.date ? new Date(appointment.date) : new Date(),
      time: appointment?.time || getNextTimeSlot(),
      patient_id: appointment?.patient_id || patient?.id || '',
      doctor_id: appointment?.doctor_id || '',
      type: appointment?.type || "Walk-in",
      status: appointment?.status || "Scheduled",
      notes: appointment?.notes || '',
    },
  });

  // Effect to reset form when modal opens or props change
  useEffect(() => {
    if (open) {
      const defaultDate = appointment?.date ? new Date(appointment.date) : new Date();
      const defaultValues = {
        date: isNaN(defaultDate.getTime()) ? new Date() : defaultDate,
        time: appointment?.time || getNextTimeSlot(),
        patient_id: appointment?.patient_id || patient?.id || '',
        doctor_id: appointment?.doctor_id || '',
        type: appointment?.type || "Walk-in",
        status: appointment?.status || "Scheduled",
        notes: appointment?.notes || '',
      };
      form.reset(defaultValues);
    }
  }, [open, appointment, patient, form, activeClinic?.clinic_id]);


  // Fetch patients using RPC instead of direct query
  const { data: patients, isLoading: isLoadingPatients } = useQuery<RpcPatient[], Error>({
    queryKey: ['patients', activeClinic?.clinic_id],
    queryFn: async () => {
      if (!activeClinic?.clinic_id) return [];
      const { data, error } = await supabase.rpc('get_patients_by_clinic', {
        _clinic_id: activeClinic.clinic_id,
        _limit: 100, // Reasonable limit for dropdown
        _offset: 0,
      });
      if (error) throw error;
      return data || [];
    },
    enabled: open && !!activeClinic?.clinic_id,
  });

  // Filter patients by search
  const filteredPatients = (patients || []).filter((p: RpcPatient) =>
    p.name?.toLowerCase().includes(patientSearch.toLowerCase()) ?? false
  );

  const { data: doctors, isLoading: isLoadingDoctors } = useQuery<Doctor[], Error>({
    queryKey: ['doctorsForAppointment', activeClinic?.clinic_id],
    queryFn: async () => {
      if (!activeClinic?.clinic_id) return [];

      // Try RPC function first
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_doctors_by_clinic', {
        clinic_id: activeClinic.clinic_id,
      });

      if (!rpcError && rpcData) {
        console.log('RPC function succeeded, returning data:', rpcData);
        return rpcData;
      }

      console.warn('RPC function failed, using fallback query:', rpcError?.message);
      
      // Fallback to direct query if RPC fails
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('doctors')
        .select(`
          id,
          user_id,
          name,
          email,
          phone,
          bio,
          created_at,
          is_active,
          primary_specialization,
          consultation_fee,
          profiles!doctors_user_id_fkey(name, email, phone),
          clinic_members!clinic_members_user_id_fkey(
            department_id,
            clinic_departments!clinic_members_department_id_fkey(
              department_type_id,
              department_types!clinic_departments_department_type_id_fkey(name)
            )
          )
        `)
        .eq('clinic_id', activeClinic.clinic_id)
        .eq('is_active', true);

      if (fallbackError) {
        console.error('Fallback query failed:', fallbackError);
        throw new Error('Failed to fetch doctors');
      }

      console.log('Fallback query data:', fallbackData);

      // Transform the data to match expected format
      const transformedData = fallbackData?.map((doctor: unknown) => {
        const doctorData = doctor as {
          id: string;
          user_id: string;
          name: string;
          email: string;
          phone: string;
          bio: string;
          created_at: string;
          is_active: boolean;
          primary_specialization: string;
          consultation_fee: number;
          profiles?: { name?: string; email?: string; phone?: string };
          clinic_members?: Array<{
            department_id: string;
            clinic_departments?: {
              department_type_id: string;
              department_types?: { name: string };
            };
          }>;
        };

        // Extract department name from nested joins
        const departmentName = doctorData.clinic_members?.[0]?.clinic_departments?.department_types?.name ||
                              doctorData.primary_specialization ||
                              'General Medicine';

        return {
          id: doctorData.id,
          user_id: doctorData.user_id,
          name: doctorData.name || doctorData.profiles?.name || 'Unknown Doctor',
          email: doctorData.email || doctorData.profiles?.email || '',
          phone: doctorData.phone || doctorData.profiles?.phone || '',
          bio: doctorData.bio,
          created_at: doctorData.created_at,
          role: 'doctor',
          department_name: departmentName,
          department_id: doctorData.clinic_members?.[0]?.department_id || null,
          is_active: doctorData.is_active,
          primary_specialization: doctorData.primary_specialization,
          medical_specializations: [],
          years_of_experience: null,
          consultation_fee: doctorData.consultation_fee,
          languages_spoken: [],
          practice_timings: null,
          professional_summary: null,
          medical_registration_number: null,
          medical_qualifications: [],
          medical_council: null,
          medical_license_state: null,
          medical_license_expiry: null,
          subspecialty: [],
          board_certifications: [],
          fellowship_details: null,
          medical_college: null,
          graduation_year: null,
          clinic_timings: null
        };
      }) || [];

      return transformedData as Doctor[];
    },
    enabled: open && !!activeClinic?.clinic_id,
  });

  // Additional effect to set doctor_id when doctors are loaded and appointment exists
  useEffect(() => {
    if (open && appointment?.doctor_id && doctors && doctors.length > 0) {
      const doctorExists = doctors.some(d => d.id === appointment.doctor_id);
      if (doctorExists) {
        form.setValue('doctor_id', appointment.doctor_id);
      }
    }
  }, [open, appointment?.doctor_id, doctors, form]);

  // Mutation for creating/updating appointment
  const mutation = useMutation({
    mutationFn: async (values: AppointmentFormValues) => {
      if (!activeClinic?.clinic_id) throw new Error('No active clinic selected.');

      console.log('Creating appointment with data:', {
        date: format(values.date, 'yyyy-MM-dd'),
        time: values.time,
        patient_id: values.patient_id,
        doctor_id: values.doctor_id,
        type: values.type,
        status: values.status
      });

      const baseAppointmentData = {
        clinic_id: activeClinic.clinic_id,
        date: format(values.date, 'yyyy-MM-dd'),
        time: values.time || '',
        patient_id: values.patient_id,
        doctor_id: values.doctor_id,
        type: values.type,
        status: values.status,
        notes: values.notes || '',
      };

        let result;
        if (appointment) {
          result = await supabase
            .from('appointments')
            .update(baseAppointmentData)
            .eq('id', appointment.id)
            .select('id, clinic_id, patient_id, doctor_id, date, time, type, status, notes, created_at')
            .single();
        } else {
          result = await supabase
            .from('appointments')
            .insert(baseAppointmentData)
            .select('id, clinic_id, patient_id, doctor_id, date, time, type, status, notes, created_at')
            .single();
        }
        if (result.error) {
          throw result.error;
        }

        console.log('Appointment created successfully:', result.data);
        return result.data;
    },
    onSuccess: () => {
      toast.success(appointment ? 'Appointment updated!' : 'Appointment created!');
      queryClient.invalidateQueries({ queryKey: ['appointments', activeClinic?.clinic_id] });
      queryClient.invalidateQueries({ queryKey: ['dashboardData', activeClinic?.clinic_id] });
      queryClient.invalidateQueries({ queryKey: ['patientAppointments'] });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(appointment ? 'Failed to update appointment.' : 'Failed to create appointment.', {
        description: error.message,
      });
    },
  });

  const onSubmit = (values: AppointmentFormValues) => {
    // Prevent duplicate submissions
    if (isSubmitting) {
      return;
    }

    if (doctors) {
      const doctorIds = doctors.map(d => d.id);
      if (!doctorIds.includes(values.doctor_id)) {
        toast.error("Selected doctor is not valid. Please select a doctor from the list.");
        return;
      }
    }
    if (Object.keys(form.formState.errors).length > 0) {
      toast.error("Please fix form errors before submitting.");
      return;
    }
    mutation.mutate(values);
  };

  const isSubmitting = mutation.isPending;

  // When a new patient is created, select them in the form
  useEffect(() => {
    if (newlyCreatedPatient) {
      form.setValue("patient_id", newlyCreatedPatient.id);
      setNewlyCreatedPatient(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newlyCreatedPatient]);

  useEffect(() => {
    if (pendingPatientId && patients?.some((p: RpcPatient) => p.id === pendingPatientId)) {
      form.setValue("patient_id", pendingPatientId);
      setPendingPatientId(null);
    }
  }, [pendingPatientId, patients, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] z-[50]">
        <DialogHeader>
          <DialogTitle><div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            {appointment ? "Edit Appointment" : "New Appointment"}
          </div></DialogTitle>
          <DialogDescription>
            Fill in the details to {appointment ? 'edit' : 'create'} an appointment.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              {/* Patient Select - moved to top, searchable, add new option */}
              <FormField
                control={form.control}
                name="patient_id"
                render={({ field }: { field: ControllerRenderProps<AppointmentFormValues, 'patient_id'> }) => (
                  <FormItem className="md:col-span-2">
                    <div className="flex justify-between mb-1">
                    <FormLabel>Patient</FormLabel>
                      <button
                        type="button"
                        className="text-xs text-primary hover:underline flex items-center"
                        onClick={() => setIsPatientModalOpen(true)}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Patient
                      </button>
                    </div>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isLoadingPatients || !!patient}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={isLoadingPatients ? "Loading patients..." : "Select a patient"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <div className="px-2 py-1">
                          <Input
                            type="text"
                            placeholder="Search patients..."
                            value={patientSearch}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPatientSearch(e.target.value)}
                            className="mb-2"
                          />
                        </div>
                        {filteredPatients.map((p: RpcPatient) => (
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



            {/* Doctor Select with Department */}
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
                          <div className="flex flex-col items-start">
                            <div className="font-medium">
                              {d.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {/* Show medical specialization if available, otherwise department */}
                              {d.department_name}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

              {/* Time Input - 15-minute intervals (24 hour) */}
              <FormField
                control={form.control}
                name="time"
                render={({ field }: { field: ControllerRenderProps<AppointmentFormValues, 'time'> }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Time</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-60">
                        {/* Generate 15-minute intervals for 24 hours */}
                        {generateTimeSlots().map((slot) => (
                          <SelectItem key={slot.value} value={slot.value}>
                            {slot.display}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />


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
                        disabled={(date: Date) => date < new Date("1900-01-01")}
                        captionLayout="dropdown"
                      />
                    </PopoverContent>
                  </Popover>
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
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select appointment type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {['Walk-in', 'Digital'].map(typeOption => (
                        <SelectItem key={typeOption} value={typeOption}>
                          {typeOption}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Status Selection */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {['Scheduled', 'In Progress', 'Completed', 'Cancelled'].map(statusOption => (
                        <SelectItem key={statusOption} value={statusOption}>
                          {statusOption}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || Object.keys(form.formState.errors).length > 0}
                onClick={(e) => {
                  // Prevent double-click submission
                  if (isSubmitting) {
                    e.preventDefault();
                  }
                }}
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
      {isPatientModalOpen && (
        <PatientModal
          open={isPatientModalOpen}
          onOpenChange={setIsPatientModalOpen}
          patient={null}
          onPatientCreated={(newPatient: Patient) => {
            setNewlyCreatedPatient(newPatient);
            setPendingPatientId(newPatient.id);
            form.setValue('patient_id', newPatient.id);
            setIsPatientModalOpen(false);
          }}
        />
      )}
    </Dialog>
  );
};

export { AppointmentModal };
