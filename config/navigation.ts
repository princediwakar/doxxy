// Path: config/navigation.ts
import { Calendar, Pill, BarChart3, Settings, User2, Users, PersonStanding } from "lucide-react";

export const navItems = [
  { icon: Calendar, label: "Schedule", path: "/schedule", roles: ["superadmin", "staff", "doctor"], bottomNav: true, topGroup: true },
  { icon: PersonStanding, label: "Patients", path: "/patients", roles: ["superadmin", "staff", "doctor"], bottomNav: true, topGroup: true },
  { icon: Pill, label: "Pharmacy", path: "/pharmacy", roles: ["staff", "superadmin"], bottomNav: true, topGroup: true },
  { icon: BarChart3, label: "Analytics", path: "/analytics", roles: ["superadmin"], bottomNav: true, topGroup: true },
  { icon: User2, label: "Profile", path: "/profile", roles: ["superadmin", "staff", "doctor"], bottomNav: false, topGroup: false },
  { icon: Users, label: "Staff", path: "/clinic/staff", roles: ["superadmin"], bottomNav: true, topGroup: false },
  { icon: Settings, label: "Clinic Settings", path: "/clinic", roles: ["superadmin"], bottomNav: true, topGroup: false },
];

export function isActiveLink(location: string, path: string) {
  const normalizedLocation = location.endsWith("/") ? location.slice(0, -1) : location;
  const normalizedPath = path.endsWith("/") ? path.slice(0, -1) : path;

  return (
    normalizedLocation === normalizedPath ||
    normalizedLocation.startsWith(normalizedPath + "/")
  );
}
