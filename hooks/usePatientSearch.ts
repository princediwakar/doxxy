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

function ageGroupToRange(ageGroup: string): { gte?: number; lte?: number } | null {
  const match = ageGroup.match(/^(\d+)[-+](\d+)?$/);
  if (!match) return null;

  const minAge = parseInt(match[1], 10);
  const suffix = ageGroup.slice(String(minAge).length);

  if (suffix === "+") {
    return { gte: minAge };
  }

  const maxAge = parseInt(match[2], 10);
  return { gte: minAge, lte: maxAge };
}

function applyFilters(
  query: ReturnType<typeof supabase.from>,
  filters: { search?: string; gender?: string; ageRange?: { gte?: number; lte?: number } | null }
) {
  let q = query;
  if (filters.search?.trim()) {
    q = q.ilike("name", `%${filters.search}%`);
  }
  if (filters.gender) {
    q = q.eq("gender", filters.gender);
  }
  if (filters.ageRange) {
    const { gte, lte } = filters.ageRange;
    if (gte !== undefined) q = q.gte("age", gte);
    if (lte !== undefined) q = q.lte("age", lte);
  }
  return q as typeof query;
}

async function fetchPatients(
  clinicId: string,
  search: string,
  page: number,
  genderFilter: string | null,
  ageGroupFilter: string | null,
): Promise<{ patients: DbPatientByClinic[]; totalCount: number }> {
  if (!clinicId) return { patients: [], totalCount: 0 };

  const start = (page - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE - 1;
  const ageRange = ageGroupFilter ? ageGroupToRange(ageGroupFilter) : null;

  let countQuery = supabase
    .from("patients")
    .select("*", { count: "exact", head: true })
    .eq("clinic_id", clinicId);
  countQuery = applyFilters(countQuery, { search, gender: genderFilter ?? undefined, ageRange });

  const { count, error: countError } = await countQuery;
  if (countError) throw countError;

  if (!count) return { patients: [], totalCount: 0 };

  let dataQuery = supabase
    .from("patients")
    .select("*")
    .eq("clinic_id", clinicId)
    .order("name")
    .range(start, end);
  dataQuery = applyFilters(dataQuery, { search, gender: genderFilter ?? undefined, ageRange });

  const { data, error } = await dataQuery;
  if (error) throw error;

  return { patients: (data as DbPatientByClinic[]) ?? [], totalCount: count };
}

export function usePatientSearch(
  searchOverride?: string,
  genderFilter?: string | null,
  ageGroupFilter?: string | null,
) {
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
      "gender",
      genderFilter ?? "",
      "age",
      ageGroupFilter ?? "",
      currentPage,
    ],
    queryFn: () => fetchPatients(clinicId, debouncedSearch, currentPage, genderFilter ?? null, ageGroupFilter ?? null),
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
