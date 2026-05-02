"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useDoctorProfile } from "@/hooks/useDoctorProfile";
import { Button } from "@/components/ui/button";
import { Stethoscope, X } from "lucide-react";

export function DoctorProfilePrompt() {
  const { user, activeClinic, activeClinicRole } = useAuth();
  const router = useRouter();
  const [dismissed, setDismissed] = useState(false);

  const { data: doctorProfile, isLoading } = useDoctorProfile(
    user?.id,
    activeClinic?.clinic_id
  );

  if (dismissed || isLoading || activeClinicRole !== "doctor" || !doctorProfile) {
    return null;
  }

  const isIncomplete =
    !doctorProfile.primary_specialization ||
    doctorProfile.primary_specialization.trim() === "";

  if (!isIncomplete) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="bg-blue-100 p-2 rounded-full shrink-0">
          <Stethoscope className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <p className="font-medium text-blue-900">
            Complete your medical profile
          </p>
          <p className="text-sm text-blue-700">
            Add your specialization and consultation details to start seeing
            patients.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Button
          size="sm"
          onClick={() => router.push("/profile?setup=doctor")}
        >
          Setup Profile
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setDismissed(true)}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
