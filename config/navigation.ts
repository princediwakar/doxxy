import { Calendar, Pill, BarChart3, Settings, User2, Users, PersonStanding } from "lucide-react";

export const operationalNav = [
  { icon: Calendar, label: "Schedule", path: "/schedule", roles: ["superadmin", "staff", "doctor"] },
  { icon: PersonStanding, label: "Patients", path: "/patients", roles: ["superadmin", "staff", "doctor"] },
  { icon: Pill, label: "Pharmacy", path: "/pharmacy", roles: ["staff", "superadmin"] },
];

export const managementNav = [
  { icon: BarChart3, label: "Analytics", path: "/analytics", roles: ["superadmin"] },
  { icon: Settings, label: "Clinic Settings", path: "/clinic/about", roles: ["superadmin"] },
];

export function isActiveLink(location: string, path: string) {
  const normalizedLocation = location.endsWith("/") ? location.slice(0, -1) : location;
  const normalizedPath = path.endsWith("/") ? path.slice(0, -1) : path;

  return (
    normalizedLocation === normalizedPath ||
    normalizedLocation.startsWith(normalizedPath + "/")
  );
}