'use client';

import { useCallback } from 'react';
import { toast } from 'sonner';
import {
  classifyError,
  showErrorToast,
  formatErrorForDisplay,
  isNotFoundError,
  ErrorType,
  ClassifiedError,
} from '@/lib/error-utils';

/**
 * Hook for standardized error handling throughout the application
 * Provides consistent error display and handling patterns
 */
export function useErrorHandler() {
  /**
   * Handle an error with appropriate user feedback
   */
  const handleError = useCallback((error: unknown, options?: {
    showToast?: boolean;
    toastTitle?: string;
    fallbackMessage?: string;
    logToConsole?: boolean;
  }) => {
    const {
      showToast = true,
      toastTitle,
      fallbackMessage,
      logToConsole = process.env.NODE_ENV === 'development',
    } = options || {};

    const classified = classifyError(error);

    // Log to console in development
    if (logToConsole) {
      console.error('Error handled:', {
        type: classified.type,
        message: classified.message,
        originalError: error,
      });
    }

    // Show toast notification
    if (showToast) {
      showErrorToast(error, { title: toastTitle });
    }

    return classified;
  }, []);

  /**
   * Handle Supabase query/mutation errors
   */
  const handleSupabaseError = useCallback((error: unknown, context?: string) => {
    const classified = classifyError(error);

    let userMessage = classified.userMessage;

    // Add context to error message if provided
    if (context) {
      userMessage = `${context}: ${userMessage}`;
    }

    // Special handling for common Supabase errors
    if (isNotFoundError(error)) {
      // Don't show toast for "not found" errors as they're often expected
      return { ...classified, userMessage, shouldShowToast: false };
    }

    toast.error('Database Error', {
      description: userMessage,
    });

    return { ...classified, userMessage, shouldShowToast: true };
  }, []);

  /**
   * Handle network errors with retry logic
   */
  const handleNetworkError = useCallback(async (
    error: unknown,
    retryCallback: () => Promise<any>,
    maxRetries = 3
  ): Promise<any> => {
    const classified = classifyError(error);

    if (classified.type !== 'NETWORK_ERROR') {
      throw error; // Not a network error, rethrow
    }

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        toast.info('Retrying connection...', {
          description: `Attempt ${attempt} of ${maxRetries}`,
          duration: 2000,
        });

        await new Promise(resolve => {
          setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)); // Exponential backoff
        });

        return await retryCallback();
      } catch (retryError) {
        if (attempt === maxRetries) {
          const finalError = classifyError(retryError);
          toast.error('Connection Failed', {
            description: `Unable to connect after ${maxRetries} attempts. ${finalError.userMessage}`,
          });
          throw retryError;
        }
      }
    }
  }, []);

  /**
   * Handle form submission errors
   */
  const handleFormError = useCallback((error: unknown, fieldErrors?: Record<string, string>) => {
    const classified = classifyError(error);

    if (classified.type === 'VALIDATION_ERROR' && fieldErrors) {
      // Return field-specific errors for form handling
      return {
        type: classified.type as 'VALIDATION_ERROR',
        fieldErrors,
        generalError: classified.userMessage,
      };
    }

    // Show general error toast
    toast.error('Form Error', {
      description: classified.userMessage,
    });

    return {
      type: classified.type,
      fieldErrors: {},
      generalError: classified.userMessage,
    };
  }, []);

  /**
   * Create a safe async wrapper that handles errors automatically
   */
  const withErrorHandling = useCallback(<T extends (...args: any[]) => Promise<any>>(
    asyncFn: T,
    options?: {
      successMessage?: string;
      errorContext?: string;
      onSuccess?: (result: Awaited<ReturnType<T>>) => void;
      onError?: (error: unknown) => void;
    }
  ): ((...args: Parameters<T>) => Promise<Awaited<ReturnType<T>> | null>) => {
    return async (...args: Parameters<T>) => {
      try {
        const result = await asyncFn(...args);

        if (options?.successMessage) {
          toast.success('Success', {
            description: options.successMessage,
          });
        }

        if (options?.onSuccess) {
          options.onSuccess(result);
        }

        return result;
      } catch (error) {
        const classified = handleError(error, {
          toastTitle: options?.errorContext || 'Operation Failed',
          logToConsole: true,
        });

        if (options?.onError) {
          options.onError(error);
        }

        // Return null for non-critical errors to allow graceful degradation
        if (['VALIDATION_ERROR', 'NOT_FOUND_ERROR'].includes(classified.type)) {
          return null;
        }

        // Re-throw critical errors
        throw error;
      }
    };
  }, [handleError]);

  /**
   * Check if error is recoverable (user can retry)
   */
  const isRecoverableError = useCallback((error: unknown): boolean => {
    const classified = classifyError(error);
    return classified.shouldRetry;
  }, []);

  /**
   * Get formatted error for display in UI components
   */
  const getFormattedError = useCallback((error: unknown) => {
    return formatErrorForDisplay(error);
  }, []);

  return {
    handleError,
    handleSupabaseError,
    handleNetworkError,
    handleFormError,
    withErrorHandling,
    isRecoverableError,
    getFormattedError,
    classifyError: (error: unknown) => classifyError(error),
    isNotFoundError: (error: unknown) => isNotFoundError(error),
  };
}

/**
 * Type for the error handler hook return value
 */
export type UseErrorHandlerReturn = ReturnType<typeof useErrorHandler>;