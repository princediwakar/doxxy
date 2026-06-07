"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useAppState } from "@/contexts/AppStateContext";
import { operationalNav, isActiveLink } from "@/config/navigation";

export function BottomNav() {
  const { activeClinicRole } = useAppState();
  const pathname = usePathname();

  const mobileItems = activeClinicRole 
    ? operationalNav.filter(item => item.roles.includes(activeClinicRole)).slice(0, 4)
    : [];

  if (mobileItems.length === 0) return null;

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border pb-safe">
      <div className="flex items-center justify-around h-16 px-2">
        {mobileItems.map((item) => {
          const isActive = isActiveLink(pathname, item.path);

          return (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "flex flex-col items-center justify-center gap-1 h-full min-w-0 flex-1 touch-manipulation transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon size={24} className={cn("flex-shrink-0 transition-transform", isActive ? "scale-110" : "")} />
              <span className="text-[10px] font-medium leading-none truncate w-full text-center">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}