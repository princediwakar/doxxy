import type { Metadata } from 'next'
import Script from 'next/script';
import { getBlogPost, getBlogPosts } from "@/content/blog";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Calendar, User, Clock, ArrowLeft, Share2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import SiteFooter from "@/components/SiteFooter";
import SignupCTA from "@/components/SignupCTA";
import ReactMarkdown from "react-markdown";
import { APP_URL } from "@/lib/constants";

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
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
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
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              <span>{Math.ceil(post.content.length / 1000)} min read</span>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative h-64 md:h-96 rounded-3xl overflow-hidden mb-12">
            <img
              src={post.heroImage}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Article Content */}
      <section className="px-6 lg:px-8 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>

          {/* Share Section */}
          <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300 font-medium">Share this article</span>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" size="sm">
                  Twitter
                </Button>
                <Button variant="outline" size="sm">
                  LinkedIn
                </Button>
                <Button variant="outline" size="sm">
                  Copy Link
                </Button>
              </div>
            </div>
          </div>

          {/* Author Bio */}
          <div className="mt-16 p-8 bg-gray-50 dark:bg-gray-800 rounded-3xl">
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                <User className="w-8 h-8 text-gray-500 dark:text-gray-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  About {post.author}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {post.author} is a healthcare technology expert with over a decade of experience
                  in practice management, telemedicine, and digital health innovation. They regularly
                  contribute insights on improving clinical workflows and patient outcomes through
                  technology.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Articles */}
      <section className="px-6 lg:px-8 pb-20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-10 text-center">
            More from Doxxy Blog
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* We'll implement related articles later */}
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <p>More articles coming soon...</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <SignupCTA />

      {/* Footer */}
      <SiteFooter />
      <Script
        id="article-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleStructuredData) }}
      />
    </div>
  );
}