// Path: components/pharmacy/import/ImportPreview.tsx
'use client';

import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import type { BulkProcurementGroup } from '@/types/pharmacy';

interface ImportPreviewProps {
  groups: BulkProcurementGroup[];
  mergeAll: boolean;
  onMergeAllChange: (v: boolean) => void;
}

export function ImportPreview({ groups, mergeAll, onMergeAllChange }: ImportPreviewProps) {
  const totalItems = groups.reduce((s, g) => s + g.items.length, 0);
  const totalValue = groups.reduce((s, g) => s + g.total_amount, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">
            <strong>{totalItems}</strong> items across{' '}
            <strong>{groups.length}</strong> procurement{groups.length > 1 ? 's' : ''}
            {' '}· ₹{totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          {groups.length > 1 && (
            <p className="text-xs text-muted-foreground mt-0.5">
              Each supplier–invoice combination creates a separate auditable record
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Label htmlFor="merge-toggle" className="text-xs text-muted-foreground">Add to existing batches</Label>
          <Switch id="merge-toggle" checked={mergeAll} onCheckedChange={onMergeAllChange} />
        </div>
      </div>

      {groups.map((group, gi) => (
        <div key={gi} className="rounded-lg border overflow-hidden">
          {/* Group header */}
          <div className="flex items-center gap-3 border-b bg-muted/40 px-4 py-2.5">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
              {gi + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate">{group.supplier_name}</p>
              <p className="text-[10px] text-muted-foreground">
                {group.invoice_number} · {group.invoice_date} ·{' '}
                ₹{group.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <Badge variant="secondary" className="text-[10px] shrink-0">
              {group.procurement_type === 'OPENING_BALANCE' ? 'Opening Balance' : 'Invoice'}
            </Badge>
            <span className="text-[10px] text-muted-foreground shrink-0">{group.items.length} items</span>
          </div>

          {/* Items table */}
          <div className="overflow-x-auto  overflow-y-auto">
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
                {group.items.slice(0, 50).map((item, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-xs font-medium py-1.5">{item.medicine_name}</TableCell>
                    <TableCell className="text-xs py-1.5 text-muted-foreground">{item.batch_number}</TableCell>
                    <TableCell className="text-xs py-1.5 text-muted-foreground">{item.expiry_date || '—'}</TableCell>
                    <TableCell className="text-xs py-1.5 text-right">{item.quantity}</TableCell>
                    <TableCell className="text-xs py-1.5 text-right">₹{item.mrp.toFixed(2)}</TableCell>
                    <TableCell className="text-xs py-1.5 text-right">₹{item.unit_price.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {group.items.length > 50 && (
            <p className="py-2 text-center text-xs text-muted-foreground border-t">
              +{group.items.length - 50} more rows
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
