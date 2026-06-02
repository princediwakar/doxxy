import type { Metadata } from 'next'
import Script from 'next/script';
import { getBlogPost, getBlogPosts } from "@/content/blog";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Calendar, User, Clock, ArrowLeft, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import SignupCTA from "@/components/SignupCTA";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { APP_URL } from "@/lib/constants";
import { ShareButtons } from "./ShareButtons";
import { ReadingProgress } from "@/components/ReadingProgress";
import BreadcrumbJsonLd from "@/components/SEO/BreadcrumbJsonLd";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    return {
      title: 'Blog Post Not Found',
      description: 'The requested blog post could not be found.',
    };
  }

  // Create description from content (first 160 chars)
  const contentPreview = post.content.replace(/[\n#*`]/g, ' ').substring(0, 160).trim() + '...';

  return {
    title: `${post.title} - Doxxy Blog`,
    description: contentPreview,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: contentPreview,
      type: 'article',
      publishedTime: post.publishDate,
      authors: [post.author],
      images: post.heroImage ? [
        {
          url: post.heroImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ] : [],
    },
    keywords: [post.category || 'healthcare', 'healthcare', 'clinic management', 'blog'].filter(Boolean),
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  const baseUrl = APP_URL;

  if (!post) {
    notFound();
  }

  const articleStructuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.content.replace(/[\n#*`]/g, ' ').substring(0, 160).trim() + '...',
    "image": post.heroImage ? [post.heroImage as string] : [],
    "datePublished": post.publishDate,
    "dateModified": post.publishDate,
    "author": {
      "@type": "Person",
      "name": post.author
    },
    "publisher": {
      "@type": "Organization",
      "name": "Doxxy",
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/doxxy.png`
      }
    },
    ...(post.references?.length ? {
      "citation": post.references.map((ref) => ({
        "@type": "CreativeWork",
        "name": ref.title,
        "url": ref.url,
      })),
    } : {}),
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      <ReadingProgress />

      {/* Back Navigation */}
      <div className="pt-8 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to all articles
          </Link>
        </div>
      </div>

      {/* Article Header */}
      <section className="pt-12 pb-16 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <span className="inline-block px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-sm font-medium rounded-full">
              {post.category}
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white mb-6">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 mb-8 text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5" />
              <span className="font-medium">{post.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <span>
                {new Date(post.publishDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span>{post.readTime}</span>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative h-64 md:h-[28rem] rounded-3xl overflow-hidden mb-12 shadow-2xl">
            <img
              src={post.heroImage}
              alt={post.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          </div>
        </div>
      </section>

      {/* Article Content */}
      <section className="px-6 lg:px-8 pb-20">
        <div className="max-w-4xl mx-auto">
          <article className="prose prose-lg lg:prose-xl prose-gray dark:prose-invert max-w-none
            prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-gray-900 dark:prose-headings:text-white
            prose-h2:text-2xl md:prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
            prose-h3:text-xl md:prose-h3:text-2xl prose-h3:mt-10 prose-h3:mb-4
            prose-p:leading-relaxed prose-p:text-gray-700 dark:prose-p:text-gray-300
            prose-blockquote:border-l-blue-500 prose-blockquote:bg-blue-50/50 dark:prose-blockquote:bg-blue-950/20 prose-blockquote:py-3 prose-blockquote:px-6 prose-blockquote:rounded-r-xl prose-blockquote:not-italic prose-blockquote:text-gray-700 dark:prose-blockquote:text-gray-300
            prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
            prose-img:rounded-2xl prose-img:shadow-lg
            prose-li:text-gray-700 dark:prose-li:text-gray-300
            prose-strong:text-gray-900 dark:prose-strong:text-white
            prose-hr:border-gray-200 dark:prose-hr:border-gray-700
          ">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
          </article>

          {/* Share Section */}
          <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300 font-medium">Share this article</span>
              </div>
              <ShareButtons title={post.title} slug={post.slug} />
            </div>
          </div>

          {/* References */}
          {post.references && post.references.length > 0 && (
            <div className="mt-16 p-8 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                References & Further Reading
              </h3>
              <ul className="space-y-2">
                {post.references.map((ref, i) => (
                  <li key={i} className="text-sm">
                    <a
                      href={ref.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {ref.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Author Bio */}
          <div className="mt-16 p-8 bg-gradient-to-br from-gray-50 to-blue-50/50 dark:from-gray-800 dark:to-blue-950/20 rounded-3xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold shrink-0 shadow-lg shadow-blue-500/20">
                {post.author.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Written by {post.author}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Healthcare technology expert with over a decade of experience in practice management,
                  telemedicine, and digital health innovation. Regular contributor to industry publications
                  on clinical workflow optimization and patient-centered technology.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Articles */}
      <RelatedArticles currentSlug={post.slug} />

      {/* CTA Section */}
      <SignupCTA
        heading="Liked This Article? There's a Tool That Makes It Easy."
        description="Doxxy turns the advice you just read into one-click workflows. Chat with us on WhatsApp to see how."
      />

      <Script
        id="article-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleStructuredData) }}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: baseUrl },
          { name: "Blog", url: `${baseUrl}/blog` },
          { name: post.title, url: `${baseUrl}/blog/${post.slug}` },
        ]}
      />
    </div>
  );
}

async function RelatedArticles({ currentSlug }: { currentSlug: string }) {
  const posts = await getBlogPosts();
  const related = posts.filter((p) => p.slug !== currentSlug).slice(0, 3);

  if (related.length === 0) return null;

  return (
    <section className="px-6 lg:px-8 pb-20">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-10 text-center">
          More from Doxxy Blog
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {related.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={post.heroImage}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4">
                  <span className="inline-block px-3 py-1 bg-gray-800/80 backdrop-blur-sm text-white text-xs font-medium rounded-full">
                    {post.category}
                  </span>
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
                  <Calendar className="w-4 h-4" />
                  {new Date(post.publishDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                  <span className="mx-1">·</span>
                  <Clock className="w-4 h-4" />
                  {post.readTime}
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {post.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}