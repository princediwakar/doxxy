"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { IndianRupee, Users, Building2, Building, Wallet, MessageCircle } from "lucide-react";

const subNavItems = [
  { icon: IndianRupee, label: "Financials", path: "/clinic/financials" },
  { icon: Users, label: "Staff", path: "/clinic/staff" },
  { icon: Building2, label: "Departments", path: "/clinic/departments" },
  { icon: Building, label: "About", path: "/clinic/about" },
  { icon: Wallet, label: "Payments", path: "/clinic/payments" },
  { icon: MessageCircle, label: "WhatsApp", path: "/clinic/whatsapp" },
];

export default function ClinicSubNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:w-48 shrink-0">
      <div className="flex lg:flex-col gap-1 overflow-x-auto pb-1 lg:pb-0">
        {subNavItems.map((item) => {
          const isActive =
            pathname === item.path || pathname.startsWith(item.path + "/");
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shrink-0 ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
