import { readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { logger } from "@/lib/logger";
// app/sitemap.ts
import { MetadataRoute } from "next";
import { getBlogPosts } from "@/content/blog";
import { getKBArticles } from "@/content/kb";
import { APP_URL } from "@/lib/constants";
import { specialtySlugs } from "@/config/specialties";
import { citySlugs } from "@/config/cities";

const BASE_URL = APP_URL;
const PUBLIC_DIR = join(process.cwd(), "app", "(public)");

// Overrides for non-default sitemap metadata.
// Everything else gets priority 0.7, monthly, lastModified = build time.
const PRIORITY: Record<string, number> = {
  "/": 1.0,
  "/features": 0.9,
  "/pricing": 0.9,
  "/india-clinic-digitization-guide": 0.9,
  "/privacy": 0.5,
  "/terms": 0.5,
  "/cities/mumbai": 0.8,
  "/cities/delhi": 0.8,
  "/cities/bangalore": 0.8,
  "/cities/pune": 0.8,
  "/cities/hyderabad": 0.8,
  "/cities/chennai": 0.8,
};

const CHANGE_FREQ: Record<string, MetadataRoute.Sitemap[number]["changeFrequency"]> = {
  "/": "weekly",
  "/privacy": "yearly",
  "/terms": "yearly",
};

const LASTMOD: Record<string, Date> = {
  "/about": new Date("2026-03-15"),
  "/contact": new Date("2026-03-15"),
  "/faq": new Date("2026-03-15"),
  "/security": new Date("2026-01-20"),
  "/privacy": new Date("2026-01-15"),
  "/terms": new Date("2026-01-15"),
};

const DEFAULTS = {
  priority: 0.7,
  changeFrequency: "monthly" as const,
};

function discoverStaticRoutes(dir: string, basePath = ""): string[] {
  const routes: string[] = [];

  if (existsSync(join(dir, "page.tsx"))) {
    routes.push(basePath || "/");
  }

  let entries: ReturnType<typeof readdirSync>;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return routes;
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith("[")) continue;
    if (basePath === "" && (entry.name === "blog" || entry.name === "help")) continue;

    const segment = entry.name;
    const nextPath = basePath ? `${basePath}/${segment}` : `/${segment}`;
    routes.push(...discoverStaticRoutes(join(dir, entry.name), nextPath));
  }

  return routes;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = discoverStaticRoutes(PUBLIC_DIR);
  const specialtyRoutes = specialtySlugs.map((slug) => `/specialties/${slug}`);
  const cityRoutes = citySlugs.map((slug) => `/cities/${slug}`);
  const allRoutes = [...staticRoutes, ...specialtyRoutes, ...cityRoutes];

  const publicRoutes: MetadataRoute.Sitemap = allRoutes.map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: LASTMOD[path] ?? new Date(),
    changeFrequency: CHANGE_FREQ[path] ?? DEFAULTS.changeFrequency,
    priority: PRIORITY[path] ?? DEFAULTS.priority,
  }));

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
    logger.error("Error fetching blog posts for sitemap:", error);
  }

  let helpArticles: MetadataRoute.Sitemap = [];
  try {
    const articles = await getKBArticles();
    helpArticles = articles.map((article) => ({
      url: `${BASE_URL}/help/${article.category}/${article.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    }));
  } catch (error) {
    logger.error("Error fetching help articles for sitemap:", error);
  }

  return [...publicRoutes, ...blogPosts, ...helpArticles];
}
