/** @type {import('next').NextConfig} */

import withBundleAnalyzer from '@next/bundle-analyzer'

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/",
        destination: "/schedule",
        permanent: false,
      },
      {
        source: "/consultation/:id",
        destination: "/schedule?selectedAppointment=:id",
        permanent: false,
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

export default bundleAnalyzer(nextConfig)