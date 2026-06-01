"use client";
import { useMemo, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAppState } from '@/contexts/AppStateContext';
import { useBillingQueries } from '@/hooks/useBillingQueries';
import { useBillingFormEffects } from '@/hooks/useBillingFormEffects';
import { saveBill } from '@/actions/billing';
import { showErrorToast } from '@/lib/error-utils';
import { toast } from 'sonner';
import type { Medicine } from '@/types/prescriptions';
import type { InventoryItemWithMedicine } from '@/types/core';
import type { DbBill } from '@/types/core';
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
  medicine_id: z.number().nullable().optional(),
  inventory_item_id: z.string().uuid().nullable().optional(),
  source: z.enum(['catalog', 'inventory', 'manual']).optional(),
});

const billingFormSchema = z.object({
  patient_id: z.string().nonempty('Patient is required'),
  appointment_id: z.string().nullable().optional().transform(e => e === "" || e === "none" ? null : e),
  invoice_number: z.string().optional(),
  amount: z.number().min(0, 'Amount must be positive').optional(),
  description: z.string().nullable().optional().transform(e => e === "" ? null : e),
  service_items: z.array(serviceItemSchema).optional(),
  discount_percentage: z.number().min(0).max(100).default(0),
  tax_percentage: z.number().min(0).max(100).default(0),
  notes: z.string().optional(),
});

export type { BillingFormValues, ServiceItem };

export const useBilling = ({ bill, patient, appointment, mode = 'create', open }: UseBillingProps) => {
  const { activeClinicId } = useAppState();

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

  const selectedPatientId = form.watch('patient_id');
  const selectedAppointmentId = form.watch('appointment_id');
  const discountPercentage = form.watch('discount_percentage') || 0;
  const taxPercentage = form.watch('tax_percentage') || 0;
  const serviceItems = form.watch('service_items') || [];

  const [isSubmitting, setIsSubmitting] = useState(false);

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
    prescriptionItems,
  } = useBillingQueries(open, selectedPatientId, selectedAppointmentId, mode);

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

  const selectMedicineForItem = (index: number, medicine: Medicine, inventoryItem?: InventoryItemWithMedicine) => {
    const currentItems = form.getValues('service_items') || [];
    const updatedItems = [...currentItems];
    const rate = inventoryItem?.mrp ?? medicine.price ?? 0;
    updatedItems[index] = {
      ...updatedItems[index],
      description: medicine.name,
      rate,
      amount: (updatedItems[index].quantity || 1) * rate,
      medicine_id: medicine.id,
      inventory_item_id: inventoryItem?.id ?? null,
      source: inventoryItem ? 'inventory' : 'catalog',
    };
    form.setValue('service_items', updatedItems, { shouldValidate: true, shouldDirty: true });
    form.trigger('service_items');
  };

  const handleSave = useCallback(async (values: BillingFormValues): Promise<DbBill> => {
    if (!activeClinicId) throw new Error('No active clinic selected');
    setIsSubmitting(true);
    try {
      const result = await saveBill(
        mode as 'create' | 'edit',
        {
          patient_id: values.patient_id,
          appointment_id: values.appointment_id,
          clinic_id: activeClinicId,
          amount: calculateTotals.total,
          description: values.description,
          service_items: values.service_items as unknown as import('@/types/core').Json,
          discount_percentage: values.discount_percentage,
          tax_percentage: values.tax_percentage,
          notes: values.notes,
        },
        bill?.id,
      );
      if ('error' in result && result.error) {
        throw new Error(result.error);
      }
      if ('data' in result && result.data) {
        return result.data as DbBill;
      }
      throw new Error('Unexpected response from server');
    } catch (err) {
      const message = err instanceof Error ? err.message : `Failed to ${mode === 'edit' ? 'update' : 'create'} bill`;
      showErrorToast(new Error(message), { title: 'Bill save failed' });
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, [activeClinicId, mode, bill?.id, calculateTotals.total]);

  useBillingFormEffects(form, open, mode, bill, patient, appointment, doctorFee, selectedAppointmentId, selectedAppointment, prescriptionItems);

  return {
    form,
    appointments: filteredAppointments,
    patients,
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
    selectMedicineForItem,
    saveBill: handleSave,
    isSubmitting,
  };
};
