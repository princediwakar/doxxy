"use client";

import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { stripNotSpecified } from "@/lib/voice/structureClinicalNotes";
import type { FieldConfidence, AIExtractedPrescription } from "@/types/voice";

export function getConfidence(
  fieldConfidence: FieldConfidence[] | undefined,
  field: string,
): FieldConfidence | undefined {
  return fieldConfidence?.find((fc) => fc.field === field);
}

export function ConfidenceBanner({ reason }: { reason: string }) {
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

export function formatFieldLabel(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function RawFieldsSection({ rawFields }: { rawFields: Record<string, unknown> }) {
  const cleaned = stripNotSpecified(rawFields) as Record<string, unknown> | null;
  const entries = cleaned ? Object.entries(cleaned) : [];

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

export function PrescriptionRow({ p }: { p: AIExtractedPrescription }) {
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
