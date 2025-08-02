// React hooks polyfill for production builds
// This ensures useLayoutEffect and other hooks are available globally

import React from 'react';

// Ensure React and its hooks are available on the global scope
if (typeof window !== 'undefined') {
  // Make React available globally
  (window as any).React = React;
  
  // Create a robust React proxy that handles useLayoutEffect fallback
  const ReactProxy = new Proxy(React, {
    get(target, prop) {
      // Critical fix: useLayoutEffect fallback to useEffect for SSR/production safety
      if (prop === 'useLayoutEffect') {
        return target.useLayoutEffect || target.useEffect;
      }
      if (prop === 'useEffect') {
        return target.useEffect;
      }
      // Return all other React properties/methods as-is
      return target[prop as keyof typeof React];
    }
  });
  
  // Override global React with the safe proxy
  (window as any).React = ReactProxy;
  
  // Make individual hooks available globally for libraries that expect them
  (window as any).useLayoutEffect = React.useLayoutEffect || React.useEffect;
  (window as any).useEffect = React.useEffect;
  (window as any).useState = React.useState;
  (window as any).useCallback = React.useCallback;
  (window as any).useMemo = React.useMemo;
  (window as any).useRef = React.useRef;
  (window as any).useContext = React.useContext;
  (window as any).useReducer = React.useReducer;
  (window as any).useImperativeHandle = React.useImperativeHandle;
  (window as any).useDebugValue = React.useDebugValue;
  
  // Mark hooks as available
  (window as any).__REACT_HOOKS_AVAILABLE__ = true;
  
  // Silent logging for debugging
  if (process.env.NODE_ENV === 'development') {
    console.log('[Doxxy] React hooks polyfill loaded successfully');
  }
}

export default React;