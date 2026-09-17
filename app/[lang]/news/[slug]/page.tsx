import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { i18n } from "@/lib/i18n-config";
import { getContentBySlug, getAllContent } from "@/lib/content";
import { ArticleRenderer } from "@/components/article-renderer";

// Статическая генерация путей для всех новостей — теперь весь контент
// локальный (content/news/uk/*.md), поэтому список известен на билде целиком
export async function generateStaticParams() {
  return i18n.locales.flatMap((locale) =>
    getAllContent("news", locale).map((entry) => ({ lang: locale, slug: entry.slug })),
  )
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; lang: string }>;
}): Promise<Metadata> {
  const { slug, lang } = await params;
  const safeLocale = i18n.locales.includes(lang) ? lang : i18n.defaultLocale;

  const article = getContentBySlug("news", safeLocale, slug);
  if (!article) {
    return { title: 'Новину не знайдено' };
  }

  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: `https://crmcustoms.com/${safeLocale}/news/${article.slug}` },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: "article",
      images: article.image ? [{ url: article.image }] : undefined,
    },
  };
}

export default async function NewsArticlePage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  // Валидируем locale явно — иначе /<любой-текст>/news/<slug> рендерит дубликат этой новости
  if (!i18n.locales.includes(lang)) {
    notFound();
  }
  const safeLocale = lang;

  const article = getContentBySlug("news", safeLocale, slug);
  if (!article) {
    notFound();
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
      url={`https://crmcustoms.com/${safeLocale}/news/${article.slug}`}
      ctaTitle={article.ctaTitle}
      ctaText={article.ctaText}
      ctaLabel={article.ctaLabel}
      ctaHref={article.ctaHref}
    />
  );
}
