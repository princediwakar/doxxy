import { useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export function useFABAction(action: string, onTrigger: () => void) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const handled = useRef(false);

  useEffect(() => {
    if (searchParams.get("action") === action && !handled.current) {
      handled.current = true;
      onTrigger();
      const next = new URLSearchParams(searchParams.toString());
      next.delete("action");
      const qs = next.toString();
      router.replace(window.location.pathname + (qs ? `?${qs}` : ""));
    } else if (searchParams.get("action") !== action) {
      handled.current = false;
    }
  }, [searchParams, router, action, onTrigger]);
}
