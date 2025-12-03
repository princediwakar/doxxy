// src/components/appointments/AppointmentModal.tsx
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Form, FormField, FormItem, FormLabel, FormMessage, FormControl
} from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { PatientModal } from "@/components/patients/PatientModal";
import { PatientSelect } from "./PatientSelect"; // Imported new component
import {
  Patient,
  appointmentFormSchema,
  AppointmentFormValues,
  getNextTimeSlot,
  generateTimeSlots,
} from "./appointment.utils";
import type { AppointmentData } from "@/types/appointments";
import { useAppointmentForm, useAppointmentMutation } from "../../hooks/useAppointmentForm";

interface AppointmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: AppointmentData | null;
  patient?: Patient | null;
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({
  open,
  onOpenChange,
  appointment,
  patient,
}) => {
  // 1. Data & Mutation
  const { patients, isLoadingPatients, doctors, isLoadingDoctors } = useAppointmentForm(open);
  const mutation = useAppointmentMutation(appointment, () => onOpenChange(false));

  // 2. Local State
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [newPatientName, setNewPatientName] = useState("");

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

  // 4. Consolidated Synchronization Effect
  // We combine the reset logic into one clear effect
  useEffect(() => {
    if (open) {
      const defaultDate = appointment?.date ? new Date(appointment.date) : new Date();
      
      // Determine Doctor ID
      let defaultDoctor = appointment?.doctor_id || "";
      // Auto-select doctor if editing or if only one doctor exists (optional UX improvement)
      if (defaultDoctor && doctors && !doctors.some(d => d.id === defaultDoctor)) {
        defaultDoctor = ""; // Reset if doctor not in list
      }

      form.reset({
        date: isNaN(defaultDate.getTime()) ? new Date() : defaultDate,
        time: appointment?.time || getNextTimeSlot(),
        patient_id: appointment?.patient_id || patient?.id || "",
        doctor_id: defaultDoctor,
        type: appointment?.type || "Walk-in",
        status: appointment?.status || "Scheduled",
        notes: appointment?.notes || "",
      });
    }
  }, [open, appointment, patient, doctors, form]);


  const onSubmit = (values: AppointmentFormValues) => {
    if (mutation.isPending) return;
    mutation.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] z-[50] overflow-visible">
        <DialogHeader>
          <DialogTitle>
             <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              {appointment ? "Edit Appointment" : "New Appointment"}
            </div>
          </DialogTitle>
          <DialogDescription>
            {appointment ? "Update details below." : "Schedule a new appointment."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            
            {/* 1. Refactored Patient Select */}
            <FormField
              control={form.control}
              name="patient_id"
              render={({ field }) => (
                <FormItem className="md:col-span-2 flex flex-col">
                  <FormLabel>Patient</FormLabel>
                  <PatientSelect 
                    patients={patients}
                    isLoading={isLoadingPatients}
                    value={field.value}
                    onSelect={field.onChange}
                    onCreateNew={(name) => {
                      setNewPatientName(name);
                      setIsPatientModalOpen(true);
                    }}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 2. Doctor Select (Standardized) */}
            <FormField
              control={form.control}
              name="doctor_id"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Doctor</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingDoctors}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={isLoadingDoctors ? "Loading..." : "Select a doctor"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(doctors || []).map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          <span className="font-medium">{d.name}</span>
                          <span className="text-muted-foreground ml-2 text-xs">({d.department_name})</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 3. Date & Time */}
            <FormField
              control={form.control}
              name="time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Time</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Time" /></SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-60">
                      {generateTimeSlots().map((s) => (
                        <SelectItem key={s.value} value={s.value}>{s.display}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                        >
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date("1900-01-01")}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 4. Type & Status */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="Walk-in">Walk-in</SelectItem>
                      <SelectItem value="Digital">Digital</SelectItem>
                    </SelectContent>
                  </Select>
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
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      {["Scheduled", "In Progress", "Completed", "Cancelled"].map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea {...field} value={field.value || ""} placeholder="Add any additional notes..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="md:col-span-2 gap-2">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Saving..." : appointment ? "Update Appointment" : "Create Appointment"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>

      {/* Logic simplification: Callback directly updates form instead of effect watching state */}
      {isPatientModalOpen && (
        <PatientModal
          open={isPatientModalOpen}
          onOpenChange={setIsPatientModalOpen}
          initialName={newPatientName}
          patient={null}
          onPatientCreated={(newPatient) => {
            // DIRECTLY update form state here. No useEffect needed.
            form.setValue("patient_id", newPatient.id);
            setIsPatientModalOpen(false);
            // The PatientSelect component will auto-sync the name via its own internal effect watching 'value'
          }}
        />
      )}
    </Dialog>
  );
};