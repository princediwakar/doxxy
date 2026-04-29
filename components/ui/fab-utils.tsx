import React from "react";
import { Calendar, User, Receipt, Building2 } from "lucide-react";

export type FABAction = {
  id: string;
  icon: React.ReactNode;
  label: string;
  href?: string;
  action?: () => void;
  color?: string;
};

const defaultActions: FABAction[] = [
  {
    id: "new-appointment",
    icon: <Calendar className="w-5 h-5" />,
    label: "New Appointment",
    href: "/appointments?action=new",
  },
  {
    id: "new-patient",
    icon: <User className="w-5 h-5" />,
    label: "New Patient",
    href: "/patients?action=new",
  },
  {
    id: "new-bill",
    icon: <Receipt className="w-5 h-5" />,
    label: "New Bill",
    href: "/billing?action=new",
  },
];

export function getDefaultFABActions(role: "staff" | "doctor" | "superadmin"): FABAction[] {
  if (role === "superadmin") {
    return [
      {
        id: "settings",
        icon: <Building2 className="w-5 h-5" />,
        label: "Settings",
        href: "/settings",
      },
      ...defaultActions,
    ];
  }

  return defaultActions;
}
