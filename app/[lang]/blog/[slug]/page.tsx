import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { i18n } from "@/lib/i18n-config";
import { getContentBySlug, getAllContent } from "@/lib/content";
import { ArticleRenderer } from "@/components/article-renderer";

// Статическая генерация путей для всех статей блога — теперь весь контент
// локальный (content/blog/uk/*.md), поэтому список известен на билде целиком
export async function generateStaticParams() {
  return i18n.locales.flatMap((locale) =>
    getAllContent("blog", locale).map((entry) => ({ lang: locale, slug: entry.slug })),
  )
}

// Генерация метаданных для страницы
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; lang: string }>;
}): Promise<Metadata> {
  const { slug, lang } = await params;
  const safeLocale = i18n.locales.includes(lang) ? lang : i18n.defaultLocale;

  const article = getContentBySlug("blog", safeLocale, slug);
  if (!article) {
    return { title: 'Статтю не знайдено' };
  }

  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: `https://crmcustoms.com/${safeLocale}/blog/${article.slug}` },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: "article",
      images: article.image ? [{ url: article.image }] : undefined,
    },
  };
}

// Основной компонент страницы
export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  // Валидируем locale явно — иначе /<любой-текст>/blog/<slug> рендерит
  // дубликат этой статьи (см. wiki/sitemain.md SEO раздел)
  if (!i18n.locales.includes(lang)) {
    notFound();
  }
  const safeLocale = lang;

  const article = getContentBySlug("blog", safeLocale, slug);
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
      url={`https://crmcustoms.com/${safeLocale}/blog/${article.slug}`}
      ctaTitle={article.ctaTitle}
      ctaText={article.ctaText}
      ctaLabel={article.ctaLabel}
      ctaHref={article.ctaHref}
    />
  );
}
