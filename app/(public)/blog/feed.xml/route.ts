// Path: app/(public)/blog/feed.xml/route.ts
import { getBlogPosts, getExcerpt } from "@/content/blog";
import { APP_URL } from "@/lib/constants";

export async function GET() {
  const posts = await getBlogPosts();

  const items = posts
    .map(
      (post) => `    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${APP_URL}/blog/${post.slug}</link>
      <guid isPermaLink="true">${APP_URL}/blog/${post.slug}</guid>
      <description><![CDATA[${getExcerpt(post.content)}]]></description>
      <pubDate>${new Date(post.publishDate).toUTCString()}</pubDate>
      <author>${post.author}</author>
      ${post.category ? `<category>${post.category}</category>` : ""}
    </item>`
    )
    .join("\n");

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Doxxy Blog — Healthcare Practice Management Insights</title>
    <link>${APP_URL}/blog</link>
    <description>Insights, best practices, and thought leadership on healthcare practice management, telemedicine, and digital health for Indian clinics.</description>
    <language>en</language>
    <lastBuildDate>${posts[0] ? new Date(posts[0].publishDate).toUTCString() : ""}</lastBuildDate>
    <atom:link href="${APP_URL}/blog/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  return new Response(feed, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600",
    },
  });
}
