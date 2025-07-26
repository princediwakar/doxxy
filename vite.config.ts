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
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Core React ecosystem
          if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
            return 'vendor-react';
          }
          
          // Core UI components (most commonly used)
          if (id.includes('@radix-ui/react-dialog') || 
              id.includes('@radix-ui/react-select') ||
              id.includes('@radix-ui/react-popover') ||
              id.includes('@radix-ui/react-dropdown-menu')) {
            return 'vendor-ui-core';
          }
          
          // Form-related UI components
          if (id.includes('@radix-ui/react-checkbox') || 
              id.includes('@radix-ui/react-radio-group') ||
              id.includes('@radix-ui/react-switch') ||
              id.includes('@radix-ui/react-slider') ||
              id.includes('@radix-ui/react-label')) {
            return 'vendor-ui-forms';
          }
          
          // Layout & Navigation UI components
          if (id.includes('@radix-ui/react-tabs') ||
              id.includes('@radix-ui/react-accordion') ||
              id.includes('@radix-ui/react-navigation-menu') ||
              id.includes('@radix-ui/react-menubar') ||
              id.includes('@radix-ui/react-separator') ||
              id.includes('@radix-ui/react-scroll-area')) {
            return 'vendor-ui-layout';
          }
          
          // Interactive UI components (less commonly used)
          if (id.includes('@radix-ui/react-alert-dialog') ||
              id.includes('@radix-ui/react-context-menu') ||
              id.includes('@radix-ui/react-hover-card') ||
              id.includes('@radix-ui/react-tooltip') ||
              id.includes('@radix-ui/react-toast') ||
              id.includes('@radix-ui/react-collapsible') ||
              id.includes('@radix-ui/react-toggle') ||
              id.includes('@radix-ui/react-aspect-ratio') ||
              id.includes('@radix-ui/react-avatar') ||
              id.includes('@radix-ui/react-progress') ||
              id.includes('@radix-ui/react-slot')) {
            return 'vendor-ui-interactive';
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
          
          if (id.includes('jspdf') || id.includes('html2canvas')) {
            return 'vendor-pdf';
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
      },
      mangle: {
        safari10: true, // Fix Safari 10 issues
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