// Path: components/pharmacy/SmartInventoryDropzone.tsx
'use client';

import { useCallback, useRef, useState } from 'react';
import { FileSpreadsheet, FolderOpen, ScanLine, UploadCloud, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SmartInventoryDropzoneProps {
  onSpreadsheet: (file: File) => void;
  onBillImage: (file: File) => void;
  className?: string;
}

const SPREADSHEET_EXTS = ['.csv', '.xlsx', '.xls'];

function classifyFile(file: File): 'spreadsheet' | 'bill' | null {
  const name = file.name.toLowerCase();
  const isSpreadsheetMime = file.type === 'text/csv' ||
    file.type === 'application/vnd.ms-excel' ||
    file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    file.type === 'text/comma-separated-values';

  if (isSpreadsheetMime || SPREADSHEET_EXTS.some((ext) => name.endsWith(ext))) return 'spreadsheet';
  if (file.type.startsWith('image/') || file.type === 'application/pdf') return 'bill';
  return null;
}

export function SmartInventoryDropzone({
  onSpreadsheet,
  onBillImage,
  className,
}: SmartInventoryDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragType, setDragType] = useState<'spreadsheet' | 'bill' | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files?.length) return;
      const file = files[0];
      const type = classifyFile(file);
      if (type === 'spreadsheet') onSpreadsheet(file);
      else if (type === 'bill') onBillImage(file);
    },
    [onSpreadsheet, onBillImage],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
    // Peek at the dragged file type for visual feedback
    const item = e.dataTransfer.items[0];
    if (item) {
      const isSpreadsheet =
        item.type.includes('spreadsheet') ||
        item.type.includes('csv') ||
        item.type === 'application/vnd.ms-excel' ||
        item.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      setDragType(isSpreadsheet ? 'spreadsheet' : 'bill');
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      setDragType(null);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  return (
    <div
      className={cn(
        'group relative select-none rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center p-8 overflow-hidden',
        isDragging
          ? dragType === 'spreadsheet'
            ? 'border-violet-500 bg-violet-50/80 dark:bg-violet-950/30 scale-[1.02]'
            : 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/30 scale-[1.02]'
          : 'border-border/60 bg-background/50 backdrop-blur-sm hover:border-primary/50 hover:bg-muted/30',
        className,
      )}
      onDragOver={handleDragOver}
      onDragLeave={() => { setIsDragging(false); setDragType(null); }}
      onDrop={handleDrop}
      aria-label="Drop a bill image or inventory spreadsheet to add stock"
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*,application/pdf,.csv,.xlsx,.xls"
        className="hidden"
        onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }}
      />

      {/* Animated background pulse when dragging */}
      {isDragging && (
        <div className={cn(
          "absolute inset-0 opacity-20 transition-all duration-500",
          dragType === 'spreadsheet' ? 'bg-violet-400 animate-pulse' : 'bg-blue-400 animate-pulse'
        )} />
      )}

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center text-center gap-6">
        <div className="relative flex h-20 w-20 shrink-0 items-center justify-center">
          <div className={cn(
            'absolute inset-0 rounded-2xl transition-all duration-300 rotate-3',
            isDragging 
              ? dragType === 'spreadsheet' ? 'bg-violet-500/20 scale-110 -rotate-3' : 'bg-blue-500/20 scale-110 -rotate-3'
              : 'bg-primary/10 group-hover:bg-primary/15 group-hover:-rotate-3',
          )} />
          {isDragging && dragType === 'spreadsheet' ? (
            <FileSpreadsheet className="relative h-10 w-10 text-violet-600 dark:text-violet-400 animate-in zoom-in duration-300" />
          ) : isDragging && dragType === 'bill' ? (
            <ScanLine className="relative h-10 w-10 text-blue-600 dark:text-blue-400 animate-in zoom-in duration-300" />
          ) : (
            <UploadCloud className="relative h-10 w-10 text-primary transition-transform duration-300 group-hover:scale-110" />
          )}
        </div>

        <div className="space-y-1.5 max-w-sm">
          {isDragging ? (
            <h3 className={cn(
              'text-lg font-semibold tracking-tight',
              dragType === 'spreadsheet' ? 'text-violet-700 dark:text-violet-300' : 'text-blue-700 dark:text-blue-300',
            )}>
              {dragType === 'spreadsheet' ? 'Drop to bulk import inventory →' : 'Drop to scan invoice with AI →'}
            </h3>
          ) : (
            <>
              <h3 className="text-lg font-semibold tracking-tight text-foreground">
                Drag and drop your files here
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We support <strong className="text-foreground/80 font-medium">images, PDFs</strong> for AI scanning, and <strong className="text-foreground/80 font-medium">CSV/Excel</strong> for bulk imports.
              </p>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant={isDragging ? 'default' : 'secondary'}
            size="lg"
            className={cn(
              "gap-2 font-medium rounded-xl transition-all shadow-sm",
              isDragging && dragType === 'spreadsheet' && "bg-violet-600 hover:bg-violet-700",
              isDragging && dragType === 'bill' && "bg-blue-600 hover:bg-blue-700"
            )}
            onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
          >
            <FolderOpen className="h-4 w-4" />
            Browse your computer
          </Button>
          
          {!isDragging && (
            <div className={cn(
              'flex shrink-0 items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary shadow-sm backdrop-blur-md transition-all',
              'group-hover:bg-primary/10 group-hover:border-primary/30',
            )}>
              <Zap className="h-3.5 w-3.5 fill-primary/20" />
              AI-Powered
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
