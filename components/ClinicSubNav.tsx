"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { IndianRupee, Users, Building2, Building, Wallet, MessageCircle } from "lucide-react";
import { isWhatsAppEnabled } from "@/lib/feature-flags";

const subNavItems = [
  { icon: Building, label: "General", path: "/clinic/about" },
  { icon: Users, label: "Staff", path: "/clinic/staff" },
  { icon: Building2, label: "Departments", path: "/clinic/departments" },
  { icon: IndianRupee, label: "Financials", path: "/clinic/financials" },
  { icon: Wallet, label: "Payments", path: "/clinic/payments" },
  ...(isWhatsAppEnabled ? [{ icon: MessageCircle, label: "WhatsApp", path: "/clinic/whatsapp" }] : []),
];

export default function ClinicSubNav() {
  const pathname = usePathname();

  return (
    <div className="border-b mb-4">
      <nav className="-mb-px flex space-x-6 overflow-x-auto [&::-webkit-scrollbar]:hidden">
        {subNavItems.map((item) => {
          const isActive = pathname === item.path || pathname.startsWith(item.path + "/");
          return (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "group inline-flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors",
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
              )}
            >
              <item.icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground")} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}