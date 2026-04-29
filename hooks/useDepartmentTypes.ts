"use client";

import { useQuery } from "@tanstack/react-query";
import { getSupabase } from "@/integrations/supabase/client";

const supabase = getSupabase();

export function useDepartmentTypes() {
  return useQuery({
    queryKey: ["departmentTypes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("department_types").select("*");
      if (error) throw error;
      return data || [];
    },
    retry: (failureCount, _error) => failureCount < 3,
  });
}
