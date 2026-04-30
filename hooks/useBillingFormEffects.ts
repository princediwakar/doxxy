"use client";
import { useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import type { BillingFormValues, ServiceItem, Bill, UseBillingProps } from '@/types/billing';

interface DoctorFee {
  consultation_fee: number;
}

interface SelectedAppointment {
  department_name?: string | null;
}

export function useBillingFormEffects(
  form: UseFormReturn<BillingFormValues>,
  open: boolean,
  mode: UseBillingProps['mode'],
  bill: Bill | null | undefined,
  patient: UseBillingProps['patient'],
  appointment: UseBillingProps['appointment'],
  doctorFee: DoctorFee | null | undefined,
  selectedAppointmentId: string | null,
  selectedAppointment: SelectedAppointment | null | undefined
) {
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

  // Reset form when modal opens
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
}
