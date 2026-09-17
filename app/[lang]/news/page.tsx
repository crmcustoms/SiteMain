import { Metadata } from "next"
import { getDictionary } from "@/lib/dictionaries"
import { getAllContent, ogImageUrl } from "@/lib/content"
import TypedStaticCases, { CasePost } from "@/components/landing/typed-static-cases"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { i18n } from "@/lib/i18n-config"
import { notFound } from "next/navigation"

const NEWS_CATEGORY = "Новини"

export async function generateMetadata({
  params
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const resolvedParams = await params;
  const paramsLang = resolvedParams.lang;
  const safeLocale = (paramsLang && i18n.locales.includes(paramsLang))
    ? paramsLang
    : i18n.defaultLocale;

  const dict = await getDictionary(safeLocale).catch(() => ({} as any));
  const description = dict?.news?.description || "Новини Planfix та CRM Customs.";

  return {
    title: dict?.news?.title || "Новини",
    description,
    alternates: { canonical: `https://crmcustoms.com/${safeLocale}/news` },
    openGraph: {
      title: dict?.news?.title || "Новини",
      description,
      type: "website",
      locale: safeLocale,
    },
  };
}

export default async function NewsPage({
  params
}: {
  params: Promise<{ lang: string }>
}) {
  const resolvedParams = await params;
  const paramsLang = resolvedParams.lang;
  // Валидируем locale явно — иначе /<любой-текст>/news рендерит дубликат этой страницы
  if (!paramsLang || !i18n.locales.includes(paramsLang)) {
    notFound();
  }
  const safeLocale = paramsLang;

  const posts: CasePost[] = getAllContent("news", safeLocale)
    .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())
    .map((entry) => ({
      id: entry.slug,
      title: entry.title,
      slug: entry.slug,
      excerpt: entry.excerpt,
      date: entry.date,
      image: entry.image || ogImageUrl(entry.title, entry.tag),
      tags: entry.tags || [],
      services: [] as string[],
      categories: entry.tag ? [entry.tag] : [NEWS_CATEGORY],
      likes: 0,
      comments: 0,
    }));

  return (
    <>
      <Breadcrumbs items={[{ label: 'Новини' }]} lang={safeLocale} />
      <TypedStaticCases
        casesData={posts}
        lang={safeLocale}
        pageType="news"
      />
    </>
  );
}
