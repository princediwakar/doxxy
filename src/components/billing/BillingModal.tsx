import React from 'react';
import { FileText, Edit, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { useBilling, BillingFormValues } from '@/hooks/useBilling';
import { ServiceItemsSection } from './ServiceItemsSection';
import { printBill } from './printUtils';
import type { Bill, AppointmentForBilling } from '@/types/billing';
import type { DbPatient } from '@/types/core';

interface BillingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bill?: Bill | null;
  patient?: DbPatient | null;
  appointment?: AppointmentForBilling | null;
  mode?: 'create' | 'view' | 'edit';
  onModeChange?: (mode: 'create' | 'view' | 'edit') => void;
}

export const BillingModal: React.FC<BillingModalProps> = ({
  open,
  onOpenChange,
  bill,
  patient,
  appointment,
  mode = 'create',
  onModeChange,
}) => {
  const {
    form,
    appointments,
    patients,
    isLoadingInvoiceNumber,
    calculateTotals,
    addServiceItem,
    removeServiceItem,
    updateServiceItem,
    saveBillMutation,
    isSubmitting,
    refetchInvoiceNumber,
  } = useBilling({ bill, patient, appointment, mode, open });

  const onSubmit = (values: BillingFormValues) => {
    saveBillMutation.mutate(values, {
      onSuccess: () => {
        if (mode === 'edit') {
          onModeChange?.('view');
        } else {
          onOpenChange(false);
        }
      },
    });
  };

  const handlePrint = async () => {
    if (!bill) return;

    // Prepare bill data for printing
    const billData: Bill = {
      ...bill,
      service_items: form.watch('service_items') || [] as any,
      discount_percentage: form.watch('discount_percentage'),
      tax_percentage: form.watch('tax_percentage'),
      notes: form.watch('notes') || null
    };

    await printBill(billData, patient || null);
  };

  const getModalTitle = () => {
    switch (mode) {
      case 'view': return 'View Bill';
      case 'edit': return 'Edit Bill';
      default: return 'Create Bill';
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    // Only close the modal if we're not switching modes
    if (!newOpen) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {getModalTitle()}
          </DialogTitle>
          <DialogDescription>
            {mode === 'view' ? 'View billing details and invoice information' : 
             mode === 'edit' ? 'Edit billing information and service items' : 
             'Create a new bill for the selected patient and appointment'}
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[80vh] overflow-y-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-1">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="patient_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Patient</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={mode === 'view' || !!appointment}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select patient" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {patients?.map((patient) => (
                            <SelectItem key={patient.id} value={patient.id}>
                              {patient.name} {patient.medical_id}
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
                      <FormLabel>Appointment (Optional)</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || ""}
                        disabled={mode === 'view' || !!appointment}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select appointment" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">No Appointment</SelectItem>
                          {appointments?.map((apt) => (
                            <SelectItem key={apt.id} value={apt.id}>
                              {apt.patient_name} - {apt.date} {apt.time}
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
                  name="invoice_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invoice Number</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input
                            {...field}
                            placeholder={isLoadingInvoiceNumber ? "Generating invoice number..." : "Invoice number"}
                            disabled={mode === 'view' || isLoadingInvoiceNumber}
                          />
                          {mode === 'create' && !field.value && !isLoadingInvoiceNumber && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => refetchInvoiceNumber()}
                              disabled={isLoadingInvoiceNumber}
                            >
                              Generate
                            </Button>
                          )}
                        </div>
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
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value || ''}
                          placeholder="Bill description"
                          disabled={mode === 'view'}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Service Items */}
              <ServiceItemsSection
                serviceItems={form.watch('service_items') || []}
                onUpdateItem={updateServiceItem}
                onAddItem={addServiceItem}
                onRemoveItem={removeServiceItem}
                mode={mode}
              />

              {/* Discount and Tax */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="discount_percentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount Percentage</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          disabled={mode === 'view'}
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
                      <FormLabel>Tax Percentage</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          disabled={mode === 'view'}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value || ''}
                        placeholder="Additional notes"
                        disabled={mode === 'view'}
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Calculation Summary */}
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>₹{calculateTotals.subtotal.toFixed(2)}</span>
                </div>
                {calculateTotals.discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-red-600">
                    <span>Discount ({form.watch('discount_percentage')}%):</span>
                    <span>-₹{calculateTotals.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span>Subtotal after discount:</span>
                  <span>₹{calculateTotals.subtotalAfterDiscount.toFixed(2)}</span>
                </div>
                {calculateTotals.taxAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Tax ({form.watch('tax_percentage')}%):</span>
                    <span>₹{calculateTotals.taxAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>₹{calculateTotals.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex justify-end gap-3 pt-4">
                {mode === 'view' ? (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePrint}
                      className="flex items-center gap-2"
                    >
                      <Printer className="h-4 w-4" />
                      Print
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => onOpenChange(false)}
                    >
                      Close
                    </Button>
                    <Button
                      type="button"
                      onClick={() => onModeChange?.('edit')}
                      className="flex items-center gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Edit Bill
                    </Button>
                  </>
                ) : (
                  <>
                    {bill && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handlePrint}
                        className="flex items-center gap-2"
                        disabled={isSubmitting}
                      >
                        <Printer className="h-4 w-4" />
                        Print
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        if (mode === 'edit' && bill) {
                          onModeChange?.('view');
                        } else {
                          onOpenChange(false);
                        }
                      }}
                      disabled={isSubmitting}
                    >
                      {mode === 'edit' ? 'Cancel' : 'Cancel'}
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting || calculateTotals.total <= 0}
                    >
                      {isSubmitting ? 'Saving...' : mode === 'edit' ? 'Update Bill' : 'Create Bill'}
                    </Button>
                  </>
                )}
              </div>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};