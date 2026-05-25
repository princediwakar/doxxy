// components/doctor/DoctorProfilePrompt.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/contexts/AppStateContext";
import { useQuery } from "@tanstack/react-query";
import { queryDoctorProfile } from "@/lib/queries/profile";
import { queryKeys } from "@/lib/query-keys";
import { Button } from "@/components/ui/button";
import { Stethoscope, X } from "lucide-react";

export function DoctorProfilePrompt() {
  const { user, activeClinicId, activeClinicRole } = useAppState();
  const router = useRouter();
  const [dismissed, setDismissed] = useState(false);

  const { data: doctorProfile, isLoading } = useQuery({
    queryKey: queryKeys.profile.doctor(user?.id ?? "", activeClinicId ?? ""),
    queryFn: () => queryDoctorProfile(user!.id!, activeClinicId!),
    enabled: !!user?.id && !!activeClinicId,
    staleTime: 5 * 60 * 1000,
  });

  if (dismissed || isLoading || activeClinicRole !== "doctor" || !doctorProfile) {
    return null;
  }

  const missingDepartment =
    doctorProfile.department_id === null ||
    doctorProfile.department_id === undefined;

  const missingFee =
    doctorProfile.consultation_fee === null ||
    doctorProfile.consultation_fee === undefined;

  const isIncomplete = missingDepartment || missingFee;

  if (!isIncomplete) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="bg-blue-100 p-2 rounded-full shrink-0">
          <Stethoscope className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <p className="font-medium text-blue-900">
            {missingDepartment
              ? "Select your primary department"
              : "Complete your medical profile"}
          </p>
          <p className="text-sm text-blue-700">
            {missingDepartment
              ? "You must select a department before you can start seeing patients."
              : "Add your consultation fee to speed up billing."}
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
