// src/components/DashboardStatsCard.tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ReactNode } from "react";

interface DashboardStatsCardProps {
  icon: ReactNode;
  label: string;
  value: number | string;
  onClick?: () => void;
  ariaLabel?: string;
}

export function DashboardStatsCard({ icon, label, value, onClick, ariaLabel }: DashboardStatsCardProps) {
  return (
    <Card className="col-span-1" onClick={onClick} role={onClick ? "button" : undefined} tabIndex={onClick ? 0 : undefined} aria-label={ariaLabel}>
      <CardHeader>
        <CardTitle className="flex items-center">
          {icon}
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
} 