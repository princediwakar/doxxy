import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format, parseISO } from 'date-fns';
import { 
  Calculator, 
  Plus, 
  Trash2, 
  FileText, 
  User, 
  Calendar,
  Stethoscope,
  Pill,
  IndianRupee
} from 'lucide-react';

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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { toast } from 'sonner';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getSupabase } from '@/integrations/supabase/client';
import { Database, Enums, Constants } from '@/integrations/supabase/types';
import { useAuth } from '@/contexts/AuthContext';

const supabase = getSupabase();

type Bill = Database['public']['Tables']['bills']['Row'];

// Extended bill type with additional fields
interface ExtendedBill extends Bill {
  billing_type?: string;
  service_items?: ServiceItem[];
  discount_percentage?: number;
  tax_percentage?: number;
  notes?: string;
}
type Patient = Database['public']['Tables']['patients']['Row'];
type Appointment = Database['public']['Tables']['appointments']['Row'];


// Use the existing Supabase enum type instead of defining our own
type BillStatusEnum = Enums<'bill_status'>;

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
  status: z.enum(['Paid', 'Pending', 'Overdue'], {
    required_error: 'Status is required',
  }),
  billing_type: z.enum(['simple', 'itemized']),
  // Simple billing
  amount: z.number().min(0, 'Amount must be positive').optional(),
  description: z.string().nullable().optional().transform(e => e === "" ? null : e),
  // Itemized billing
  service_items: z.array(serviceItemSchema).optional(),
  discount_percentage: z.number().min(0).max(100).optional(),
  tax_percentage: z.number().min(0).max(100).optional(),
  notes: z.string().optional(),
});

type BillingFormValues = z.infer<typeof billingFormSchema>;

interface EnhancedBillingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bill: ExtendedBill | null;
  patient?: Patient | null;
  appointment?: Appointment | null;
  mode?: 'create' | 'edit' | 'view';
}

// Predefined service templates
const serviceTemplates = {
  consultation: [
    { description: 'Initial Consultation', rate: 500, quantity: 1 },
    { description: 'Follow-up Consultation', rate: 300, quantity: 1 },
    { description: 'Emergency Consultation', rate: 800, quantity: 1 },
  ],
  neurology: [
    { description: 'Neurological Examination', rate: 600, quantity: 1 },
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

export const EnhancedBillingModal: React.FC<EnhancedBillingModalProps> = ({
  open,
  onOpenChange,
  bill,
  patient,
  appointment,
  mode = 'create',
}) => {
  const queryClient = useQueryClient();
  const { activeClinic } = useAuth();
  const [billingType, setBillingType] = useState<'simple' | 'itemized'>('simple');
  const [serviceItems, setServiceItems] = useState<ServiceItem[]>([
    { description: '', quantity: 1, rate: 0, amount: 0 }
  ]);

  const form = useForm<BillingFormValues>({
    resolver: zodResolver(billingFormSchema),
    defaultValues: {
      patient_id: bill?.patient_id || patient?.id || appointment?.patient_id || '',
      appointment_id: bill?.appointment_id || appointment?.id || '',
      amount: bill?.amount ? Number(bill.amount) : 0,
      description: bill?.description || '',
      invoice_number: bill?.invoice_number || '',
      status: bill ? bill.status : "Pending",
      billing_type: 'simple',
      service_items: [],
      discount_percentage: 0,
      tax_percentage: 0,
      notes: '',
    },
  });

  useEffect(() => {
    if (open) {
      // Auto-fill patient from appointment if available
      const patientId = bill?.patient_id || patient?.id || appointment?.patient_id || '';
      
      const defaultValues = {
        patient_id: patientId,
        appointment_id: bill?.appointment_id || appointment?.id || '',
        amount: bill?.amount ? Number(bill.amount) : 0,
        description: bill?.description || '',
        invoice_number: bill?.invoice_number || '',
        status: bill ? bill.status : "Pending",
        billing_type: 'simple' as const,
        service_items: [],
        discount_percentage: 0,
        tax_percentage: 0,
        notes: '',
      };
      form.reset(defaultValues);
      setBillingType('simple');
      setServiceItems([{ description: '', quantity: 1, rate: 0, amount: 0 }]);
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
      if (selectedAppointment && selectedAppointment.patient_id !== selectedPatientId) {
        form.setValue('patient_id', selectedAppointment.patient_id);
      }
    }
  }, [selectedAppointmentId, appointments, selectedPatientId, form]);

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
    setServiceItems([...serviceItems, { description: '', quantity: 1, rate: 0, amount: 0 }]);
  };

  const removeServiceItem = (index: number) => {
    if (serviceItems.length > 1) {
      setServiceItems(serviceItems.filter((_, i) => i !== index));
    }
  };

  const updateServiceItem = (index: number, field: keyof ServiceItem, value: string | number) => {
    const updatedItems = [...serviceItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Calculate amount when quantity or rate changes
    if (field === 'quantity' || field === 'rate') {
      updatedItems[index].amount = updatedItems[index].quantity * updatedItems[index].rate;
    }
    
    setServiceItems(updatedItems);
  };

  const addServiceTemplate = (template: ServiceTemplate) => {
    setServiceItems([...serviceItems, { ...template, amount: template.quantity * template.rate }]);
  };

  const calculateTotals = () => {
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
      
      let finalAmount = 0;
      let finalDescription = '';

      if (values.billing_type === 'simple') {
        finalAmount = values.amount || 0;
        finalDescription = values.description || '';
      } else {
        const totals = calculateTotals();
        finalAmount = totals.total;
        finalDescription = `Itemized bill with ${serviceItems.length} service(s)`;
      }

      const billData = {
        clinic_id: activeClinic.clinic_id,
        patient_id: values.patient_id,
        appointment_id: values.appointment_id,
        amount: finalAmount,
        description: finalDescription,
        invoice_number: values.invoice_number,
        status: values.status,
        // Store itemized data in a JSON field if needed
        ...(values.billing_type === 'itemized' && {
          metadata: {
            billing_type: 'itemized',
            service_items: serviceItems,
            discount_percentage: values.discount_percentage,
            tax_percentage: values.tax_percentage,
            notes: values.notes,
          }
        })
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
      console.error("EnhancedBillingModal: Mutation error:", error);
      toast.error(bill ? 'Failed to update bill.' : 'Failed to create bill.', {
        description: error.message,
      });
    },
  });

  const onSubmit = (values: BillingFormValues) => {
    mutation.mutate(values);
  };

  const isSubmitting = mutation.isPending;
  const totals = billingType === 'itemized' ? calculateTotals() : null;

  if (mode === 'view' && bill) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Bill Details</span>
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="flex-1 max-h-[70vh] pr-4">
            <div className="space-y-6">
              {/* Header Information */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h3 className="text-lg font-semibold">
                          Invoice #{bill.invoice_number || 'N/A'}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Created on {format(parseISO(bill.created_at!), 'PPP')}
                        </p>
                      </div>
                    </div>
                    <Badge variant={
                      bill.status === 'Paid' ? 'default' :
                      bill.status === 'Pending' ? 'secondary' :
                      bill.status === 'Overdue' ? 'destructive' :
                      'outline'
                    } className={`status-badge ${
                      bill.status === 'Paid' ? 'status-active' :
                      bill.status === 'Pending' ? 'status-pending' :
                      bill.status === 'Overdue' ? 'status-urgent' :
                      'status-inactive'
                    }`}>
                      {bill.status}
                    </Badge>
                  </div>
                </CardHeader>
              </Card>

              {/* Patient Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>Patient Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    if (isLoadingPatients) {
                      return (
                        <div className="space-y-2">
                          <div className="h-4 bg-muted rounded animate-pulse" />
                          <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
                        </div>
                      );
                    }

                    // First try to find patient in the fetched patients list
                    let patientInfo = patients?.find(p => p.id === bill.patient_id);
                    
                    // If not found and we have a patient prop, use that
                    if (!patientInfo && patient && patient.id === bill.patient_id) {
                      patientInfo = patient;
                    }
                    
                    if (patientInfo) {
                      return (
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-muted-foreground">Name:</span>
                            <p className="font-medium">{patientInfo.name}</p>
                          </div>
                          <div>
                            <span className="font-medium text-muted-foreground">Phone:</span>
                            <p>{patientInfo.phone || 'N/A'}</p>
                          </div>
                          <div>
                            <span className="font-medium text-muted-foreground">Email:</span>
                            <p>{patientInfo.email || 'N/A'}</p>
                          </div>
                          {patientInfo.medical_id && (
                            <div>
                              <span className="font-medium text-muted-foreground">Medical ID:</span>
                              <p>{patientInfo.medical_id}</p>
                            </div>
                          )}
                        </div>
                      );
                    }
                    
                    return (
                      <div className="text-center text-muted-foreground">
                        <div className="text-sm">Unable to load patient information</div>
                        <div className="text-xs mt-1">Patient ID: {bill.patient_id}</div>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>

              {/* Appointment Information */}
              {bill.appointment_id && appointments && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Related Appointment</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const appointment = appointments.find(a => a.id === bill.appointment_id);
                      return appointment ? (
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-muted-foreground">Date:</span>
                            <p className="font-medium">{appointment.date}</p>
                          </div>
                          <div>
                            <span className="font-medium text-muted-foreground">Time:</span>
                            <p>{appointment.time}</p>
                          </div>
                          <div>
                            <span className="font-medium text-muted-foreground">Doctor:</span>
                            <p>{appointment.doctor_name}</p>
                          </div>
                          <div>
                            <span className="font-medium text-muted-foreground">Department:</span>
                            <p>{appointment.department_name || 'N/A'}</p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-muted-foreground">Appointment information not available</p>
                      );
                    })()}
                  </CardContent>
                </Card>
              )}

              {/* Bill Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <IndianRupee className="h-4 w-4" />
                    <span>Billing Details</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-muted-foreground">Amount:</span>
                      <p className="text-lg font-bold text-primary">₹{bill.amount?.toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Status:</span>
                      <p className="font-medium">{bill.status}</p>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Billing Type:</span>
                      <p className="font-medium capitalize">{bill.billing_type || 'Simple'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Created:</span>
                      <p>{format(parseISO(bill.created_at!), 'PPP')}</p>
                    </div>
                  </div>
                  {bill.description && (
                    <div>
                      <span className="font-medium text-muted-foreground">Description:</span>
                      <p className="bg-muted/30 p-3 rounded-md whitespace-pre-wrap">{bill.description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Itemized Services */}
              {bill.service_items && Array.isArray(bill.service_items) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Calculator className="h-4 w-4" />
                      <span>Service Items</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {bill.service_items!.map((item, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-muted/30 rounded-md">
                          <div className="flex-1">
                            <p className="font-medium">{item.description}</p>
                            <p className="text-sm text-muted-foreground">
                              Qty: {item.quantity} × ₹{item.rate?.toFixed(2)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">₹{item.amount?.toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                      
                      {/* Totals */}
                      <Separator />
                      <div className="space-y-2">
                        {(() => {
                          const serviceItems = bill.service_items!;
                          const subtotal = serviceItems.reduce((sum, item) => sum + (item.amount || 0), 0);
                          const discountPercent = bill.discount_percentage || 0;
                          const taxPercent = bill.tax_percentage || 0;
                          const discountAmount = (subtotal * discountPercent) / 100;
                          const taxableAmount = subtotal - discountAmount;
                          const taxAmount = (taxableAmount * taxPercent) / 100;
                          const total = taxableAmount + taxAmount;
                          
                          return (
                            <>
                              <div className="flex justify-between text-sm">
                                <span>Subtotal:</span>
                                <span>₹{subtotal.toFixed(2)}</span>
                              </div>
                              {discountPercent > 0 && (
                                <div className="flex justify-between text-sm text-green-600">
                                  <span>Discount ({discountPercent}%):</span>
                                  <span>-₹{discountAmount.toFixed(2)}</span>
                                </div>
                              )}
                              {taxPercent > 0 && (
                                <div className="flex justify-between text-sm">
                                  <span>Tax ({taxPercent}%):</span>
                                  <span>₹{taxAmount.toFixed(2)}</span>
                                </div>
                              )}
                              <Separator />
                              <div className="flex justify-between font-bold">
                                <span>Total:</span>
                                <span>₹{total.toFixed(2)}</span>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Notes */}
              {bill.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <FileText className="h-4 w-4" />
                      <span>Notes</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="bg-muted/30 p-3 rounded-md whitespace-pre-wrap">{bill.notes}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <IndianRupee className="h-5 w-5" />
            <span>{bill ? 'Edit Bill' : 'Create New Bill'}</span>
          </DialogTitle>
          <DialogDescription>
            {bill ? 'Update the bill details below.' : 'Create a comprehensive bill for patient services.'}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Patient and Appointment Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="patient_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Patient *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingPatients || !!patient}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={isLoadingPatients ? "Loading patients..." : "Select a patient"} />
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

                <FormField
                  control={form.control}
                  name="appointment_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Related Appointment (Optional)</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value || ''} 
                        disabled={isLoadingAppointments || !selectedPatientId}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={
                              isLoadingAppointments ? "Loading appointments..." : 
                              !selectedPatientId ? "Select a patient first" :
                              filteredAppointments.length === 0 ? "No appointments for this patient" :
                              "Select an appointment"
                            } />
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
                          {selectedPatientId && filteredAppointments.length === 0 && (
                            <SelectItem value="no-appointments" disabled>
                              No appointments found for this patient
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                      {selectedPatientId && filteredAppointments.length === 0 && (
                        <p className="text-xs text-muted-foreground">
                          This patient has no appointments. You can still create a bill without linking it to an appointment.
                        </p>
                      )}
                    </FormItem>
                  )}
                />
              </div>



              {/* Billing Type Selection */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="billing_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Billing Type</FormLabel>
                      <Select onValueChange={(value) => {
                        field.onChange(value);
                        setBillingType(value as 'simple' | 'itemized');
                      }} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select billing type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="simple">Simple Billing</SelectItem>
                          <SelectItem value="itemized">Itemized Billing</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Simple Billing */}
                {billingType === 'simple' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amount *</FormLabel>
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

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Input placeholder="Service description" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* Itemized Billing */}
                {billingType === 'itemized' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
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

                    <div className="space-y-3">
                      {serviceItems.map((item, index) => (
                        <Card key={index}>
                          <CardContent className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                              <div className="md:col-span-2">
                                <label className="text-sm font-medium">Description</label>
                                <Input
                                  placeholder="Service description"
                                  value={item.description}
                                  onChange={(e) => updateServiceItem(index, 'description', e.target.value)}
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium">Quantity</label>
                                <Input
                                  type="number"
                                  min="1"
                                  value={item.quantity}
                                  onChange={(e) => updateServiceItem(index, 'quantity', parseInt(e.target.value) || 1)}
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium">Rate (₹)</label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={item.rate}
                                  onChange={(e) => updateServiceItem(index, 'rate', parseFloat(e.target.value) || 0)}
                                />
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="flex-1">
                                  <label className="text-sm font-medium">Amount (₹)</label>
                                  <Input
                                    type="number"
                                    value={item.amount}
                                    readOnly
                                    className="bg-muted"
                                  />
                                </div>
                                {serviceItems.length > 1 && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeServiceItem(index)}
                                    className="text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Discount and Tax */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="discount_percentage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Discount (%)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                step="0.01"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="tax_percentage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tax (%)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                step="0.01"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Totals Summary */}
                    {totals && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Bill Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>Subtotal:</span>
                              <span>₹{totals.subtotal.toFixed(2)}</span>
                            </div>
                            {totals.discountAmount > 0 && (
                              <div className="flex justify-between text-green-600">
                                <span>Discount:</span>
                                <span>-₹{totals.discountAmount.toFixed(2)}</span>
                              </div>
                            )}
                            {totals.taxAmount > 0 && (
                              <div className="flex justify-between">
                                <span>Tax:</span>
                                <span>₹{totals.taxAmount.toFixed(2)}</span>
                              </div>
                            )}
                            <Separator />
                            <div className="flex justify-between font-bold text-lg">
                              <span>Total:</span>
                              <span>₹{totals.total.toFixed(2)}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

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
                )}
              </div>

              {/* Invoice Number and Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="invoice_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invoice Number</FormLabel>
                      <FormControl>
                        <Input placeholder="INV-001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Constants.public.Enums.bill_status.map(status => (
                            <SelectItem key={status} value={status}>
                              <Badge variant={status === 'Paid' ? 'default' : status === 'Pending' ? 'secondary' : 'destructive'}>
                                {status}
                              </Badge>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        </ScrollArea>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} onClick={form.handleSubmit(onSubmit)}>
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

