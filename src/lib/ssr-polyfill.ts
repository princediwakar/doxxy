// Simple SSR-safe useLayoutEffect hook
import { useEffect, useLayoutEffect } from 'react';

// Use useLayoutEffect in browser, useEffect in SSR
// Modern Radix UI components handle SSR properly on their own
export const useIsomorphicLayoutEffect = 
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;