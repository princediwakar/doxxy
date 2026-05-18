import type { Metadata } from "next";
import { getKBArticle, getKBArticles, getKBCategories } from "@/content/kb";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface KBArticlePageProps {
  params: Promise<{ category: string; slug: string }>;
}

export async function generateStaticParams() {
  const articles = await getKBArticles();
  return articles.map((article) => ({
    category: article.category,
    slug: article.slug,
  }));
}

export async function generateMetadata({
  params,
}: KBArticlePageProps): Promise<Metadata> {
  const { category, slug } = await params;
  const article = await getKBArticle(category, slug);

  if (!article) {
    return { title: "Article Not Found — Doxxy Help" };
  }

  return {
    title: `${article.title} — Doxxy Help`,
    description: article.description,
    openGraph: {
      title: article.title,
      description: article.description,
      type: "article",
    },
  };
}

export default async function KBArticlePage({ params }: KBArticlePageProps) {
  const { category, slug } = await params;
  const article = await getKBArticle(category, slug);
  const categories = await getKBCategories();

  if (!article) {
    notFound();
  }

  const categoryLabel = category.charAt(0).toUpperCase() + category.slice(1);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      {/* Back Navigation */}
      <div className="pt-8 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Link
            href={`/kb/${category}`}
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to {categoryLabel} articles
          </Link>
        </div>
      </div>

      {/* Article Header */}
      <section className="pt-8 pb-8 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-sm font-medium rounded-full">
              {categoryLabel}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {article.role}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
            {article.title}
          </h1>

          <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
            {article.description}
          </p>
        </div>
      </section>

      {/* Article Content */}
      <section className="px-6 lg:px-8 pb-20">
        <div className="max-w-4xl mx-auto">
          <article
            className="prose prose-lg lg:prose-xl prose-gray dark:prose-invert max-w-none
            prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-gray-900 dark:prose-headings:text-white
            prose-h2:text-xl md:prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
            prose-h3:text-lg md:prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
            prose-p:leading-relaxed prose-p:text-gray-700 dark:prose-p:text-gray-300
            prose-blockquote:border-l-blue-500 prose-blockquote:bg-blue-50/50 dark:prose-blockquote:bg-blue-950/20 prose-blockquote:py-3 prose-blockquote:px-6 prose-blockquote:rounded-r-xl prose-blockquote:not-italic
            prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
            prose-li:text-gray-700 dark:prose-li:text-gray-300
            prose-strong:text-gray-900 dark:prose-strong:text-white
            prose-table:border-collapse prose-th:border prose-th:border-gray-300 dark:prose-th:border-gray-600 prose-th:bg-gray-100 dark:prose-th:bg-gray-800 prose-th:px-4 prose-th:py-2 prose-td:border prose-td:border-gray-300 dark:prose-td:border-gray-600 prose-td:px-4 prose-td:py-2
            prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
            "
          >
            <ReactMarkdown>{article.content}</ReactMarkdown>
          </article>
        </div>
      </section>
    </div>
  );
}
