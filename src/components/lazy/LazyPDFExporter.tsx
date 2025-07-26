import { lazy, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { FileDown, Clock } from 'lucide-react';

// Lazy load PDF-related functionality
const PDFExportModal = lazy(() => 
  import('@/components/ExportOptionsModal').then(module => ({
    default: module.ExportOptionsModal
  }))
);

const usePDFExporter = lazy(() => 
  import('@/lib/pdfExport').then(module => ({
    default: module.MedicalRecordPDFExporter
  }))
);

// Loading component for PDF operations
const PDFLoader = () => (
  <div className="flex items-center justify-center p-4">
    <div className="flex items-center space-x-2">
      <Clock className="h-4 w-4 animate-spin" />
      <span className="text-sm">Loading PDF tools...</span>
    </div>
  </div>
);

interface LazyPDFExporterProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExport: (options: any) => void;
  patient: any;
  loading?: boolean;
}

// Wrapper component for lazy PDF export
export const LazyPDFExporter = (props: LazyPDFExporterProps) => {
  return (
    <Suspense fallback={<PDFLoader />}>
      <PDFExportModal {...props} />
    </Suspense>
  );
};

// Lazy PDF Export Button - only loads PDF libraries when clicked
interface LazyPDFExportButtonProps {
  onExportClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export const LazyPDFExportButton = ({ 
  onExportClick, 
  disabled = false,
  loading = false 
}: LazyPDFExportButtonProps) => {
  return (
    <Button 
      onClick={onExportClick}
      disabled={disabled || loading}
      variant="outline"
      size="sm"
    >
      {loading ? (
        <>
          <Clock className="h-4 w-4 mr-2 animate-spin" />
          Exporting...
        </>
      ) : (
        <>
          <FileDown className="h-4 w-4 mr-2" />
          Export PDF
        </>
      )}
    </Button>
  );
};

export default LazyPDFExporter;