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
  const cases = getAllContent("cases", safeLocale)
  const description = dict?.cases?.description || cases[0]?.excerpt || "Кейси автоматизації бізнесу"

  return {
    title: dict?.cases?.title || "Кейси",
    description,
    alternates: { canonical: `https://crmcustoms.com/${safeLocale}/cases` },
    openGraph: {
      title: dict?.cases?.title || "Кейси",
      description,
      type: "website",
      locale: safeLocale,
      images: cases[0]?.image ? [{ url: cases[0].image }] : undefined,
    },
  }
}

export default async function CasesPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const safeLocale = i18n.locales.includes(lang) ? lang : i18n.defaultLocale
  const cases = getAllContent("cases", safeLocale)

  return (
    <section id="cases" className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-2">Кейси автоматизації бізнесу</h1>
        <p className="text-lg mb-8 text-gray-600">Реальні приклади впровадження CRM та автоматизації бізнес-процесів.</p>
        <ContentList
          items={cases}
          basePath={`/${safeLocale}/cases`}
          emptyTitle="Кейси не знайдені"
          emptyText="Скоро тут з'являться нові кейси."
        />
      </div>
    </section>
  )
}
