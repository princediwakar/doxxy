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
import { SkeletonLoader } from '@/components/ui/loading';
import { AppointmentsTable } from './AppointmentsTable';
import { AppointmentWithDetails, AppointmentFilter } from '@/types/appointments';
import { Search } from 'lucide-react';

interface AppointmentsTabsProps {
  appointments: {
    today: AppointmentWithDetails[];
    upcoming: AppointmentWithDetails[];
    past: AppointmentWithDetails[];
    all: AppointmentWithDetails[];
  };
  isLoading: boolean; // NEW PROP
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
  onCheckIn?: (appointmentId: string) => void;
  activeClinicRole: string | null;
  cancelLoading?: boolean;
  isSearching: boolean;
}

export const AppointmentsTabs: React.FC<AppointmentsTabsProps> = ({
  appointments,
  isLoading,
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
  onCheckIn,
  activeClinicRole,
  cancelLoading,
  isSearching,
}) => {

  // Helper to render content: either Skeleton, Empty State, or Real Table
  const renderTabContent = (appointmentList: AppointmentWithDetails[], filter: AppointmentFilter) => {
    
    // 1. LOADING STATE
    if (isLoading) {
      return (
        <div className="space-y-4">
           {/* Render 5 skeleton rows to simulate the table */}
           <div className="rounded-md border bg-card">
              <div className="p-4 space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <SkeletonLoader count={1} className="h-12 w-full bg-muted/30" />
                    </div>
                  ))}
              </div>
           </div>
        </div>
      );
    }

    // 2. EMPTY STATE
    if (appointmentList.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground border rounded-lg bg-muted/5">
                {isSearching ? 'No appointments found matching your search.' : 'No appointments found.'}
            </div>
        );
    }

    // 3. REAL DATA STATE
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
          onCheckIn={onCheckIn}
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

  // If Searching, return a single view (ignores tabs visually, uses 'all' logic)
  if (isSearching) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/20 p-3 rounded-md border border-muted/50">
          <Search className="h-4 w-4" />
          <span>
             {isLoading ? 'Searching...' : <>Showing <strong>{appointments.all.length}</strong> results</>}
          </span>
        </div>
        {renderTabContent(appointments.all, 'all')}
      </div>
    );
  }

  // Standard Tabs
  return (
    <Tabs value={activeTab} onValueChange={(val) => onTabChange(val as AppointmentFilter)} className="space-y-6">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="today" className="flex items-center gap-2">
          Today
          {/* Hide counts during loading to prevent '0' flickering */}
          {!isLoading && (
            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-medium">
              {appointments.today.length}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="upcoming" className="flex items-center gap-2">
          Upcoming
          {!isLoading && (
            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-medium">
              {appointments.upcoming.length}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="past" className="flex items-center gap-2">
          Past
          {!isLoading && (
            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-medium">
              {appointments.past.length}
            </span>
          )}
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