import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getAllContent, getContentBySlug } from "@/lib/content"
import { ArticleRenderer } from "@/components/article-renderer"
import { i18n } from "@/lib/i18n-config"

export async function generateStaticParams() {
  return i18n.locales.flatMap((lang) =>
    getAllContent("blog", lang).map((entry) => ({ lang, slug: entry.slug })),
  )
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>
}): Promise<Metadata> {
  const { lang, slug } = await params
  const safeLocale = i18n.locales.includes(lang) ? lang : i18n.defaultLocale
  const article = getContentBySlug("blog", safeLocale, slug)

  if (!article) {
    return { title: "Статтю не знайдено" }
  }

  const canonical = `https://crmcustoms.com/${safeLocale}/blog/${article.slug}`

  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: "article",
      url: canonical,
      publishedTime: article.date || undefined,
      images: article.image ? [{ url: article.image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt,
      images: article.image ? [article.image] : undefined,
    },
  }
}

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>
}) {
  const { lang, slug } = await params
  const safeLocale = i18n.locales.includes(lang) ? lang : i18n.defaultLocale
  const article = getContentBySlug("blog", safeLocale, slug)

  if (!article) {
    notFound()
  }

  return (
    <ArticleRenderer
      title={article.title}
      date={article.date}
      excerpt={article.excerpt}
      body={article.body}
      tag={article.tag}
      readTime={article.readTime}
      author={article.author}
      image={article.image}
      url={`https://crmcustoms.com/${safeLocale}/blog/${article.slug}`}
      ctaTitle={article.ctaTitle}
      ctaText={article.ctaText}
      ctaLabel={article.ctaLabel}
      ctaHref={article.ctaHref}
    />
  )
}
