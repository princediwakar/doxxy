import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useParams, Link, Navigate } from "react-router-dom";
import { blogPosts, BlogPost as BlogPostType } from "@/content/blog";
import { ArrowRight } from "lucide-react";
import { useEffect } from "react";
import SiteFooter from "@/components/SiteFooter";
import ReactMarkdown from "react-markdown";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = blogPosts.find((p) => p.slug === slug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!post) {
    return <Navigate to="/not-found" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      
      <article className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <header className="mb-12 text-center">
          <Badge variant="outline" className="mb-4 px-4 py-2">
            {post.category}
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            {post.title}
          </h1>
          <p className="text-muted-foreground mb-6">
            By {post.author} • {new Date(post.publishDate).toLocaleDateString()} • {post.readTime}
          </p>
          <img
            src={post.heroImage}
            alt={post.title}
            className="rounded-lg shadow-lg w-full mb-8"
          />
        </header>
        <div className="prose lg:prose-xl max-w-none mx-auto mb-16 text-foreground">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>

        {/* CTA Section */}
        <section className="py-16 border-t border-border text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Ready to Transform Your Practice?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of healthcare professionals who trust Doxxy to manage
            their clinics efficiently and securely.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90" asChild>
              <Link to="/auth">
                Setup your Practice <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/contact">Schedule Demo</Link>
            </Button>
          </div>
        </section>
      </article>
      <SiteFooter />
    </div>
  );
};

export default BlogPost; 