import fm from "front-matter";

interface BlogFrontmatter {
  slug: string;
  title: string;
  author: string;
  publishDate: string;
  readTime?: string;
  category?: string;
  heroImage?: string;
  featured?: boolean;
}

export type BlogPost = BlogFrontmatter & {
  content: string;
};

// Define the front-matter attributes type
interface FrontMatterResult {
  attributes: BlogFrontmatter;
  body: string;
}

// Load all markdown files in this directory
const files = import.meta.glob("./*.md", { query: '?raw', import: 'default', eager: true });

export const blogPosts: BlogPost[] = Object.entries(files).map(([, raw]) => {
  const { attributes: data, body: content } = fm(raw as string) as FrontMatterResult;
  return {
    ...data,
    content,
  } as BlogPost;
}).sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()); 