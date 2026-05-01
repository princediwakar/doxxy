"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";
import { getSupabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { queryKeys } from "@/lib/query-keys";
import type { DbPatientByClinic } from "@/types/core";

const supabase = getSupabase();
const ITEMS_PER_PAGE = 20;

async function fetchPatients(
  clinicId: string,
  search: string,
  page: number
): Promise<{ patients: DbPatientByClinic[]; totalCount: number }> {
  if (!clinicId) return { patients: [], totalCount: 0 };

  const start = (page - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE - 1;

  let countQuery = supabase
    .from("patients")
    .select("*", { count: "exact", head: true })
    .eq("clinic_id", clinicId);

  if (search.trim()) {
    countQuery = countQuery.ilike("name", `%${search}%`);
  }

  const { count, error: countError } = await countQuery;
  if (countError) throw countError;

  if (!count) return { patients: [], totalCount: 0 };

  let dataQuery = supabase
    .from("patients")
    .select("*")
    .eq("clinic_id", clinicId)
    .order("name")
    .range(start, end);

  if (search.trim()) {
    dataQuery = dataQuery.ilike("name", `%${search}%`);
  }

  const { data, error } = await dataQuery;
  if (error) throw error;

  return { patients: (data as DbPatientByClinic[]) ?? [], totalCount: count };
}

export function usePatientSearch(searchOverride?: string) {
  const { activeClinic, loading: authLoading } = useAuth();
  const clinicId = activeClinic?.clinic_id ?? "";
  const [internalSearch, setInternalSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const searchQuery = searchOverride !== undefined ? searchOverride : internalSearch;
  const [debouncedSearch] = useDebounce(searchQuery, 300);

  const { data, isLoading } = useQuery({
    queryKey: [
      ...queryKeys.patients.byClinic(clinicId),
      "search",
      debouncedSearch,
      currentPage,
    ],
    queryFn: () => fetchPatients(clinicId, debouncedSearch, currentPage),
    enabled: !!clinicId && !authLoading,
    staleTime: 60 * 1000,
    placeholderData: (previousData) => previousData,
  });

  return {
    patients: data?.patients ?? [],
    totalCount: data?.totalCount ?? 0,
    isLoading,
    currentPage,
    setPage: setCurrentPage,
  };
}
