// React hooks polyfill for production builds
// This ensures useLayoutEffect and other hooks are available globally

import React from 'react';

// Ensure React and its hooks are available on the global scope
if (typeof window !== 'undefined') {
  // Make React available globally for libraries that expect it
  (window as any).React = React;
  
  // Explicitly ensure useLayoutEffect exists
  if (!React.useLayoutEffect) {
    console.warn('useLayoutEffect not found in React, using useEffect fallback');
    (React as any).useLayoutEffect = React.useEffect;
  }
  
  // Create a global hook availability check
  (window as any).__REACT_HOOKS_AVAILABLE__ = true;
}

export default React;