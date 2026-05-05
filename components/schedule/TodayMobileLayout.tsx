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
      <div className="hidden lg:flex gap-6" style={{ height: "calc(100vh - 13rem)" }}>
        <div className="w-1/3">{queue}</div>
        <div className="w-2/3 border rounded-lg bg-muted/5 p-4 overflow-y-auto">
          {detail}
        </div>
      </div>
      {/* Mobile: queue full-width, detail as overlay */}
      <div className="lg:hidden">
        {showMobileDetail ? (
          <div className="flex flex-col" style={{ height: "calc(100vh - 7rem)" }}>
            <div className="flex items-center gap-2 px-1 py-2 border-b">
              <button
                onClick={onBackToQueue}
                className="flex items-center gap-1 text-sm font-medium hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Queue
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">{detail}</div>
          </div>
        ) : (
          queue
        )}
      </div>
    </>
  );
}
