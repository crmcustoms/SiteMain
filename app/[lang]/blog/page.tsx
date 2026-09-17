import { Metadata } from "next"
import { getDictionary } from "@/lib/dictionaries"
import { getAllContent, ogImageUrl } from "@/lib/content"
import TypedStaticCases, { CasePost } from "@/components/landing/typed-static-cases"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { i18n } from "@/lib/i18n-config"
import { notFound } from "next/navigation"

// Динамическая генерация метаданных
export async function generateMetadata({
  params
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  // Получаем параметры безопасно с await
  const resolvedParams = await params;
  const paramsLang = resolvedParams.lang;
  const safeLocale = (paramsLang && i18n.locales.includes(paramsLang))
    ? paramsLang
    : i18n.defaultLocale;

  const dict = await getDictionary(safeLocale).catch(() => ({} as any));
  const articles = getAllContent("blog", safeLocale);

  const allKeywords = new Set<string>();
  articles.forEach((entry) => {
    if (entry.tag) allKeywords.add(entry.tag);
    (entry.tags || []).forEach((t) => allKeywords.add(t));
    if (entry.title) allKeywords.add(entry.title);
  });

  const description = dict?.blog?.description
    || articles[0]?.excerpt
    || "Блог компанії - корисні статті про автоматизацію бізнесу";

  return {
    title: dict?.blog?.title || "Блог",
    description,
    keywords: allKeywords.size > 0
      ? Array.from(allKeywords)
      : ["блог", "статті", "автоматизація", "бізнес", "CRM"],
    openGraph: {
      title: dict?.blog?.title || "Блог",
      description,
      type: "website",
      locale: safeLocale,
      images: articles[0]
        ? [{ url: articles[0].image || ogImageUrl(articles[0].title, articles[0].tag) }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: dict?.blog?.title || "Блог",
      description,
    },
  };
}

export default async function BlogPage({
  params
}: {
  params: Promise<{ lang: string }>
}) {
  // Получаем параметры безопасно с await
  const resolvedParams = await params;
  const paramsLang = resolvedParams.lang;
  // force-dynamic обходит dynamicParams=false родительского layout — валидируем locale явно,
  // иначе /<любой-текст>/blog рендерит дубликат этой страницы (см. wiki/sitemain.md SEO раздел)
  if (!paramsLang || !i18n.locales.includes(paramsLang)) {
    notFound();
  }
  const safeLocale = paramsLang;

  const posts: CasePost[] = getAllContent("blog", safeLocale)
    .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())
    .map((entry) => ({
      id: entry.slug,
      title: entry.title,
      slug: entry.slug,
      excerpt: entry.excerpt,
      date: entry.date,
      image: entry.image || "/placeholder.svg",
      tags: entry.tags || [],
      services: [] as string[],
      categories: entry.tag ? [entry.tag] : [],
      likes: 0,
      comments: 0,
    }));

  return (
    <>
      <Breadcrumbs items={[{ label: 'Блог' }]} lang={safeLocale} />
      <TypedStaticCases
        casesData={posts}
        lang={safeLocale}
        pageType="blog"
      />
    </>
  );
}
