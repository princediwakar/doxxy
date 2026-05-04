"use client";

import { useState } from "react";
import { AlertTriangle, Check, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/loading";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  getConfidence,
  ConfidenceBanner,
  RawFieldsSection,
  PrescriptionRow,
} from "./ReviewHandoffHelpers";
import type { AIStructuredOutput, FieldConfidence } from "@/types/voice";

interface ReviewHandoffProps {
  structured: AIStructuredOutput | null;
  transcript: string;
  fieldConfidence?: FieldConfidence[];
  isCompleting: boolean;
  onApprove: (structured: AIStructuredOutput) => void;
  onEditManually: (structured: AIStructuredOutput) => void;
  onDiscard: () => void;
}

export function ReviewHandoff({ structured, transcript, fieldConfidence, isCompleting, onApprove, onEditManually, onDiscard }: ReviewHandoffProps) {
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);

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
        <Button
          variant="ghost"
          size="lg"
          className="text-destructive hover:text-destructive"
          disabled={isCompleting}
          onClick={() => setShowDiscardDialog(true)}
        >
          <Trash2 className="h-4 w-4 mr-1" />Discard
        </Button>
      </div>

      <AlertDialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard this dictation?</AlertDialogTitle>
            <AlertDialogDescription>
              The AI-structured notes will be lost and you will return to the dictation screen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDiscard()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
