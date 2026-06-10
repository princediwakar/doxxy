// Patched version of @radix-ui/react-id that uses React.useId() directly
// instead of wrapping it in useState, which causes SSR/client ID mismatches
// in Next.js 16 + Turbopack.
import * as React from "react";

function useId(deterministicId?: string): string {
  if (deterministicId) return deterministicId;
  const reactId = React.useId();
  return `radix-${reactId}`;
}

export { useId };
