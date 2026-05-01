import React from "react";
import { User } from "lucide-react";

export type FABAction = {
  id: string;
  icon: React.ReactNode;
  label: string;
  href?: string;
  action?: () => void;
  color?: string;
};

export function getDefaultFABActions(role: "staff" | "doctor" | "superadmin"): FABAction[] {
  return [
    {
      id: "new-patient",
      icon: <User className="w-5 h-5" />,
      label: "New Patient",
      href: "/today?action=new-patient",
    },
  ];
}
