
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

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

type Bill = Database['public']['Tables']['bills']['Row'];
type Patient = Database['public']['Tables']['patients']['Row'];

enum BillStatusEnum {
  "Paid" = "Paid",
  "Pending" = "Pending",
  "Overdue" = "Overdue",
}

const billingFormSchema = z.object({
  patient_id: z.string().nonempty('Patient is required'),
  appointment_id: z.string().nullable().optional().transform(e => e === "" ? null : e),
  amount: z.number().min(0, 'Amount must be positive'),
  description: z.string().nullable().optional().transform(e => e === "" ? null : e),
  invoice_number: z.string().nullable().optional().transform(e => e === "" ? null : e),
  status: z.nativeEnum(BillStatusEnum, {
    required_error: 'Status is required',
  }),
});

type BillingFormValues = z.infer<typeof billingFormSchema>;

interface BillingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bill: Bill | null;
  patient?: Patient | null;
}

const BillingModal: React.FC<BillingModalProps> = ({
  open,
  onOpenChange,
  bill,
  patient,
}) => {
  const queryClient = useQueryClient();
  const { activeClinic } = useAuth();

  const form = useForm<BillingFormValues>({
    resolver: zodResolver(billingFormSchema),
    defaultValues: {
      patient_id: bill?.patient_id || patient?.id || '',
      appointment_id: bill?.appointment_id || '',
      amount: bill?.amount ? Number(bill.amount) : 0,
      description: bill?.description || '',
      invoice_number: bill?.invoice_number || '',
      status: bill ? (bill.status as BillStatusEnum) : BillStatusEnum.Pending,
    },
  });

  useEffect(() => {
    if (open) {
      const defaultValues = {
        patient_id: bill?.patient_id || patient?.id || '',
        appointment_id: bill?.appointment_id || '',
        amount: bill?.amount ? Number(bill.amount) : 0,
        description: bill?.description || '',
        invoice_number: bill?.invoice_number || '',
        status: bill ? (bill.status as BillStatusEnum) : BillStatusEnum.Pending,
      };
      form.reset(defaultValues);
    }
  }, [open, bill, patient, form]);

  // Fetch patients for selection
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

  // Fetch appointments for selection
  const { data: appointments, isLoading: isLoadingAppointments } = useQuery({
    queryKey: ['appointments', activeClinic?.clinic_id],
    queryFn: async () => {
      if (!activeClinic?.clinic_id) return [];
      const { data, error } = await supabase
        .rpc('get_appointments_with_details_by_clinic', { clinic_id: activeClinic.clinic_id });
      if (error) throw error;
      return data || [];
    },
    enabled: open && !!activeClinic?.clinic_id,
  });

  const mutation = useMutation({
    mutationFn: async (values: BillingFormValues) => {
      if (!activeClinic?.clinic_id) throw new Error('No active clinic selected.');
      
      const billData = {
        clinic_id: activeClinic.clinic_id,
        patient_id: values.patient_id,
        appointment_id: values.appointment_id,
        amount: values.amount,
        description: values.description,
        invoice_number: values.invoice_number,
        status: values.status,
      };

      let result;
      if (bill) {
        result = await supabase
          .from('bills')
          .update(billData)
          .eq('id', bill.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from('bills')
          .insert(billData)
          .select()
          .single();
      }

      if (result.error) throw result.error;
      return result.data;
    },
    onSuccess: () => {
      toast.success(bill ? 'Bill updated!' : 'Bill created!');
      queryClient.invalidateQueries({ queryKey: ['bills', activeClinic?.clinic_id] });
      queryClient.invalidateQueries({ queryKey: ['patientBills'] });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      console.error("BillingModal: Mutation error:", error);
      toast.error(bill ? 'Failed to update bill.' : 'Failed to create bill.', {
        description: error.message,
      });
    },
  });

  const onSubmit = (values: BillingFormValues) => {
    mutation.mutate(values);
  };

  const isSubmitting = mutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{bill ? 'Edit Bill' : 'New Bill'}</DialogTitle>
          <DialogDescription>
            Fill in the details to {bill ? 'edit' : 'create'} a bill.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            {/* Patient Select */}
            <FormField
              control={form.control}
              name="patient_id"
              render={({ field }) => (
                <FormItem>
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

            {/* Appointment Select (Optional) */}
            <FormField
              control={form.control}
              name="appointment_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Related Appointment (Optional)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ''} disabled={isLoadingAppointments}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={isLoadingAppointments ? "Loading appointments..." : "Select an appointment"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">No appointment</SelectItem>
                      {(appointments || []).map((apt) => (
                        <SelectItem key={apt.id} value={apt.id}>
                          {apt.patient_name} - {apt.date} ({apt.doctor_name})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Amount */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Invoice Number */}
            <FormField
              control={form.control}
              name="invoice_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Invoice Number (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="INV-001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Status */}
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
                      {Object.values(BillStatusEnum).map(status => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Description of services..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8v-8H4z" />
                    </svg>
                    {bill ? 'Saving...' : 'Creating...'}
                  </span>
                ) : (
                  bill ? 'Save Changes' : 'Create Bill'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export { BillingModal };
