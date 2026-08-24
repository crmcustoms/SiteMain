import { Metadata } from "next"
import { getDictionary } from "@/lib/dictionaries"
import { getAllContent } from "@/lib/content"
import { ContentList } from "@/components/content-list"
import { i18n } from "@/lib/i18n-config"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params
  const safeLocale = i18n.locales.includes(lang) ? lang : i18n.defaultLocale
  const dict = await getDictionary(safeLocale).catch(() => ({} as any))
  const articles = getAllContent("blog", safeLocale)
  const description = dict?.blog?.description || articles[0]?.excerpt || "Блог про автоматизацію бізнесу"

  return {
    title: dict?.blog?.title || "Блог",
    description,
    alternates: { canonical: `https://crmcustoms.com/${safeLocale}/blog` },
    openGraph: {
      title: dict?.blog?.title || "Блог",
      description,
      type: "website",
      locale: safeLocale,
      images: articles[0]?.image ? [{ url: articles[0].image }] : undefined,
    },
  }
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const safeLocale = i18n.locales.includes(lang) ? lang : i18n.defaultLocale
  const articles = getAllContent("blog", safeLocale)

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-2">Блог про автоматизацію бізнесу</h1>
        <p className="text-lg mb-8 text-gray-600">Корисні статті, поради та приклади автоматизації бізнес-процесів.</p>
        <ContentList
          items={articles}
          basePath={`/${safeLocale}/blog`}
          emptyTitle="Статті не знайдені"
          emptyText="Скоро тут з'являться нові статті."
        />
      </div>
    </section>
  )
}
