"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { PieChart, Users } from "lucide-react";
import type { AggregatedDemographics } from "@/types/dashboard";

interface PatientDemographicsProps {
  data: AggregatedDemographics | null | undefined;
  loading: boolean;
}

function HorizontalBar({
  label,
  count,
  maxCount,
  onClick,
}: {
  label: string;
  count: number;
  maxCount: number;
  onClick?: () => void;
}) {
  const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;

  return (
    <div
      className={onClick ? "flex items-center gap-2 text-sm cursor-pointer hover:opacity-80 transition-opacity" : "flex items-center gap-2 text-sm"}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } } : undefined}
      title={onClick ? `Filter by ${label}` : undefined}
    >
      <span className="w-16 text-muted-foreground shrink-0 truncate">{label}</span>
      <div className="flex-1 bg-muted rounded-full h-4 overflow-hidden">
        <div
          className="bg-primary/60 h-full rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-10 text-right text-muted-foreground shrink-0">{count}</span>
    </div>
  );
}

export function PatientDemographics({ data, loading }: PatientDemographicsProps) {
  const router = useRouter();
  const ageGroups = data?.age_groups ?? [];
  const genderSplit = data?.gender_split ?? [];
  const maxAgeCount = ageGroups.reduce((max, g) => Math.max(max, g.count), 0);
  const maxGenderCount = genderSplit.reduce((max, g) => Math.max(max, g.count), 0);

  const handleAgeGroupClick = useCallback(
    (ageGroup: string) => {
      router.push(`/today?age_group=${encodeURIComponent(ageGroup)}`);
    },
    [router]
  );

  const handleGenderClick = useCallback(
    (gender: string) => {
      router.push(`/today?gender=${encodeURIComponent(gender)}`);
    },
    [router]
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <PieChart size={18} />
          <div>
            <CardTitle className="text-base">Patient Demographics</CardTitle>
            <CardDescription>Age distribution &amp; gender split</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-6 bg-muted rounded animate-pulse" />
              ))}
            </div>
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-6 bg-muted rounded animate-pulse" />
              ))}
            </div>
          </div>
        ) : ageGroups.length === 0 && genderSplit.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="mx-auto h-10 w-10 mb-2 opacity-50" />
            <p className="text-sm">No demographic data available.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {ageGroups.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">
                  Age Groups
                </p>
                <div className="space-y-2">
                  {ageGroups.map((g) => (
                    <HorizontalBar
                      key={g.age_group}
                      label={g.age_group}
                      count={g.count}
                      maxCount={maxAgeCount}
                      onClick={() => handleAgeGroupClick(g.age_group)}
                    />
                  ))}
                </div>
              </div>
            )}
            {genderSplit.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">
                  Gender
                </p>
                <div className="space-y-2">
                  {genderSplit.map((g) => (
                    <HorizontalBar
                      key={g.gender}
                      label={g.gender}
                      count={g.count}
                      maxCount={maxGenderCount}
                      onClick={() => handleGenderClick(g.gender)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
