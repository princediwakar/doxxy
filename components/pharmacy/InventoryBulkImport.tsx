// Path: components/pharmacy/InventoryBulkImport.tsx
'use client';

import React, { useCallback, useRef, useState } from 'react';
import { read, utils } from 'xlsx';
import { toast } from 'sonner';
import { useAppState } from '@/contexts/AppStateContext';
import { bulkImportInventory, type BulkImportRow } from '@/actions/inventory-bulk';
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/loading';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  UploadCloud, FileSpreadsheet, Sparkles, CheckCircle2, AlertTriangle, X, ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Types ──────────────────────────────────────────────────────────────────────

type ColumnField = 'medicineName' | 'batchNo' | 'expiryDate' | 'qty' | 'mrp' | 'purchasePrice';
type ColumnMapping = Record<ColumnField, number | null>;

interface ParsedFile {
  headers: string[];
  rows: string[][];
  rawRows: (string | number | null)[][];
}

type ImportState = 'idle' | 'parsing' | 'mapping' | 'preview' | 'importing' | 'done';

const FIELD_LABELS: Record<ColumnField, string> = {
  medicineName: 'Medicine Name',
  batchNo: 'Batch No.',
  expiryDate: 'Expiry Date',
  qty: 'Quantity',
  mrp: 'MRP (₹)',
  purchasePrice: 'Purchase Price (₹)',
};

const REQUIRED_FIELDS: ColumnField[] = ['medicineName', 'qty'];

// ── Helpers ────────────────────────────────────────────────────────────────────

function parseExpiryDate(raw: string | number | null): string {
  if (!raw) return '';
  if (typeof raw === 'number') {
    // Excel serial date
    const d = new Date(Math.round((raw - 25569) * 86400 * 1000));
    return d.toISOString().split('T')[0];
  }
  const str = String(raw).trim();
  // Try common formats: MM/YY, MM-YYYY, YYYY-MM-DD, DD/MM/YYYY
  const mmyy = str.match(/^(\d{1,2})[\/\-](\d{2})$/);
  if (mmyy) return `20${mmyy[2]}-${mmyy[1].padStart(2, '0')}-01`;
  const mmyyyy = str.match(/^(\d{1,2})[\/\-](\d{4})$/);
  if (mmyyyy) return `${mmyyyy[2]}-${mmyyyy[1].padStart(2, '0')}-01`;
  const ddmmyyyy = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (ddmmyyyy) return `${ddmmyyyy[3]}-${ddmmyyyy[2].padStart(2, '0')}-${ddmmyyyy[1].padStart(2, '0')}`;
  // Already ISO
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) return str.slice(0, 10);
  return '';
}

function getCellStr(row: (string | number | null)[], idx: number | null): string {
  if (idx === null || idx === undefined || !row[idx]) return '';
  return String(row[idx]).trim();
}

function getCellNum(row: (string | number | null)[], idx: number | null): number {
  if (idx === null || idx === undefined) return 0;
  const v = row[idx];
  if (v === null || v === undefined || v === '') return 0;
  return parseFloat(String(v).replace(/[₹,\s]/g, '')) || 0;
}

function mappingToRows(rawRows: (string | number | null)[][], mapping: ColumnMapping): BulkImportRow[] {
  return rawRows.map((row) => ({
    medicineName: getCellStr(row, mapping.medicineName),
    batchNo: getCellStr(row, mapping.batchNo) || 'BULK',
    expiryDate: parseExpiryDate(mapping.expiryDate !== null ? row[mapping.expiryDate!] ?? null : null),
    qty: getCellNum(row, mapping.qty),
    mrp: getCellNum(row, mapping.mrp),
    purchasePrice: getCellNum(row, mapping.purchasePrice),
  })).filter((r) => r.medicineName && r.qty > 0);
}

// ── Drag-and-Drop Zone ──────────────────────────────────────────────────────────

function DropZone({ onFile }: { onFile: (file: File) => void }) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onFile(file);
  }, [onFile]);

  return (
    <div
      className={cn(
        'relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-14 px-6 text-center transition-all cursor-pointer select-none',
        isDragging
          ? 'border-primary bg-primary/5 scale-[1.01]'
          : 'border-border hover:border-primary/50 hover:bg-muted/30'
      )}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.xlsx,.xls"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ''; }}
      />
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
        <FileSpreadsheet className="h-8 w-8 text-primary" />
      </div>
      <p className="text-base font-semibold">Drop your inventory file here</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Accepts CSV, Excel (.xlsx, .xls) — no fixed template required
      </p>
      <div className="mt-4 flex items-center gap-2">
        <Button type="button" size="sm" variant="outline" className="gap-1.5">
          <UploadCloud className="h-4 w-4" />
          Browse File
        </Button>
      </div>
      <p className="mt-3 text-xs text-muted-foreground flex items-center gap-1">
        <Sparkles className="h-3 w-3 text-violet-500" />
        AI will automatically detect column names
      </p>
    </div>
  );
}

// ── Column Mapper ───────────────────────────────────────────────────────────────

function ColumnMapper({
  headers,
  sampleRows,
  mapping,
  onChange,
}: {
  headers: string[];
  sampleRows: string[][];
  mapping: ColumnMapping;
  onChange: (m: ColumnMapping) => void;
}) {
  const colOptions = [{ label: '— Skip —', value: 'null' }, ...headers.map((h, i) => ({ label: h || `Column ${i + 1}`, value: String(i) }))];

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        AI has mapped your columns. Review and adjust if needed.
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {(Object.keys(FIELD_LABELS) as ColumnField[]).map((field) => (
          <div key={field} className="space-y-1.5">
            <Label className="text-xs font-medium flex items-center gap-1">
              {FIELD_LABELS[field]}
              {REQUIRED_FIELDS.includes(field) && <span className="text-destructive">*</span>}
            </Label>
            <Select
              value={mapping[field] === null ? 'null' : String(mapping[field])}
              onValueChange={(v) => onChange({ ...mapping, [field]: v === 'null' ? null : parseInt(v) })}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {colOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} className="text-xs">
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>

      {/* 5-row preview */}
      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              {headers.map((h, i) => {
                const isMapped = Object.values(mapping).includes(i);
                const fieldName = (Object.entries(mapping) as [ColumnField, number | null][]).find(([, v]) => v === i)?.[0];
                return (
                  <TableHead key={i} className={cn('text-xs py-2', isMapped && 'bg-primary/5 text-primary font-semibold')}>
                    {h || `Col ${i + 1}`}
                    {fieldName && <span className="block text-[10px] text-primary/60 font-normal">→ {FIELD_LABELS[fieldName]}</span>}
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sampleRows.slice(0, 5).map((row, ri) => (
              <TableRow key={ri}>
                {row.map((cell, ci) => (
                  <TableCell key={ci} className={cn('text-xs py-1.5', Object.values(mapping).includes(ci) && 'bg-primary/5')}>
                    {cell}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ── Preview Table ───────────────────────────────────────────────────────────────

function PreviewTable({
  rows,
  mergeAll,
  onMergeAllChange,
}: {
  rows: BulkImportRow[];
  mergeAll: boolean;
  onMergeAllChange: (v: boolean) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          <strong>{rows.length}</strong> rows ready to import
        </p>
        <div className="flex items-center gap-2">
          <Label htmlFor="merge-toggle" className="text-xs text-muted-foreground">Add to existing batches</Label>
          <Switch id="merge-toggle" checked={mergeAll} onCheckedChange={onMergeAllChange} />
        </div>
      </div>
      <div className="overflow-x-auto rounded-lg border max-h-64 overflow-y-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-card">
            <TableRow>
              <TableHead className="text-xs">Medicine</TableHead>
              <TableHead className="text-xs">Batch</TableHead>
              <TableHead className="text-xs">Expiry</TableHead>
              <TableHead className="text-xs text-right">Qty</TableHead>
              <TableHead className="text-xs text-right">MRP</TableHead>
              <TableHead className="text-xs text-right">Cost</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.slice(0, 50).map((row, i) => (
              <TableRow key={i}>
                <TableCell className="text-xs font-medium py-1.5">{row.medicineName}</TableCell>
                <TableCell className="text-xs py-1.5 text-muted-foreground">{row.batchNo}</TableCell>
                <TableCell className="text-xs py-1.5 text-muted-foreground">{row.expiryDate || '—'}</TableCell>
                <TableCell className="text-xs py-1.5 text-right">{row.qty}</TableCell>
                <TableCell className="text-xs py-1.5 text-right">₹{row.mrp.toFixed(2)}</TableCell>
                <TableCell className="text-xs py-1.5 text-right">₹{row.purchasePrice.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {rows.length > 50 && (
        <p className="text-xs text-muted-foreground text-center">Showing first 50 of {rows.length} rows</p>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

interface InventoryBulkImportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InventoryBulkImport({ open, onOpenChange }: InventoryBulkImportProps) {
  const { activeClinicId } = useAppState();
  const [state, setState] = useState<ImportState>('idle');
  const [parsed, setParsed] = useState<ParsedFile | null>(null);
  const [mapping, setMapping] = useState<ColumnMapping>({
    medicineName: null, batchNo: null, expiryDate: null, qty: null, mrp: null, purchasePrice: null,
  });
  const [previewRows, setPreviewRows] = useState<BulkImportRow[]>([]);
  const [mergeAll, setMergeAll] = useState(true);
  const [result, setResult] = useState<{ inserted: number; updated: number; newMedicines: number } | null>(null);

  const reset = () => {
    setState('idle');
    setParsed(null);
    setMapping({ medicineName: null, batchNo: null, expiryDate: null, qty: null, mrp: null, purchasePrice: null });
    setPreviewRows([]);
    setResult(null);
  };

  const handleClose = () => { reset(); onOpenChange(false); };

  const handleFile = useCallback(async (file: File) => {
    if (!activeClinicId) { toast.error('No clinic selected'); return; }
    setState('parsing');

    try {
      const buffer = await file.arrayBuffer();
      const wb = read(buffer, { type: 'array', cellDates: false });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rawData: (string | number | null)[][] = utils.sheet_to_json(ws, { header: 1, raw: true, defval: null });

      if (rawData.length < 2) { toast.error('File has no data rows'); setState('idle'); return; }

      const headers = rawData[0].map((h) => h !== null ? String(h).trim() : '');
      const dataRows = rawData.slice(1).filter((r) => r.some((c) => c !== null && c !== ''));
      const stringRows = dataRows.map((r) => r.map((c) => c !== null ? String(c) : ''));

      setParsed({ headers, rows: stringRows, rawRows: dataRows });
      setState('mapping');

      // Call AI column mapper
      const sample = stringRows.slice(0, 5);
      const res = await fetch('/api/inventory/map-columns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ headers, sampleRows: sample }),
      });

      if (res.ok) {
        const data = await res.json() as { mapping: ColumnMapping };
        if (data.mapping) setMapping(data.mapping);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to parse file';
      toast.error(msg);
      setState('idle');
    }
  }, [activeClinicId]);

  const handlePreview = () => {
    if (!parsed) return;
    const missing = REQUIRED_FIELDS.filter((f) => mapping[f] === null);
    if (missing.length > 0) {
      toast.error(`Please map required fields: ${missing.map((f) => FIELD_LABELS[f]).join(', ')}`);
      return;
    }
    const rows = mappingToRows(parsed.rawRows, mapping);
    if (rows.length === 0) { toast.error('No valid rows found after mapping'); return; }
    setPreviewRows(rows);
    setState('preview');
  };

  const handleImport = async () => {
    if (!activeClinicId || !previewRows.length) return;
    setState('importing');
    const toastId = toast.loading(`Importing ${previewRows.length} rows...`);

    try {
      const result = await bulkImportInventory({
        clinicId: activeClinicId,
        rows: previewRows.map((r) => ({ ...r, mergeWithExisting: mergeAll })),
      });

      if (result.error) {
        toast.error(result.error, { id: toastId });
        setState('preview');
        return;
      }

      toast.success(
        `Import complete! ${result.inserted} added, ${result.updated} updated${result.newMedicines > 0 ? `, ${result.newMedicines} new medicines created` : ''}`,
        { id: toastId, duration: 8000 }
      );
      setResult(result);
      setState('done');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Import failed';
      toast.error(msg, { id: toastId });
      setState('preview');
    }
  };

  const canProceedMapping = REQUIRED_FIELDS.every((f) => mapping[f] !== null);

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent
        side="bottom"
        className="h-[92vh] rounded-t-xl sm:max-w-none flex flex-col p-0 border-t-0 shadow-2xl [&>button:last-of-type]:hidden"
      >
        <div className="flex flex-col h-full">
          <SheetHeader className="px-6 py-4 border-b bg-card shrink-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <Button type="button" variant="outline" size="icon" className="-ml-1" onClick={handleClose}>
                  <X className="w-4 h-4" />
                </Button>
                <div>
                  <SheetTitle className="flex items-center gap-2 text-xl">
                    <FileSpreadsheet className="w-5 h-5 text-primary" />
                    Import Inventory
                    {state === 'mapping' && <Badge variant="secondary" className="text-xs animate-pulse bg-violet-100 text-violet-700 border-0"><Sparkles className="w-3 h-3 mr-1" />AI Mapped</Badge>}
                    {state === 'importing' && <Badge variant="secondary" className="text-xs animate-pulse">Importing...</Badge>}
                    {state === 'done' && <Badge className="text-xs bg-green-500 border-0"><CheckCircle2 className="w-3 h-3 mr-1" />Done</Badge>}
                  </SheetTitle>
                  <SheetDescription>
                    {state === 'idle' && 'Upload any CSV or Excel file — no fixed template required'}
                    {state === 'parsing' && 'Reading file...'}
                    {state === 'mapping' && 'Review column mapping — adjust if AI missed anything'}
                    {state === 'preview' && `${previewRows.length} rows ready to import into your pharmacy stock`}
                    {state === 'importing' && 'Saving to database...'}
                    {state === 'done' && 'All rows imported successfully'}
                  </SheetDescription>
                </div>
              </div>

              {/* Step indicator */}
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
                {['Upload', 'Map', 'Preview', 'Import'].map((step, i) => {
                  const stepStates: ImportState[] = ['idle', 'mapping', 'preview', 'importing'];
                  const stateIndex = ['idle', 'parsing', 'mapping', 'preview', 'importing', 'done'].indexOf(state);
                  const stepIndex = stepStates.indexOf(stepStates[i]);
                  const isActive = stepIndex === ['idle', 'parsing', 'mapping', 'preview', 'importing', 'done'].indexOf(state) - (state === 'parsing' ? 1 : 0);
                  const isDone = stateIndex > i + 1 || state === 'done';
                  return (
                    <React.Fragment key={step}>
                      <span className={cn(
                        'px-2 py-0.5 rounded-full',
                        isDone && 'text-green-600 bg-green-50',
                        !isDone && 'text-muted-foreground'
                      )}>
                        {isDone ? '✓ ' : ''}{step}
                      </span>
                      {i < 3 && <ArrowRight className="w-3 h-3 text-muted-foreground/50" />}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </SheetHeader>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* State: idle / parsing */}
              {(state === 'idle' || state === 'parsing') && (
                <div className="space-y-6">
                  {state === 'parsing' ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                      <Spinner size="lg" />
                      <p className="text-sm text-muted-foreground">Reading and analysing your file...</p>
                    </div>
                  ) : (
                    <DropZone onFile={handleFile} />
                  )}
                  <div className="rounded-lg bg-muted/40 p-4 text-sm space-y-1.5">
                    <p className="font-medium text-xs uppercase tracking-wide text-muted-foreground">What gets imported</p>
                    <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                      <li>Medicine name, batch number, expiry date, quantity, MRP, purchase price</li>
                      <li>Existing batches can be merged (adds stock) or kept separate</li>
                      <li>New medicine names are auto-created in your catalog</li>
                      <li>All changes are logged in the stock audit trail</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* State: mapping */}
              {state === 'mapping' && parsed && (
                <ColumnMapper
                  headers={parsed.headers}
                  sampleRows={parsed.rows}
                  mapping={mapping}
                  onChange={setMapping}
                />
              )}

              {/* State: preview */}
              {state === 'preview' && (
                <PreviewTable rows={previewRows} mergeAll={mergeAll} onMergeAllChange={setMergeAll} />
              )}

              {/* State: importing */}
              {state === 'importing' && (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Spinner size="lg" />
                  <p className="text-sm text-muted-foreground">Importing {previewRows.length} rows into your pharmacy stock...</p>
                </div>
              )}

              {/* State: done */}
              {state === 'done' && result && (
                <div className="flex flex-col items-center justify-center py-12 gap-6">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle2 className="h-10 w-10 text-green-600" />
                  </div>
                  <div className="text-center space-y-1">
                    <h3 className="text-xl font-semibold">Import Complete</h3>
                    <p className="text-sm text-muted-foreground">Your pharmacy stock has been updated</p>
                  </div>
                  <div className="grid grid-cols-3 gap-4 w-full max-w-sm">
                    {[
                      { label: 'New Batches', value: result.inserted },
                      { label: 'Updated', value: result.updated },
                      { label: 'New Medicines', value: result.newMedicines },
                    ].map((stat) => (
                      <div key={stat.label} className="text-center p-4 rounded-lg bg-muted/50">
                        <p className="text-2xl font-bold text-primary">{stat.value}</p>
                        <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={reset}>Import Another File</Button>
                    <Button onClick={handleClose}>Done</Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer actions */}
          {(state === 'mapping' || state === 'preview') && (
            <div className="shrink-0 border-t bg-card px-6 py-4 flex items-center justify-between gap-3">
              <Button variant="ghost" onClick={() => setState(state === 'preview' ? 'mapping' : 'idle')}>
                ← Back
              </Button>
              <div className="flex items-center gap-2">
                {state === 'mapping' && !canProceedMapping && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3 text-amber-500" />
                    Map required fields to continue
                  </span>
                )}
                {state === 'mapping' && (
                  <Button onClick={handlePreview} disabled={!canProceedMapping}>
                    Preview {parsed ? `${Math.min(mappingToRows(parsed.rawRows, mapping).length, 999)} rows` : ''}
                    →
                  </Button>
                )}
                {state === 'preview' && (
                  <Button onClick={handleImport} className="bg-primary gap-2">
                    <UploadCloud className="w-4 h-4" />
                    Import {previewRows.length} rows into Stock
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
