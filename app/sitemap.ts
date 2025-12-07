import { MetadataRoute } from "next";
import { getBlogPosts } from "@/content/blog";

// Base URL - should match your production domain
// You can also make this configurable via environment variables
const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://doxxy.neurovisionhospital.com";

// Configuration for public routes with their metadata
// This makes it easier to maintain and update
const PUBLIC_ROUTES_CONFIG = [
  {
    path: "/",
    priority: 1.0,
    changeFrequency: "weekly" as const,
  },
  {
    path: "/about",
    priority: 0.8,
    changeFrequency: "monthly" as const,
  },
  {
    path: "/contact",
    priority: 0.7,
    changeFrequency: "monthly" as const,
  },
  {
    path: "/features",
    priority: 0.9,
    changeFrequency: "monthly" as const,
  },
  {
    path: "/pricing",
    priority: 0.9,
    changeFrequency: "monthly" as const,
  },
  {
    path: "/faq",
    priority: 0.7,
    changeFrequency: "monthly" as const,
  },
  {
    path: "/security",
    priority: 0.8,
    changeFrequency: "monthly" as const,
  },
  {
    path: "/privacy",
    priority: 0.5,
    changeFrequency: "yearly" as const,
  },
  {
    path: "/terms",
    priority: 0.5,
    changeFrequency: "yearly" as const,
  },
  {
    path: "/comparisons",
    priority: 0.8,
    changeFrequency: "monthly" as const,
  },
  {
    path: "/comparisons/doxxy-vs-practo",
    priority: 0.7,
    changeFrequency: "monthly" as const,
  },
  {
    path: "/comparisons/doxxy-vs-clinicplus",
    priority: 0.7,
    changeFrequency: "monthly" as const,
  },
  {
    path: "/comparisons/doxxy-vs-lybrate",
    priority: 0.7,
    changeFrequency: "monthly" as const,
  },
  {
    path: "/comparisons/doxxy-vs-mfine",
    priority: 0.7,
    changeFrequency: "monthly" as const,
  },
  {
    path: "/comparisons/doxxy-vs-eka-care",
    priority: 0.7,
    changeFrequency: "monthly" as const,
  },
  {
    path: "/comparisons/eka-care-alternative",
    priority: 0.7,
    changeFrequency: "monthly" as const,
  },
  {
    path: "/blog",
    priority: 0.8,
    changeFrequency: "weekly" as const,
  },
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Generate public routes from configuration
  const publicRoutes: MetadataRoute.Sitemap = PUBLIC_ROUTES_CONFIG.map(
    (route) => ({
      url: `${BASE_URL}${route.path}`,
      lastModified: new Date(),
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })
  );

  // Fetch blog posts dynamically
  let blogPosts: MetadataRoute.Sitemap = [];
  try {
    const posts = await getBlogPosts();
    blogPosts = posts.map((post) => ({
      url: `${BASE_URL}/blog/${post.slug}`,
      lastModified: new Date(post.publishDate),
      changeFrequency: "yearly" as const,
      priority: 0.6,
    }));
  } catch (error) {
    console.error("Error fetching blog posts for sitemap:", error);
    // Continue without blog posts if there's an error
  }

  // Return all routes
  return [...publicRoutes, ...blogPosts];
}
