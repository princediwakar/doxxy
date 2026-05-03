"use client";

import { MoreVertical, CalendarPlus, Receipt, Edit, Stethoscope } from "lucide-react";
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
  status?: string;
  onSchedule: () => void;
  onBill: () => void;
  onEditPatient: () => void;
  onEditAppointment: () => void;
}

export function PatientHeader({
  name,
  age,
  gender,
  status,
  onSchedule,
  onBill,
  onEditPatient,
  onEditAppointment,
}: PatientHeaderProps) {
  const demographic = [gender, age ? `${age}y` : null].filter(Boolean).join(", ") || "N/A";

  return (
    <div className="flex items-start justify-between">
      <div>
        <h2 className="text-lg font-semibold">{name}</h2>
        <p className="text-sm text-muted-foreground">{demographic}</p>
        {status && <Badge className={`mt-1 ${STATUS_COLORS[status] ?? "bg-gray-100 text-gray-800"}`}>{status}</Badge>}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onSchedule}>
            <CalendarPlus className="h-4 w-4 mr-2" />Schedule
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onBill}>
            <Receipt className="h-4 w-4 mr-2" />Bill
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onEditPatient}>
            <Edit className="h-4 w-4 mr-2" />Edit Patient
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onEditAppointment}>
            <Stethoscope className="h-4 w-4 mr-2" />Edit Appointment
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
