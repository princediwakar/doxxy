import { Calendar, Pill, Building2, User, BarChart3, Settings } from "lucide-react";

export const navItems = [
  { icon: Calendar, label: "Today", path: "/today", roles: ["superadmin", "staff", "doctor"], bottomNav: true },
  { icon: BarChart3, label: "Overview", path: "/overview", roles: ["superadmin", "doctor"], bottomNav: true },
  { icon: Pill, label: "Pharmacy", path: "/pharmacy", roles: ["staff", "superadmin"], bottomNav: true },
  { icon: User, label: "Profile", path: "/profile", roles: ["superadmin", "staff", "doctor"], bottomNav: true },
  { icon: Settings, label: "Clinic", path: "/clinic", roles: ["superadmin"], bottomNav: true },
];

export function isActiveLink(location: string, path: string) {
  const normalizedLocation = location.endsWith("/") ? location.slice(0, -1) : location;
  const normalizedPath = path.endsWith("/") ? path.slice(0, -1) : path;

  return (
    normalizedLocation === normalizedPath ||
    normalizedLocation.startsWith(normalizedPath + "/")
  );
}
