import { getBlogPosts } from "@/content/blog";
import Link from "next/link";
import { Calendar, User, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import SiteFooter from "@/components/SiteFooter";
import SignupCTA from "@/components/SignupCTA";
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white mb-6">
              Doxxy Blog
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-10">
              Insights, best practices, and thought leadership on healthcare practice management,
              telemedicine, revenue cycle optimization, and the future of digital health.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Post */}
      {posts.length > 0 && posts[0].featured && (
        <section className="px-6 lg:px-8 mb-20">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
              <div className="grid md:grid-cols-2 gap-8 p-8">
                <div className="relative h-64 md:h-full rounded-2xl overflow-hidden">
                  <img
                    src={posts[0].heroImage}
                    alt={posts[0].title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="inline-block px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-full">
                      Featured
                    </span>
                  </div>
                </div>
                <div className="flex flex-col justify-center">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-sm font-medium rounded-full">
                      {posts[0].category}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(posts[0].publishDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    {posts[0].title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-6 line-clamp-3">
                    {posts[0].content.substring(0, 200)}...
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      <span className="text-gray-700 dark:text-gray-300">{posts[0].author}</span>
                    </div>
                    <Link href={`/blog/${posts[0].slug}`}>
                      <Button className="gap-2">
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
      <section className="px-6 lg:px-8 mb-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <article
                key={post.slug}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="relative h-48">
                  <img
                    src={post.heroImage}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="inline-block px-3 py-1 bg-gray-800/80 backdrop-blur-sm text-white text-sm font-medium rounded-full">
                      {post.category}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(post.publishDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {post.readTime}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                    {post.content.substring(0, 150)}...
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{post.author}</span>
                    </div>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm flex items-center gap-1"
                    >
                      Read more
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <SignupCTA />

      {/* Footer */}
      <SiteFooter />
    </div>
  );
}