"use client";

import { useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Plus, Search, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTodayStore } from "@/stores/todayStore";

interface Doctor {
  id: string;
  name: string;
  user_id: string;
  primary_specialization: string | null;
}

interface TodayHeaderProps {
  doctors: Doctor[];
  effectiveDoctorFilter: string | null;
  userDoctorId: string | null;
}

export function TodayHeader({
  doctors,
  effectiveDoctorFilter,
  userDoctorId,
}: TodayHeaderProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const openModal = useTodayStore((s) => s.openModal);

  const handleDoctorChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.set("doctor", "all");
    } else {
      params.set("doctor", value);
    }
    params.delete("patient");
    params.delete("appointment");
    router.push(`/schedule?${params.toString()}`, { scroll: false });
  };

  const handleNewPatient = useCallback(() => {
    openModal("patient-new");
  }, [openModal]);

  return (
    <div className="flex items-center justify-between gap-4">
      <Select
        value={effectiveDoctorFilter ?? "all"}
        onValueChange={handleDoctorChange}
      >
        <SelectTrigger className="w-[220px]">
          <div className="flex items-center">
            <Stethoscope className="h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Doctors</SelectItem>
          {userDoctorId && (
            <SelectItem value={userDoctorId}>My Patients</SelectItem>
          )}
          {doctors
            .filter((d) => d.id !== userDoctorId)
            .map((doctor) => (
              <SelectItem key={doctor.id} value={doctor.id}>
                {doctor.name}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>

      <div className="hidden lg:flex items-center gap-3">
        <Button
          variant="outline"
          onClick={() => document.dispatchEvent(new Event("open-command-palette"))}
          className="rounded-lg text-muted-foreground hover:text-foreground"
        >
          <Search className="h-4 w-4 mr-2" />
          Search patients...
        </Button>
        <Button onClick={handleNewPatient}>
          <Plus className="h-4 w-4 mr-2" />
          New Patient
        </Button>
      </div>
    </div>
  );
}
