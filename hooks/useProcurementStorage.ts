"use client";

import { useState } from "react";
import { getSupabase } from "@/integrations/supabase/client";

const supabase = getSupabase();

export function useProcurementStorage() {
  const [isUploading, setIsUploading] = useState(false);

  const uploadBillImage = async (file: File, clinicId: string): Promise<string> => {
    setIsUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${clinicId}/${Date.now()}.${fileExt}`;

      const { error } = await supabase.storage
        .from("procurement_bills")
        .upload(fileName, file);

      if (error) throw error;

      const {
        data: { publicUrl },
      } = supabase.storage.from("procurement_bills").getPublicUrl(fileName);

      return publicUrl;
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadBillImage, isUploading };
}
