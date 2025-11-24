// React hooks polyfill for production builds
// This ensures useLayoutEffect and other hooks are available globally

import React from 'react';

// Extend Window interface to include React and hooks
declare global {
  interface Window {
    React: typeof React;
    useLayoutEffect: typeof React.useLayoutEffect;
    useEffect: typeof React.useEffect;
    useState: typeof React.useState;
    useCallback: typeof React.useCallback;
    useMemo: typeof React.useMemo;
    useRef: typeof React.useRef;
    useContext: typeof React.useContext;
    useReducer: typeof React.useReducer;
    useImperativeHandle: typeof React.useImperativeHandle;
    useDebugValue: typeof React.useDebugValue;
    __REACT_HOOKS_AVAILABLE__: boolean;
  }
}

// Ensure React and its hooks are available on the global scope
if (typeof window !== 'undefined') {
  // Make React available globally
  window.React = React;
  
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
  window.React = ReactProxy;

  // Make individual hooks available globally for libraries that expect them
  window.useLayoutEffect = React.useLayoutEffect || React.useEffect;
  window.useEffect = React.useEffect;
  window.useState = React.useState;
  window.useCallback = React.useCallback;
  window.useMemo = React.useMemo;
  window.useRef = React.useRef;
  window.useContext = React.useContext;
  window.useReducer = React.useReducer;
  window.useImperativeHandle = React.useImperativeHandle;
  window.useDebugValue = React.useDebugValue;

  // Mark hooks as available
  window.__REACT_HOOKS_AVAILABLE__ = true;
  
  // Silent logging for debugging
  if (process.env.NODE_ENV === 'development') {
    console.log('[Doxxy] React hooks polyfill loaded successfully');
  }
}

export default React;