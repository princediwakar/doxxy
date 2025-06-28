import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, Plus } from 'lucide-react';
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
import { getSupabase } from '@/integrations/supabase/client';
import { Database, Enums } from '@/integrations/supabase/types';
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

const AppointmentModal: React.FC<AppointmentModalProps> = ({
  open,
  onOpenChange,
  appointment,
  patient,
}) => {
  const queryClient = useQueryClient();
  const { activeClinic, activeClinicRole } = useAuth();
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [patientSearch, setPatientSearch] = useState("");
  const [newlyCreatedPatient, setNewlyCreatedPatient] = useState<Patient | null>(null);
  const [pendingPatientId, setPendingPatientId] = useState<string | null>(null);

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      date: appointment ? new Date(appointment.date) : new Date(),
      time: appointment?.time || '',
      patient_id: appointment?.patient_id || patient?.id || '',
      doctor_id: appointment?.doctor_id || '',
      type: appointment ? appointment.type : "Walk-in",
      status: appointment ? appointment.status : "Scheduled",
      notes: appointment?.notes || '',
    },
  });

  // Effect to reset form when modal opens or props change
  useEffect(() => {
    if (open) {
      const defaultDate = appointment ? new Date(appointment.date) : new Date();
      const defaultValues = {
        date: isNaN(defaultDate.getTime()) ? new Date() : defaultDate,
        time: appointment?.time || '',
        patient_id: appointment?.patient_id || patient?.id || '',
        doctor_id: appointment?.doctor_id || '',
        type: appointment ? appointment.type : "Walk-in",
        status: appointment ? appointment.status : "Scheduled",
        notes: appointment?.notes || '',
      };
      form.reset(defaultValues);
    }
  }, [open, appointment, patient, form, activeClinic?.clinic_id]);

  // Helper function for badge variant
  const getTypeBadgeVariant = (type: Enums<'appointment_type'>) => {
    switch (type) {
      case 'Walk-in': return 'default';
      case 'Digital': return 'secondary';
      default: return 'outline';
    }
  };

  // Fetch patients using RPC instead of direct query
  const { data: patients, isLoading: isLoadingPatients } = useQuery({
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
    enabled: open && !!activeClinic?.clinics?.id,
  });

  // Filter patients by search
  const filteredPatients = (patients || []).filter((p) =>
    p.name.toLowerCase().includes(patientSearch.toLowerCase())
  );

  const { data: doctors, isLoading: isLoadingDoctors } = useQuery<Doctor[], Error>({
    queryKey: ['doctorsForAppointment', activeClinic?.clinics?.id],
    queryFn: async () => {
      if (!activeClinic?.clinics?.id) return [];

      // Try RPC function first
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_doctors_by_clinic', {
        clinic_id: activeClinic.clinics.id,
      });

      if (!rpcError && rpcData) {
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
          profiles!doctors_user_id_fkey(name, email, phone)
        `)
        .eq('clinic_id', activeClinic.clinics.id)
        .eq('is_active', true);

      if (fallbackError) {
        console.error('Fallback query failed:', fallbackError);
        throw new Error('Failed to fetch doctors');
      }

      // Transform the data to match expected format
      const transformedData = fallbackData?.map(doctor => ({
        id: doctor.id,
        user_id: doctor.user_id,
        name: doctor.name || doctor.profiles?.name || 'Unknown Doctor',
        email: doctor.email || doctor.profiles?.email || '',
        phone: doctor.phone || doctor.profiles?.phone || '',
        bio: doctor.bio,
        created_at: doctor.created_at,
        role: 'doctor',
        department_name: 'General Medicine',
        department_id: null,
        is_active: doctor.is_active,
        primary_specialization: doctor.primary_specialization,
        medical_specializations: [],
        years_of_experience: null,
        consultation_fee: doctor.consultation_fee,
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
      })) || [];

      return transformedData;
    },
    enabled: open && !!activeClinic?.clinics?.id,
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
      if (!activeClinic?.clinics?.id) throw new Error('No active clinic selected.');
      const baseAppointmentData = {
        clinic_id: activeClinic.clinics.id,
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
        return result.data;
    },
    onSuccess: () => {
      toast.success(appointment ? 'Appointment updated!' : 'Appointment created!');
      queryClient.invalidateQueries({ queryKey: ['appointments', activeClinic?.clinics?.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboardData', activeClinic?.clinics?.id] });
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
    if (pendingPatientId && patients?.some(p => p.id === pendingPatientId)) {
      form.setValue("patient_id", pendingPatientId);
      setPendingPatientId(null);
    }
  }, [pendingPatientId, patients, form]);

  return (
    <>
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
              {/* Patient Select - moved to top, searchable, add new option */}
              <FormField
                control={form.control}
                name="patient_id"
                render={({ field }) => (
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
                            onChange={e => setPatientSearch(e.target.value)}
                            className="mb-2"
                          />
                        </div>
                        {filteredPatients.map((p) => (
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
                              {d.primary_specialization 
                                ? `${d.department_name || 'General Medicine'} • ${d.primary_specialization}`
                                : (d.department_name || 'General Medicine')
                              }
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

              {/* Time Input - 15-minute intervals */}
              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Time</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-60">
                        {/* Generate 15-minute intervals from 9:00 AM to 6:00 PM */}
                        {Array.from({ length: 37 }, (_, i) => {
                          const startTime = 9 * 60; // 9:00 AM in minutes
                          const minutes = startTime + i * 15;
                          const hours = Math.floor(minutes / 60);
                          const mins = minutes % 60;
                          const time12h = `${hours > 12 ? hours - 12 : hours === 0 ? 12 : hours}:${mins.toString().padStart(2, '0')} ${hours >= 12 ? 'PM' : 'AM'}`;
                          const time24h = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
                          return (
                            <SelectItem key={time24h} value={time24h}>
                              {time12h}
                            </SelectItem>
                          );
                        })}
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
                        disabled={(date) => date < new Date("1900-01-01")}
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
                type="submit"
                disabled={isSubmitting || Object.keys(form.formState.errors).length > 0}
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

      {/* PatientModal for quick add */}
      <PatientModal
        open={isPatientModalOpen}
        onOpenChange={setIsPatientModalOpen}
        patient={null}
        onPatientCreated={(newPatient) => {
          setIsPatientModalOpen(false);
          queryClient.invalidateQueries({ queryKey: ['patients', activeClinic?.clinic_id] });
          setPendingPatientId(newPatient.id);
          setPatientSearch("");
        }}
      />
    </>
  );
};

export { AppointmentModal };
