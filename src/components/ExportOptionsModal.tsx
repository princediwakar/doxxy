// src/components/ExportOptionsModal.tsx
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, subDays, subMonths, subYears } from "date-fns";
import { 
  FileDown, 
  Calendar,
  Settings,
  User,
  Stethoscope,
  Pill,
  Clock,
  FileText
} from "lucide-react";
import { PatientWithConsultations } from '@/types/patients';

export interface ExportConfiguration {
  includeConsultations: boolean;
  includePrescriptions: boolean;
  dateRange?: {
    from: Date;
    to: Date;
  };
  customFilename?: string;
}

interface ExportOptionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExport: (options: ExportConfiguration) => void;
  patient: PatientWithConsultations | null;
  loading?: boolean;
}

export function ExportOptionsModal({ 
  open, 
  onOpenChange, 
  onExport, 
  patient,
  loading = false 
}: ExportOptionsModalProps) {
  const [includeConsultations, setIncludeConsultations] = useState(true);
  const [includePrescriptions, setIncludePrescriptions] = useState(true);
  const [useDateRange, setUseDateRange] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [customFilename, setCustomFilename] = useState('');

  const handleExport = () => {
    const exportConfig: ExportConfiguration = {
      includeConsultations,
      includePrescriptions,
      customFilename: customFilename.trim() || undefined,
    };

    if (useDateRange && dateFrom && dateTo) {
      exportConfig.dateRange = {
        from: new Date(dateFrom),
        to: new Date(dateTo),
      };
    }

    onExport(exportConfig);
  };

  const getFilteredCounts = () => {
    if (!patient) return { consultations: 0, prescriptions: 0 };

    let consultationCount = patient.consultations.length;
    let prescriptionCount = patient.prescriptions.length;

    if (useDateRange && dateFrom && dateTo) {
      const from = new Date(dateFrom);
      const to = new Date(dateTo);

      consultationCount = patient.consultations.filter(consultation => {
        const dateStr = consultation.appointment?.date || consultation.created_at;
        if (!dateStr) return false;
        const consultationDate = new Date(dateStr);
        return consultationDate >= from && consultationDate <= to;
      }).length;

      prescriptionCount = patient.prescriptions.filter(prescription => {
        const prescriptionDate = new Date(prescription.created_at || new Date().toISOString());
        return prescriptionDate >= from && prescriptionDate <= to;
      }).length;
    }

    return { 
      consultations: includeConsultations ? consultationCount : 0,
      prescriptions: includePrescriptions ? prescriptionCount : 0 
    };
  };

  const setQuickDateRange = (type: 'week' | 'month' | '3months' | 'year') => {
    const today = new Date();
    const to = format(today, 'yyyy-MM-dd');
    let from: string;

    switch (type) {
      case 'week':
        from = format(subDays(today, 7), 'yyyy-MM-dd');
        break;
      case 'month':
        from = format(subMonths(today, 1), 'yyyy-MM-dd');
        break;
      case '3months':
        from = format(subMonths(today, 3), 'yyyy-MM-dd');
        break;
      case 'year':
        from = format(subYears(today, 1), 'yyyy-MM-dd');
        break;
      default:
        from = to;
    }

    setDateFrom(from);
    setDateTo(to);
    setUseDateRange(true);
  };

  const counts = getFilteredCounts();
  const defaultFilename = patient ? 
    `${patient.name?.replace(/\s+/g, '_') || 'unknown-patient'}_Medical_Record_${format(new Date(), 'yyyy-MM-dd')}` : 
    'Medical_Record';

  if (!patient) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileDown className="h-5 w-5" />
            <span>Export Medical Records</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Patient Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <User className="h-4 w-4" />
                <span>Patient: {patient.name}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <span>Medical ID:</span>
                  <Badge variant="outline">{patient.medical_id}</Badge>
                </div>
                <div className="flex items-center space-x-1">
                  <Stethoscope className="h-3 w-3" />
                  <span>{patient.consultations.length} consultations</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Pill className="h-3 w-3" />
                  <span>{patient.prescriptions.length} prescriptions</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span>Export Content</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="consultations"
                  checked={includeConsultations}
                  onCheckedChange={(checked) => setIncludeConsultations(checked === true)}
                />
                <Label htmlFor="consultations" className="flex items-center space-x-2">
                  <Stethoscope className="h-4 w-4" />
                  <span>Include Consultations</span>
                  <Badge variant="secondary">{counts.consultations}</Badge>
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="prescriptions"
                  checked={includePrescriptions}
                  onCheckedChange={(checked) => setIncludePrescriptions(checked === true)}
                />
                <Label htmlFor="prescriptions" className="flex items-center space-x-2">
                  <Pill className="h-4 w-4" />
                  <span>Include Prescriptions</span>
                  <Badge variant="secondary">{counts.prescriptions}</Badge>
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Date Range Filter */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Date Range Filter</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="dateRange"
                  checked={useDateRange}
                  onCheckedChange={(checked) => setUseDateRange(checked === true)}
                />
                <Label htmlFor="dateRange">Filter by date range</Label>
              </div>

              {useDateRange && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dateFrom">From Date</Label>
                      <Input
                        id="dateFrom"
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dateTo">To Date</Label>
                      <Input
                        id="dateTo"
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Quick date ranges:</Label>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setQuickDateRange('week')}
                      >
                        Last Week
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setQuickDateRange('month')}
                      >
                        Last Month
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setQuickDateRange('3months')}
                      >
                        Last 3 Months
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setQuickDateRange('year')}
                      >
                        Last Year
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* File Options */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>File Options</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="filename">Custom filename (optional)</Label>
                <Input
                  id="filename"
                  placeholder={defaultFilename}
                  value={customFilename}
                  onChange={(e) => setCustomFilename(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty to use default: {defaultFilename}.pdf
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Export Summary */}
          <Card className="bg-muted/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Export Summary</p>
                  <div className="text-xs text-muted-foreground space-y-1">
                    {counts.consultations > 0 && (
                      <p>• {counts.consultations} consultation{counts.consultations !== 1 ? 's' : ''}</p>
                    )}
                    {counts.prescriptions > 0 && (
                      <p>• {counts.prescriptions} prescription{counts.prescriptions !== 1 ? 's' : ''}</p>
                    )}
                    {useDateRange && dateFrom && dateTo && (
                      <p>• Date range: {format(new Date(dateFrom), 'PP')} to {format(new Date(dateTo), 'PP')}</p>
                    )}
                  </div>
                </div>
                <Badge variant="outline" className="flex items-center space-x-1">
                  <FileDown className="h-3 w-3" />
                  <span>PDF Format</span>
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleExport}
            disabled={loading || (counts.consultations === 0 && counts.prescriptions === 0)}
          >
            {loading ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileDown className="h-4 w-4 mr-2" />
                Export PDF
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}