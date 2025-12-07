import { MetadataRoute } from "next";

// Base URL - should match your production domain
const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://doxxy.neurovisionhospital.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Disallow authenticated app routes
      disallow: [
        "/dashboard",
        "/patients",
        "/appointments",
        "/consultation/",
        "/settings",
        "/profile",
        "/billing",
        "/auth",
      ],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
