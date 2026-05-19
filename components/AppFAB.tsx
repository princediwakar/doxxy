"use client";

import { User } from "lucide-react";
import { useTodayStore } from "@/stores/todayStore";
import { useAppState } from "@/contexts/AppStateContext";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import type { FABAction } from "@/components/ui/floating-action-button";

export function AppFAB() {
  const { activeClinicRole } = useAppState();
  const openModal = useTodayStore((s) => s.openModal);

  if (!activeClinicRole) return null;

  const actions: FABAction[] = [
    {
      id: "new-patient",
      icon: <User className="w-5 h-5" />,
      label: "New Patient",
      action: () => openModal("patient-new"),
    },
  ];

  return <FloatingActionButton actions={actions} />;
}
