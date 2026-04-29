import { Home, CalendarPlus, Users, CreditCard, Pill, User2, Settings } from "lucide-react";

export const navItems = [
  { icon: Home, label: "Dashboard", path: "/dashboard", roles: ["superadmin", "staff", "doctor"] },
  { icon: CalendarPlus, label: "Appointments", path: "/appointments", roles: ["staff", "doctor", "superadmin"] },
  { icon: Users, label: "Patients", path: "/patients", roles: ["staff", "doctor", "superadmin"] },
  { icon: CreditCard, label: "Billing", path: "/billing", roles: ["staff", "doctor", "superadmin"] },
  { icon: Pill, label: "Pharmacy", path: "/pharmacy", roles: ["staff", "superadmin"] },
  { icon: User2, label: "Profile", path: "/profile", roles: ["superadmin", "staff", "doctor"] },
  { icon: Settings, label: "Settings", path: "/settings", roles: ["superadmin"] },
];

export function isActiveLink(location: string, path: string) {
  const normalizedLocation = location.endsWith("/") ? location.slice(0, -1) : location;
  const normalizedPath = path.endsWith("/") ? path.slice(0, -1) : path;

  if (normalizedPath === "/dashboard") {
    return normalizedLocation === "/dashboard" || normalizedLocation === "/";
  }

  return (
    normalizedLocation === normalizedPath ||
    normalizedLocation.startsWith(normalizedPath + "/")
  );
}
