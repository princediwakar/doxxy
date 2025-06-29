import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format, parseISO } from 'date-fns';
import { 
  FileText,
  Plus, 
  Trash2, 
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getSupabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Database } from '@/integrations/supabase/types';
import { Textarea } from '@/components/ui/textarea';

const supabase = getSupabase();

type BillRow = Database['public']['Tables']['bills']['Row'];
type Patient = Database['public']['Tables']['patients']['Row'];
type Appointment = {
  id: string;
  patient_id: string;
  patient_name?: string;
  doctor_name?: string;
  date: string;
  time: string;
};

// Service item interface
interface ServiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

// Service template interface
interface ServiceTemplate {
  description: string;
  rate: number;
  quantity: number;
}

// Service item schema for itemized billing
const serviceItemSchema = z.object({
  description: z.string().min(1, 'Service description is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  rate: z.number().min(0, 'Rate must be positive'),
  amount: z.number().min(0, 'Amount must be positive'),
});

const billingFormSchema = z.object({
  patient_id: z.string().nonempty('Patient is required'),
  appointment_id: z.string().nullable().optional().transform(e => e === "" || e === "none" ? null : e),
  invoice_number: z.string().nullable().optional().transform(e => e === "" ? null : e),
  // Simple billing
  amount: z.number().min(0, 'Amount must be positive').optional(),
  description: z.string().nullable().optional().transform(e => e === "" ? null : e),
  // Itemized billing
  service_items: z.array(serviceItemSchema).optional(),
  // Financial details
  discount_percentage: z.number().min(0).max(100).default(0),
  tax_percentage: z.number().min(0).max(100).default(0),
  notes: z.string().optional(),
});

type BillingFormValues = z.infer<typeof billingFormSchema>;

interface BillingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bill?: BillRow | null;
  patient?: Patient | null;
  appointment?: Appointment | null;
  mode?: 'create' | 'view' | 'edit';
}

// Service templates categorized by specialty
const serviceTemplates: Record<string, ServiceTemplate[]> = {
  general: [
    { description: 'General Consultation', rate: 500, quantity: 1 },
    { description: 'Follow-up Consultation', rate: 300, quantity: 1 },
    { description: 'Health Check-up', rate: 800, quantity: 1 },
    { description: 'Vaccination', rate: 250, quantity: 1 },
  ],
  diagnostics: [
    { description: 'Blood Test - Complete Blood Count', rate: 400, quantity: 1 },
    { description: 'X-Ray', rate: 600, quantity: 1 },
    { description: 'ECG', rate: 300, quantity: 1 },
    { description: 'Ultrasound', rate: 1000, quantity: 1 },
  ],
  cardiology: [
    { description: 'Cardiac Consultation', rate: 800, quantity: 1 },
    { description: 'Echocardiogram', rate: 1500, quantity: 1 },
    { description: 'Stress Test', rate: 2000, quantity: 1 },
    { description: 'Holter Monitor', rate: 1200, quantity: 1 },
  ],
  neurology: [
    { description: 'Neurological Consultation', rate: 900, quantity: 1 },
    { description: 'EEG Test', rate: 1200, quantity: 1 },
    { description: 'Nerve Conduction Study', rate: 1500, quantity: 1 },
  ],
  ophthalmology: [
    { description: 'Comprehensive Eye Exam', rate: 400, quantity: 1 },
    { description: 'Visual Field Test', rate: 800, quantity: 1 },
    { description: 'OCT Scan', rate: 1000, quantity: 1 },
    { description: 'Fundus Photography', rate: 600, quantity: 1 },
  ],
  procedures: [
    { description: 'Minor Procedure', rate: 1000, quantity: 1 },
    { description: 'Injection', rate: 200, quantity: 1 },
    { description: 'Dressing', rate: 150, quantity: 1 },
  ]
};

export const BillingModal: React.FC<BillingModalProps> = ({
  open,
  onOpenChange,
  bill,
  patient,
  appointment,
  mode = 'create',
}) => {
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

  useEffect(() => {
    if (open) {
      // Auto-fill patient from appointment if available
      const patientId = bill?.patient_id || patient?.id || appointment?.patient_id || '';
      const appointmentId = bill?.appointment_id || appointment?.id || '';
      
      form.reset({
        patient_id: patientId,
        appointment_id: appointmentId,
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
    enabled: open && !!activeClinic?.clinic_id, // Enable for both create and view modes
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

  // Watch for patient selection to filter appointments
  const selectedPatientId = form.watch('patient_id');
  const selectedAppointmentId = form.watch('appointment_id');

  // Filter appointments based on selected patient
  const filteredAppointments = useMemo(() => {
    if (!selectedPatientId || !appointments) return appointments || [];
    return appointments.filter(apt => apt.patient_id === selectedPatientId);
  }, [appointments, selectedPatientId]);

  // Auto-select patient when appointment is selected
  useEffect(() => {
    if (selectedAppointmentId && selectedAppointmentId !== 'none' && appointments) {
      const selectedAppointment = appointments.find(apt => apt.id === selectedAppointmentId);
      if (selectedAppointment) {
        form.setValue('patient_id', selectedAppointment.patient_id);
      }
    }
  }, [selectedAppointmentId, appointments, form]);

  // Fetch patient details for view mode
  const { data: viewedPatient, isLoading: isLoadingViewedPatient } = useQuery({
    queryKey: ['patient', bill?.patient_id],
    queryFn: async () => {
      if (!bill?.patient_id) return null;
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', bill.patient_id)
        .single();
      if (error) {
        console.error("Error fetching patient for billing view:", error);
        throw new Error('Failed to fetch patient details');
      }
      return data;
    },
    enabled: mode === 'view' && !!bill?.patient_id,
  });

  // Clear appointment when patient changes (if appointment doesn't belong to new patient)
  useEffect(() => {
    if (selectedPatientId && selectedAppointmentId && selectedAppointmentId !== 'none' && appointments) {
      const selectedAppointment = appointments.find(apt => apt.id === selectedAppointmentId);
      if (selectedAppointment && selectedAppointment.patient_id !== selectedPatientId) {
        form.setValue('appointment_id', '');
      }
    }
  }, [selectedPatientId, selectedAppointmentId, appointments, form]);

  const addServiceItem = () => {
    const currentItems = form.getValues('service_items') || [];
    const newItems = [...currentItems, { description: '', quantity: 1, rate: 0, amount: 0 }];
    form.setValue('service_items', newItems);
  };

  const removeServiceItem = (index: number) => {
    const currentItems = form.getValues('service_items') || [];
    if (currentItems.length > 1) {
      const newItems = currentItems.filter((_, i) => i !== index);
      form.setValue('service_items', newItems);
    }
  };

  const updateServiceItem = (index: number, field: keyof ServiceItem, value: string | number) => {
    const currentItems = form.getValues('service_items') || [];
    const updatedItems = [...currentItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Calculate amount when quantity or rate changes
    if (field === 'quantity' || field === 'rate') {
      updatedItems[index].amount = updatedItems[index].quantity * updatedItems[index].rate;
    }
    
    form.setValue('service_items', updatedItems);
  };

  const addServiceTemplate = (template: ServiceTemplate) => {
    const currentItems = form.getValues('service_items') || [];
    const newItems = [...currentItems, { ...template, amount: template.quantity * template.rate }];
    form.setValue('service_items', newItems);
  };

  const calculateTotals = () => {
    const serviceItems = form.watch('service_items') || [];
    const subtotal = serviceItems.reduce((sum, item) => sum + (item.amount || 0), 0);
    const discountAmount = subtotal * ((form.watch('discount_percentage') || 0) / 100);
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = taxableAmount * ((form.watch('tax_percentage') || 0) / 100);
    const total = taxableAmount + taxAmount;

    return {
      subtotal,
      discountAmount,
      taxAmount,
      total,
    };
  };

  const mutation = useMutation({
    mutationFn: async (values: BillingFormValues) => {
      if (!activeClinic?.clinic_id) throw new Error('No active clinic selected.');
      
      const totals = calculateTotals();
      const serviceItems = form.getValues('service_items') || [];
      const finalAmount = totals.total;
      const finalDescription = `Itemized bill with ${serviceItems.length} service(s)`;

      const billData = {
        clinic_id: activeClinic.clinic_id,
        patient_id: values.patient_id,
        appointment_id: values.appointment_id,
        amount: finalAmount,
        description: finalDescription,
        invoice_number: values.invoice_number,
        service_items: serviceItems,
        discount_percentage: values.discount_percentage,
        tax_percentage: values.tax_percentage,
        notes: values.notes,
        items: serviceItems.map(item => ({
          description: item.description,
          amount: item.amount,
          quantity: item.quantity,
        })),
      };

      // Debug log to confirm type
      console.log('Bill payload:', billData, 'Type of items:', typeof billData.items, 'IsArray:', Array.isArray(billData.items));

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
  const totals = form.watch('service_items') ? calculateTotals() : null;

  if (mode === 'view' && bill) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden">
          <DialogTitle>Bill Details</DialogTitle>
          <div className="bg-white rounded-lg shadow-lg p-8">
            {/* Invoice Header */}
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                      <div>
                <h1 className="text-2xl font-bold tracking-wide">INVOICE</h1>
                <div className="text-sm text-muted-foreground mt-1">
                  Invoice #: <span className="font-medium">{bill.invoice_number || 'N/A'}</span>
                      </div>
                <div className="text-sm text-muted-foreground">
                  Date: <span className="font-medium">{format(parseISO(bill.created_at!), 'PPP')}</span>
                    </div>
              </div>
              <div className="text-sm text-muted-foreground">
                Bill Details
              </div>
                  </div>

            {/* Patient & Clinic Info */}
            <div className="flex justify-between mb-8">
              <div>
                <div className="font-semibold mb-1">Billed To:</div>
                  {isLoadingViewedPatient ? (
                    <p>Loading patient information...</p>
                  ) : viewedPatient ? (
                  <div className="text-sm">
                    <div>{viewedPatient.name}</div>
                    <div>ID: {viewedPatient.medical_id || 'N/A'}</div>
                    <div>{viewedPatient.phone || ''}</div>
                    <div>{viewedPatient.email || ''}</div>
                    </div>
                  ) : (
                    <p className="text-destructive">Unable to load patient information.</p>
                  )}
                          </div>
              <div className="text-right">
                <div className="font-semibold mb-1">Clinic:</div>
                <div className="text-sm">
                  {activeClinic?.clinics?.name || 'Clinic'}
                  <div>{activeClinic?.clinics?.address || ''}</div>
                  <div>{activeClinic?.clinics?.email || ''}</div>
                  <div>{activeClinic?.clinics?.phone || ''}</div>
                          </div>
                          </div>
                          </div>

            {/* Service Items Table */}
            <div className="mb-8">
              <table className="min-w-full border rounded-lg overflow-hidden">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left w-2/5">Description</th>
                    <th className="px-2 py-2 text-right w-16">Qty</th>
                    <th className="px-2 py-2 text-right w-20">Rate</th>
                    <th className="px-2 py-2 text-right w-20">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {((bill.service_items as unknown) as ServiceItem[]).map((item, index) => (
                    <tr key={index} className="border-b last:border-b-0">
                      <td className="px-4 py-2 w-2/5">{item.description}</td>
                      <td className="px-2 py-2 text-right w-16">{item.quantity}</td>
                      <td className="px-2 py-2 text-right w-20">₹{item.rate?.toFixed(2)}</td>
                      <td className="px-2 py-2 text-right font-medium w-20">₹{item.amount?.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
                      </div>

            {/* Summary Section */}
            <div className="flex flex-col items-end mb-8">
                        {(() => {
                const serviceItems = ((bill.service_items as unknown) as ServiceItem[]);
                          const subtotal = serviceItems.reduce((sum, item) => sum + (item.amount || 0), 0);
                          const discountPercent = bill.discount_percentage || 0;
                          const taxPercent = bill.tax_percentage || 0;
                          const discountAmount = (subtotal * discountPercent) / 100;
                          const taxableAmount = subtotal - discountAmount;
                          const taxAmount = (taxableAmount * taxPercent) / 100;
                          const total = taxableAmount + taxAmount;
                          return (
                  <div className="w-full max-w-xs">
                    <div className="flex justify-between py-1">
                                <span>Subtotal:</span>
                                <span>₹{subtotal.toFixed(2)}</span>
                              </div>
                              {discountPercent > 0 && (
                      <div className="flex justify-between py-1 text-success">
                                  <span>Discount ({discountPercent}%):</span>
                                  <span>-₹{discountAmount.toFixed(2)}</span>
                                </div>
                              )}
                              {taxPercent > 0 && (
                      <div className="flex justify-between py-1">
                                  <span>Tax ({taxPercent}%):</span>
                                  <span>₹{taxAmount.toFixed(2)}</span>
                                </div>
                              )}
                    <div className="border-t my-2"></div>
                    <div className="flex justify-between font-bold text-lg">
                                <span>Total:</span>
                                <span>₹{total.toFixed(2)}</span>
                              </div>
                  </div>
                          );
                        })()}
                      </div>

              {/* Notes */}
              {bill.notes && (
              <div className="mt-4">
                <div className="font-semibold mb-1">Notes:</div>
                <div className="bg-gray-50 p-3 rounded text-sm whitespace-pre-wrap">{bill.notes}</div>
            </div>
            )}

            <div className="flex justify-end mt-8">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogTitle><div className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Create/Edit Bill
        </div></DialogTitle>
        <ScrollArea className="max-h-[85vh]">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Invoice Header */}
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                  <div>
                    <h1 className="text-2xl font-bold tracking-wide">INVOICE</h1>
                    <div className="text-sm text-muted-foreground mt-1">
                      Invoice #: <span className="font-medium">{form.watch('invoice_number') || 'N/A'}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Date: <span className="font-medium">{bill?.created_at ? format(parseISO(bill.created_at), 'PPP') : format(new Date(), 'PPP')}</span>
                    </div>
                  </div>
                </div>

                {/* Patient & Clinic Info */}
                <div className="flex justify-between mb-8">
                  <div className="w-1/2 pr-4">
                    <div className="font-semibold mb-1">Billed To:</div>
                    <FormField
                      control={form.control}
                      name="patient_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="sr-only">Billed To Patient</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingPatients || !!patient}>
                            <FormControl>
                              <SelectTrigger role="combobox" aria-label="Billed To">
                                <SelectValue placeholder={isLoadingPatients ? 'Loading patients...' : 'Select a patient'} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {(patients || [])
                                .filter((p, index, self) => self.findIndex(patient => patient.id === p.id) === index)
                                .map((p) => (
                                  <SelectItem key={p.id} value={p.id}>
                                    <div>
                                      <div className="font-medium">{p.name}</div>
                                      <div className="text-sm text-muted-foreground">{p.phone}</div>
                                    </div>
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="w-1/2 pl-4 text-right">
                    <div className="font-semibold mb-1">Clinic:</div>
                    <div className="text-sm">
                      {activeClinic?.clinics?.name || 'Clinic'}
                      <div>{activeClinic?.clinics?.address || ''}</div>
                      <div>{activeClinic?.clinics?.email || ''}</div>
                      <div>{activeClinic?.clinics?.phone || ''}</div>
                    </div>
                  </div>
                </div>

                {/* Appointment Selection */}
                <div className="mb-8">
                  <FormField
                    control={form.control}
                    name="appointment_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Related Appointment</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ''} disabled={isLoadingAppointments || !form.watch('patient_id')}>
                          <FormControl>
                            <SelectTrigger role="combobox" aria-label="Related Appointment">
                              <SelectValue placeholder={isLoadingAppointments ? 'Loading appointments...' : !form.watch('patient_id') ? 'Select a patient first' : filteredAppointments.length === 0 ? 'No appointments for this patient' : 'Select an appointment'} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">No appointment</SelectItem>
                            {(filteredAppointments || [])
                              .filter((apt, index, self) => self.findIndex(appointment => appointment.id === apt.id) === index)
                              .map((apt) => (
                                <SelectItem key={apt.id} value={apt.id}>
                                  <div>
                                    <div className="font-medium">{apt.patient_name} - {apt.date}</div>
                                    <div className="text-sm text-muted-foreground">{apt.doctor_name} • {apt.time}</div>
                                  </div>
                                </SelectItem>
                              ))}
                            {form.watch('patient_id') && filteredAppointments.length === 0 && (
                              <SelectItem value="no-appointments" disabled>
                                No appointments found for this patient
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Invoice Number */}
                <div className="mb-8">
                  <FormField
                    control={form.control}
                    name="invoice_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Invoice Number</FormLabel>
                        <FormControl>
                          <Input placeholder="INV-001" {...field} aria-label="Invoice Number" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Service Items Table (Editable) */}
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold">Service Items</h3>
                    <div className="flex space-x-2">
                      <Select onValueChange={(template) => {
                        const [category, index] = template.split('-');
                        const templateItem = serviceTemplates[category as keyof typeof serviceTemplates][parseInt(index)];
                        addServiceTemplate(templateItem);
                      }}>
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="Add template" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(serviceTemplates).map(([category, templates]) => (
                            <div key={category}>
                              <div className="px-2 py-1 text-sm font-semibold text-muted-foreground capitalize">
                                {category}
                              </div>
                              {templates.map((template, index) => (
                                <SelectItem key={`${category}-${index}`} value={`${category}-${index}`}>
                                  {template.description} - ₹{template.rate}
                                </SelectItem>
                              ))}
                            </div>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button type="button" variant="outline" onClick={addServiceItem}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Item
                      </Button>
                    </div>
                  </div>
                  <table className="min-w-full border rounded-lg overflow-hidden">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left w-2/5">Description</th>
                        <th className="px-2 py-2 text-right w-16">Qty</th>
                        <th className="px-2 py-2 text-right w-20">Rate</th>
                        <th className="px-2 py-2 text-right w-20">Amount</th>
                        <th className="px-1 py-2 w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {(form.watch('service_items') || []).map((item, index) => (
                        <tr key={index} className="border-b last:border-b-0">
                          <td className="px-4 py-2 w-2/5">
                            <Input 
                              placeholder="Service Description" 
                              value={item.description}
                              onChange={(e) => updateServiceItem(index, 'description', e.target.value)}
                              aria-label="Service Description"
                            />
                          </td>
                          <td className="px-2 py-2 text-right w-16">
                            <Input 
                              type="number" 
                              placeholder="Qty" 
                              value={item.quantity}
                              onChange={(e) => updateServiceItem(index, 'quantity', parseInt(e.target.value) || 0)}
                              className="text-center"
                            />
                          </td>
                          <td className="px-2 py-2 text-right w-20">
                            <Input 
                              type="number" 
                              placeholder="Rate" 
                              value={item.rate}
                              onChange={(e) => updateServiceItem(index, 'rate', parseFloat(e.target.value) || 0)}
                              className="text-right"
                              aria-label="Rate"
                            />
                          </td>
                          <td className="px-2 py-2 text-right font-medium w-20">
                            <Input readOnly value={item.amount?.toFixed(2)} className="bg-muted text-right" />
                          </td>
                          <td className="px-1 py-2 text-center w-10">
                            <Button type="button" variant="ghost" size="sm" onClick={() => removeServiceItem(index)} className="h-8 w-8 p-0">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Discount, Tax, and Summary Section */}
                <div className="flex flex-col items-end mb-8">
                  <div className="w-full max-w-xs">
                    <div className="flex justify-between py-1">
                      <span>Subtotal:</span>
                      <span>₹{totals?.subtotal.toFixed(2) || '0.00'}</span>
                    </div>
                    <FormField
                      control={form.control}
                      name="discount_percentage"
                      render={({ field }) => (
                        <div className="flex justify-between py-1 text-success items-center">
                          <span>Discount (%):</span>
                          <Input type="number" min="0" max="100" step="0.01" className="w-20" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                          <span>-₹{totals && totals.discountAmount > 0 ? totals.discountAmount.toFixed(2) : '0.00'}</span>
                        </div>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="tax_percentage"
                      render={({ field }) => (
                        <div className="flex justify-between py-1 text-success items-center">
                          <span>Tax (%):</span>
                          <Input type="number" min="0" max="100" step="0.01" className="w-20" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                          <span>₹{totals && totals.taxAmount > 0 ? totals.taxAmount.toFixed(2) : '0.00'}</span>
                        </div>
                      )}
                    />
                    <div className="border-t my-2"></div>
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span>₹{totals?.total.toFixed(2) || '0.00'}</span>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div className="mt-4">
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Additional notes..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end mt-8 space-x-2">
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8v-8H4z" />
                        </svg>
                        {bill ? 'Updating...' : 'Creating...'}
                      </span>
                    ) : (
                      bill ? 'Update Bill' : 'Create Bill'
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

