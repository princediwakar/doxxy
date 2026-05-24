// components/billing/BillingPDF.tsx
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { Bill } from '@/types/billing';
import type { DbPatient, DbClinic } from '@/types/core';

// Structured Minimalism: Zero backgrounds, high typographic contrast.
const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10, color: '#111827' },
  
  // Header: Brand & Invoice Details
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', borderBottomWidth: 2, borderBottomColor: '#111827', paddingBottom: 20, marginBottom: 24 },
  brandSection: { flex: 1, flexDirection: 'row', gap: 12, alignItems: 'center' },
  logoText: { fontSize: 8, color: '#9ca3af', fontWeight: 'bold' },
  clinicDetails: { flex: 1 },
  clinicName: { fontSize: 16, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5, color: '#111827', marginBottom: 2 },
  clinicContact: { fontSize: 9, color: '#4b5563', lineHeight: 1.4 },
  
  invoiceTitleSection: { alignItems: 'flex-end' },
  invoiceTitle: { fontSize: 24, fontWeight: 'bold', letterSpacing: 1, color: '#111827' },
  invoiceNumber: { fontSize: 11, marginTop: 4, color: '#6b7280', fontWeight: 'bold' },
  
  // Meta Grid: Clean separations
  metaGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  metaCol: { flex: 1 },
  metaLabel: { fontSize: 8, textTransform: 'uppercase', color: '#6b7280', fontWeight: 'bold', letterSpacing: 0.5, marginBottom: 4 },
  metaValue: { fontSize: 12, fontWeight: 'bold', color: '#111827', marginBottom: 2 },
  metaSubText: { fontSize: 10, color: '#4b5563' },

  // Table Structure: Premium spacing and line weights
  table: { width: '100%', marginBottom: 30 },
  tableHeader: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#111827', paddingBottom: 8, marginBottom: 8 },
  tableHeaderCell: { fontSize: 8, textTransform: 'uppercase', color: '#6b7280', fontWeight: 'bold', letterSpacing: 0.5 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', paddingVertical: 10 },
  
  // Columns
  colDesc: { flex: 4, paddingRight: 15 },
  colQty: { flex: 1, textAlign: 'center' },
  colRate: { flex: 1.5, textAlign: 'right' },
  colAmount: { flex: 1.5, textAlign: 'right' },
  
  itemTitle: { fontSize: 10, fontWeight: 'bold', color: '#111827', marginBottom: 3 },
  tableCellText: { fontSize: 10, color: '#4b5563' },

  // Summary Section
  summaryWrapper: { flexDirection: 'row', justifyContent: 'flex-end' },
  summaryTable: { width: 240 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  summaryLabel: { fontSize: 10, color: '#4b5563' },
  summaryValue: { fontSize: 10, fontWeight: 'bold', color: '#111827' },
  
  grandTotalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderTopWidth: 2, borderTopColor: '#111827', marginTop: 4 },
  grandTotalLabel: { fontSize: 12, fontWeight: 'bold', color: '#111827' },
  grandTotalValue: { fontSize: 14, fontWeight: 'bold', color: '#111827' },

  // Footer
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingTop: 12, flexDirection: 'row', justifyContent: 'space-between' },
  footerText: { fontSize: 8, color: '#9ca3af' }
});

interface BillingPDFProps { billData: Bill; patient: DbPatient | null; clinic: DbClinic | null; }

export const BillingPDF = ({ billData, patient, clinic }: BillingPDFProps) => {
  const patientName = patient?.name || (billData as any).patient?.name || (billData as any).patient_name || 'Patient';
  const formatDate = (dateString?: string | null) => new Date(dateString || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const formatTime = (dateString?: string | null) => new Date(dateString || Date.now()).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  const subtotal = Number(billData.amount || 0);
  const discountAmount = subtotal * (Number(billData.discount_percentage || 0) / 100);
  const taxAmount = (subtotal - discountAmount) * (Number(billData.tax_percentage || 0) / 100);
  const finalTotal = subtotal - discountAmount + taxAmount;
  const serviceItems = Array.isArray(billData.service_items) ? billData.service_items : [];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View fixed style={styles.header}>
          <View style={styles.brandSection}>
            <View style={styles.clinicDetails}>
              <Text style={styles.clinicName}>{clinic?.name || 'Clinic Name'}</Text>
              {clinic?.address && <Text style={styles.clinicContact}>{clinic.address}</Text>}
              {clinic?.phone && <Text style={styles.clinicContact}>{clinic.phone}</Text>}
            </View>
          </View>
          <View style={styles.invoiceTitleSection}>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.invoiceNumber}>#{billData.invoice_number}</Text>
          </View>
        </View>

        <View style={styles.metaGrid}>
          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>Billed To</Text>
            <Text style={styles.metaValue}>{patientName}</Text>
            {patient?.phone && <Text style={styles.metaSubText}>{patient.phone}</Text>}
          </View>
          <View style={[styles.metaCol, { alignItems: 'flex-end' }]}>
            <Text style={styles.metaLabel}>Date Issued</Text>
            <Text style={styles.metaValue}>{formatDate(billData.created_at)}</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colDesc]}>Description</Text>
            <Text style={[styles.tableHeaderCell, styles.colQty]}>Qty</Text>
            <Text style={[styles.tableHeaderCell, styles.colRate]}>Rate</Text>
            <Text style={[styles.tableHeaderCell, styles.colAmount]}>Amount</Text>
          </View>

          {serviceItems.map((item: any, idx: number) => (
            <View wrap={false} key={idx} style={styles.tableRow}>
              <Text style={[styles.itemTitle, styles.colDesc]}>{item.description}</Text>
              <Text style={[styles.tableCellText, styles.colQty]}>{item.quantity}</Text>
              <Text style={[styles.tableCellText, styles.colRate]}>Rs. {Number(item.rate || 0).toFixed(2)}</Text>
              <Text style={[styles.tableCellText, styles.colAmount]}>Rs. {Number(item.amount || 0).toFixed(2)}</Text>
            </View>
          ))}
        </View>

        <View wrap={false} style={styles.summaryWrapper}>
          <View style={styles.summaryTable}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>Rs. {subtotal.toFixed(2)}</Text>
            </View>
            {Number(billData.discount_percentage || 0) > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Discount ({billData.discount_percentage}%)</Text>
                <Text style={styles.summaryValue}>-Rs. {discountAmount.toFixed(2)}</Text>
              </View>
            )}
            {Number(billData.tax_percentage || 0) > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tax ({billData.tax_percentage}%)</Text>
                <Text style={styles.summaryValue}>Rs. {taxAmount.toFixed(2)}</Text>
              </View>
            )}
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>Total Due</Text>
              <Text style={styles.grandTotalValue}>Rs. {finalTotal.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        <View fixed style={styles.footer}>
          <Text style={styles.footerText}>Generated at {formatTime()}</Text>
          <Text style={styles.footerText}>Computer Generated Document</Text>
        </View>
      </Page>
    </Document>
  );
};