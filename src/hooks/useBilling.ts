import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getSupabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';

const supabase = getSupabase();

export interface ServiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

const serviceItemSchema = z.object({
  description: z.string().min(1, 'Service description is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  rate: z.number().min(0, 'Rate must be positive'),
  amount: z.number().min(0, 'Amount must be positive'),
});

const billingFormSchema = z.object({
  patient_id: z.string().nonempty('Patient is required'),
  appointment_id: z.string().nullable().optional().transform(e => e === "" || e === "none" ? null : e),
  invoice_number: z.string().min(1, 'Invoice number is required'),
  amount: z.number().min(0, 'Amount must be positive').optional(),
  description: z.string().nullable().optional().transform(e => e === "" ? null : e),
  service_items: z.array(serviceItemSchema).optional(),
  discount_percentage: z.number().min(0).max(100).default(0),
  tax_percentage: z.number().min(0).max(100).default(0),
  notes: z.string().optional(),
});

export type BillingFormValues = z.infer<typeof billingFormSchema>;

type BillRow = Database['public']['Tables']['bills']['Row'];
type Patient = Database['public']['Tables']['patients']['Row'];
type Appointment = {
  id: string;
  patient_id: string;
  doctor_id: string;
  patient_name?: string;
  doctor_name?: string;
  date: string;
  time: string;
  department_name?: string;
};

interface UseBillingProps {
  bill?: BillRow | null;
  patient?: Patient | null;
  appointment?: Appointment | null;
  mode?: 'create' | 'view' | 'edit';
  open: boolean;
}

export const useBilling = ({ bill, patient, appointment, mode = 'create', open }: UseBillingProps) => {
  const queryClient = useQueryClient();
  const { activeClinic } = useAuth();

  const form = useForm<BillingFormValues>({
    resolver: zodResolver(billingFormSchema),
    defaultValues: {
      patient_id: bill?.patient_id || patient?.id || appointment?.patient_id || '',
      appointment_id: bill?.appointment_id || appointment?.id || '',
      amount: bill?.amount ? Number(bill.amount) : 0,
      description: bill?.description || '',
      invoice_number: bill?.invoice_number || '',
      service_items: [{ description: '', quantity: 1, rate: 0, amount: 0 }],
      discount_percentage: 0,
      tax_percentage: 0,
      notes: '',
    },
  });

  // Fetch new invoice number for create mode
  const { data: newInvoiceNumber, isLoading: isLoadingInvoiceNumber } = useQuery({
    queryKey: ['newInvoiceNumber', activeClinic?.clinic_id],
    queryFn: async () => {
      if (!activeClinic?.clinic_id) throw new Error('No active clinic selected');
      const { data, error } = await supabase
        .rpc('generate_invoice_number', { clinic_id_arg: activeClinic.clinic_id });
      if (error) throw error;
      if (!data) throw new Error('Invoice number generation returned null');
      return data;
    },
    enabled: open && !!activeClinic?.clinic_id && mode === 'create' && !bill?.invoice_number,
    retry: 2,
    retryDelay: 1000,
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

  // Fetch patients for selection
  const { data: patients, isLoading: isLoadingPatients } = useQuery({
    queryKey: ['patients', activeClinic?.clinic_id],
    queryFn: async () => {
      if (!activeClinic?.clinic_id) return [];
      const { data, error } = await supabase
        .from('patients')
        .select('id, name, phone, email, medical_id')
        .eq('clinic_id', activeClinic.clinic_id)
        .order('name');
      if (error) throw error;
      return data || [];
    },
    enabled: open && !!activeClinic?.clinic_id,
  });

  // Watch for appointment selection
  const selectedAppointmentId = form.watch('appointment_id');
  const selectedAppointment = appointments?.find(apt => apt.id === selectedAppointmentId);

  // Fetch doctor consultation fee
  const { data: doctorFee } = useQuery({
    queryKey: ['doctorFee', selectedAppointment?.doctor_id],
    queryFn: async () => {
      if (!selectedAppointment?.doctor_id) return null;
      const { data, error } = await supabase
        .from('doctors')
        .select('consultation_fee, name')
        .eq('id', selectedAppointment.doctor_id)
        .single();
      if (error) throw error;
      return {
        consultation_fee: data.consultation_fee || 0,
        doctor_name: data.name,
      };
    },
    enabled: !!selectedAppointment?.doctor_id && mode !== 'view',
  });

  // Watch form values for calculations  
  const serviceItems = useMemo(() => form.watch('service_items') || [], [form]);
  const discountPercentage = form.watch('discount_percentage') || 0;
  const taxPercentage = form.watch('tax_percentage') || 0;

  // Calculate totals
  const calculateTotals = useMemo(() => {
    const subtotal = serviceItems.reduce((sum, item) => sum + (item.amount || 0), 0);
    const discountAmount = subtotal * (discountPercentage / 100);
    const subtotalAfterDiscount = subtotal - discountAmount;
    const taxAmount = subtotalAfterDiscount * (taxPercentage / 100);
    const total = subtotalAfterDiscount + taxAmount;

    return {
      subtotal,
      discountAmount,
      subtotalAfterDiscount,
      taxAmount,
      total,
    };
  }, [serviceItems, discountPercentage, taxPercentage]);

  // Service item management
  const addServiceItem = () => {
    const currentItems = form.getValues('service_items') || [];
    form.setValue('service_items', [
      ...currentItems,
      { description: '', quantity: 1, rate: 0, amount: 0 }
    ]);
  };

  const removeServiceItem = (index: number) => {
    const currentItems = form.getValues('service_items') || [];
    if (currentItems.length > 1) {
      form.setValue('service_items', currentItems.filter((_, i) => i !== index));
    }
  };

  const updateServiceItem = (index: number, field: keyof ServiceItem, value: string | number) => {
    const currentItems = form.getValues('service_items') || [];
    const updatedItems = [...currentItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Auto-calculate amount when quantity or rate changes
    if (field === 'quantity' || field === 'rate') {
      updatedItems[index].amount = updatedItems[index].quantity * updatedItems[index].rate;
    }
    
    form.setValue('service_items', updatedItems);
  };

  // Create/Update bill mutation
  const saveBillMutation = useMutation({
    mutationFn: async (values: BillingFormValues) => {
      if (!activeClinic?.clinic_id) throw new Error('No active clinic selected');

      const billData = {
        patient_id: values.patient_id,
        appointment_id: values.appointment_id,
        clinic_id: activeClinic.clinic_id,
        invoice_number: values.invoice_number,
        amount: calculateTotals.total,
        description: values.description,
        service_items: values.service_items,
        discount_percentage: values.discount_percentage,
        tax_percentage: values.tax_percentage,
        notes: values.notes,
        status: 'Pending' as const,
      };

      if (mode === 'edit' && bill) {
        const { data, error } = await supabase
          .from('bills')
          .update(billData)
          .eq('id', bill.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('bills')
          .insert(billData)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills', activeClinic?.clinic_id] });
      queryClient.invalidateQueries({ queryKey: ['appointments', activeClinic?.clinic_id] });
      toast.success(mode === 'edit' ? 'Bill updated successfully!' : 'Bill created successfully!');
    },
    onError: (error) => {
      toast.error(error.message || `Failed to ${mode === 'edit' ? 'update' : 'create'} bill`);
    },
  });

  // Set invoice number in form
  useEffect(() => {
    if (mode === 'create' && newInvoiceNumber) {
      form.setValue('invoice_number', newInvoiceNumber, { shouldValidate: true });
    }
  }, [newInvoiceNumber, form, mode]);

  // Prefill service item with department-based consultation description
  useEffect(() => {
    if (doctorFee && selectedAppointmentId && selectedAppointment && mode !== 'view') {
      const currentItems = form.getValues('service_items') || [];
      const departmentName = selectedAppointment.department_name === 'General Medicine' || !selectedAppointment.department_name 
        ? 'General' 
        : selectedAppointment.department_name;
      if (currentItems[0]?.description === '') {
        form.setValue('service_items', [{
          description: `${departmentName} Consultation`,
          quantity: 1,
          rate: doctorFee.consultation_fee,
          amount: doctorFee.consultation_fee,
        }]);
      }
    }
  }, [doctorFee, selectedAppointmentId, selectedAppointment, form, mode]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      form.reset({
        patient_id: bill?.patient_id || patient?.id || appointment?.patient_id || '',
        appointment_id: bill?.appointment_id || appointment?.id || '',
        amount: bill?.amount ? Number(bill.amount) : 0,
        description: bill?.description || '',
        invoice_number: bill?.invoice_number || '',
        service_items: bill?.service_items ? (bill.service_items as unknown as ServiceItem[]) : [{ description: '', quantity: 1, rate: 0, amount: 0 }],
        discount_percentage: bill?.discount_percentage ? Number(bill.discount_percentage) : 0,
        tax_percentage: bill?.tax_percentage ? Number(bill.tax_percentage) : 0,
        notes: bill?.notes || '',
      });
    }
  }, [open, bill, patient, appointment, form]);

  return {
    form,
    appointments,
    patients,
    isLoadingInvoiceNumber,
    isLoadingAppointments,
    isLoadingPatients,
    selectedAppointment,
    doctorFee,
    calculateTotals,
    addServiceItem,
    removeServiceItem,
    updateServiceItem,
    saveBillMutation,
    isSubmitting: saveBillMutation.isPending,
  };
}; 