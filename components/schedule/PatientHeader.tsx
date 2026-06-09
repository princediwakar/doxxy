"use client";

import { MoreVertical, CalendarPlus, Edit, Stethoscope, XCircle } from "lucide-react";
import { formatTimeIST } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

const STATUS_COLORS: Record<string, string> = {
  "In Progress": "bg-yellow-100 text-yellow-800",
  Scheduled: "bg-blue-100 text-blue-800",
  Completed: "bg-green-100 text-green-800",
  Cancelled: "bg-red-100 text-red-800",
};

interface PatientHeaderProps {
  name: string;
  age?: string | number;
  gender?: string;
  uhid?: string;
  phone?: string;
  status?: string;
  appointmentType?: string;
  appointmentTime?: string;
  departmentName?: string;
  notes?: string;
  variant?: "doctor" | "staff";
  onSchedule: () => void;
  onEditPatient: () => void;
  onEditAppointment: () => void;
  onCancelAppointment?: () => void;
}

export function PatientHeader({
  name,
  age,
  gender,
  uhid,
  phone,
  status,
  appointmentType,
  appointmentTime,
  departmentName,
  notes,
  variant = "doctor",
  onSchedule,
  onEditPatient,
  onEditAppointment,
  onCancelAppointment,
}: PatientHeaderProps) {
  const demographic = [gender, age ? `${age}y` : null].filter(Boolean).join(", ") || "N/A";
  const contextParts = [demographic, uhid ? `UHID: ${uhid}` : null, departmentName, formatTimeIST(appointmentTime)].filter(Boolean);

  return (
    <div className="space-y-2 pb-3 border-b">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg font-semibold truncate">{name}</h2>
            {status && <Badge className={STATUS_COLORS[status] ?? "bg-muted text-foreground"}>{status}</Badge>}
          </div>
          <p className="text-sm text-muted-foreground truncate">
            {contextParts.join(" · ")}
          </p>
          {phone && <p className="text-xs text-muted-foreground">{phone}</p>}
        </div>

        {variant === "staff" ? (
          <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
            <Button variant="outline" size="sm" onClick={onSchedule}>
              <CalendarPlus className="h-3.5 w-3.5 mr-1" />Schedule
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEditPatient}>
                  <Edit className="h-4 w-4 mr-2" />Edit Patient
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onEditAppointment}>
                  <Stethoscope className="h-4 w-4 mr-2" />Edit Appointment
                </DropdownMenuItem>
                {onCancelAppointment && (
                  <DropdownMenuItem
                    onClick={onCancelAppointment}
                    className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                  >
                    <XCircle className="h-4 w-4 mr-2" />Cancel Appointment
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onSchedule}>
                <CalendarPlus className="h-4 w-4 mr-2" />Schedule
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onEditPatient}>
                <Edit className="h-4 w-4 mr-2" />Edit Patient
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onEditAppointment}>
                <Stethoscope className="h-4 w-4 mr-2" />Edit Appointment
              </DropdownMenuItem>
              {onCancelAppointment && (
                <DropdownMenuItem
                  onClick={onCancelAppointment}
                  className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                >
                  <XCircle className="h-4 w-4 mr-2" />Cancel Appointment
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {notes && (
        <p className="text-xs text-muted-foreground line-clamp-1 border-t pt-2">{notes}</p>
      )}
    </div>
  );
}
