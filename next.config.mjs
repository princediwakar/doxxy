/** @type {import('next').NextConfig} */

const cspHeader = [
  "default-src 'self'",
  // Added 'blob:' to allow the dynamic script execution for your STT library
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' blob: https://www.googletagmanager.com https://embed.tawk.to https://va.tawk.to https://connect.facebook.net https://cdn.tailwindcss.com https://maps.googleapis.com https://maps.gstatic.com https://places.googleapis.com https://checkout.razorpay.com https://cdn.razorpay.com",
  "style-src 'self' 'unsafe-inline' https://lh3.googleusercontent.com https://connect.facebook.net https://maps.googleapis.com",
  "img-src 'self' data: https: blob: https://lh3.googleusercontent.com https://maps.googleapis.com https://maps.gstatic.com",
  "font-src 'self' https://fonts.gstatic.com https://lh3.googleusercontent.com https://connect.facebook.net https://maps.googleapis.com",
  // Added wss://*.onrender.com to allow the WebSocket connection to your STT proxy
  "connect-src 'self' data: https://*.supabase.co wss://*.supabase.co https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://*.vercel-insights.com https://*.tawk.to wss://*.tawk.to wss://*.onrender.com https://*.facebook.com https://*.facebook.net https://connect.facebook.net https://lh3.googleusercontent.com https://maps.googleapis.com https://places.googleapis.com https://*.ingest.us.sentry.io https://api.razorpay.com https://lumberjack.razorpay.com",
  "frame-src 'self' https://www.googletagmanager.com https://www.facebook.com https://web.facebook.com https://api.razorpay.com",
  "worker-src 'self' blob:",
  "media-src 'self' blob:",
].join('; ');

/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/consultation/:id",
        destination: "/schedule?selectedAppointment=:id",
        permanent: false,
      },
      {
        source: "/kb/:path*",
        destination: "/help/:path*",
        permanent: true,
      },
      {
        source: "/clinic",
        destination: "/clinic/financials",
        permanent: false,
      },
    ];
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(self), geolocation=()' },
          // 'same-origin' breaks FB.login() and any popup-based OAuth flow by
          // severing the opener reference. 'same-origin-allow-popups' keeps security
          // intact while allowing popups we open to communicate back.
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'Content-Security-Policy', value: cspHeader },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'no-store, max-age=0' },
        ],
      },
      {
        source: '/(.*).(svg|png|jpg|jpeg|webp|avif|ico|woff2?)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },

  // Image Optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },

  // TypeScript Configuration
  typescript: {
    ignoreBuildErrors: false,
  },

  // Trailing Slash for better compatibility
  trailingSlash: false,
}

import { withSentryConfig } from '@sentry/nextjs';

let config = nextConfig

if (process.env.ANALYZE === 'true') {
  try {
    const { default: withBundleAnalyzer } = await import('@next/bundle-analyzer')
    config = withBundleAnalyzer({ enabled: true })(nextConfig)
  } catch {
    // @next/bundle-analyzer not installed, skip
  }
}

if (process.env.NODE_ENV === 'production' || process.env.SENTRY_AUTH_TOKEN) {
  config = withSentryConfig(config, {
    org: process.env.SENTRY_ORG ?? '',
    project: process.env.SENTRY_PROJECT ?? '',
    authToken: process.env.SENTRY_AUTH_TOKEN,
    widenClientFileUpload: true,
    tunnelRoute: '/monitoring',
    silent: !process.env.CI,
  });
}

export default config;