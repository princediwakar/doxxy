// src/components/appointments/AppointmentModal.tsx
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Plus } from "lucide-react";
import { useForm, ControllerRenderProps } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";

import { PatientModal } from "@/components/patients/PatientModal";
import {
  Appointment,
  Patient,
  RpcPatient,
  appointmentFormSchema,
  AppointmentFormValues,
  getNextTimeSlot,
  generateTimeSlots,
} from "./appointment.utils";
import {
  useAppointmentForm,
  useAppointmentMutation,
} from "../../hooks/useAppointmentForm";

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
  // 1. Logic & Data Hooks
  const {
    patients,
    isLoadingPatients,
    doctors,
    isLoadingDoctors,
    activeClinic,
  } = useAppointmentForm(open);
  const mutation = useAppointmentMutation(appointment, () =>
    onOpenChange(false)
  );

  // 2. Local UI State
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [patientSearch, setPatientSearch] = useState("");
  const [newlyCreatedPatient, setNewlyCreatedPatient] =
    useState<Patient | null>(null);
  const [pendingPatientId, setPendingPatientId] = useState<string | null>(null);

  // 3. Form Setup
  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      date: new Date(),
      time: getNextTimeSlot(),
      patient_id: "",
      doctor_id: "",
      type: "Walk-in",
      status: "Scheduled",
      notes: "",
    },
  });

  // 4. Effects
  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      const defaultDate = appointment?.date
        ? new Date(appointment.date)
        : new Date();
      form.reset({
        date: isNaN(defaultDate.getTime()) ? new Date() : defaultDate,
        time: appointment?.time || getNextTimeSlot(),
        patient_id: appointment?.patient_id || patient?.id || "",
        doctor_id: appointment?.doctor_id || "",
        type: appointment?.type || "Walk-in",
        status: appointment?.status || "Scheduled",
        notes: appointment?.notes || "",
      });
    }
  }, [open, appointment, patient, form, activeClinic?.clinic_id]);

  // Handle auto-selecting doctor if appointment exists
  useEffect(() => {
    if (open && appointment?.doctor_id && doctors && doctors.length > 0) {
      const doctorExists = doctors.some((d) => d.id === appointment.doctor_id);
      if (doctorExists) {
        form.setValue("doctor_id", appointment.doctor_id);
      }
    }
  }, [open, appointment?.doctor_id, doctors, form]);

  // Handle auto-selecting newly created patient
  useEffect(() => {
    if (newlyCreatedPatient) {
      form.setValue("patient_id", newlyCreatedPatient.id);
      setNewlyCreatedPatient(null);
    }
  }, [newlyCreatedPatient, form]);

  useEffect(() => {
    if (pendingPatientId && patients?.some((p) => p.id === pendingPatientId)) {
      form.setValue("patient_id", pendingPatientId);
      setPendingPatientId(null);
    }
  }, [pendingPatientId, patients, form]);

  // 5. Handlers
  const filteredPatients = (patients || []).filter(
    (p) => p.name?.toLowerCase().includes(patientSearch.toLowerCase()) ?? false
  );

  const onSubmit = (values: AppointmentFormValues) => {
    if (mutation.isPending) return;

    if (doctors) {
      const doctorIds = doctors.map((d) => d.id);
      if (!doctorIds.includes(values.doctor_id)) {
        toast.error("Selected doctor is not valid.");
        return;
      }
    }
    mutation.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] z-[50]">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              {appointment ? "Edit Appointment" : "New Appointment"}
            </div>
          </DialogTitle>
          <DialogDescription>
            Fill in the details to {appointment ? "edit" : "create"} an
            appointment.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4"
          >
            {/* Patient Select */}
            <FormField
              control={form.control}
              name="patient_id"
              render={({
                field,
              }: {
                field: ControllerRenderProps<
                  AppointmentFormValues,
                  "patient_id"
                >;
              }) => (
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
                        <SelectValue
                          placeholder={
                            isLoadingPatients
                              ? "Loading..."
                              : "Select a patient"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <div className="px-2 py-1">
                        <Input
                          type="text"
                          placeholder="Search..."
                          value={patientSearch}
                          onChange={(e) => setPatientSearch(e.target.value)}
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

            {/* Doctor Select */}
            <FormField
              control={form.control}
              name="doctor_id"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Doctor</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isLoadingDoctors}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            isLoadingDoctors ? "Loading..." : "Select a doctor"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(doctors || []).map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          <div className="flex flex-col items-start">
                            <div className="font-medium">{d.name}</div>
                            <div className="text-sm text-muted-foreground">
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

            {/* Time Select */}
            <FormField
              control={form.control}
              name="time"
              render={({
                field,
              }: {
                field: ControllerRenderProps<AppointmentFormValues, "time">;
              }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Time</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-60">
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
                        disabled={(date: Date) => date < new Date("1900-01-01")}
                        captionLayout="dropdown"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Type & Status */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {["Walk-in", "Digital"].map((o) => (
                        <SelectItem key={o} value={o}>
                          {o}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {[
                        "Scheduled",
                        "In Progress",
                        "Completed",
                        "Cancelled",
                      ].map((o) => (
                        <SelectItem key={o} value={o}>
                          {o}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Footer */}
            <DialogFooter className="md:col-span-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={mutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin h-5 w-5 mr-2"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8v-8H4z"
                      />
                    </svg>
                    {appointment ? "Saving..." : "Creating..."}
                  </span>
                ) : appointment ? (
                  "Save Changes"
                ) : (
                  "Create Appointment"
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
            form.setValue("patient_id", newPatient.id);
            setIsPatientModalOpen(false);
          }}
        />
      )}
    </Dialog>
  );
};

export { AppointmentModal };
