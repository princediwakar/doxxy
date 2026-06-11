// Path: components/pharmacy/import/ImportDone.tsx
'use client';

import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ImportResult } from '@/types/pharmacy';

interface ImportDoneProps {
  result: ImportResult;
  onReset: () => void;
  onClose: () => void;
}

export function ImportDone({ result, onReset, onClose }: ImportDoneProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-6">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-950">
        <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
      </div>
      <div className="text-center space-y-1">
        <h3 className="text-xl font-semibold">Import Complete</h3>
        <p className="text-sm text-muted-foreground">Stock and procurement records updated with full audit trail</p>
      </div>
      <div className="grid grid-cols-3 gap-4 w-full max-w-sm">
        {([
          { label: 'Procurements', value: result.procurements_created },
          { label: 'New Batches',  value: result.inventory_inserted },
          { label: 'Updated',      value: result.inventory_updated },
        ] as const).map(({ label, value }) => (
          <div key={label} className="text-center p-4 rounded-lg bg-muted/50">
            <p className="text-2xl font-bold text-primary">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{label}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-3">
        <Button variant="outline" onClick={onReset}>Import Another File</Button>
        <Button onClick={onClose}>Done</Button>
      </div>
    </div>
  );
}
