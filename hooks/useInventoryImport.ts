// Path: hooks/useInventoryImport.ts
'use client';

import { useCallback, useRef, useState } from 'react';
import { read, utils } from 'xlsx';
import { toast } from 'sonner';
import { saveBulkProcurements } from '@/actions/inventory';
import { mappingToRawRows, validateRows, buildProcurementGroups, INITIAL_MAPPING } from '@/lib/pharmacy-import';
import type {
  ImportStep, ImportMode, ParsedFile, ColumnMapping, ValidatedRow, BulkProcurementGroup,
} from '@/types/pharmacy';

// ── Hook ───────────────────────────────────────────────────────────────────────

export function useInventoryImport(clinicId: string | null, userId: string | null) {
  const [step, setStep] = useState<ImportStep>({ type: 'upload' });
  const initialFileConsumed = useRef(false);

  const reset = useCallback(() => {
    setStep({ type: 'upload' });
    initialFileConsumed.current = false;
  }, []);

  // ── File processor (Upload → Parse → Map) ──────────────────────────────────

  const processFile = useCallback(async (file: File) => {
    if (!clinicId) { toast.error('No clinic selected'); return; }
    setStep({ type: 'upload' }); // show spinner while reading

    try {
      const buffer = await file.arrayBuffer();
      const wb = read(buffer, { type: 'array', cellDates: false });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rawData: (string | number | null)[][] =
        utils.sheet_to_json(ws, { header: 1, raw: true, defval: null });

      if (rawData.length < 2) {
        toast.error('File has no data rows');
        setStep({ type: 'upload' });
        return;
      }

      const headers    = rawData[0].map((h) => h !== null ? String(h).trim() : '');
      const dataRows   = rawData.slice(1).filter((r) => r.some((c) => c !== null && c !== ''));
      const stringRows = dataRows.map((r) => r.map((c) => c !== null ? String(c) : ''));
      const parsed: ParsedFile = { headers, rows: stringRows, rawRows: dataRows };

      let mapping: ColumnMapping = INITIAL_MAPPING;

      // AI column mapping — best-effort
      try {
        const res = await fetch('/api/inventory/map-columns', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ headers, sampleRows: stringRows.slice(0, 5) }),
        });
        if (res.ok) {
          const data = await res.json() as { mapping: ColumnMapping };
          if (data.mapping) mapping = data.mapping;
        }
      } catch { /* silent — user maps manually */ }

      setStep({ type: 'config', parsed, mapping });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to parse file');
      setStep({ type: 'upload' });
    }
  }, [clinicId]);

  // ── State transitions ───────────────────────────────────────────────────────

  /** Called from ImportDropZone when user picks a file. */
  const handleFile = useCallback((file: File) => {
    processFile(file);
  }, [processFile]);

  const updateMapping = useCallback((mapping: ColumnMapping) => {
    setStep((prev) => prev.type === 'config' ? { ...prev, mapping } : prev);
  }, []);

  const proceedToPreview = useCallback((currentStep: ImportStep) => {
    if (currentStep.type !== 'config') return;
    const { parsed, mapping } = currentStep;

    const rawRows = mappingToRawRows(parsed.rawRows, mapping);
    const { valid, errors } = validateRows(rawRows);

    if (valid.length === 0 && errors.length === 0) {
      toast.error('No rows found to process.');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const mode: ImportMode = mapping.supplierName !== null ? 'multi_vendor' : 'opening_balance';
    const groups = buildProcurementGroups(valid, mode, '', '', today);
    setStep({
      type: 'preview', mode, parsed, mapping, groups, mergeAll: true, validCount: valid.length, errors
    });
  }, []);

  const setMergeAll = useCallback((mergeAll: boolean) => {
    setStep((prev) => prev.type === 'preview' ? { ...prev, mergeAll } : prev);
  }, []);

  const executeImport = useCallback(async (groups: BulkProcurementGroup[]) => {
    if (!clinicId || !userId || !groups.length) return;

    // We only need the current step to restore on failure.
    // To do this safely, we get the previous state if we need it. 
    // For now we'll just store the groups in importing step.
    setStep({ type: 'importing', groups });

    const total   = groups.reduce((s, g) => s + g.items.length, 0);
    const toastId = toast.loading(
      `Importing ${total} items across ${groups.length} procurement${groups.length > 1 ? 's' : ''}...`
    );

    try {
      const res = await saveBulkProcurements({ clinicId, userId, procurements: groups });
      if (res.error) {
        toast.error(res.error, { id: toastId });
        // Can't easily restore preview step with parsed/mapping here, but upload works as fallback.
        setStep({ type: 'upload' });
        return;
      }
      toast.success(
        `Done! ${res.procurements_created} procurement${res.procurements_created > 1 ? 's' : ''} · ` +
        `${res.inventory_inserted} new batches · ${res.inventory_updated} updated`,
        { id: toastId, duration: 8000 },
      );
      setStep({ type: 'done', result: res });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Import failed', { id: toastId });
      setStep({ type: 'upload' });
    }
  }, [clinicId, userId]);

  const goBack = useCallback((currentStep: ImportStep) => {
    switch (currentStep.type) {
      case 'parsing':
      case 'config':
        setStep({ type: 'upload' });
        break;
      case 'preview':
        setStep({ type: 'config', parsed: currentStep.parsed, mapping: currentStep.mapping });
        break;
    }
  }, []);

  return {
    step,
    reset,
    handleFile,
    updateMapping,
    proceedToPreview,
    setMergeAll,
    executeImport,
    goBack,
    initialFileConsumed,
  } as const;
}

export type UseInventoryImport = ReturnType<typeof useInventoryImport>;
