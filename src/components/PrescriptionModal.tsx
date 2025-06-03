import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { Pill, Plus, Trash2 } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";

type Appointment = Database['public']['Tables']['appointments']['Row'] & {
  patient_name?: string;
  doctor_name?: string;
};

// Prescription schema
const medicationSchema = z.object({
  name: z.string().min(1, "Medication name is required"),
  dosage: z.string().optional(),
  route: z.enum(["Oral", "Topical", "IV", "IM", "Eye Drops"]).optional(),
  frequency: z.enum(["OD", "BD", "TDS", "QID", "PRN"]).optional(),
  duration: z.string().optional(),
  instructions: z.string().optional(),
  eye: z.enum(["Left", "Right", "Both", "N/A"]).default("N/A"),
});

const prescriptionFormSchema = z.object({
  medications: z.array(medicationSchema).min(1, "At least one medication is required"),
});

type PrescriptionFormValues = z.infer<typeof prescriptionFormSchema>;

interface PrescriptionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  consultationId: string | null;
  appointment: Appointment | null;
  doctorId: string | null;
  patientId: string | null;
  clinicId: string | null;
}

export function PrescriptionModal({ open, onOpenChange, consultationId, appointment, doctorId, patientId, clinicId }: PrescriptionModalProps) {
  const queryClient = useQueryClient();
  const [medications, setMedications] = useState<PrescriptionFormValues['medications']>([{ name: "", eye: "N/A" }]);
  const [shouldClose, setShouldClose] = useState(false);

  const form = useForm<PrescriptionFormValues>({
    resolver: zodResolver(prescriptionFormSchema),
    defaultValues: { medications: [{ name: "", eye: "N/A" }] },
    mode: 'onChange',
  });

  const addMedication = useCallback(() => {
    setMedications((prev) => [...prev, { name: "", eye: "N/A" }]);
    form.setValue('medications', [...medications, { name: "", eye: "N/A" }]);
  }, [form, medications]);

  const removeMedication = useCallback((index: number) => {
    setMedications((prev) => prev.filter((_, i) => i !== index));
    form.setValue('medications', medications.filter((_, i) => i !== index));
  }, [form, medications]);

  const saveMutation = useMutation({
    mutationFn: async (values: PrescriptionFormValues) => {
      if (!consultationId || !doctorId || !patientId || !clinicId) {
        throw new Error('Missing required data to save prescription.');
      }
      const prescriptionData = {
        consultation_id: consultationId,
        doctor_id: doctorId,
        patient_id: patientId,
        clinic_id: clinicId,
        medications: values.medications,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const { data, error } = await supabase
        .from('prescriptions')
        .insert(prescriptionData)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast(
        "Prescription saved successfully!"
      );
      queryClient.invalidateQueries({ queryKey: ['prescriptions', consultationId] });
      setShouldClose(true);
    },
    onError: (error: Error) => {
      toast(
        "Error saving prescription",
        { description: `Failed to save prescription: ${error.message}` }
      );
    },
  });

  const onSubmit = useCallback((values: PrescriptionFormValues) => {
    saveMutation.mutate(values);
  }, [saveMutation]);

  const handleOpenChange = useCallback((newOpen: boolean) => {
    if (!newOpen && form.formState.isDirty && !shouldClose) {
      toast(
        "Unsaved Changes",
        { description: "You have unsaved changes. Please save or cancel to close." }
      );
      return;
    }
    if (shouldClose || !newOpen) {
      onOpenChange(newOpen);
      setShouldClose(false);
      form.reset();
      setMedications([{ name: "", eye: "N/A" }]);
    }
  }, [form, onOpenChange, shouldClose]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[90vw] sm:max-w-[720px] max-h-[80vh] flex flex-col p-0">
        <DialogHeader className="px-4 py-3 sm:px-6 sm:py-4 border-b bg-background">
          <DialogTitle className="text-base sm:text-lg font-semibold text-foreground">
            Add Prescription for {appointment?.patient_name || 'Patient'}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-1 px-4 py-3 sm:px-6 sm:py-4 overflow-y-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {medications.map((_, index) => (
                <div key={index} className="border rounded-lg p-3 sm:p-4 bg-background">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-semibold text-foreground">Medication {index + 1}</h3>
                    {index > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMedication(index)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <FormField
                      control={form.control}
                      name={`medications.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs sm:text-sm">Medication Name *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="e.g., Levetiracetam"
                              className="text-xs sm:text-sm border-2 border-primary bg-primary/5"
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`medications.${index}.dosage`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs sm:text-sm">Dosage</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="e.g., 500mg"
                              className="text-xs sm:text-sm"
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`medications.${index}.route`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs sm:text-sm">Route</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="text-xs sm:text-sm">
                                <SelectValue placeholder="Select route" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Oral">Oral</SelectItem>
                              <SelectItem value="Topical">Topical</SelectItem>
                              <SelectItem value="IV">IV</SelectItem>
                              <SelectItem value="IM">IM</SelectItem>
                              <SelectItem value="Eye Drops">Eye Drops</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`medications.${index}.frequency`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs sm:text-sm">Frequency</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="text-xs sm:text-sm">
                                <SelectValue placeholder="Select frequency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="OD">OD (Once Daily)</SelectItem>
                              <SelectItem value="BD">BD (Twice Daily)</SelectItem>
                              <SelectItem value="TDS">TDS (Three Times Daily)</SelectItem>
                              <SelectItem value="QID">QID (Four Times Daily)</SelectItem>
                              <SelectItem value="PRN">PRN (As Needed)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`medications.${index}.duration`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs sm:text-sm">Duration</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="e.g., 1 month"
                              className="text-xs sm:text-sm"
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`medications.${index}.eye`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs sm:text-sm">Eye (Ophthalmology)</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="text-xs sm:text-sm">
                                <SelectValue placeholder="Select eye" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Left">Left</SelectItem>
                              <SelectItem value="Right">Right</SelectItem>
                              <SelectItem value="Both">Both</SelectItem>
                              <SelectItem value="N/A">N/A</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`medications.${index}.instructions`}
                      render={({ field }) => (
                        <FormItem className="sm:col-span-2">
                          <FormLabel className="text-xs sm:text-sm">Instructions</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="e.g., Take after food"
                              className="text-xs sm:text-sm"
                              rows={3}
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={addMedication}
                className="w-full sm:w-auto"
              >
                <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                Add Medication
              </Button>
            </form>
          </Form>
        </ScrollArea>
        <DialogFooter className="border-t bg-background px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex gap-2 justify-end w-full">
            <DialogClose asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={saveMutation.isPending}
                onClick={() => {
                  if (form.formState.isDirty) {
                    toast(
                      "Unsaved Changes",
                      { description: "You have unsaved changes. Please save before closing." }
                    );
                    return;
                  }
                  setShouldClose(true);
                }}
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              size="sm"
              onClick={form.handleSubmit(onSubmit)}
              disabled={saveMutation.isPending || !form.formState.isValid}
            >
              {saveMutation.isPending ? 'Saving...' : 'Save Prescription'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}