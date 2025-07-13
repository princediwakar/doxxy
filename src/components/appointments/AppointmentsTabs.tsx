import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Pagination,
  PaginationContent,  
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { AppointmentsTable } from './AppointmentsTable';
import { AppointmentWithDetails, AppointmentFilter } from '@/hooks/useAppointments';

interface AppointmentsTabsProps {
  appointments: {
    today: AppointmentWithDetails[];
    upcoming: AppointmentWithDetails[];
    past: AppointmentWithDetails[];
  };
  activeTab: AppointmentFilter;
  onTabChange: (tab: string) => void;
  currentPage: Record<AppointmentFilter, number>;
  onPageChange: (tab: AppointmentFilter, page: number) => void;
  getPaginatedAppointments: (appointments: AppointmentWithDetails[], page: number) => AppointmentWithDetails[];
  getTotalPages: (appointments: AppointmentWithDetails[]) => number;
  onAppointmentClick: (appointment: AppointmentWithDetails) => void;
  onCancelAppointment: (appointmentId: string) => void;
  onStartConsultation: (appointment: AppointmentWithDetails) => void;
  onViewConsultation: (appointment: AppointmentWithDetails) => void;
  onCreateBill: (appointment: AppointmentWithDetails) => void;
  activeClinicRole: string | null;
  cancelLoading?: boolean;
}

export const AppointmentsTabs: React.FC<AppointmentsTabsProps> = ({
  appointments,
  activeTab,
  onTabChange,
  currentPage,
  onPageChange,
  getPaginatedAppointments,
  getTotalPages,
  onAppointmentClick,
  onCancelAppointment,
  onStartConsultation,
  onViewConsultation,
  onCreateBill,
  activeClinicRole,
  cancelLoading,
}) => {
  const renderTabContent = (appointmentList: AppointmentWithDetails[], filter: AppointmentFilter) => {
    const paginatedAppointments = getPaginatedAppointments(appointmentList, currentPage[filter]);
    const totalPages = getTotalPages(appointmentList);

    return (
      <div className="space-y-4">
        <AppointmentsTable
          appointments={paginatedAppointments}
          onAppointmentClick={onAppointmentClick}
          onCancelAppointment={onCancelAppointment}
          onStartConsultation={onStartConsultation}
          onViewConsultation={onViewConsultation}
          onCreateBill={onCreateBill}
          activeClinicRole={activeClinicRole}
          cancelLoading={cancelLoading}
        />

        {totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage[filter] > 1) {
                      onPageChange(filter, currentPage[filter] - 1);
                    }
                  }}
                  className={currentPage[filter] <= 1 ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      onPageChange(filter, page);
                    }}
                    isActive={currentPage[filter] === page}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              
              <PaginationItem>
                <PaginationNext 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage[filter] < totalPages) {
                      onPageChange(filter, currentPage[filter] + 1);
                    }
                  }}
                  className={currentPage[filter] >= totalPages ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    );
  };

  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="space-y-6">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="today" className="flex items-center gap-2 ">
          Today
          <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs">
            {appointments.today.length}
          </span>
        </TabsTrigger>
        <TabsTrigger value="upcoming" className="flex items-center gap-2">
          Upcoming
          <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs">
            {appointments.upcoming.length}
          </span>
        </TabsTrigger>
        <TabsTrigger value="past" className="flex items-center gap-2">
          Past
          <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs">
            {appointments.past.length}
          </span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="today">
        {renderTabContent(appointments.today, 'today')}
      </TabsContent>

      <TabsContent value="upcoming">
        {renderTabContent(appointments.upcoming, 'upcoming')}
      </TabsContent>

      <TabsContent value="past">
        {renderTabContent(appointments.past, 'past')}
      </TabsContent>
    </Tabs>
  );
}; 