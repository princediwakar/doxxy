"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ReactNode } from "react";
import React from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { TrendDirection } from "@/types/dashboard";

interface DashboardStatsCardProps {
  icon: ReactNode;
  label: string;
  value: number | string;
  onClick?: () => void;
  ariaLabel?: string;
  variant?: "default" | "primary" | "secondary";
  description?: string;
  trendValue?: number;
  trendDirection?: TrendDirection;
  trendLabel?: string;
}

export function DashboardStatsCard({
  icon,
  label,
  value,
  onClick,
  ariaLabel,
  variant = "default",
  description,
  trendValue,
  trendDirection,
  trendLabel,
}: DashboardStatsCardProps) {
  const isClickable = !!onClick;

  const getIconColorAndBg = () => {
    if (typeof icon === "object" && icon && "props" in icon) {
      const className = (icon.props as { className?: string })?.className || "";
      if (className.includes("text-medical-blue") || className.includes("text-blue-500")) {
        return { iconColor: "text-primary", bgColor: "bg-primary/10", textColor: "text-primary" };
      }
      if (className.includes("text-success") || className.includes("text-green-500") || className.includes("text-emerald-500")) {
        return { iconColor: "text-success", bgColor: "bg-success/10", textColor: "text-success" };
      }
      if (className.includes("text-warning") || className.includes("text-orange-500")) {
        return { iconColor: "text-warning", bgColor: "bg-warning/10", textColor: "text-warning" };
      }
      if (className.includes("text-accent") || className.includes("text-purple-500")) {
        return { iconColor: "text-accent", bgColor: "bg-accent/10", textColor: "text-accent" };
      }
      if (className.includes("text-medical-teal")) {
        return { iconColor: "text-accent", bgColor: "bg-accent/10", textColor: "text-accent" };
      }
    }
    return { iconColor: "text-primary", bgColor: "bg-primary/10", textColor: "text-primary" };
  };

  const { iconColor, bgColor, textColor } = getIconColorAndBg();

  const TrendIcon =
    trendDirection === "up" ? TrendingUp : trendDirection === "down" ? TrendingDown : Minus;
  const trendColor =
    trendDirection === "up"
      ? "text-green-600"
      : trendDirection === "down"
        ? "text-red-500"
        : "text-muted-foreground";

  return (
    <Card
      className={cn(
        "col-span-1 transition-all duration-200",
        isClickable && "hover:shadow-lg hover:scale-[1.02] cursor-pointer hover:border-primary/50",
        variant === "primary" && "border-primary/20 bg-primary/5",
        variant === "secondary" && "border-secondary/20 bg-secondary/5"
      )}
      onClick={onClick}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      aria-label={ariaLabel}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
    >
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className={cn("text-2xl font-bold", textColor)}>{value}</p>
            {trendDirection && trendLabel && (
              <div className="flex items-center gap-1 mt-1">
                <TrendIcon size={14} className={trendColor} />
                <span className={cn("text-xs font-medium", trendColor)}>
                  {trendLabel}
                </span>
              </div>
            )}
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          <div
            className={cn(
              "p-3 rounded-lg transition-transform duration-200",
              bgColor,
              isClickable && "hover:scale-110"
            )}
          >
            {typeof icon === "object" && icon && "props" in icon
              ? React.cloneElement(icon as React.ReactElement, {
                  className: cn("w-6 h-6", iconColor),
                })
              : icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
