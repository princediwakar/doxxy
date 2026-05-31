// components/schedule/TodayMobileLayout.tsx
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
      {header}
      {/* Desktop: always show both panels side-by-side */}
      <div className="hidden lg:flex gap-6 flex-1 min-h-0">
        <div className="w-1/3 flex flex-col min-h-0">
          {queue}
        </div>
        <div className="w-2/3 border rounded-lg bg-muted/5 p-4 overflow-y-auto min-h-0">
          {detail}
        </div>
      </div>
      {/* Mobile: queue full-width, detail as overlay */}
      <div className="lg:hidden flex-1 min-h-0 flex flex-col">
        {showMobileDetail ? (
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-2 px-1 py-2 border-b shrink-0">
              <button
                onClick={onBackToQueue}
                className="flex items-center gap-1 text-sm font-medium hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Queue
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 min-h-0">
              {detail}
            </div>
          </div>
        ) : (
          queue
        )}
      </div>
    </>
  );
}
