import type { Metadata } from "next";
import { getKBArticles, getKBCategories } from "@/content/kb";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Stethoscope, Users, Shield } from "lucide-react";
import KBArticleSearch from "../KBArticleSearch";
import KBCategoryGrid from "../KBCategoryGrid";
import { Suspense } from "react";

const CATEGORY_CONFIG: Record<
  string,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
  }
> = {
  doctor: {
    label: "Doctor",
    icon: Stethoscope,
    description: "Guides for consultations, prescriptions, and patient encounters.",
  },
  staff: {
    label: "Staff",
    icon: Users,
    description: "Guides for front desk, patient registration, invoicing, and pharmacy.",
  },
  superadmin: {
    label: "Administrator",
    icon: Shield,
    description: "Guides for clinic setup, staff management, financials, and analytics.",
  },
};

interface KBCategoryPageProps {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ search?: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const config = CATEGORY_CONFIG[category];
  if (!config) return { title: "Not Found — Doxxy Help" };

  return {
    title: `${config.label} Articles — Doxxy Help`,
    description: config.description,
  };
}

export default async function KBCategoryPage({
  params,
  searchParams,
}: KBCategoryPageProps) {
  const { category } = await params;
  const { search } = await searchParams;
  const categories = await getKBCategories();

  if (!categories.includes(category)) {
    notFound();
  }

  const config = CATEGORY_CONFIG[category];
  const Icon = config.icon;

  const articles = await getKBArticles(category);

  const filtered = search
    ? articles.filter(
        (a) =>
          a.title.toLowerCase().includes(search.toLowerCase()) ||
          a.description.toLowerCase().includes(search.toLowerCase()),
      )
    : articles;

  const grouped = filtered.length > 0 ? [{ category, articles: filtered }] : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="pt-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <Link
            href="/help"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            All articles
          </Link>
        </div>
      </div>

      <section className="pt-8 pb-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
                <Icon className="h-6 w-6" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-3">
              {config.label} Articles
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              {config.description}
            </p>
            <div className="flex justify-center">
              <Suspense fallback={null}>
                <KBArticleSearch
                  initialSearch={search}
                  placeholder={`Search ${config.label.toLowerCase()} articles...`}
                />
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
