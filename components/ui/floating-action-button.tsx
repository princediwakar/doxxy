"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { FABAction } from "./fab-utils";

export type { FABAction };

type FloatingActionButtonProps = {
  actions?: FABAction[];
  className?: string;
};

export function FloatingActionButton({
  actions = [],
  className,
}: FloatingActionButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Hide FAB when a Radix dialog is open so it doesn't block the modal
  const [dialogOpen, setDialogOpen] = useState(false);
  useEffect(() => {
    const check = () => {
      setDialogOpen(
        !!document.querySelector('[data-state="open"][role="dialog"]')
      );
    };
    check();
    const mo = new MutationObserver(check);
    mo.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["data-state"],
    });
    return () => mo.disconnect();
  }, []);

  useEffect(() => {
    if (!isMobile) {
      setIsOpen(false);
    }
  }, [isMobile]);

  if (!mounted || !isMobile || actions.length === 0 || dialogOpen) {
    return null;
  }

  const handleActionClick = (action: FABAction) => {
    setIsOpen(false);
    if (action.href) {
      router.push(action.href);
    } else if (action.action) {
      action.action();
    }
  };

  return (
    <TooltipProvider>
      <div
        className={cn(
          "fixed bottom-24 right-6 z-[60] flex flex-col-reverse items-center gap-3 pb-safe",
          className
        )}
      >
        {isOpen && (
          <div className="flex flex-col gap-3">
            {[...actions].reverse().map((action) => (
              <Tooltip key={action.id}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => handleActionClick(action)}
                    className={cn(
                      "h-12 px-4 rounded-full flex items-center justify-center gap-2 shadow-lg transition-all hover:scale-105 active:scale-95 whitespace-nowrap",
                      action.color || "bg-primary text-primary-foreground"
                    )}
                  >
                    {action.icon}
                    <span className="text-sm font-medium">{action.label}</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="left">{action.label}</TooltipContent>
              </Tooltip>
            ))}
          </div>
        )}

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={cn(
                "h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center transition-transform hover:scale-105 active:scale-95",
                isOpen && "rotate-45"
              )}
              aria-label="Quick actions"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
            </button>
          </TooltipTrigger>
          <TooltipContent side="left">
            {isOpen ? "Close" : "Quick actions"}
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
