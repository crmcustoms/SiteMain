import fs from "fs"
import path from "path"
import matter from "gray-matter"

export type ContentType = "blog" | "cases"

export interface ContentMeta {
  slug: string
  title: string
  date: string
  excerpt: string
  tag?: string
  tags?: string[]
  readTime?: string
  author?: string
  image?: string
}

export interface ContentEntry extends ContentMeta {
  body: string
  ctaTitle?: string
  ctaText?: string
  ctaLabel?: string
  ctaHref?: string
}

function contentDir(type: ContentType, locale: string) {
  return path.join(process.cwd(), "content", type, locale)
}

export function getAllContent(type: ContentType, locale: string): ContentEntry[] {
  const dir = contentDir(type, locale)
  if (!fs.existsSync(dir)) return []

  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const raw = fs.readFileSync(path.join(dir, file), "utf-8")
      const { data, content } = matter(raw)
      const slug = data.slug || file.replace(/\.md$/, "")

      return {
        slug,
        title: data.title || "",
        date: data.date || "",
        excerpt: data.excerpt || "",
        tag: data.tag,
        tags: data.tags || [],
        readTime: data.readTime,
        author: data.author || "CRMCUSTOMS",
        image: data.image,
        body: content,
        ctaTitle: data.ctaTitle,
        ctaText: data.ctaText,
        ctaLabel: data.ctaLabel,
        ctaHref: data.ctaHref,
      }
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getContentBySlug(type: ContentType, locale: string, slug: string): ContentEntry | null {
  return getAllContent(type, locale).find((entry) => entry.slug === slug) ?? null
}
