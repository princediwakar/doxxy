"use client";

import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

interface TodayMobileLayoutProps {
  showMobileDetail: boolean;
  onBackToQueue: () => void;
  queue: ReactNode;
  detail: ReactNode;
}

export function TodayMobileLayout({
  showMobileDetail,
  onBackToQueue,
  queue,
  detail,
}: TodayMobileLayoutProps) {
  return (
    <>
      <div className="hidden lg:flex flex-1 min-h-0 gap-4">
        <div className="w-[30%] flex flex-col min-h-0">{queue}</div>
        <div className="flex-1 border rounded-lg bg-muted/5 p-3 overflow-y-auto min-h-0">
          {detail}
        </div>
      </div>

      <div className="flex lg:hidden flex-1 min-h-0 flex-col">
        {showMobileDetail ? (
          <div className="flex flex-col h-full bg-background">
            <div className="flex items-center px-2 py-2 border-b bg-muted/10 sticky top-0 z-10 shrink-0">
              <button
                onClick={onBackToQueue}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors p-2 rounded-md hover:bg-muted/30"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="font-semibold text-base">Back to Schedule</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 min-h-0">
              {detail}
            </div>
          </div>
        ) : (
          <div className="flex-1 min-h-0 p-4">
            {queue}
          </div>
        )}
      </div>
    </>
  );
}
