import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getAllContent, getContentBySlug } from "@/lib/content"
import { ArticleRenderer } from "@/components/article-renderer"
import { i18n } from "@/lib/i18n-config"

export async function generateStaticParams() {
  return i18n.locales.flatMap((lang) =>
    getAllContent("cases", lang).map((entry) => ({ lang, slug: entry.slug })),
  )
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>
}): Promise<Metadata> {
  const { lang, slug } = await params
  const safeLocale = i18n.locales.includes(lang) ? lang : i18n.defaultLocale
  const caseItem = getContentBySlug("cases", safeLocale, slug)

  if (!caseItem) {
    return { title: "Кейс не знайдено" }
  }

  const canonical = `https://crmcustoms.com/${safeLocale}/cases/${caseItem.slug}`

  return {
    title: caseItem.title,
    description: caseItem.excerpt,
    alternates: { canonical },
    openGraph: {
      title: caseItem.title,
      description: caseItem.excerpt,
      type: "article",
      url: canonical,
      publishedTime: caseItem.date || undefined,
      images: caseItem.image ? [{ url: caseItem.image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: caseItem.title,
      description: caseItem.excerpt,
      images: caseItem.image ? [caseItem.image] : undefined,
    },
  }
}

export default async function CaseArticlePage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>
}) {
  const { lang, slug } = await params
  const safeLocale = i18n.locales.includes(lang) ? lang : i18n.defaultLocale
  const caseItem = getContentBySlug("cases", safeLocale, slug)

  if (!caseItem) {
    notFound()
  }

  return (
    <ArticleRenderer
      title={caseItem.title}
      date={caseItem.date}
      excerpt={caseItem.excerpt}
      body={caseItem.body}
      tag={caseItem.tag}
      readTime={caseItem.readTime}
      author={caseItem.author}
      image={caseItem.image}
      url={`https://crmcustoms.com/${safeLocale}/cases/${caseItem.slug}`}
      ctaTitle={caseItem.ctaTitle}
      ctaText={caseItem.ctaText}
      ctaLabel={caseItem.ctaLabel}
      ctaHref={caseItem.ctaHref}
    />
  )
}
