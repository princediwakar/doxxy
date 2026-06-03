// app/robots.ts
import { MetadataRoute } from "next";
import { APP_URL } from "@/lib/constants";

const BASE_URL = APP_URL;

const AUTHED_DISALLOW = [
  "/schedule",
  "/clinic/",
  "/consultation/",
  "/profile",
  "/pharmacy",
  "/complete-profile",
  "/create-clinic",
  "/analytics",
  "/overview",
  "/patients",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "OAI-SearchBot",
        allow: "/",
        disallow: AUTHED_DISALLOW,
      },
      {
        userAgent: "PerplexityBot",
        allow: "/",
        disallow: AUTHED_DISALLOW,
      },
      {
        userAgent: "GPTBot",
        disallow: "/",
      },
      {
        userAgent: "ClaudeBot",
        disallow: "/",
      },
      {
        userAgent: "*",
        allow: "/",
        disallow: AUTHED_DISALLOW,
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
