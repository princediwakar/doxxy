import { getBlogPosts, getExcerpt } from "@/content/blog";
import Link from "next/link";
import { Calendar, User, Clock, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import SignupCTA from "@/components/SignupCTA";
import BreadcrumbJsonLd from "@/components/SEO/BreadcrumbJsonLd";
import { APP_URL } from "@/lib/constants";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Doxxy Blog - Healthcare Practice Management Insights & Best Practices',
  description: 'Read insights, best practices, and thought leadership on healthcare practice management, telemedicine, revenue cycle optimization, and digital health.',
  alternates: {
    canonical: '/blog',
  },
  openGraph: {
    title: 'Doxxy Blog - Healthcare Practice Management Insights',
    description: 'Insights and best practices for healthcare practice management',
    images: [
      {
        url: '/doxxy.png',
        width: 1200,
        height: 630,
        alt: 'Doxxy Blog - Healthcare Practice Management',
      },
    ],
  },
  keywords: ['doxxy blog', 'healthcare practice management blog', 'medical practice insights', 'telemedicine best practices'],
}

export default async function BlogPage() {
  const posts = await getBlogPosts();
  const featuredPost = posts.find((p) => p.featured) ?? null;
  const regularPosts = featuredPost ? posts.filter((p) => p.slug !== featuredPost.slug) : posts;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-24 px-6 lg:px-8">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-blue-100/60 dark:from-blue-900/20 to-transparent rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-sm font-medium rounded-full mb-8">
              <Sparkles className="w-4 h-4" />
              Insights for modern healthcare practices
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white mb-6">
              The Doxxy Blog
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-6 leading-relaxed max-w-2xl mx-auto">
              Expert insights on practice management, telemedicine, revenue cycle optimization,
              compliance, and the technology shaping tomorrow's clinics.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Post */}
      {featuredPost && (
        <section className="px-6 lg:px-8 mb-24">
          <div className="max-w-7xl mx-auto">
            <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700 group/card">
              <div className="grid md:grid-cols-2">
                <div className="relative h-72 md:h-auto overflow-hidden">
                  <img
                    src={featuredPost.heroImage}
                    alt={featuredPost.title}
                    className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-6 left-6">
                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 text-white text-sm font-semibold rounded-full shadow-lg shadow-blue-600/20">
                      <Sparkles className="w-3.5 h-3.5" />
                      Featured
                    </span>
                  </div>
                </div>
                <div className="flex flex-col justify-center p-8 md:p-12">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-sm font-medium rounded-full">
                      {featuredPost.category}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      {new Date(featuredPost.publishDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <Link href={`/blog/${featuredPost.slug}`} className="group/title">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4 group-hover/title:text-blue-600 dark:group-hover/title:text-blue-400 transition-colors">
                      {featuredPost.title}
                    </h2>
                  </Link>
                  <p className="text-gray-600 dark:text-gray-300 mb-8 line-clamp-3 leading-relaxed">
                    {getExcerpt(featuredPost.content, 220)}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
                        {featuredPost.author.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <span className="block text-sm font-medium text-gray-900 dark:text-white">{featuredPost.author}</span>
                        <span className="block text-xs text-gray-500 dark:text-gray-400">{featuredPost.readTime}</span>
                      </div>
                    </div>
                    <Link href={`/blog/${featuredPost.slug}`}>
                      <Button size="lg" className="gap-2 rounded-xl">
                        Read Article
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* All Posts Grid */}
      <section className="px-6 lg:px-8 mb-24">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Latest Articles
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {regularPosts.map((post) => (
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
                      <span className="mx-0.5">·</span>
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
                        {post.author.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{post.author}</span>
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
        </div>
      </section>

      {/* CTA Section */}
      <SignupCTA />

      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: APP_URL },
          { name: "Blog", url: `${APP_URL}/blog` },
        ]}
      />
    </div>
  );
}
