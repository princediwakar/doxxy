"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useAppState } from "@/contexts/AppStateContext";
import { navItems, isActiveLink } from "@/config/navigation";

export function BottomNav() {
  const { activeClinicRole } = useAppState();
  const pathname = usePathname();

  const items = activeClinicRole ? navItems.filter(item => item.bottomNav && item.roles.includes(activeClinicRole)) : [];

  if (items.length === 0) return null;

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border pb-safe">
      <div className="flex items-center justify-around h-16">
        {items.map((item) => {
          const isActive = isActiveLink(pathname, item.path);
          return (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "flex flex-col items-center justify-center gap-1 h-full min-w-0 flex-1 touch-manipulation",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon size={22} className="flex-shrink-0" />
              <span className="text-[11px] font-medium leading-none truncate max-w-full px-1">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
