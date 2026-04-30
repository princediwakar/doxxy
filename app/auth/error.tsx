'use client';

import { useEffect } from 'react';
import { ErrorFallback } from '@/components/error-boundary/ErrorFallback';
import { getErrorType } from '@/lib/error-utils';

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Auth error boundary caught:', error);
  }, [error]);

  return (
    <ErrorFallback
      error={error}
      errorType={getErrorType(error)}
      onReset={reset}
      onRetry={() => window.location.reload()}
    />
  );
}
