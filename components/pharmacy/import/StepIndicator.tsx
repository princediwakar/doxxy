// Path: components/pharmacy/import/StepIndicator.tsx
'use client';

import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ImportStep } from '@/types/pharmacy';

const STEPS = ['Upload', 'Map', 'Intent', 'Validate', 'Preview'] as const;

const STEP_INDEX: Partial<Record<ImportStep['type'], number>> = {
  upload:      0,
  parsing:     0,
  mapping:     1,
  intent:      2,
  validation:  3,
  preview:     4,
  importing:   4,
  done:        5,
};

export function StepIndicator({ step }: { step: ImportStep }) {
  const current = STEP_INDEX[step.type] ?? 0;
  return (
    <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground shrink-0">
      {STEPS.map((label, i) => (
        <span key={label} className="flex items-center gap-1">
          <span className={cn(
            'px-2 py-0.5 rounded-full transition-all',
            i < current  && 'text-green-600 dark:text-green-400',
            i === current && 'bg-primary/10 text-primary font-medium',
          )}>
            {i < current ? `✓ ${label}` : label}
          </span>
          {i < STEPS.length - 1 && <ArrowRight className="h-3 w-3 opacity-30" />}
        </span>
      ))}
    </div>
  );
}
