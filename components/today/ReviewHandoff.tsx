"use client";

import { AlertTriangle, Check, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/loading";
import type { AIStructuredOutput, AIExtractedPrescription, FieldConfidence } from "@/types/voice";

interface ReviewHandoffProps {
  structured: AIStructuredOutput | null;
  transcript: string;
  fieldConfidence?: FieldConfidence[];
  isCompleting: boolean;
  onApprove: (structured: AIStructuredOutput) => void;
  onEditManually: (structured: AIStructuredOutput) => void;
}

function getConfidence(
  fieldConfidence: FieldConfidence[] | undefined,
  field: string,
): FieldConfidence | undefined {
  return fieldConfidence?.find((fc) => fc.field === field);
}

function ConfidenceBanner({ reason }: { reason: string }) {
  const text =
    reason === "NOT_SPECIFIED"
      ? "Not detected — please verify"
      : "Brief extraction — please verify";
  return (
    <div className="flex items-center gap-1.5 text-xs text-amber-700 mt-1">
      <AlertTriangle className="h-3 w-3" />
      <span>{text}</span>
    </div>
  );
}

function formatFieldLabel(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function RawFieldsSection({ rawFields }: { rawFields: Record<string, unknown> }) {
  const entries = Object.entries(rawFields).filter(([, v]) => {
    if (v === null || v === undefined) return false;
    if (typeof v === 'string' && (v === 'NOT_SPECIFIED' || v.trim() === '')) return false;
    return true;
  });

  if (entries.length === 0) return null;

  return (
    <>
      {entries.map(([key, value]) => (
        <div key={key} className="rounded-lg border bg-card p-3">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-1">
            {formatFieldLabel(key)}
          </h4>
          {typeof value === 'string' ? (
            <p className="text-sm">{value}</p>
          ) : (
            <pre className="text-xs text-muted-foreground whitespace-pre-wrap break-words">
              {JSON.stringify(value, null, 2)}
            </pre>
          )}
        </div>
      ))}
    </>
  );
}

function PrescriptionRow({ p }: { p: AIExtractedPrescription }) {
  const missingFields = [
    p.dosage === "NOT_SPECIFIED" ? "dosage" : null,
    p.frequency === "NOT_SPECIFIED" ? "frequency" : null,
    p.route === "NOT_SPECIFIED" ? "route" : null,
  ].filter(Boolean);

  const hasInstructions = p.instructions !== "NOT_SPECIFIED";

  return (
    <tr className="border-b last:border-0">
      <td className="py-1.5 pr-2 align-top">
        <span className="font-medium text-sm">{p.drug_name}</span>
        {missingFields.length > 0 && (
          <Badge variant="outline" className="ml-1 text-[10px] bg-yellow-50 text-yellow-700 border-yellow-300">
            <AlertTriangle className="h-2.5 w-2.5 mr-0.5" />
            {missingFields.join(", ")}
          </Badge>
        )}
        {hasInstructions && (
          <p className="text-[11px] text-muted-foreground mt-0.5">{p.instructions}</p>
        )}
      </td>
      <td className="py-1.5 px-1 text-sm whitespace-nowrap">{p.dosage === "NOT_SPECIFIED" ? "—" : p.dosage}</td>
      <td className="py-1.5 px-1 text-sm">{p.route === "NOT_SPECIFIED" ? "—" : p.route}</td>
      <td className="py-1.5 px-1 text-sm whitespace-nowrap">{p.frequency === "NOT_SPECIFIED" ? "—" : p.frequency}</td>
      <td className="py-1.5 pl-1 text-sm whitespace-nowrap">{p.duration === "NOT_SPECIFIED" ? "—" : p.duration}</td>
    </tr>
  );
}

export function ReviewHandoff({ structured, transcript, fieldConfidence, isCompleting, onApprove, onEditManually }: ReviewHandoffProps) {
  const isEmpty = !structured;
  const fallbackStructured: AIStructuredOutput = {
    symptoms: "NOT_SPECIFIED",
    diagnosis: "NOT_SPECIFIED",
    prescriptions: [],
    advice: "NOT_SPECIFIED",
    rawFields: {},
  };
  const data = structured ?? fallbackStructured;

  if (isEmpty) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-3">
          <h4 className="text-xs font-semibold text-yellow-800 uppercase mb-1 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />AI Structuring Unavailable
          </h4>
          <p className="text-xs text-yellow-700">
            The transcript was captured but could not be auto-structured. Review the transcript below and
            complete the notes manually.
          </p>
        </div>

        <div className="rounded-lg border bg-card p-3">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-1">Raw Transcript</h4>
          <p className="text-sm whitespace-pre-wrap">&ldquo;{transcript}&rdquo;</p>
        </div>

        <Button variant="outline" size="lg" className="w-full" onClick={() => onEditManually(fallbackStructured)}>
          <Edit className="h-4 w-4 mr-1" />Edit in Form
        </Button>
      </div>
    );
  }

  const symptomsConf = getConfidence(fieldConfidence, "symptoms");
  const diagnosisConf = getConfidence(fieldConfidence, "diagnosis");

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground italic px-1 line-clamp-3">
        &ldquo;{transcript}&rdquo;
      </p>

      {/* Symptoms */}
      <div className={`rounded-lg border bg-card p-3 ${symptomsConf ? "border-l-4 border-l-yellow-400" : ""}`}>
        <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-1">Symptoms</h4>
        <p className="text-sm">
          {data.symptoms === "NOT_SPECIFIED" ? "Not specified" : data.symptoms}
        </p>
        {symptomsConf && <ConfidenceBanner reason={symptomsConf.reason} />}
      </div>

      {/* Diagnosis */}
      <div className={`rounded-lg border bg-card p-3 ${diagnosisConf ? "border-l-4 border-l-yellow-400" : ""}`}>
        <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-1">Diagnosis</h4>
        <p className="text-sm">
          {data.diagnosis === "NOT_SPECIFIED" ? "Not specified" : data.diagnosis}
        </p>
        {diagnosisConf && <ConfidenceBanner reason={diagnosisConf.reason} />}
      </div>

      {/* Prescriptions */}
      <div className="rounded-lg border bg-card p-3">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
          Prescriptions
          {data.prescriptions.length > 0 && (
            <span className="ml-1 font-normal">({data.prescriptions.length})</span>
          )}
        </h4>
        {data.prescriptions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No prescriptions</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-muted-foreground">
                <th className="text-left font-medium py-1 pr-2">Drug</th>
                <th className="text-left font-medium py-1 px-1">Dose</th>
                <th className="text-left font-medium py-1 px-1">Route</th>
                <th className="text-left font-medium py-1 px-1">Freq</th>
                <th className="text-left font-medium py-1 pl-1">Duration</th>
              </tr>
            </thead>
            <tbody>
              {data.prescriptions.map((p, i) => (
                <PrescriptionRow key={i} p={p} />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* All schema fields (management, department-specific, etc.) */}
      {data.rawFields && Object.keys(data.rawFields).length > 0 && (
        <RawFieldsSection rawFields={data.rawFields} />
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Button className="flex-1" size="lg" disabled={isCompleting} onClick={() => onApprove(data)}>
          {isCompleting ? (
            <Spinner size="sm" className="mr-1" />
          ) : (
            <Check className="h-4 w-4 mr-1" />
          )}
          {isCompleting ? "Completing..." : "Approve & Complete"}
        </Button>
        <Button variant="outline" size="lg" onClick={() => onEditManually(data)}>
          <Edit className="h-4 w-4 mr-1" />Edit in Form
        </Button>
      </div>
    </div>
  );
}
