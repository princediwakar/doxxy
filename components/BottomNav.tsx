"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Ellipsis } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppState } from "@/contexts/AppStateContext";
import { navItems, isActiveLink } from "@/config/navigation";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

const MAX_BOTTOM_TABS = 5;

export function BottomNav() {
  const { activeClinicRole } = useAppState();
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  const items = activeClinicRole ? navItems.filter(item => item.bottomNav && item.roles.includes(activeClinicRole)) : [];

  if (items.length === 0) return null;

  const hasOverflow = items.length > MAX_BOTTOM_TABS;
  const visibleItems = hasOverflow ? items.slice(0, MAX_BOTTOM_TABS - 1) : items;
  const overflowItems = hasOverflow ? items.slice(MAX_BOTTOM_TABS - 1) : [];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border pb-safe">
      <div className="flex items-center justify-around h-16">
        {visibleItems.map((item) => {
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

        {hasOverflow && (
          <Popover open={moreOpen} onOpenChange={setMoreOpen}>
            <PopoverTrigger asChild>
              <button
                className={cn(
                  "flex flex-col items-center justify-center gap-1 h-full min-w-0 flex-1 touch-manipulation",
                  moreOpen ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Ellipsis size={22} className="flex-shrink-0" />
                <span className="text-[11px] font-medium leading-none truncate max-w-full px-1">More</span>
              </button>
            </PopoverTrigger>
            <PopoverContent side="top" align="end" sideOffset={8} className="w-44 p-1">
              {overflowItems.map((item) => {
                const isActive = isActiveLink(pathname, item.path);
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setMoreOpen(false)}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <item.icon size={18} className="flex-shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </PopoverContent>
          </Popover>
        )}
      </div>
    </nav>
  );
}
