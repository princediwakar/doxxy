// src/components/appointments/AppointmentsTabs.tsx
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
import { AppointmentWithDetails, AppointmentFilter } from '@/types/appointments';
import { Search } from 'lucide-react';

interface AppointmentsTabsProps {
  appointments: {
    today: AppointmentWithDetails[];
    upcoming: AppointmentWithDetails[];
    past: AppointmentWithDetails[];
    all: AppointmentWithDetails[]; // Added 'all' to props
  };
  activeTab: AppointmentFilter;
  onTabChange: (tab: AppointmentFilter) => void;
  currentPage: Record<AppointmentFilter, number>;
  onPageChange: (tab: AppointmentFilter, page: number) => void;
  getPaginatedAppointments: (list: AppointmentWithDetails[], page: number) => AppointmentWithDetails[];
  getTotalPages: (list: AppointmentWithDetails[]) => number;
  onAppointmentClick: (appointment: AppointmentWithDetails) => void;
  onCancelAppointment: (appointmentId: string) => void;
  onStartConsultation: (appointment: AppointmentWithDetails) => void;
  onViewConsultation: (appointment: AppointmentWithDetails) => void;
  onCreateBill: (appointment: AppointmentWithDetails) => void;
  activeClinicRole: string | null;
  cancelLoading?: boolean;
  isSearching: boolean; // NEW PROP
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
  isSearching,
}) => {
  const renderTabContent = (appointmentList: AppointmentWithDetails[], filter: AppointmentFilter) => {
    const paginatedAppointments = getPaginatedAppointments(appointmentList, currentPage[filter]);
    const totalPages = getTotalPages(appointmentList);

    if (appointmentList.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground border rounded-lg bg-muted/5">
                {isSearching ? 'No appointments found matching your search.' : 'No appointments found.'}
            </div>
        );
    }

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
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                 if (totalPages > 10 && Math.abs(page - currentPage[filter]) > 2 && page !== 1 && page !== totalPages) {
                    if (Math.abs(page - currentPage[filter]) === 3) return <PaginationItem key={page}>...</PaginationItem>;
                    return null;
                 }
                 
                 return (
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
                 );
              })}
              
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

  // If Searching, return a single view with ALL results (ignoring tabs)
  if (isSearching) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/20 p-3 rounded-md border border-muted/50">
          <Search className="h-4 w-4" />
          <span>Showing <strong>{appointments.all.length}</strong> results</span>
        </div>
        {/* We use 'all' as the filter key for pagination state */}
        {renderTabContent(appointments.all, 'all')}
      </div>
    );
  }

  // Otherwise, return standard Tabs
  return (
    <Tabs value={activeTab} onValueChange={(val) => onTabChange(val as AppointmentFilter)} className="space-y-6">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="today" className="flex items-center gap-2">
          Today
          <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-medium">
            {appointments.today.length}
          </span>
        </TabsTrigger>
        <TabsTrigger value="upcoming" className="flex items-center gap-2">
          Upcoming
          <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-medium">
            {appointments.upcoming.length}
          </span>
        </TabsTrigger>
        <TabsTrigger value="past" className="flex items-center gap-2">
          Past
          <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-medium">
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