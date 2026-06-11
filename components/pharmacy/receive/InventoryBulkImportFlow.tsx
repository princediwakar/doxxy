// components/pharmacy/receive/InventoryBulkImportFlow.tsx
'use client';

import { useEffect } from 'react';
import { useAppState } from '@/contexts/AppStateContext';
import { useInventoryImport } from '@/hooks/useInventoryImport';
import { REQUIRED_FIELDS } from '@/lib/pharmacy-import';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/loading';
import { Badge } from '@/components/ui/badge';
import {
  FileSpreadsheet,
  Sparkles,
  PackageCheck,
  AlertTriangle
} from 'lucide-react';
import { ImportColumnMapper } from '../import/ImportColumnMapper';
import { ImportPreview } from '../import/ImportPreview';
import { ImportDone } from '../import/ImportDone';

interface InventoryBulkImportFlowProps {
  onCancel: () => void;
  initialFile?: File;
}

export function InventoryBulkImportFlow({ onCancel, initialFile }: InventoryBulkImportFlowProps) {
  const { activeClinicId, user } = useAppState();
  const im = useInventoryImport(activeClinicId ?? null, user?.id ?? null);
  const { step } = im;

  // Auto-process initialFile from SmartInventoryDropzone
  useEffect(() => {
    if (initialFile && !im.initialFileConsumed.current) {
      im.initialFileConsumed.current = true;
      im.handleFile(initialFile);
    }
  }, [initialFile, im]);

  const handleClose = () => { im.reset(); onCancel(); };

  function handleProceedToPreview() {
    if (step.type !== 'config') return;
    im.proceedToPreview(step);
  }

  // ── Loading / parsing ────────────────────────────────────────────────────
  if (step.type === 'upload' || step.type === 'parsing') {
    return (
      <div className="flex flex-col flex-1 items-center justify-center gap-4 py-24 animate-in fade-in duration-300">
        <Spinner size="lg" />
        <p className="text-sm text-muted-foreground">
          {step.type === 'parsing' ? 'Reading and analysing your file…' : 'Preparing upload…'}
        </p>
        <Button variant="outline" className="mt-4" onClick={handleClose}>Cancel</Button>
      </div>
    );
  }

  if (step.type === 'importing') {
    return (
      <div className="flex flex-col flex-1 items-center justify-center gap-4 py-24 animate-in fade-in duration-300">
        <Spinner size="lg" />
        <p className="text-sm text-muted-foreground">Saving to database…</p>
      </div>
    );
  }

  if (step.type === 'done') {
    return (
      <div className="flex flex-col flex-1 animate-in fade-in duration-300">
        <ImportDone result={step.result} onReset={im.reset} onClose={handleClose} />
      </div>
    );
  }

  // ── Configure phase: single screen for column mapping ────────────────────────────
  if (step.type === 'config') {
    const canProceedToPreview = REQUIRED_FIELDS.every((f) => step.mapping[f] !== null);



    return (
      <div className="flex flex-col h-full w-full animate-in fade-in duration-300">
        {/* Header */}
        <div className="flex-none p-4 sm:p-6 border-b border-border/50 bg-background/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-xl">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-foreground">
                Upload & configure
              </h2>
              <p className="text-sm text-muted-foreground">
                {step.parsed.rawRows.length} rows found. Map columns and review preview.
              </p>
            </div>
            {step.mapping.medicineName !== null && (
              <Badge variant="secondary" className="ml-auto bg-violet-50 text-violet-700 border-0 dark:bg-violet-900/30 dark:text-violet-300">
                <Sparkles className="w-3 h-3 mr-1" />
                AI-mapped
              </Badge>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="max-w-5xl mx-auto w-full">
              <ImportColumnMapper
                parsed={step.parsed}
                mapping={step.mapping}
                onChange={im.updateMapping}
              />
          </div>
        </div>

        {/* Footer */}
        <div className="flex-none border-t bg-background px-4 sm:px-6 py-4 flex items-center justify-between gap-6 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <Button variant="ghost" onClick={handleClose} className="text-muted-foreground hover:text-destructive">
            Cancel
          </Button>
          <Button
            disabled={!canProceedToPreview}
            onClick={handleProceedToPreview}
          >
            Preview import →
          </Button>
        </div>
      </div>
    );
  }

  // ── Preview phase ─────────────────────────────────────────────────────────
  if (step.type === 'preview') {
    const totalItems = step.groups.reduce((s, g) => s + g.items.length, 0);
    const hasErrors = step.errors.length > 0;
    const canImport = totalItems > 0;

    return (
      <div className="flex flex-col h-full w-full animate-in fade-in duration-300">
        <div className="flex-none p-4 sm:p-6 border-b border-border/50 bg-background/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-xl">
              <PackageCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-foreground">
                {totalItems} item{totalItems !== 1 ? 's' : ''} across {step.groups.length} procurement{step.groups.length !== 1 ? 's' : ''}
              </h2>
              <p className="text-sm text-muted-foreground">
                Review your {step.mode === 'opening_balance' ? 'opening balance' : 'vendor bills'} before importing.
              </p>
            </div>

            <div className="ml-auto flex gap-2">
              <Badge variant="secondary" className="bg-green-50 text-green-700 border-0 dark:bg-green-900/30 dark:text-green-300">
                {step.validCount} valid
              </Badge>
              {hasErrors && (
                <Badge variant="secondary" className="bg-red-50 text-red-700 border-0 dark:bg-red-900/30 dark:text-red-300">
                  {step.errors.length} errors
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="max-w-5xl mx-auto w-full space-y-8">
          {hasErrors && (
            <div className="rounded-xl border border-red-200 dark:border-red-900/40 overflow-hidden">
              <div className="bg-red-50 dark:bg-red-950/20 px-4 py-3 border-b border-red-200 dark:border-red-900/40 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <h3 className="text-sm font-medium text-red-800 dark:text-red-300">
                  {step.errors.length} row{step.errors.length !== 1 ? 's' : ''} will be skipped due to errors
                </h3>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-red-50/50 dark:bg-red-950/10">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-red-700 dark:text-red-400">Row</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-red-700 dark:text-red-400">Medicine (Raw)</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-red-700 dark:text-red-400">Issues</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {step.errors.slice(0, 50).map((err, i) => (
                    <tr key={i} className="bg-card">
                      <td className="px-4 py-2 text-xs text-muted-foreground font-mono">{err._rowIndex}</td>
                      <td className="px-4 py-2 text-sm text-foreground">{err.rawName}</td>
                      <td className="px-4 py-2 text-xs text-red-600 dark:text-red-400">{err.errors.join(', ')}</td>
                    </tr>
                  ))}
                  {step.errors.length > 50 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-2 text-xs text-muted-foreground text-center">
                        + {step.errors.length - 50} more errors
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {canImport ? (
            <ImportPreview
              groups={step.groups}
              mergeAll={step.mergeAll}
              onMergeAllChange={im.setMergeAll}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center bg-muted/20 rounded-xl border border-dashed">
              <p className="text-muted-foreground mb-2">No valid rows to import.</p>
              <Button variant="outline" onClick={() => im.goBack(step)}>Go back and fix</Button>
            </div>
          )}
          </div>
        </div>

        <div className="flex-none border-t bg-background px-4 sm:px-6 py-4 flex items-center justify-between gap-6 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <Button variant="ghost" onClick={() => im.goBack(step)}>← Back to config</Button>
          <Button
            className="bg-foreground text-background hover:bg-foreground/90 shadow-md gap-2"
            onClick={() => im.executeImport(step.groups)}
            disabled={!canImport}
          >
            <PackageCheck className="h-4 w-4" />
            Import {totalItems} valid rows
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
