// Path: components/pharmacy/import/ImportColumnMapper.tsx
'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FIELD_LABELS, REQUIRED_FIELDS, PROCUREMENT_FIELDS } from '@/lib/pharmacy-import';
import type { ParsedFile, ColumnMapping, ColumnField } from '@/types/pharmacy';

interface ImportColumnMapperProps {
  parsed: ParsedFile;
  mapping: ColumnMapping;
  onChange: (m: ColumnMapping) => void;
}

export function ImportColumnMapper({ parsed, mapping, onChange }: ImportColumnMapperProps) {
  const { headers, rows } = parsed;
  const colOptions = [
    { label: '— Skip —', value: 'null' },
    ...headers.map((h, i) => ({ label: h || `Column ${i + 1}`, value: String(i) })),
  ];

  const coreFields = (Object.keys(FIELD_LABELS) as ColumnField[]).filter((f) => !PROCUREMENT_FIELDS.includes(f as typeof PROCUREMENT_FIELDS[number]));

  const renderFields = (fields: ColumnField[]) => (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {fields.map((field) => (
        <div key={field} className="space-y-1.5">
          <Label className="text-xs font-medium flex items-center gap-1">
            {FIELD_LABELS[field]}
            {REQUIRED_FIELDS.includes(field as typeof REQUIRED_FIELDS[number]) && (
              <span className="text-destructive">*</span>
            )}
          </Label>
          <Select
            value={mapping[field] === null ? 'null' : String(mapping[field])}
            onValueChange={(v) => onChange({ ...mapping, [field]: v === 'null' ? null : parseInt(v) })}
          >
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {colOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="text-xs">{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">

      {renderFields(coreFields)}

      <div className="rounded-lg border border-dashed border-violet-200 bg-violet-50/40 p-4 dark:border-violet-800 dark:bg-violet-950/20 space-y-3">
        <div className="flex items-center gap-2">
          <Info className="h-3.5 w-3.5 text-violet-500 shrink-0" />
          <p className="text-xs font-medium text-violet-700 dark:text-violet-300">
            Supplier & Invoice Columns — optional, enables automatic multi-vendor grouping
          </p>
        </div>
        {renderFields(PROCUREMENT_FIELDS as unknown as ColumnField[])}
      </div>

      {/* 5-row sample preview */}
      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              {headers.map((h, i) => {
                const fieldName = (Object.entries(mapping) as [ColumnField, number | null][])
                  .find(([, v]) => v === i)?.[0];
                const isMeta = fieldName ? PROCUREMENT_FIELDS.includes(fieldName as typeof PROCUREMENT_FIELDS[number]) : false;
                return (
                  <TableHead key={i} className={cn(
                    'text-xs py-2',
                    fieldName && !isMeta && 'bg-primary/5 text-primary font-semibold',
                    fieldName && isMeta && 'bg-violet-50 text-violet-700 font-semibold dark:bg-violet-950/30 dark:text-violet-300',
                  )}>
                    {h || `Col ${i + 1}`}
                    {fieldName && (
                      <span className="block text-[10px] font-normal opacity-70">→ {FIELD_LABELS[fieldName]}</span>
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.slice(0, 10).map((row, ri) => (
              <TableRow key={ri}>
                {row.map((cell, ci) => {
                  const fieldName = (Object.entries(mapping) as [ColumnField, number | null][])
                    .find(([, v]) => v === ci)?.[0];
                  const isMeta = fieldName ? PROCUREMENT_FIELDS.includes(fieldName as typeof PROCUREMENT_FIELDS[number]) : false;
                  return (
                    <TableCell key={ci} className={cn(
                      'text-xs py-1.5',
                      fieldName && !isMeta && 'bg-primary/5',
                      fieldName && isMeta && 'bg-violet-50/60 dark:bg-violet-950/20',
                    )}>
                      {cell}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
