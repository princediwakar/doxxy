import { Search, Calendar, Pill, BarChart3, Settings, User2, HelpCircle } from "lucide-react";

export const navItems = [
  { icon: Search, label: "Search", path: "#", roles: ["superadmin", "staff", "doctor"], bottomNav: true, topGroup: true, sidebar: true },
  { icon: Calendar, label: "Schedule", path: "/schedule", roles: ["superadmin", "staff", "doctor"], bottomNav: true, topGroup: true },
  { icon: Pill, label: "Pharmacy", path: "/pharmacy", roles: ["staff", "superadmin"], bottomNav: true, topGroup: true },
  { icon: BarChart3, label: "Analytics", path: "/analytics", roles: ["superadmin"], bottomNav: true, topGroup: true },
  { icon: User2, label: "Profile", path: "/profile", roles: ["superadmin", "staff", "doctor"], bottomNav: false, topGroup: false },
  { icon: Settings, label: "Clinic Settings", path: "/clinic", roles: ["superadmin"], bottomNav: true, topGroup: false },
  { icon: HelpCircle, label: "Help", path: "/help", roles: ["superadmin", "staff", "doctor"], bottomNav: false, topGroup: false },
];

export function isActiveLink(location: string, path: string) {
  const normalizedLocation = location.endsWith("/") ? location.slice(0, -1) : location;
  const normalizedPath = path.endsWith("/") ? path.slice(0, -1) : path;

  return (
    normalizedLocation === normalizedPath ||
    normalizedLocation.startsWith(normalizedPath + "/")
  );
}
