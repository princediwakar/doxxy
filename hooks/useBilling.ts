"use client";
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { useInvoiceNumber } from '@/hooks/useInvoiceNumber';
import { useBillingQueries } from '@/hooks/useBillingQueries';
import { useSaveBill } from '@/hooks/useSaveBill';
import { useBillingFormEffects } from '@/hooks/useBillingFormEffects';
import type {
  ServiceItem,
  BillingFormValues,
  UseBillingProps,
} from '@/types/billing';

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

export type { BillingFormValues, ServiceItem };

export const useBilling = ({ bill, patient, appointment, mode = 'create', open }: UseBillingProps) => {
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

  // Watch form values
  const selectedPatientId = form.watch('patient_id');
  const selectedAppointmentId = form.watch('appointment_id');
  const discountPercentage = form.watch('discount_percentage') || 0;
  const taxPercentage = form.watch('tax_percentage') || 0;
  const serviceItems = form.watch('service_items') || [];

  // Invoice number generation
  const {
    data: newInvoiceNumber,
    isLoading: isLoadingInvoiceNumber,
    error: invoiceError,
    refetch: refetchInvoiceNumber,
  } = useInvoiceNumber(open, mode, !!bill?.invoice_number);

  // Data queries: appointments, patients, doctor fee, selected appointment
  const {
    appointments: filteredAppointments,
    patients,
    isLoadingAppointments,
    isLoadingPatients,
    appointmentsError,
    patientsError,
    doctorFee,
    doctorFeeError,
    selectedAppointment,
  } = useBillingQueries(open, selectedPatientId, selectedAppointmentId, mode);

  // Calculate bill totals
  const calculateTotals = useMemo(() => {
    let subtotal = serviceItems.reduce((sum, item) => sum + (item.amount || 0), 0);
    if (mode === 'view' && bill?.amount && subtotal === 0) {
      subtotal = Number(bill.amount);
    }
    const discountAmount = subtotal * (discountPercentage / 100);
    const subtotalAfterDiscount = subtotal - discountAmount;
    const taxAmount = subtotalAfterDiscount * (taxPercentage / 100);
    const total = subtotalAfterDiscount + taxAmount;
    return { subtotal, discountAmount, subtotalAfterDiscount, taxAmount, total };
  }, [serviceItems, discountPercentage, taxPercentage, mode, bill]);

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
    const currentItem = updatedItems[index];
    updatedItems[index] = { ...currentItem, [field]: value };
    if (field === 'quantity' || field === 'rate') {
      const quantity = field === 'quantity' ? Number(value) : Number(currentItem.quantity);
      const rate = field === 'rate' ? Number(value) : Number(currentItem.rate);
      updatedItems[index].amount = quantity * rate;
    }
    form.setValue('service_items', updatedItems, { shouldValidate: true, shouldDirty: true });
    form.trigger('service_items');
  };

  // Save bill mutation
  const saveBillMutation = useSaveBill(mode, bill, calculateTotals);
  // Effect 1: Set invoice number in form when generated
  useEffect(() => {
    if (mode === 'create' && newInvoiceNumber) {
      form.setValue('invoice_number', newInvoiceNumber, { shouldValidate: true });
    }
  }, [newInvoiceNumber, form, mode]);
  // Effect 2: Retry invoice generation after 2s if still missing
  useEffect(() => {
    if (mode === 'create' && open && activeClinic?.clinic_id && !newInvoiceNumber && !isLoadingInvoiceNumber && !invoiceError) {
      const timer = setTimeout(() => {
        if (!form.getValues('invoice_number')) {
          refetchInvoiceNumber();
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [mode, open, activeClinic?.clinic_id, newInvoiceNumber, isLoadingInvoiceNumber, invoiceError, refetchInvoiceNumber, form]);
  // Form lifecycle effects (prefill + reset)
  useBillingFormEffects(form, open, mode, bill, patient, appointment, doctorFee, selectedAppointmentId, selectedAppointment);

  return {
    form,
    appointments: filteredAppointments,
    patients,
    isLoadingInvoiceNumber,
    isLoadingAppointments,
    isLoadingPatients,
    appointmentsError: appointmentsError as Error | null,
    patientsError: patientsError as Error | null,
    doctorFeeError: doctorFeeError as Error | null,
    selectedAppointment,
    doctorFee,
    calculateTotals,
    addServiceItem,
    removeServiceItem,
    updateServiceItem,
    saveBillMutation,
    isSubmitting: saveBillMutation.isPending,
    refetchInvoiceNumber,
  };
};
