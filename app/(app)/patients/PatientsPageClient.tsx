// Path: app/(app)/patients/PatientsPageClient.tsx
"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { PersonStanding, Plus, Search, X, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/loading";
import { useAppState } from "@/contexts/AppStateContext";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";
import { PatientModal } from "@/components/patients/PatientModal";
import { PatientChart } from "@/components/patients/PatientChart";
import { queryPatientDetail, queryPatientSearch } from "@/lib/queries/patients";
import type { DbPatientByClinic, PatientDetail } from "@/types/core";
import type { Patient } from "@/types/patients";

interface PatientsPageClientProps {
  serverPatients: DbPatientByClinic[];
  initialPatientId: string | null;
  initialPatientDetail: PatientDetail | null;
}

export function PatientsPageClient({
  serverPatients,
  initialPatientId,
  initialPatientDetail,
}: PatientsPageClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { activeClinicId } = useAppState();

  // ── URL state ──
  const selectedPatientId = searchParams.get("patient") || null;

  // ── Local state ──
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<DbPatientByClinic[] | null>(null);
  const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState(false);
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);

  const patients = searchResults ?? serverPatients;
  const isSearchActive = searchQuery.trim().length > 0;
  const isInitialPatient = selectedPatientId === initialPatientId;

  // ── React Query: detail for selected patient ──
  const { data: remoteDetail, isLoading: isLoadingDetail } = useQuery({
    queryKey: ["patient", selectedPatientId, "detail"],
    queryFn: () => queryPatientDetail(activeClinicId ?? "", selectedPatientId!),
    enabled: !!activeClinicId && !!selectedPatientId && !isInitialPatient,
    staleTime: 5 * 60 * 1000,
  });

  const patientDetail =
    isInitialPatient ? initialPatientDetail :
    selectedPatientId && selectedPatientId !== initialPatientId ? (remoteDetail ?? null) :
    null;

  // ── Realtime ──
  const patientsQueryKeys = useMemo(
    () => [["patients_list"], ["patient", selectedPatientId, "detail"]] as unknown[][],
    [selectedPatientId],
  );
  useRealtimeSubscription({
    table: "patients",
    clinicId: activeClinicId ?? "",
    queryKeys: patientsQueryKeys,
    onChange: () => router.refresh(),
  });
  useRealtimeSubscription({
    table: "bills",
    clinicId: activeClinicId ?? "",
    queryKeys: patientsQueryKeys,
    onChange: () => router.refresh(),
  });

  // ── Debounced search ──
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const result = await queryPatientSearch(activeClinicId ?? "", searchQuery);
        setSearchResults(result.patients);
      } catch {
        // queryPatientSearch throws on error — leave results unchanged
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, activeClinicId]);

  // ── Handlers ──
  const handlePatientClick = useCallback((patientId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("patient", patientId);
    router.push(`/patients?${params.toString()}`, { scroll: false });
    setMobileDetailOpen(true);
  }, [router, searchParams]);

  const handlePatientCreated = useCallback((newPatient: Patient) => {
    setIsNewPatientModalOpen(false);
    const params = new URLSearchParams(searchParams.toString());
    params.set("patient", newPatient.id);
    router.push(`/patients?${params.toString()}`, { scroll: false });
    setMobileDetailOpen(true);
  }, [router, searchParams]);

  const handleBackToList = useCallback(() => {
    setMobileDetailOpen(false);
  }, []);

  // ── List panel ──
  const listPanel = (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center justify-between gap-3 mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted shrink-0">
            <PersonStanding className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-bold">Patients</h1>
        </div>
        <Button onClick={() => setIsNewPatientModalOpen(true)} className="gap-2 bg-primary shrink-0">
          <Plus className="w-4 h-4" />
          New Patient
        </Button>
      </div>

      <div className="relative mb-4 shrink-0">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search patients by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 pr-9"
        />
        {isSearchActive && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        {isSearching ? (
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        ) : patients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <PersonStanding className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {isSearchActive ? "No patients match your search." : "No patients yet. Create one to get started."}
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {patients.map((patient) => (
              <button
                key={patient.id}
                onClick={() => handlePatientClick(patient.id)}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  patient.id === selectedPatientId
                    ? "bg-primary/10 border-primary/30"
                    : "bg-card hover:bg-accent"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{patient.name}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {patient.gender && `${patient.gender} · `}
                      {patient.age != null && `${patient.age}y · `}
                      {patient.uhid}
                    </p>
                  </div>
                  {patient.phone && (
                    <p className="text-sm text-muted-foreground shrink-0 ml-2">{patient.phone}</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // ── Detail panel ──
  const detailPanel = (
    <div className="h-full overflow-y-auto">
      {!selectedPatientId ? (
        <div className="flex flex-col items-center justify-center h-full text-center py-12">
          <PersonStanding className="w-16 h-16 text-muted-foreground/40 mb-4" />
          <p className="text-muted-foreground text-lg font-medium">Select a patient</p>
          <p className="text-muted-foreground text-sm mt-1">Click a patient from the list to view details and actions.</p>
        </div>
      ) : isLoadingDetail ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : patientDetail?.patient ? (
        <PatientChart patientDetail={patientDetail} />
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-center py-12">
          <p className="text-muted-foreground">Patient not found.</p>
        </div>
      )}
    </div>
  );

  return (
    <>
      <div className="flex flex-col lg:h-[calc(100vh-3rem)] flex-1 min-h-0">
        <div className="hidden lg:flex gap-6 flex-1 min-h-0">
        <div className="w-1/3 flex flex-col min-h-0">{listPanel}</div>
        <div className="w-2/3 border rounded-lg bg-muted/5 p-4 overflow-y-auto min-h-0">
          {detailPanel}
        </div>
      </div>

      {/* Mobile: toggle */}
      <div className="flex lg:hidden flex-1 min-h-0 flex-col">
        {mobileDetailOpen ? (
          <div className="flex flex-col h-full">
            <div className="flex items-center px-2 py-2 border-b bg-muted/10 sticky top-0 z-10 shrink-0">
              <button
                onClick={handleBackToList}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors p-2 rounded-md hover:bg-muted/30"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="font-semibold text-base">Back to Patients</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 min-h-0">
              {detailPanel}
            </div>
          </div>
        ) : (
          <div className="flex-1 min-h-0 p-4">{listPanel}</div>
        )}
      </div>
      </div>

      <PatientModal
        open={isNewPatientModalOpen}
        onOpenChange={setIsNewPatientModalOpen}
        patient={null}
        onPatientCreated={handlePatientCreated}
      />
    </>
  );
}
