import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarCheck, User, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FormattedAppointment } from "@/types/dashboard";
import { Button } from "@/components/ui/button";
import { formatTimeIST } from '@/lib/utils';

interface UpcomingAppointmentsListProps {
  upcomingAppointments: FormattedAppointment[];
  loading: boolean;
  appointmentsPerPage?: number;
  currentPage?: number;
  setCurrentPage?: (page: number) => void;
  totalPages?: number;
  onAppointmentClick?: (appointmentId: string) => void;
  showViewAllButton?: boolean;
  onViewAll?: () => void;
}

export function UpcomingAppointmentsList({
  upcomingAppointments,
  loading,
  appointmentsPerPage = 5,
  currentPage = 1,
  setCurrentPage,
  totalPages,
  onAppointmentClick,
  showViewAllButton = false,
  onViewAll,
}: UpcomingAppointmentsListProps) {
  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return 'outline' as const;
      case 'in progress':
        return 'secondary' as const;
      case 'completed':
        return 'default' as const;
      case 'cancelled':
        return 'destructive' as const;
      default:
        return 'outline' as const;
    }
  };

  // Pagination logic
  const startIdx = (currentPage - 1) * appointmentsPerPage;
  const endIdx = startIdx + appointmentsPerPage;
  const paginatedAppointments = upcomingAppointments.slice(startIdx, endIdx);
  const showPagination = (upcomingAppointments.length > appointmentsPerPage) && setCurrentPage && totalPages;

  return (
    <Card className="col-span-1">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center">
          <CalendarCheck size={18} className="mr-2 " />
          <CardTitle className="text-base">Upcoming Appointments</CardTitle>
        </div>
        {showViewAllButton && onViewAll && (
          <Button
            variant="link"
            size="sm"
            className="text-primary px-0 h-auto"
            onClick={onViewAll}
            aria-label="View all upcoming appointments"
          >
            View All
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="animate-pulse h-14 bg-muted/30 rounded-md"></div>
            ))}
          </div>
        ) : upcomingAppointments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CalendarCheck className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <p>No upcoming appointments scheduled.</p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {paginatedAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  role={onAppointmentClick ? "button" : undefined}
                  tabIndex={onAppointmentClick ? 0 : undefined}
                  aria-label={onAppointmentClick ? `View appointment for ${appointment.patient}` : undefined}
                  className={
                    "border border-border rounded-lg px-3 py-2 transition-colors " +
                    (onAppointmentClick ? "hover:bg-muted/50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary" : "")
                  }
                  onClick={onAppointmentClick ? () => onAppointmentClick(appointment.id) : undefined}
                  onKeyDown={onAppointmentClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onAppointmentClick(appointment.id); } } : undefined}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground truncate">{appointment.patient}</span>
                                                <Badge variant={getStatusVariant(appointment.status)}>{appointment.status}</Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
                    <span className="flex items-center"><User size={14} className="mr-1" />{appointment.doctor}</span>
                    <span className="flex items-center"><CalendarCheck size={14} className="mr-1" />{appointment.date}</span>
                    <span className="flex items-center"><Clock size={14} className="mr-1" />{formatTimeIST(appointment.time)}</span>
                  </div>
                </div>
              ))}
            </div>
            {showPagination && (
              <div className="flex justify-center items-center gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage && setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Prev
                </Button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage && setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
