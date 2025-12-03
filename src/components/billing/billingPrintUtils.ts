// src/components/billing/billingPrintUtils.ts
import { DbPatient, DbClinic } from '@/types/core';
import { Bill, ServiceItem } from '@/types/billing';

// ----------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------

type BillWithPotentialDetails = Bill & {
  patient?: { name?: string } | null;
  patient_name?: string;
};

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

function getPatientName(bill: Bill, patient: DbPatient | null): string {
  if (patient?.name) return patient.name;
  const enhancedBill = bill as BillWithPotentialDetails;
  if (enhancedBill.patient?.name) return enhancedBill.patient.name;
  if (enhancedBill.patient_name) return enhancedBill.patient_name;
  return 'Patient';
}

function generateBillFilename(bill: Bill, patient: DbPatient | null): string {
  const name = getPatientName(bill, patient);
  const safeName = name.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
  const invoiceNum = bill.invoice_number?.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_') || 'Invoice';
  const dateStr = bill.created_at 
    ? new Date(bill.created_at).toISOString().split('T')[0] 
    : new Date().toISOString().split('T')[0];
  return `${safeName}_${dateStr}_${invoiceNum}`;
}

// ----------------------------------------------------------------------
// Main Print Function
// ----------------------------------------------------------------------

export const generateBillPrintContent = (
  billData: Bill,
  patient: DbPatient | null,
  clinic: DbClinic | null
) => {
  const filename = generateBillFilename(billData, patient);
  const patientName = getPatientName(billData, patient);

  const formatDate = (dateString?: string | null) => 
    dateString 
      ? new Date(dateString).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) 
      : new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  const subtotal = Number(billData.amount || 0);
  const discountPct = Number(billData.discount_percentage || 0);
  const taxPct = Number(billData.tax_percentage || 0);
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <title>${filename}</title>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        * { box-sizing: border-box; }

        @page {
          size: auto;
          margin: 5mm; 
        }

        html, body {
          margin: 0;
          padding: 0;
          background: white;
          font-family: 'Inter', sans-serif;
          color: #1e293b;
          height: auto;
        }

        .print-container {
          padding: 10mm; 
          width: 100%;
        }

        .no-print { display: none !important; }
        ::-webkit-scrollbar { display: none; }
      </style>
    </head>
    <body>
      <div class="print-container">
        
        <div class="flex justify-between items-start border-b border-slate-200 pb-6 mb-6">
          <div>
            <h1 class="text-3xl font-bold text-slate-900 tracking-tight">INVOICE</h1>
            <p class="text-slate-500 mt-1">#${billData.invoice_number || 'Pending'}</p>
          </div>
          <div class="text-right">
            <div class="text-slate-500 text-sm">
              <p class="font-medium text-slate-900">Date Issued:</p>
              <p>${formatDate(billData.created_at)}</p>
            </div>
            <div class="text-slate-500 text-sm mt-1">
              <p class="font-medium text-slate-900">Status:</p>
              <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800 uppercase tracking-wide">
                ${billData.status || 'Draft'}
              </span>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-6 mb-8">
          <div>
            <h3 class="text-xs font-medium text-slate-600 uppercase tracking-wider mb-2">Bill From</h3>
            <div class="text-slate-800 text-sm">
              <p class="font-semibold text-base">${clinic?.name || 'Clinic Name'}</p>
              ${clinic?.address ? `<p class="text-slate-500 mt-1 whitespace-pre-line">${clinic.address}</p>` : ''}
              ${clinic?.phone ? `<p class="mt-1">${clinic.phone}</p>` : ''}
              ${clinic?.email ? `<p>${clinic.email}</p>` : ''}
            </div>
          </div>

          <div>
            <h3 class="text-xs font-medium text-slate-600 uppercase tracking-wider mb-2">Bill To</h3>
            <div class="text-slate-800 text-sm">
              <p class="font-semibold text-base">${patientName}</p>
              <p class="mt-1">${patient?.phone || ''}</p>
              <p>${patient?.email || ''}</p>
              <p class="text-slate-500 mt-1 whitespace-pre-line">${patient?.address || ''}</p>
            </div>
          </div>
        </div>

        <div class="mb-8">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-slate-200 bg-slate-50">
                <th class="py-2 px-3 text-xs font-semibold text-slate-600 uppercase tracking-wider w-1/2">Service / Description</th>
                <th class="py-2 px-3 text-xs font-semibold text-slate-600 uppercase tracking-wider text-center">Qty</th>
                <th class="py-2 px-3 text-xs font-semibold text-slate-600 uppercase tracking-wider text-right">Rate</th>
                <th class="py-2 px-3 text-xs font-semibold text-slate-600 uppercase tracking-wider text-right">Amount</th>
              </tr>
            </thead>
            <tbody class="text-sm">
              ${(Array.isArray(billData.service_items) ? billData.service_items : []).map((item: unknown) => {
                const serviceItem = item as ServiceItem;
                return `
                <tr class="border-b border-slate-100 last:border-0">
                  <td class="py-3 px-3 font-medium text-slate-700">${serviceItem.description}</td>
                  <td class="py-3 px-3 text-center text-slate-600">${serviceItem.quantity}</td>
                  <td class="py-3 px-3 text-right text-slate-600">₹${Number(serviceItem.rate).toFixed(2)}</td>
                  <td class="py-3 px-3 text-right font-semibold text-slate-800">₹${Number(serviceItem.amount).toFixed(2)}</td>
                </tr>
              `}).join('')}
            </tbody>
          </table>
        </div>

        <div class="flex flex-col items-end border-t border-slate-200 pt-4">
          <div class="w-64 space-y-2">
            <div class="flex justify-between text-sm text-slate-600">
              <span>Subtotal</span>
              <span class="font-medium">₹${subtotal.toFixed(2)}</span>
            </div>
            
            ${discountPct > 0 ? `
              <div class="flex justify-between text-sm text-red-600">
                <span>Discount (${discountPct}%)</span>
                <span>-₹${(subtotal * (discountPct / 100)).toFixed(2)}</span>
              </div>
            ` : ''}

            ${taxPct > 0 ? `
              <div class="flex justify-between text-sm text-slate-600">
                <span>Tax (${taxPct}%)</span>
                <span>₹${(subtotal * (taxPct / 100)).toFixed(2)}</span>
              </div>
            ` : ''}

            <div class="flex justify-between items-center border-t border-slate-200 pt-3 mt-3">
              <span class="text-base font-bold text-slate-800">Total</span>
              <span class="text-xl font-bold text-slate-900">₹${subtotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        ${billData.notes ? `
          <div class="mt-8 pt-6 border-t border-slate-100">
            <h4 class="text-xs font-medium text-slate-600 uppercase tracking-wider mb-2">Notes & Instructions</h4>
            <p class="text-sm text-slate-500 bg-slate-50 p-3 rounded-md">${billData.notes}</p>
          </div>
        ` : ''}
        
        <div class="mt-10 text-center text-xs text-slate-500">
          <p>This is a computer-generated invoice and needs no signature.</p>
        </div>
      </div>
      
      <script>
        // 1. Detect when printing is finished (works in Chrome, Safari, Firefox)
        window.onafterprint = function() {
          window.close();
        };

        // 2. Trigger print after load
        window.onload = function() {
           setTimeout(function() {
             window.focus(); // Ensure window has focus for print dialog
             window.print();
           }, 500);
        };
      </script>
    </body>
    </html>
  `;
};

export const printBill = async (
  billData: Bill,
  patient: DbPatient | null,
  clinic: DbClinic | null
) => {
  try {
    const printContent = generateBillPrintContent(billData, patient, clinic);
    const filename = generateBillFilename(billData, patient);

    const printWindow = window.open('', '_blank', 'width=800,height=800');
    if (!printWindow) {
      console.error("Popup blocked");
      return;
    }

    printWindow.document.write(printContent);
    printWindow.document.title = filename;
    printWindow.document.close(); 
    // We do NOT call printWindow.print() here anymore.
    // The internal script handles printing and closing.
    printWindow.focus();
    
  } catch (error) {
    console.error('Error generating print content:', error);
  }
};