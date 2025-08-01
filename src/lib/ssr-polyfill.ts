// Simple SSR-safe useLayoutEffect hook
import { useEffect, useLayoutEffect } from 'react';

// Use useLayoutEffect in browser, useEffect in SSR
// Modern Radix UI components handle SSR properly on their own
export const useIsomorphicLayoutEffect = 
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

// Global polyfill for production builds where React hooks might be undefined
if (typeof window !== 'undefined' && typeof window.React === 'undefined') {
  import('react').then((React) => {
    (window as any).React = React;
  }).catch(() => {
    // Silently fail if React cannot be loaded
  });
}