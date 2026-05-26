/** @type {import('next').NextConfig} */

const cspHeader = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://embed.tawk.to https://va.tawk.to",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https: blob:",
  "font-src 'self'",
  "connect-src 'self' https://*.supabase.co https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://*.vercel-insights.com https://*.tawk.to wss://*.tawk.to",
  "frame-src 'self' https://www.googletagmanager.com",
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
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
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

let config = nextConfig

if (process.env.ANALYZE === 'true') {
  try {
    const { default: withBundleAnalyzer } = await import('@next/bundle-analyzer')
    config = withBundleAnalyzer({ enabled: true })(nextConfig)
  } catch {
    // @next/bundle-analyzer not installed, skip
  }
}

export default config