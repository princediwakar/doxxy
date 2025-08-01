// React hooks polyfill for production builds
// This ensures useLayoutEffect and other hooks are available globally

import React from 'react';

// Ensure React and its hooks are available on the global scope
if (typeof window !== 'undefined') {
  // Make React available globally for libraries that expect it
  (window as any).React = React;
  
  // Create a global React proxy that always has hooks available
  const ReactProxy = new Proxy(React, {
    get(target, prop) {
      if (prop === 'useLayoutEffect') {
        return target.useLayoutEffect || target.useEffect;
      }
      if (prop === 'useEffect') {
        return target.useEffect;
      }
      return target[prop as keyof typeof React];
    }
  });
  
  // Override the global React reference
  (window as any).React = ReactProxy;
  
  // Also make hooks directly available globally as a fallback
  (window as any).useLayoutEffect = React.useLayoutEffect || React.useEffect;
  (window as any).useEffect = React.useEffect;
  
  // Create a global hook availability check
  (window as any).__REACT_HOOKS_AVAILABLE__ = true;
}

export default React;