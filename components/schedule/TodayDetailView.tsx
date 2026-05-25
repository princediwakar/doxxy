// components/schedule/TodayDetailView.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { User, Lock, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { TodayDetailPanel } from "@/components/schedule/TodayDetailPanel";
import { Button } from "@/components/ui/button";
import { getLatestClinicInviteLink } from "@/actions/clinic";
import { useTodayStore } from "@/stores/todayStore";
import type { AppointmentWithDetails } from "@/types/appointments";
import type { PatientDetail } from "@/types/core";
import type { BillWithDetails } from "@/types/billing";

interface TodayDetailViewProps {
  patientAppointments: AppointmentWithDetails[];
  patientDetail: PatientDetail | undefined;
  isLoadingDetail: boolean;
  selectedPatientId: string | null;
  selectedAppointmentId: string | null;
  patientBills: BillWithDetails[];
  isLoadingBills: boolean;
  onRefreshNeeded: () => void;
  hasDoctors: boolean;
  clinicId: string | null;
}

export function TodayDetailView({
  patientAppointments,
  patientDetail,
  isLoadingDetail,
  selectedPatientId,
  selectedAppointmentId,
  patientBills,
  isLoadingBills,
  onRefreshNeeded,
  hasDoctors,
  clinicId,
}: TodayDetailViewProps) {
  const router = useRouter();
  const openModal = useTodayStore((s) => s.openModal);
  const [inviteLink, setInviteLink] = useState<string | null | undefined>(undefined);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (selectedPatientId) return;
    if (!hasDoctors && clinicId && inviteLink === undefined) {
      getLatestClinicInviteLink(clinicId).then((r) => {
        setInviteLink(r.link);
      });
    }
  }, [selectedPatientId, hasDoctors, clinicId, inviteLink]);

  const handleCopy = useCallback(async () => {
    if (!inviteLink) return;
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast.success("Invite link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  }, [inviteLink]);

  if (!selectedPatientId) {
    if (!hasDoctors) {
      return (
        <div className="hidden lg:flex items-center justify-center h-full">
          <div className="text-center max-w-md px-6">
            <Lock className="h-10 w-10 mx-auto mb-3 text-amber-600 dark:text-amber-400" />
            <p className="font-semibold text-lg">Your clinic is locked</p>
            <p className="text-muted-foreground text-sm mt-1">
              Waiting on your first doctor.
            </p>
            <p className="text-muted-foreground text-xs mt-3 max-w-xs mx-auto">
              You cannot schedule appointments until at least one doctor accepts
              their invite and selects their primary department.
            </p>

            <div className="mt-6 space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                While you wait, prepare your clinic
              </p>
              <Button
                variant="default"
                className="w-full"
                onClick={() => router.push("/clinic/staff")}
              >
                Invite Doctors & Staff
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => openModal("patient-new")}
              >
                Add Patient Records
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push("/clinic/about")}
              >
                Complete Clinic Profile
              </Button>
            </div>

            {inviteLink && (
              <div className="mt-8 pt-6 border-t">
                <p className="text-xs text-muted-foreground mb-2">
                  Share invite link directly
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs bg-muted px-3 py-2 rounded text-left truncate border">
                    {inviteLink}
                  </code>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopy}
                    title="Copy link"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="hidden lg:flex items-center justify-center h-full text-muted-foreground">
        <div className="text-center">
          <User className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p className="font-medium">Select a patient</p>
          <p className="text-sm">Choose from the queue to view details.</p>
        </div>
      </div>
    );
  }

  return (
    <TodayDetailPanel
      patientAppointments={patientAppointments}
      patientDetail={patientDetail}
      isLoadingDetail={isLoadingDetail}
      selectedPatientId={selectedPatientId}
      selectedAppointmentId={selectedAppointmentId}
      patientBills={patientBills}
      isLoadingBills={isLoadingBills}
      onRefreshNeeded={onRefreshNeeded}
    />
  );
}
