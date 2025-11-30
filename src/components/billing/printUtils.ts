// src/components/billing/printUtils.ts
import { DbPatient } from '@/types/core';
import { Bill, ServiceItem } from '@/types/billing';

// Helper function to generate proper filename
function generateBillFilename(bill: Bill, patient: DbPatient | null): string {
  const patientName = patient?.name?.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_') || 'Patient';
  const invoiceNumber = bill.invoice_number?.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_') || 'Invoice';
  const dateStr = bill.created_at ? new Date(bill.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
  return `${patientName}_${dateStr}_${invoiceNumber}_Bill`;
}

// --- CONFIGURATION ---
// Adjust this value to match the height of your physical paper's letterhead.
const PRINT_TOP_MARGIN = '45mm';
// ---------------------

export const generateBillPrintContent = (
  billData: Bill,
  patient: DbPatient | null
) => {
  const filename = generateBillFilename(billData, patient);

  const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${filename}</title>
      <meta charset="utf-8">
      <meta name="format-detection" content="telephone=no">
      <meta name="print-option" content="no-header-footer">
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        @page {
          margin: 8mm;
          size: A4;
        }
        * {
          box-sizing: border-box;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.5;
          color: #374151;
          background: white;
          font-size: 12px;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        @media print {
          @page {
            margin: ${PRINT_TOP_MARGIN} 8mm 8mm 8mm;
            size: A4;
          }
        }

        @page {
          margin: ${PRINT_TOP_MARGIN} 8mm 8mm 8mm !important;
          size: A4 !important;
          @top-left { content: "" !important; }
          @top-center { content: "" !important; }
          @top-right { content: "" !important; }
          @bottom-left { content: "" !important; }
          @bottom-center { content: "" !important; }
          @bottom-right { content: "" !important; }
        }

        @media print {
          body {
            margin: 0 !important;
            padding: 0 !important;
          }
          .no-print { display: none !important; }

          .space-y-6 > * + * { margin-top: 0.75rem !important; }
          .space-y-4 > * + * { margin-top: 0.5rem !important; }
          .space-y-2 > * + * { margin-top: 0.25rem !important; }
        }
      </style>
    </head>
    <body>
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="margin: 0; color: #333;">INVOICE</h1>
          <p style="margin: 5px 0; color: #666;">${billData.invoice_number || 'N/A'}</p>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
          <div>
            <h3 style="margin: 0 0 10px 0; color: #333;">Bill To:</h3>
            <p style="margin: 0; color: #666;">${patient?.name || 'N/A'}</p>
            <p style="margin: 0; color: #666;">${patient?.phone || ''}</p>
            <p style="margin: 0; color: #666;">${patient?.email || ''}</p>
          </div>
          <div>
            <h3 style="margin: 0 0 10px 0; color: #333;">Bill Details:</h3>
            <p style="margin: 0; color: #666;"><strong>Date:</strong> ${billData.created_at ? new Date(billData.created_at).toLocaleDateString() : new Date().toLocaleDateString()}</p>
            <p style="margin: 0; color: #666;"><strong>Status:</strong> ${billData.status || 'Pending'}</p>
            <p style="margin: 0; color: #666;"><strong>Description:</strong> ${billData.description || 'N/A'}</p>
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: #f8f9fa;">
              <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Description</th>
              <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Qty</th>
              <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Rate</th>
              <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${(Array.isArray(billData.service_items) ? billData.service_items : []).map((item: unknown) => {
              const serviceItem = item as ServiceItem;
              return `
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd;">${serviceItem.description}</td>
                <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">${serviceItem.quantity}</td>
                <td style="padding: 10px; text-align: right; border: 1px solid #ddd;">₹${Number(serviceItem.rate).toFixed(2)}</td>
                <td style="padding: 10px; text-align: right; border: 1px solid #ddd;">₹${Number(serviceItem.amount).toFixed(2)}</td>
              </tr>
            `}).join('')}
          </tbody>
        </table>

        <div style="margin-left: auto; width: 300px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
            <span>Subtotal:</span>
            <span>₹${Number(billData.amount || 0).toFixed(2)}</span>
          </div>
          ${Number(billData.discount_percentage || 0) > 0 ? `
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px; color: #dc2626;">
              <span>Discount (${billData.discount_percentage || 0}%):</span>
              <span>-₹${Number((Number(billData.amount || 0) * (Number(billData.discount_percentage || 0) / 100)).toFixed(2))}</span>
            </div>
          ` : ''}
          ${Number(billData.tax_percentage || 0) > 0 ? `
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
              <span>Tax (${billData.tax_percentage || 0}%):</span>
              <span>₹${Number((Number(billData.amount || 0) * (Number(billData.tax_percentage || 0) / 100)).toFixed(2))}</span>
            </div>
          ` : ''}
          <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 1.1em; border-top: 2px solid #333; padding-top: 10px;">
            <span>Total:</span>
            <span>₹${Number(billData.amount || 0).toFixed(2)}</span>
          </div>
        </div>

        ${billData.notes ? `
          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd;">
            <h3 style="margin: 0 0 10px 0; color: #333;">Notes:</h3>
            <p style="margin: 0; color: #666;">${billData.notes}</p>
          </div>
        ` : ''}
      </div>
    </body>
    </html>
  `;

  return { printContent, filename };
};

export const printBill = async (
  billData: Bill,
  patient: DbPatient | null
) => {
  try {
    const { printContent, filename } = generateBillPrintContent(billData, patient);

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      console.error('Could not open print window');
      return;
    }

    printWindow.document.title = filename;
    try {
      printWindow.history.replaceState({}, '', '');
    } catch {
      // Ignore history replace errors in print window
    }

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();

    const additionalCSS = printWindow.document.createElement('style');
    additionalCSS.textContent = `
      @page {
        margin: ${PRINT_TOP_MARGIN} 15mm 10mm 15mm !important;
        size: A4 !important;
        @top-left { content: "" !important; }
        @top-center { content: "" !important; }
        @top-right { content: "" !important; }
        @bottom-left { content: "" !important; }
        @bottom-center { content: "" !important; }
        @bottom-right { content: "" !important; }
      }
      @media print {
        @page {
          margin: ${PRINT_TOP_MARGIN} 8mm 8mm 8mm !important;
          size: A4 !important;
          @top-left { content: "" !important; }
          @top-center { content: "" !important; }
          @top-right { content: "" !important; }
          @bottom-left { content: "" !important; }
          @bottom-center { content: "" !important; }
          @bottom-right { content: "" !important; }
        }
        html::before, html::after,
        body::before, body::after {
          display: none !important;
          content: "" !important;
        }
      }
    `;
    printWindow.document.head.appendChild(additionalCSS);

    const script = printWindow.document.createElement('script');
    script.textContent = `
      window.addEventListener('beforeprint', function() {
        document.title = '${filename}';
        const extraStyle = document.createElement('style');
        extraStyle.textContent = \`
          @page {
            margin: ${PRINT_TOP_MARGIN} 8mm 8mm 8mm !important;
            size: A4 !important;
            @top-left { content: "" !important; }
            @top-center { content: "" !important; }
            @top-right { content: "" !important; }
            @bottom-left { content: "" !important; }
            @bottom-center { content: "" !important; }
            @bottom-right { content: "" !important; }
          }
        \`;
        document.head.appendChild(extraStyle);
      });
    `;
    printWindow.document.head.appendChild(script);

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  } catch (error) {
    console.error('Error generating print content:', error);
  }
};