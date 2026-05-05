"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, ExternalLink } from "lucide-react";
import type { ProviderPerformanceRow } from "@/types/dashboard";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

interface DoctorPerformanceTableProps {
  data: ProviderPerformanceRow[];
  loading: boolean;
}

function NoShowBadge({ rate }: { rate: number }) {
  if (rate > 25) {
    return <Badge variant="destructive">{rate}%</Badge>;
  }
  if (rate > 15) {
    return (
      <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-100">
        {rate}%
      </Badge>
    );
  }
  return <span className="text-sm text-muted-foreground">{rate}%</span>;
}

function UtilizationBadge({ rate }: { rate: number }) {
  if (rate > 80) {
    return (
      <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
        {rate}%
      </Badge>
    );
  }
  return <span className="text-sm text-muted-foreground">{rate}%</span>;
}

export function DoctorPerformanceTable({ data, loading }: DoctorPerformanceTableProps) {
  const router = useRouter();

  const navigate = useCallback(
    (path: string) => {
      router.push(path);
    },
    [router]
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Users size={18} />
          <div>
            <CardTitle className="text-base">Provider Performance</CardTitle>
            <CardDescription>Appointment metrics per doctor in the selected period</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-10 bg-muted rounded animate-pulse" />
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="mx-auto h-10 w-10 mb-2 opacity-50" />
            <p className="text-sm">No provider data available for this period.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 font-medium">Provider</th>
                  <th className="pb-2 font-medium text-center">Booked</th>
                  <th className="pb-2 font-medium text-center">Completed</th>
                  <th className="pb-2 font-medium text-center">No-Show Rate</th>
                  <th className="pb-2 font-medium text-center">Utilization</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row) => (
                  <tr
                    key={row.doctor_id}
                    className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-2.5">
                      <button
                        className="text-left hover:text-primary transition-colors font-medium flex items-center gap-1"
                        onClick={() =>
                          navigate(
                            `/schedule?doctor=${row.doctor_id}&date=${new Date().toISOString().split("T")[0]}`
                          )
                        }
                      >
                        {row.doctor_name}
                        <ExternalLink size={12} className="opacity-50" />
                      </button>
                    </td>
                    <td className="py-2.5 text-center">
                      <button
                        className="hover:text-primary transition-colors"
                        onClick={() =>
                          navigate(`/schedule?doctor=${row.doctor_id}`)
                        }
                      >
                        {row.total_booked}
                      </button>
                    </td>
                    <td className="py-2.5 text-center">
                      <button
                        className="hover:text-primary transition-colors"
                        onClick={() =>
                          navigate(
                            `/schedule?doctor=${row.doctor_id}&status=completed`
                          )
                        }
                      >
                        {row.completed}
                      </button>
                    </td>
                    <td className="py-2.5 text-center">
                      <button
                        className="hover:text-primary transition-colors"
                        onClick={() =>
                          navigate(
                            `/schedule?doctor=${row.doctor_id}&status=no-show`
                          )
                        }
                      >
                        <NoShowBadge rate={row.no_show_rate} />
                      </button>
                    </td>
                    <td className="py-2.5 text-center">
                      <UtilizationBadge rate={row.utilization} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
