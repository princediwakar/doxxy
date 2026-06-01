/**
 * Standardized error handling utilities for Doxxy healthcare application
 * Provides consistent error classification, formatting, and handling
 */

import { toast } from 'sonner';

interface ErrorLike {
  code?: string;
  message?: string;
  details?: string;
  [key: string]: unknown;
}

// Error type definitions
export type ErrorType =
  | 'NETWORK_ERROR'
  | 'AUTH_ERROR'
  | 'VALIDATION_ERROR'
  | 'DATABASE_ERROR'
  | 'RATE_LIMIT_ERROR'
  | 'NOT_FOUND_ERROR'
  | 'PERMISSION_ERROR'
  | 'SERVICE_ERROR'
  | 'UNKNOWN_ERROR';

export interface ClassifiedError {
  type: ErrorType;
  message: string;
  originalError?: unknown;
  userMessage: string;
  shouldRetry: boolean;
  retryAfter?: number; // in seconds
}

// Supabase error codes mapping
const SUPABASE_ERROR_CODES = {
  'PGRST116': 'NOT_FOUND_ERROR', // No rows returned
  '23505': 'VALIDATION_ERROR', // Unique violation
  '23503': 'VALIDATION_ERROR', // Foreign key violation
  '42501': 'PERMISSION_ERROR', // Insufficient privilege
  '42P01': 'DATABASE_ERROR', // Undefined table
  '08000': 'NETWORK_ERROR', // Connection exception
  '08006': 'NETWORK_ERROR', // Connection failure
};

// Network error patterns
const NETWORK_ERROR_PATTERNS = [
  'NetworkError',
  'Failed to fetch',
  'Network request failed',
  'ERR_CONNECTION_REFUSED',
  'ERR_INTERNET_DISCONNECTED',
  'ERR_TIMED_OUT',
  'ETIMEDOUT',
  'ECONNREFUSED',
  'ENOTFOUND',
];

// Auth error patterns
const AUTH_ERROR_PATTERNS = [
  'Invalid login credentials',
  'Email not confirmed',
  'User not found',
  'Invalid token',
  'Session expired',
  'JWT expired',
  'Unauthorized',
  'Forbidden',
  '403',
  '401',
];

// Rate limit patterns
const RATE_LIMIT_PATTERNS = [
  'rate limit',
  'too many requests',
  '429',
  'quota exceeded',
];

// Service error patterns (Sarvam STT, OpenAI, etc.)
const SERVICE_ERROR_PATTERNS = [
  'speech-to-text',
  'transcription',
  'transcribe',
  'structure clinical notes',
  'sarvam',
  'openai api error',
];

/**
 * Classify an error based on its message, code, or type
 */
export function getErrorType(error: unknown): ErrorType {
  if (!error) return 'UNKNOWN_ERROR';

  const errorObj = error as ErrorLike;
  const errorString = (errorObj?.message || (error instanceof Error ? error.message : String(error))).toLowerCase();

  // Check for Supabase error codes
  if (errorObj?.code && SUPABASE_ERROR_CODES[errorObj.code as keyof typeof SUPABASE_ERROR_CODES]) {
    return SUPABASE_ERROR_CODES[errorObj.code as keyof typeof SUPABASE_ERROR_CODES] as ErrorType;
  }

  // Check for network errors
  if (NETWORK_ERROR_PATTERNS.some(pattern => errorString.includes(pattern.toLowerCase()))) {
    return 'NETWORK_ERROR';
  }

  // Check for auth errors
  if (AUTH_ERROR_PATTERNS.some(pattern => errorString.includes(pattern.toLowerCase()))) {
    return 'AUTH_ERROR';
  }

  // Check for rate limit errors
  if (RATE_LIMIT_PATTERNS.some(pattern => errorString.includes(pattern.toLowerCase()))) {
    return 'RATE_LIMIT_ERROR';
  }

  // Check for external service errors (Sarvam STT, OpenAI, etc.)
  if (SERVICE_ERROR_PATTERNS.some(pattern => errorString.includes(pattern.toLowerCase()))) {
    return 'SERVICE_ERROR';
  }

  // Check for database errors
  if (errorString.includes('database') || errorString.includes('postgres') || errorString.includes('sql')) {
    return 'DATABASE_ERROR';
  }

  // Check for validation errors
  if (errorString.includes('validation') || errorString.includes('invalid') || errorString.includes('required')) {
    return 'VALIDATION_ERROR';
  }

  return 'UNKNOWN_ERROR';
}

/**
 * Create a classified error object with user-friendly messaging
 */
export function classifyError(error: unknown): ClassifiedError {
  const type = getErrorType(error);
  const errorObj = error as ErrorLike;
  const rawMessage = errorObj?.message || (error instanceof Error ? error.message : String(error));
  const errorMessage = rawMessage === '[object Object]' || !rawMessage
    ? 'An unknown error occurred'
    : rawMessage;

  const baseConfig = {
    type,
    message: errorMessage,
    originalError: error,
    userMessage: 'An unexpected error occurred. Please try again.',
    shouldRetry: type === 'NETWORK_ERROR' || type === 'RATE_LIMIT_ERROR',
    retryAfter: type === 'RATE_LIMIT_ERROR' ? 60 : undefined, // 60 seconds for rate limits
  };

  // Add specific handling for different error types
  switch (type) {
    case 'NETWORK_ERROR':
      return {
        ...baseConfig,
        userMessage: 'Unable to connect to the server. Please check your internet connection and try again.',
      };
    case 'AUTH_ERROR':
      return {
        ...baseConfig,
        userMessage: 'Your session has expired. Please sign in again.',
        shouldRetry: false,
      };
    case 'DATABASE_ERROR':
      return {
        ...baseConfig,
        userMessage: 'We\'re experiencing technical difficulties. Our team has been notified.',
        shouldRetry: true,
      };
    case 'RATE_LIMIT_ERROR':
      return {
        ...baseConfig,
        userMessage: 'Too many requests. Please wait a moment before trying again.',
        retryAfter: 60,
      };
    case 'VALIDATION_ERROR':
      return {
        ...baseConfig,
        userMessage: buildValidationErrorMessage(errorObj),
      };
    case 'SERVICE_ERROR':
      return {
        ...baseConfig,
        userMessage: errorMessage,
        shouldRetry: true,
      };
    default:
      return baseConfig;
  }
}

const CONSTRAINT_MESSAGES: Record<string, string> = {
  uhid: 'A patient with this UHID already exists in your clinic.',
  email: 'A patient with this email already exists in your clinic.',
  phone: 'A patient with this phone number already exists in your clinic.',
};

function buildValidationErrorMessage(errorObj: ErrorLike): string {
  if (errorObj?.code === '23505' || errorObj?.message?.includes('duplicate key')) {
    const details = errorObj?.details || errorObj?.message || '';
    const constraintMatch = details.match(/constraint\s+"(\w+)"/);
    if (constraintMatch) {
      const constraint = constraintMatch[1];
      for (const [key, message] of Object.entries(CONSTRAINT_MESSAGES)) {
        if (constraint.includes(key)) return message;
      }
      return 'A record with this value already exists. Please use a different value.';
    }
  }
  return 'There was an issue with the data provided. Please check and try again.';
}

/**
 * Show a toast notification for an error
 * Uses appropriate styling based on error type
 */
export function showErrorToast(error: unknown, options?: {
  title?: string;
  duration?: number;
}) {
  const classified = classifyError(error);

  toast.error(options?.title || 'Error', {
    description: classified.userMessage,
    duration: options?.duration || 5000,
  });

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error toast shown:', {
      type: classified.type,
      message: classified.message,
      originalError: classified.originalError,
    });
  }
}

/**
 * Check if an error should trigger a retry
 */
export function shouldRetryError(error: unknown, attempt: number): boolean {
  if (attempt >= 3) return false; // Max 3 retries

  const classified = classifyError(error);
  return classified.shouldRetry;
}

/**
 * Get backoff delay for retry attempts
 */
export function getRetryDelay(attempt: number): number {
  // Exponential backoff with jitter
  const baseDelay = Math.min(1000 * Math.pow(2, attempt), 10000); // Max 10 seconds
  const jitter = Math.random() * 1000; // Add up to 1 second of jitter
  return baseDelay + jitter;
}

/**
 * Format error for display in UI components
 */
export function formatErrorForDisplay(error: unknown): {
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
} {
  const classified = classifyError(error);

  let severity: 'low' | 'medium' | 'high' = 'medium';
  let title = 'Error';

  switch (classified.type) {
    case 'NETWORK_ERROR':
      title = 'Connection Issue';
      severity = 'medium';
      break;
    case 'AUTH_ERROR':
      title = 'Authentication Error';
      severity = 'high';
      break;
    case 'DATABASE_ERROR':
      title = 'System Error';
      severity = 'high';
      break;
    case 'RATE_LIMIT_ERROR':
      title = 'Too Many Requests';
      severity = 'low';
      break;
    case 'VALIDATION_ERROR':
      title = 'Validation Error';
      severity = 'low';
      break;
    case 'SERVICE_ERROR':
      title = 'Service Error';
      severity = 'medium';
      break;
  }

  return {
    title,
    message: classified.userMessage,
    severity,
  };
}

/**
 * Check if error is a Supabase "no rows" error
 */
export function isNotFoundError(error: unknown): boolean {
  const errorObj = error as ErrorLike;
  return errorObj?.code === 'PGRST116' || getErrorType(error) === 'NOT_FOUND_ERROR';
}

/**
 * Create a safe error handler for async operations
 */
export function createSafeHandler<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  errorHandler?: (error: unknown) => void
): (...args: Parameters<T>) => Promise<ReturnType<T> | null> {
  return async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      if (errorHandler) {
        errorHandler(error);
      } else {
        showErrorToast(error);
      }
      return null;
    }
  };
}