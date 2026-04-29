"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface PullToRefreshProps {
  onRefresh: () => void | Promise<void>;
  children: React.ReactNode;
  className?: string;
  pullingText?: string;
  pullingTextRefreshing?: string;
}

export function PullToRefresh({
  onRefresh,
  children,
  className,
  pullingText = "Pull to refresh",
  pullingTextRefreshing = "Refreshing...",
}: PullToRefreshProps) {
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const startY = useRef(0);

  useEffect(() => {
    setIsMobile(window.innerWidth < 1024);
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile) return;
    startY.current = e.touches[0].clientY;
    setIsPulling(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isMobile || !isPulling) return;
    
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;
    
    if (diff > 0 && diff < 150) {
      setPullDistance(diff);
    }
  };

  const handleTouchEnd = async () => {
    if (!isMobile || !isPulling) return;
    
    setIsPulling(false);
    
    if (pullDistance > 80) {
      setIsRefreshing(true);
      setPullDistance(0);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    } else {
      setPullDistance(0);
    }
  };

  if (!isMobile) {
    return <>{children}</>;
  }

  return (
    <div
      className={cn("relative", className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 flex items-center justify-center overflow-hidden transition-transform",
          isPulling || isRefreshing ? "h-12 -translate-y-full" : "h-0"
        )}
        style={{
          transform: `translateY(-${Math.min(pullDistance * 2, 100)}%)`,
        }}
      >
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <RefreshCw
            className={cn(
              "h-4 w-4",
              isRefreshing && "animate-spin"
            )}
          />
          {isRefreshing ? pullingTextRefreshing : pullingText}
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          transform: isPulling ? `translateY(${pullDistance}px)` : undefined,
          transition: isPulling ? "none" : "transform 0.2s ease-out",
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default PullToRefresh;