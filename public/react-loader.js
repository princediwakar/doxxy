// React pre-loader to ensure hooks are available before any other modules
(function() {
  'use strict';
  
  // Check if we're in a browser environment
  if (typeof window === 'undefined') return;
  
  // Create a comprehensive React mock that handles all common hooks
  const createReactMock = () => ({
    useLayoutEffect: function(effect, deps) {
      console.warn('useLayoutEffect called before React loaded, using fallback');
      // Fallback to useEffect behavior
      if (typeof effect === 'function') {
        try {
          const cleanup = effect();
          if (typeof cleanup === 'function') {
            // Store cleanup for potential later use
            window.__REACT_CLEANUP_FUNCS__ = window.__REACT_CLEANUP_FUNCS__ || [];
            window.__REACT_CLEANUP_FUNCS__.push(cleanup);
          }
        } catch (e) {
          console.warn('Error in useLayoutEffect fallback:', e);
        }
      }
      return function() {}; // no-op cleanup
    },
    
    useEffect: function(effect, deps) {
      console.warn('useEffect called before React loaded, using fallback');
      // Similar fallback implementation
      if (typeof effect === 'function') {
        try {
          const cleanup = effect();
          if (typeof cleanup === 'function') {
            window.__REACT_CLEANUP_FUNCS__ = window.__REACT_CLEANUP_FUNCS__ || [];
            window.__REACT_CLEANUP_FUNCS__.push(cleanup);
          }
        } catch (e) {
          console.warn('Error in useEffect fallback:', e);
        }
      }
      return function() {};
    },
    
    useState: function(initial) {
      console.warn('useState called before React loaded, using fallback');
      return [initial, function() {}];
    },
    
    useCallback: function(fn) {
      console.warn('useCallback called before React loaded, using fallback');
      return fn || function() {};
    },
    
    useMemo: function(fn) {
      console.warn('useMemo called before React loaded, using fallback');
      try {
        return typeof fn === 'function' ? fn() : fn;
      } catch (e) {
        console.warn('Error in useMemo fallback:', e);
        return undefined;
      }
    },
    
    useRef: function(initial) {
      console.warn('useRef called before React loaded, using fallback');
      return { current: initial };
    },
    
    useContext: function(context) {
      console.warn('useContext called before React loaded, using fallback');
      return undefined;
    },
    
    useReducer: function(reducer, initialArg, init) {
      console.warn('useReducer called before React loaded, using fallback');
      const initialState = init ? init(initialArg) : initialArg;
      return [initialState, function() {}];
    }
  });
  
  // Create the React mock
  const reactMock = createReactMock();
  
  // Make React available globally with all hooks
  window.React = window.React || reactMock;
  
  // Also make hooks available directly on window for direct imports
  Object.keys(reactMock).forEach(hookName => {
    window[hookName] = window[hookName] || reactMock[hookName];
  });
  
  // Set a flag that the polyfill is active
  window.__REACT_POLYFILL_ACTIVE__ = true;
  
  console.log('React hooks polyfill loaded - all hooks available globally');
})();