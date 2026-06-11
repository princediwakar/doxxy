"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { AppSidebar } from "@/components/AppSidebar";

export function SidebarLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
      <div
        className={cn(
          "hidden lg:flex lg:flex-col fixed left-0 top-0 h-screen z-40 transition-all duration-300 bg-background border-r border-border",
          isCollapsed ? "lg:w-16" : "lg:w-56"
        )}
      >
        {/* We removed the absolute floating button and passed the toggle as a prop */}
        <AppSidebar 
          isCollapsed={isCollapsed} 
          onToggle={() => setIsCollapsed(!isCollapsed)} 
        />
      </div>

      <div
        className={cn(
          "flex-1 mt-14 lg:mt-0 pb-24 lg:pb-0 min-w-0 overflow-hidden bg-background transition-all duration-300",
          isCollapsed ? "lg:ml-16" : "lg:ml-56"
        )}
      >
        <main className="md:p-4 mx-auto h-full max-w-full overflow-hidden flex flex-col">
          {children}
        </main>
      </div>
    </>
  );
}