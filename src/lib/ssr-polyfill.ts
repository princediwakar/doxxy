// SSR compatibility polyfill for React hooks
// This fixes the useLayoutEffect warning in production builds

// Global polyfills for SSR compatibility - must run before React imports
if (typeof window === 'undefined') {
  // @ts-ignore
  global.window = global.window || {};
  // @ts-ignore
  global.document = global.document || {};
  // @ts-ignore
  global.navigator = global.navigator || {};
}

// Fix React hooks for SSR/production builds
if (typeof window !== 'undefined' && window.React && !window.React.useLayoutEffect) {
  // Polyfill missing React hooks in production chunks
  const React = window.React;
  if (React.useEffect && !React.useLayoutEffect) {
    React.useLayoutEffect = React.useEffect;
  }
}

import { useEffect, useLayoutEffect } from 'react';

// Use useLayoutEffect in browser, useEffect in SSR
export const useIsomorphicLayoutEffect = 
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;