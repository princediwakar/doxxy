import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  define: {
    // Fix useLayoutEffect SSR warning in production
    global: 'globalThis',
    // Polyfill for React 18 strict mode compatibility
    __DEV__: mode === 'development',
    // Fix React hooks SSR compatibility
    'process.env.NODE_ENV': JSON.stringify(mode === 'production' ? 'production' : 'development'),
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    // Bundle analyzer - generate stats.html after build
    mode === 'production' && visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/contexts/AuthContext": path.resolve(__dirname, "./tests/__mocks__/AuthContext.tsx"),
      // Fix lodash import issues by aliasing to lodash-es
      "lodash": "lodash-es",
    },
  },
  // Optimize dependency pre-bundling
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      '@supabase/supabase-js',
      'lucide-react',
      'date-fns',
      'zod',
      'react-hook-form',
      'recharts',
      'lodash-es',
      // Force inclusion of Radix UI dependencies that use useLayoutEffect
      '@radix-ui/react-use-layout-effect',
    ],
    exclude: [
      // Exclude heavy libraries from pre-bundling for better chunking
      'jspdf',
      'html2canvas',
    ],
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
  },
  esbuild: {
    // Define NODE_ENV for better optimization
    define: {
      'process.env.NODE_ENV': mode === 'production' ? '"production"' : '"development"'
    }
  },
  build: {
    rollupOptions: {
      // Ensure proper module format and dependencies
      external: [],
      output: {
        // Ensure consistent module format
        format: 'es',
        // Better interop handling
        interop: 'auto',
        manualChunks: (id) => {
          // Core React ecosystem - ensure this loads first
          if (id.includes('react/') || id.includes('react-dom/') || id.includes('react-router')) {
            return 'vendor-react';
          }
          
          // All Radix UI components together to prevent cross-chunk dependency issues
          if (id.includes('@radix-ui/')) {
            return 'vendor-radix';
          }
          
          // Data & API
          if (id.includes('@supabase/supabase-js') || 
              id.includes('@tanstack/react-query') || 
              id.includes('date-fns')) {
            return 'vendor-data';
          }
          
          // Forms & Validation
          if (id.includes('react-hook-form') || 
              id.includes('@hookform/resolvers') || 
              id.includes('zod')) {
            return 'vendor-forms';
          }
          
          // Utility libraries
          if (id.includes('lucide-react') || 
              id.includes('clsx') || 
              id.includes('class-variance-authority') ||
              id.includes('tailwind-merge') ||
              id.includes('cmdk') ||
              id.includes('use-debounce') ||
              id.includes('lodash')) {
            return 'vendor-utils';
          }
          
          // Heavy libraries - separate chunks
          if (id.includes('recharts') || id.includes('d3-')) {
            return 'vendor-charts';
          }
          
          // PDF libraries - only loaded dynamically, exclude from initial bundle
          if (id.includes('jspdf') || id.includes('html2canvas')) {
            return 'vendor-pdf-dynamic';
          }
          
          if (id.includes('react-day-picker')) {
            return 'vendor-calendar';
          }
          
          // UI libraries that can be grouped
          if (id.includes('sonner') || 
              id.includes('vaul') ||
              id.includes('embla-carousel') ||
              id.includes('input-otp') ||
              id.includes('next-themes') ||
              id.includes('react-resizable-panels') ||
              id.includes('tailwindcss-animate')) {
            return 'vendor-misc';
          }
          
          // Everything else goes to vendor-common
          if (id.includes('node_modules')) {
            return 'vendor-common';
          }
        },
      },
    },
    // Optimized chunk size limits
    chunkSizeWarningLimit: 600, // Stricter limit to catch large chunks
    // Minification options for better compression
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production', // Remove console.log in production
        drop_debugger: true,
        pure_funcs: mode === 'production' ? ['console.log', 'console.warn'] : [],
        // Prevent aggressive function inlining that can break module exports
        inline: 1,
      },
      mangle: {
        safari10: true, // Fix Safari 10 issues
        // Preserve function names for better debugging
        keep_fnames: /^use[A-Z]/, // Keep React hook names
        reserved: ['React', 'useLayoutEffect', 'useEffect'], // Preserve critical identifiers
      },
      // Prevent module wrapper issues
      format: {
        preserve_annotations: true,
      },
    },
    // Report compressed size only in development for faster builds
    reportCompressedSize: mode === 'development',
    // Enable source maps for development only
    sourcemap: mode === 'development',
    // Target modern browsers for smaller bundles
    target: 'es2020',
  },
  include: ['tests/*.spec.tsx'],
  exclude: ['tests/**/*.spec.ts'],
}));