// Path: components/SidebarLayout.tsx
"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { AppSidebar } from "@/components/AppSidebar";

export function SidebarLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const sidebarExpanded = !isCollapsed || isHovered;
  const isFlyout = isCollapsed && isHovered;

  return (
    <>
      <div
        className={cn(
          "hidden lg:flex lg:flex-col fixed left-0 top-0 h-screen z-40 transition-all duration-300 bg-background border-r border-border",
          sidebarExpanded ? "lg:w-72" : "lg:w-16",
          isFlyout && "shadow-2xl z-50"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <AppSidebar isCollapsed={!sidebarExpanded} />
      </div>

      <div
        className={cn(
          "flex-1 mt-14 lg:mt-0 pb-24 lg:pb-0 min-w-0 overflow-hidden",
          isCollapsed ? "lg:ml-16" : "lg:ml-72"
        )}
      >
        <main className="bg-background p-4 md:p-6 mx-auto min-h-screen max-w-full overflow-x-hidden">
          {children}
        </main>
      </div>
    </>
  );
}