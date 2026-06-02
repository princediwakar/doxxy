import fm from "front-matter";
import fs from "fs/promises";
import path from "path";

interface BlogFrontmatter {
  slug: string;
  title: string;
  author: string;
  publishDate: string;
  readTime?: string;
  category?: string;
  heroImage?: string;
  featured?: boolean;
  references?: { title: string; url: string }[];
}

export type BlogPost = BlogFrontmatter & {
  content: string;
};

// Define the front-matter attributes type
interface FrontMatterResult {
  attributes: BlogFrontmatter;
  body: string;
}

// Load all markdown files in this directory for Next.js
export async function getBlogPosts(): Promise<BlogPost[]> {
  const blogDir = path.join(process.cwd(), "content/blog");
  const files = await fs.readdir(blogDir);
  const markdownFiles = files.filter(file => file.endsWith(".md"));

  const posts: BlogPost[] = [];

  for (const file of markdownFiles) {
    const filePath = path.join(blogDir, file);
    const rawContent = await fs.readFile(filePath, "utf-8");
    const { attributes: data, body: content } = fm(rawContent) as FrontMatterResult;

    posts.push({
      ...data,
      content,
    } as BlogPost);
  }

  // Sort by publish date (newest first)
  return posts.sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());
}

// Get a single blog post by slug
export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const blogDir = path.join(process.cwd(), "content/blog");
  const filePath = path.join(blogDir, `${slug}.md`);

  try {
    const rawContent = await fs.readFile(filePath, "utf-8");
    const { attributes: data, body: content } = fm(rawContent) as FrontMatterResult;

    return {
      ...data,
      content,
    } as BlogPost;
  } catch (error) {
    console.error(`Error loading blog post ${slug}:`, error);
    return null;
  }
}

function stripMarkdown(md: string): string {
  return md
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\[([^\]]*)\]\(.*?\)/g, "$1")
    .replace(/[*_~`>]/g, "")
    .replace(/---+/g, "")
    .replace(/\n{2,}/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function getExcerpt(content: string, maxLen = 160): string {
  const clean = stripMarkdown(content);
  if (clean.length <= maxLen) return clean;
  return clean.substring(0, clean.lastIndexOf(" ", maxLen)) + "...";
}