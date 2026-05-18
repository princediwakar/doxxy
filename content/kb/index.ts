import fm from "front-matter";
import fs from "fs/promises";
import path from "path";

interface KBFrontmatter {
  title: string;
  description: string;
  role: string;
  sortOrder: number;
}

export type KBArticle = KBFrontmatter & {
  content: string;
  slug: string;
  category: string;
};

const CATEGORY_PREFIX: Record<string, string> = {
  staff: "st",
  doctor: "dr",
  superadmin: "sa",
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function buildSlug(category: string, sortOrder: number, title: string): string {
  const prefix = CATEGORY_PREFIX[category] || category.substring(0, 2);
  return `${prefix}-${sortOrder}-${slugify(title)}`;
}

function parseSortOrderFromSlug(slug: string): number | null {
  const match = slug.match(/^[a-z]+-(\d+)/);
  if (!match) return null;
  return parseInt(match[1], 10);
}

export async function getKBArticles(category?: string): Promise<KBArticle[]> {
  const kbDir = path.join(process.cwd(), "content/kb");
  const articles: KBArticle[] = [];

  const categories = category
    ? [category]
    : await fs.readdir(kbDir).catch(() => []);

  for (const cat of categories) {
    const catDir = path.join(kbDir, cat);
    try {
      const files = await fs.readdir(catDir);
      const mdxFiles = files.filter((f) => f.endsWith(".mdx"));

      for (const file of mdxFiles) {
        const filePath = path.join(catDir, file);
        const rawContent = await fs.readFile(filePath, "utf-8");
        const { attributes: data, body: content } = fm(rawContent);
        const attrs = data as KBFrontmatter;

        articles.push({
          ...attrs,
          content,
          slug: buildSlug(cat, attrs.sortOrder, attrs.title),
          category: cat,
        });
      }
    } catch {
      // skip unreadable directories
    }
  }

  return articles.sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getKBArticle(
  category: string,
  slug: string,
): Promise<KBArticle | null> {
  const sortOrder = parseSortOrderFromSlug(slug);
  if (sortOrder === null) return null;

  const articles = await getKBArticles(category);
  return articles.find((a) => a.sortOrder === sortOrder) || null;
}

export async function getKBCategories(): Promise<string[]> {
  const kbDir = path.join(process.cwd(), "content/kb");
  const entries = await fs.readdir(kbDir, { withFileTypes: true }).catch(() => []);
  return entries.filter((e) => e.isDirectory()).map((e) => e.name);
}
