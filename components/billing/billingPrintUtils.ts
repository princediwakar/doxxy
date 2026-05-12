import { logger } from "@/lib/logger";
import { toast } from "sonner";
import { DbPatient, DbClinic } from '@/types/core';
import { Bill, ServiceItem } from '@/types/billing';

type BillWithPotentialDetails = Bill & {
  patient?: { name?: string } | null;
  patient_name?: string;
};

function getPatientName(bill: Bill, patient: DbPatient | null): string {
  if (patient?.name) return patient.name;
  const enhancedBill = bill as BillWithPotentialDetails;
  return enhancedBill.patient?.name || enhancedBill.patient_name || 'Patient';
}

export function generateBillFilename(bill: Bill, patient: DbPatient | null, clinicName?: string | null): string {
  const name = getPatientName(bill, patient);
  const safeName = name.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
  const dateStr = bill.created_at ? new Date(bill.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
  return `${safeName}_${dateStr}_Bill`;
}

export const generateBillPrintContent = (billData: Bill, patient: DbPatient | null, clinic: DbClinic | null) => {
  const filename = generateBillFilename(billData, patient, clinic?.name);
  const patientName = getPatientName(billData, patient);
  const formatDate = (dateString?: string | null) => 
    new Date(dateString || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  const subtotal = Number(billData.amount || 0);
  const discountAmount = subtotal * (Number(billData.discount_percentage || 0) / 100);
  const taxAmount = (subtotal - discountAmount) * (Number(billData.tax_percentage || 0) / 100);
  const finalTotal = subtotal - discountAmount + taxAmount;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <title>${filename}</title>
      <meta charset="utf-8">
      <meta name="viewport" content="width=210mm, initial-scale=1.0">
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        @page { size: A4; margin: 0; }
        * { box-sizing: border-box; }
        body {
          margin: 0; padding: 0; background: white;
          font-family: 'Inter', sans-serif; color: #1e293b;
          width: 210mm; /* Essential for mobile consistency */
          -webkit-print-color-adjust: exact !important;
        }
        .print-container { padding: 15mm; width: 100%; }
        table { width: 100%; border-collapse: collapse; }
        .no-print { display: none !important; }
      </style>
    </head>
    <body>
      <div class="print-container">
        <div class="flex justify-between items-start border-b pb-6 mb-6">
          <div>
            <h1 class="text-3xl font-bold text-slate-900">INVOICE</h1>
            <p class="text-slate-500">#${billData.invoice_number || ''}</p>
          </div>
          <div class="text-right">
            <p class="font-medium">Date Issued: ${formatDate(billData.created_at)}</p>
          </div>
        </div>
        <!-- ... (Rest of billing UI remains same, ensuring Tailwind classes are used) ... -->
        <div class="grid grid-cols-2 gap-8 mb-8">
            <div>
                <h3 class="text-xs font-bold text-slate-600 uppercase mb-2">From</h3>
                <p class="font-bold">${clinic?.name || 'Clinic Name'}</p>
                <p class="text-sm text-slate-600">${clinic?.address || ''}</p>
            </div>
            <div>
                <h3 class="text-xs font-bold text-slate-600 uppercase mb-2">Bill To</h3>
                <p class="font-bold">${patientName}</p>
                <p class="text-sm text-slate-600">${patient?.phone || ''}</p>
            </div>
        </div>
        <table class="mb-8">
            <thead>
                <tr class="border-b-2 text-left">
                    <th class="py-3 text-xs font-bold uppercase text-slate-500">Service</th>
                    <th class="py-3 text-xs font-bold uppercase text-slate-500 text-center">Qty</th>
                    <th class="py-3 text-xs font-bold uppercase text-slate-500 text-right">Amount</th>
                </tr>
            </thead>
            <tbody class="text-sm">
                ${(Array.isArray(billData.service_items) ? billData.service_items : []).map((item: any) => `
                    <tr class="border-b border-slate-100">
                        <td class="py-3 font-medium">${item.description}</td>
                        <td class="py-3 text-center">${item.quantity}</td>
                        <td class="py-3 text-right">₹${Number(item.amount).toFixed(2)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        <div class="flex flex-col items-end pt-4">
            <div class="w-64 space-y-2 text-sm">
                <div class="flex justify-between"><span>Subtotal</span><span>₹${subtotal.toFixed(2)}</span></div>
                <div class="flex justify-between text-xl font-bold border-t pt-2"><span>Total</span><span>₹${finalTotal.toFixed(2)}</span></div>
            </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const printBill = async (billData: Bill, patient: DbPatient | null, clinic: DbClinic | null) => {
  try {
    const printContent = generateBillPrintContent(billData, patient, clinic);
    const iframe = document.createElement('iframe');
    Object.assign(iframe.style, { position: 'fixed', visibility: 'hidden', width: '0', height: '0' });
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;

    doc.open();
    doc.write(printContent);
    doc.close();

    const doPrint = () => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      iframe.contentWindow?.addEventListener('afterprint', () => document.body.removeChild(iframe), { once: true });
    };

    if (doc.readyState === 'complete') {
        setTimeout(doPrint, 500);
    } else {
        iframe.onload = () => setTimeout(doPrint, 500);
    }
  } catch (error) {
    logger.error('Print Error:', error);
    toast.error("Failed to print.");
  }
};