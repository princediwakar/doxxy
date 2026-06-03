// Path: app/(public)/blog/author/[author]/page.tsx

import { getBlogPosts, getExcerpt } from "@/content/blog";
import Link from "next/link";
import { Calendar, Clock, ArrowRight, ArrowLeft, User } from "lucide-react";
import SignupCTA from "@/components/SignupCTA";
import BreadcrumbJsonLd from "@/components/SEO/BreadcrumbJsonLd";
import { Section } from "@/components/ui/section-headers";
import { APP_URL } from "@/lib/constants";
import type { Metadata } from "next";
import Script from "next/script";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

interface AuthorPageProps {
  params: Promise<{ author: string }>;
}

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  const authors = new Set<string>();
  for (const post of posts) {
    if (post.author) {
      authors.add(slugify(post.author));
    }
  }
  return Array.from(authors).map((author) => ({ author }));
}

export async function generateMetadata({ params }: AuthorPageProps): Promise<Metadata> {
  const { author } = await params;
  const decodedAuthor = decodeURIComponent(author);
  const posts = await getBlogPosts();
  const matchingPosts = posts.filter(
    (p) => p.author && slugify(p.author) === decodedAuthor
  );

  const displayName =
    matchingPosts[0]?.author ||
    decodedAuthor.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const count = matchingPosts.length;

  return {
    title: `${displayName} — Doxxy Blog`,
    description: `Read ${count} article${count !== 1 ? "s" : ""} by ${displayName} on the Doxxy Blog. Expert insights on healthcare practice management.`,
    alternates: {
      canonical: `/blog/author/${decodedAuthor}`,
    },
    openGraph: {
      title: `${displayName} — Doxxy Blog`,
      description: `${count} article${count !== 1 ? "s" : ""} by ${displayName}`,
    },
  };
}

export default async function AuthorPage({ params }: AuthorPageProps) {
  const { author } = await params;
  const decodedAuthor = decodeURIComponent(author);
  const posts = await getBlogPosts();
  const matchingPosts = posts
    .filter((p) => p.author && slugify(p.author) === decodedAuthor)
    .sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());

  const displayName =
    matchingPosts[0]?.author ||
    decodedAuthor.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const count = matchingPosts.length;

  const profilePageSchema = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name: `${displayName} — Doxxy Blog`,
    description: `Articles by ${displayName} on the Doxxy Blog`,
    mainEntity: {
      "@type": "Person",
      name: displayName,
    },
    hasPart: matchingPosts.map((p) => ({
      "@type": "BlogPosting",
      url: `${APP_URL}/blog/${p.slug}`,
      headline: p.title,
      datePublished: p.publishDate,
    })),
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      {/* Back Navigation */}
      <div className="pt-8 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to all articles
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 px-6 lg:px-8">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-blue-100/60 dark:from-blue-900/20 to-transparent rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6 shadow-lg shadow-blue-500/20">
            {displayName.startsWith(decodedAuthor) && matchingPosts.length === 0 ? (
              <User className="w-10 h-10" />
            ) : (
              displayName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()
            )}
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
            {displayName}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow-sm border border-gray-200 dark:border-gray-700 text-blue-600 dark:text-blue-400 font-semibold">
              {count} {count === 1 ? "Article" : "Articles"}
            </span>
          </p>
        </div>
      </section>

      {/* Posts Grid or Empty State */}
      {matchingPosts.length === 0 ? (
        <Section>
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">
              No posts by this author yet.
            </p>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Browse all articles
            </Link>
          </div>
        </Section>
      ) : (
        <Section>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {matchingPosts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="group/card block">
                <article className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-2xl hover:shadow-gray-200/50 dark:hover:shadow-gray-900/50 transition-all duration-300 h-full flex flex-col">
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={post.heroImage}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300" />
                    <div className="absolute top-4 left-4">
                      <span className="inline-block px-3 py-1 bg-gray-900/80 backdrop-blur-sm text-white text-xs font-medium rounded-full">
                        {post.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mb-4">
                      <Calendar className="w-4 h-4" />
                      {new Date(post.publishDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                      <span className="mx-0.5">&middot;</span>
                      <Clock className="w-4 h-4" />
                      {post.readTime}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover/card:text-blue-600 dark:group-hover/card:text-blue-400 transition-colors leading-snug">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-5 line-clamp-3 text-sm leading-relaxed flex-1">
                      {getExcerpt(post.content, 140)}
                    </p>
                    <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white text-xs font-bold">
                        {post.author
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {post.author}
                      </span>
                      <span className="ml-auto text-blue-600 dark:text-blue-400 font-medium text-sm flex items-center gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity">
                        Read
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </Section>
      )}

      {/* CTA Section */}
      <SignupCTA
        heading={`Enjoying ${displayName}'s articles? See Doxxy in Action.`}
        description="All the advice, plus the software that makes it easy. Chat with us on WhatsApp for a quick demo tailored to your clinic."
      />

      <Script
        id="profile-page-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(profilePageSchema) }}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: APP_URL },
          { name: "Blog", url: `${APP_URL}/blog` },
          { name: displayName, url: `${APP_URL}/blog/author/${decodedAuthor}` },
        ]}
      />
    </div>
  );
}
