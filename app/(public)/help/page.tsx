import type { Metadata } from "next";
import { getKBArticles } from "@/content/kb";
import KBArticleSearch from "./KBArticleSearch";
import KBCategoryGrid, { type GroupedArticles } from "./KBCategoryGrid";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Knowledge Base — Doxxy Help",
  description:
    "Browse help articles for doctors, staff, and administrators using Doxxy clinic management software.",
  alternates: {
    canonical: "/help",
  },
  openGraph: {
    title: "Knowledge Base — Doxxy Help",
    description:
      "Browse help articles for doctors, staff, and administrators using Doxxy.",
  },
};

const CATEGORY_ORDER = ["doctor", "staff", "superadmin"];

function filterAndGroup(
  articles: Awaited<ReturnType<typeof getKBArticles>>,
  search: string | undefined,
): GroupedArticles[] {
  const filtered = search
    ? articles.filter(
        (a) =>
          a.title.toLowerCase().includes(search.toLowerCase()) ||
          a.description.toLowerCase().includes(search.toLowerCase()),
      )
    : articles;

  const grouped: GroupedArticles[] = [];
  for (const cat of CATEGORY_ORDER) {
    const catArticles = filtered.filter((a) => a.category === cat);
    if (catArticles.length > 0) {
      grouped.push({ category: cat, articles: catArticles });
    }
  }
  return grouped;
}

export default async function KBLandingPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const { search } = await searchParams;
  const articles = await getKBArticles();
  const grouped = filterAndGroup(articles, search);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      <section className="pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
              Knowledge Base
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              Step-by-step guides for doctors, staff, and administrators using
              Doxxy.
            </p>
            <div className="flex justify-center">
              <Suspense fallback={null}>
                <KBArticleSearch initialSearch={search} />
              </Suspense>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <KBCategoryGrid grouped={grouped} search={search} />
        </div>
      </section>
    </div>
  );
}
