import { useEffect, useState, useRef } from "react";
import { format } from "date-fns";
import { CalendarIcon, Plus, Check, Phone, Hash } from "lucide-react";
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
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
  CommandGroup,
} from "@/components/ui/command";
import { toast } from "sonner";

import { PatientModal } from "@/components/patients/PatientModal";
import {
  Patient,
  appointmentFormSchema,
  AppointmentFormValues,
  getNextTimeSlot,
  generateTimeSlots,
} from "./appointment.utils";
import type { AppointmentData } from "@/types/appointments";
import {
  useAppointmentForm,
  useAppointmentMutation,
} from "../../hooks/useAppointmentForm";

// Helper to format Age/Gender compactly: "25/M" or "M" or "25"
const formatDemographics = (age?: number | null, gender?: string | null) => {
  const parts = [];
  if (age !== null && age !== undefined) parts.push(age);
  if (gender) parts.push(gender.charAt(0).toUpperCase()); // Take first letter 'M'/'F'
  return parts.length > 0 ? parts.join("/") : null;
};

interface AppointmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: AppointmentData | null;
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
  const [newlyCreatedPatient, setNewlyCreatedPatient] = useState<Patient | null>(null);
  const [pendingPatientId, setPendingPatientId] = useState<string | null>(null);

  // State for the Autocomplete/Typeahead
  const [inputQuery, setInputQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const commandRef = useRef<HTMLDivElement>(null);

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
  
  // Close dropdown if clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (commandRef.current && !commandRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

      setInputQuery("");
      setIsDropdownOpen(false);
    }
  }, [open, appointment, patient, form, activeClinic?.clinic_id]);

  // Handle auto-selecting doctor
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
      setInputQuery(newlyCreatedPatient.name); 
      setNewlyCreatedPatient(null);
    }
  }, [newlyCreatedPatient, form]);

  useEffect(() => {
    if (pendingPatientId && patients?.some((p) => p.id === pendingPatientId)) {
      form.setValue("patient_id", pendingPatientId);
      setPendingPatientId(null);
    }
  }, [pendingPatientId, patients, form]);

  // Sync Input Text with Form ID
  useEffect(() => {
    const currentId = form.getValues("patient_id");
    if (currentId && patients) {
      const selected = patients.find((p) => p.id === currentId);
      if (selected && selected.name !== inputQuery) {
        setInputQuery(selected.name);
      }
    }
  }, [form, inputQuery, patients]); 

  // 5. Handlers
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
      <DialogContent className="sm:max-w-[425px] z-[50] overflow-visible">
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
            {/* Patient Autocomplete Input */}
            <FormField
              control={form.control}
              name="patient_id"
              render={({ field }) => (
                <FormItem className="md:col-span-2 flex flex-col">
                  <FormLabel>Patient</FormLabel>
                  <FormControl>
                    <div className="relative" ref={commandRef}>
                      <Command 
                        shouldFilter={false}
                        className="rounded-lg border shadow-sm overflow-visible bg-background"
                      >
                        <CommandInput
                          placeholder="Type name to search..."
                          value={inputQuery}
                          onValueChange={(val) => {
                            setInputQuery(val);
                            setIsDropdownOpen(!!val); 
                            if (!val) field.onChange("");
                          }}
                          onFocus={() => {
                             if (inputQuery) setIsDropdownOpen(true);
                          }}
                          className="border-none focus:ring-0 capitalize"
                          // FIX: Removed isLoadingPatients from disabled, Added autoFocus
                          disabled={!!patient}
                          autoFocus={!patient && !appointment}
                        />
                        
                        {/* Dropdown Container */}
                        <div className={cn(
                          "absolute top-full left-0 w-full bg-popover text-popover-foreground shadow-lg rounded-md border mt-1 z-[60] flex flex-col",
                          !isDropdownOpen && "hidden" 
                        )}>
                          
                          {/* 1. Results Area (Scrollable) */}
                          <div className="max-h-[220px] overflow-y-auto overflow-x-hidden">
                            <CommandList>
                              {isLoadingPatients ? (
                                <div className="p-2 text-xs text-muted-foreground text-center">Loading...</div>
                              ) : (
                                <CommandGroup>
                                  {patients
                                    ?.filter((p) =>
                                      p.name?.toLowerCase().includes(inputQuery.toLowerCase())
                                    )
                                    .map((p) => {
                                      const demographics = formatDemographics(p.age, p.gender);

                                      return (
                                        <CommandItem
                                          key={p.id}
                                          value={p.name + p.id} 
                                          onSelect={() => {
                                            field.onChange(p.id);
                                            setInputQuery(p.name);
                                            setIsDropdownOpen(false);
                                          }}
                                          className="cursor-pointer"
                                        >
                                          {/* Selection Checkmark */}
                                          <Check
                                            className={cn(
                                              "mr-2 h-4 w-4 shrink-0",
                                              field.value === p.id
                                                ? "opacity-100"
                                                : "opacity-0"
                                            )}
                                          />
                                          
                                          {/* Rich Item Content */}
                                          <div className="flex flex-col gap-0.5 w-full">
                                            {/* Line 1: Name + Demographics Badge */}
                                            <div className="flex items-center gap-2">
                                              <span className="font-medium">{p.name}</span>
                                              {demographics && (
                                                <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-sm uppercase tracking-wide font-medium">
                                                  {demographics}
                                                </span>
                                              )}
                                            </div>

                                            {/* Line 2: Secondary Info (Phone & Med ID) */}
                                            <div className="flex items-center gap-3 text-xs text-muted-foreground truncate">
                                              {p.phone && (
                                                <div className="flex items-center gap-1">
                                                  <Phone className="h-3 w-3 opacity-70" />
                                                  <span>{p.phone}</span>
                                                </div>
                                              )}
                                              {/* Only show separator if both exist */}
                                              {p.phone && p.medical_id && <span>•</span>}
                                              
                                              {p.medical_id && (
                                                <div className="flex items-center gap-1">
                                                  <Hash className="h-3 w-3 opacity-70" />
                                                  <span>{p.medical_id}</span>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        </CommandItem>
                                      );
                                    })}
                                </CommandGroup>
                              )}
                            </CommandList>
                          </div>

                          {/* 2. Sticky Footer (Create Button) */}
                          {inputQuery.length > 0 && (
                             <div className="border-t p-1 bg-accent/5 backdrop-blur-sm"> 
                                <button
                                  type="button"
                                  className="flex w-full items-center gap-2 rounded-sm px-2 py-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground text-primary font-medium transition-colors"
                                  onClick={() => {
                                    setIsDropdownOpen(false);
                                    setIsPatientModalOpen(true);
                                  }}
                                >
                                  <Plus className="h-4 w-4" />
                                  Create "{inputQuery}"
                                </button>
                             </div>
                          )}
                        </div>
                      </Command>
                    </div>
                  </FormControl>
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
                {mutation.isPending ? "Saving..." : appointment ? "Save Changes" : "Create Appointment"}
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
          initialName={inputQuery} 
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