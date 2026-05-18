/** @type {import('next').NextConfig} */

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