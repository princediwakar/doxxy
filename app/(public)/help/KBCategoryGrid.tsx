import type { KBArticle } from "@/content/kb";
import Link from "next/link";
import { Stethoscope, Users, Shield, ArrowRight, SearchX } from "lucide-react";

export interface GroupedArticles {
  category: string;
  articles: KBArticle[];
}

const CATEGORY_CONFIG: Record<
  string,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badgeClasses: string;
    iconColor: string;
  }
> = {
  doctor: {
    label: "Doctor",
    icon: Stethoscope,
    badgeClasses:
      "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  staff: {
    label: "Staff",
    icon: Users,
    badgeClasses:
      "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  superadmin: {
    label: "Administrator",
    icon: Shield,
    badgeClasses:
      "bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300",
    iconColor: "text-purple-600 dark:text-purple-400",
  },
};

interface KBCategoryGridProps {
  grouped: GroupedArticles[];
  search?: string;
}

export default function KBCategoryGrid({ grouped, search }: KBCategoryGridProps) {
  if (grouped.length === 0) {
    return (
      <div className="text-center py-20">
        <SearchX className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No articles matching &ldquo;{search}&rdquo;
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Try a different search term or browse the categories below.
        </p>
        <Link
          href="/help"
          className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          Clear search
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {grouped.map(({ category, articles }) => {
        const config = CATEGORY_CONFIG[category];
        if (!config) return null;

        const Icon = config.icon;

        return (
          <section key={category}>
            <div className="flex items-center gap-3 mb-5">
              <div
                className={`p-2 rounded-lg ${config.iconColor} bg-gray-100 dark:bg-gray-800`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {config.label}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {articles.length} {articles.length === 1 ? "article" : "articles"}
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => (
                <Link
                  key={article.slug}
                  href={`/help/${category}/${article.slug}`}
                  className="group block p-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
                      {article.title}
                    </h3>
                    <ArrowRight className="h-4 w-4 flex-shrink-0 mt-0.5 text-gray-300 dark:text-gray-600 group-hover:text-blue-500 transition-colors" />
                  </div>
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                    {article.description}
                  </p>
                  <span
                    className={`inline-block mt-3 text-xs px-2 py-0.5 rounded-full ${config.badgeClasses}`}
                  >
                    {article.role}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
