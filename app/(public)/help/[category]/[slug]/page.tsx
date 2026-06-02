import type { Metadata } from "next";
import Script from "next/script";
import { getKBArticle, getKBArticles, getKBCategories } from "@/content/kb";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import BreadcrumbJsonLd from "@/components/SEO/BreadcrumbJsonLd";
import { APP_URL } from "@/lib/constants";

interface HowToStep {
  name: string;
  text: string;
}

function extractHowToSteps(content: string): HowToStep[] {
  const stepsSection = content.match(/## Step-by-Step UI Instructions\n\n([\s\S]*?)(?=\n## |\n---|$)/);
  if (!stepsSection) return [];

  const stepsText = stepsSection[1];
  const stepRegex = /(\d+)\.\s+\*\*(.+?)\*\*\n([\s\S]*?)(?=\n\d+\.\s+\*\*|\n###|\n##|$)/g;
  const steps: HowToStep[] = [];

  let match;
  while ((match = stepRegex.exec(stepsText)) !== null) {
    const title = match[2].trim();
    const text = match[3]
      .replace(/^[\s-]*/g, "")
      .replace(/\*\*/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/\n+/g, " ")
      .trim()
      .substring(0, 300);

    if (title && text) {
      steps.push({ name: title, text });
    }
  }

  return steps;
}

const CATEGORY_LABELS: Record<string, string> = {
  doctor: "Doctor",
  staff: "Staff",
  superadmin: "Administrator",
};

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
    alternates: {
      canonical: `/help/${category}/${slug}`,
    },
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

  const categoryLabel = CATEGORY_LABELS[category] || category;
  const howToSteps = extractHowToSteps(article.content);

  const howToStructuredData = howToSteps.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: article.title,
    description: article.description,
    step: howToSteps.map((step, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: step.name,
      text: step.text,
    })),
  } : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      {/* Back Navigation */}
      <div className="pt-8 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Link
            href={`/help/${category}`}
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
            className="prose max-w-3xl prose-slate dark:prose-invert
            prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-gray-900 dark:prose-headings:text-white
            prose-h1:text-3xl
            prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-4
            prose-h3:text-lg prose-h3:mt-6
            prose-p:text-[15px] prose-p:leading-relaxed prose-p:text-gray-700 dark:prose-p:text-gray-300
            prose-li:text-[15px] prose-li:my-1 prose-li:text-gray-700 dark:prose-li:text-gray-300
            prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
            prose-strong:text-gray-900 dark:prose-strong:text-white
            prose-table:border-collapse prose-th:border prose-th:border-gray-300 dark:prose-th:border-gray-600 prose-th:bg-gray-100 dark:prose-th:bg-gray-800 prose-th:px-4 prose-th:py-2 prose-td:border prose-td:border-gray-300 dark:prose-td:border-gray-600 prose-td:px-4 prose-td:py-2
            prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
            prose-blockquote:border-l-blue-500 prose-blockquote:bg-blue-50/50 dark:prose-blockquote:bg-blue-950/20 prose-blockquote:py-3 prose-blockquote:px-6 prose-blockquote:rounded-r-xl prose-blockquote:not-italic
            "
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{article.content}</ReactMarkdown>
          </article>
        </div>
      </section>

      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: APP_URL },
          { name: "Help", url: `${APP_URL}/help` },
          { name: categoryLabel, url: `${APP_URL}/help/${category}` },
          { name: article.title, url: `${APP_URL}/help/${category}/${slug}` },
        ]}
      />
      {howToStructuredData && (
        <Script
          id="howto-structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(howToStructuredData) }}
        />
      )}
    </div>
  );
}
