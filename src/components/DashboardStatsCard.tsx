// src/components/DashboardStatsCard.tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DashboardStatsCardProps {
  icon: ReactNode;
  label: string;
  value: number | string;
  onClick?: () => void;
  ariaLabel?: string;
  variant?: "default" | "primary" | "secondary";
  description?: string;
}

export function DashboardStatsCard({ 
  icon, 
  label, 
  value, 
  onClick, 
  ariaLabel, 
  variant = "default",
  description 
}: DashboardStatsCardProps) {
  const isClickable = !!onClick;
  
  return (
    <Card 
      className={cn(
        "col-span-1 transition-all duration-200",
        isClickable && "hover:shadow-md hover:scale-[1.02] cursor-pointer hover:border-primary/50",
        variant === "primary" && "border-primary/20 bg-primary/5",
        variant === "secondary" && "border-secondary/20 bg-secondary/5"
      )}
      onClick={onClick} 
      role={isClickable ? "button" : undefined} 
      tabIndex={isClickable ? 0 : undefined} 
      aria-label={ariaLabel}
      onKeyDown={isClickable ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      } : undefined}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        <div className="transition-transform duration-200 hover:scale-110">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
} 