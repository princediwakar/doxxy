import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/contexts/AuthContext": path.resolve(__dirname, "./tests/__mocks__/AuthContext.tsx"),
      "@/contexts/AuthContext": path.resolve(__dirname, "./tests/__mocks__/AuthContext.tsx"),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks - separate large libraries
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-popover',
            '@radix-ui/react-tabs',
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-avatar',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-collapsible',
            '@radix-ui/react-context-menu',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-hover-card',
            '@radix-ui/react-label',
            '@radix-ui/react-menubar',
            '@radix-ui/react-navigation-menu',
            '@radix-ui/react-popover',
            '@radix-ui/react-progress',
            '@radix-ui/react-radio-group',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-separator',
            '@radix-ui/react-slider',
            '@radix-ui/react-slot',
            '@radix-ui/react-switch',
            '@radix-ui/react-toast',
            '@radix-ui/react-toggle',
            '@radix-ui/react-toggle-group',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-aspect-ratio',
          ],
          'vendor-data': [
            '@supabase/supabase-js',
            '@tanstack/react-query',
            'date-fns',
          ],
          'vendor-forms': [
            'react-hook-form',
            '@hookform/resolvers',
            'zod',
          ],
          'vendor-utils': [
            'lucide-react',
            'clsx',
            'class-variance-authority',
            'tailwind-merge',
            'cmdk',
            'sonner',
            'vaul',
            'use-debounce',
            'lodash.isequal',
          ],
          'vendor-charts': ['recharts'],
          'vendor-pdf': ['jspdf', 'html2canvas'],
          'vendor-calendar': ['react-day-picker'],
          'vendor-misc': [
            'embla-carousel-react',
            'input-otp',
            'next-themes',
            'react-resizable-panels',
            'tailwindcss-animate',
          ],
        },
      },
    },
    // Increase chunk size warning limit since we're now splitting properly
    chunkSizeWarningLimit: 1000,
    // Enable source maps for better debugging in production
    sourcemap: mode === 'development',
  },
  include: ['tests/*.spec.tsx'],
  exclude: ['tests/**/*.spec.ts'],
}));