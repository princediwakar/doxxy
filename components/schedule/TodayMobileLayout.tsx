"use client";

import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

interface TodayMobileLayoutProps {
  showMobileDetail: boolean;
  onBackToQueue: () => void;
  queue: ReactNode;
  detail: ReactNode;
  header: ReactNode;
}

export function TodayMobileLayout({
  showMobileDetail,
  onBackToQueue,
  queue,
  detail,
  header,
}: TodayMobileLayoutProps) {
  return (
    <>
      {/* =========================================
          DESKTOP LAYOUT (Always Side-by-Side)
          ========================================= */}
      <div className="hidden lg:flex flex-col h-full min-h-0 gap-6">
        {/* Header sits globally on top for desktop */}
        <div className="shrink-0">{header}</div>
        
        <div className="flex gap-6 flex-1 min-h-0">
          <div className="w-1/3 flex flex-col min-h-0">{queue}</div>
          <div className="w-2/3 border rounded-lg bg-muted/5 p-4 overflow-y-auto min-h-0">
            {detail}
          </div>
        </div>
      </div>

      {/* =========================================
          MOBILE LAYOUT (Dynamic Rendering)
          ========================================= */}
      <div className="flex lg:hidden flex-1 min-h-0 flex-col">
        {showMobileDetail ? (
          /* DETAIL VIEW: Hide the doctor selector entirely */
          <div className="flex flex-col h-full bg-background">
            <div className="flex items-center px-2 py-2 border-b bg-muted/10 sticky top-0 z-10 shrink-0">
              <button
                onClick={onBackToQueue}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors p-2 rounded-md hover:bg-muted/30 active:bg-muted/50"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="font-semibold text-base">Back to Queue</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 min-h-0">
              {detail}
            </div>
          </div>
        ) : (
          /* QUEUE VIEW: Tightly couple the selector to the list */
          <div className="flex flex-col h-full min-h-0 gap-4">
            <div className="shrink-0 px-1">
              {header}
            </div>
            <div className="flex-1 min-h-0">
              {queue}
            </div>
          </div>
        )}
      </div>
    </>
  );
}