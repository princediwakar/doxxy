// app/robots.tsx
import { MetadataRoute } from "next";
import { APP_URL } from "@/lib/constants";

const BASE_URL = APP_URL;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Disallow authenticated app routes
      disallow: [
        "/schedule",
        "/clinic/",
        "/consultation/",
        "/profile",
        "/pharmacy",
        "/complete-profile",
        "/create-clinic",
      ],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
