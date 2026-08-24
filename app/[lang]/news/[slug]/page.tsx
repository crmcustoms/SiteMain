import { getBlogPostBySlug, getBlogPostContent, renderNotionContent, getBlogPostsFromAPI } from "@/lib/blog";
import BlogDetail from '@/components/blog/blog-detail';
import { Metadata } from 'next';
import { getDictionary } from '@/lib/dictionaries';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { i18n } from "@/lib/i18n-config";
import { getContentBySlug, getAllContent } from "@/lib/content";
import { ArticleRenderer } from "@/components/article-renderer";
import ErrorBoundary from '../../blog/components/ErrorBoundary';

export const dynamic = "force-dynamic";

// Статическая генерация путей для всех новостей
export async function generateStaticParams() {
  try {
    const isBuild =
      process.env.NEXT_PHASE === "phase-production-build" ||
      process.env.NETLIFY === "true";
    if (isBuild) {
      return [];
    }
    const posts = await getBlogPostsFromAPI();

    return i18n.locales.flatMap(locale => {
      const notionParams = posts
        .filter((post: any) => post && post.slug && post.property_categorytext === "Новини")
        .map((post: any) => ({ slug: post.slug, lang: locale }));
      const localParams = getAllContent("news", locale).map(entry => ({ slug: entry.slug, lang: locale }));
      return [...localParams, ...notionParams];
    });
  } catch (error) {
    console.error('Ошибка при генерации статических путей:', error);
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string; lang: string };
}): Promise<Metadata> {
  const { slug, lang } = params;
  const safeLocale = i18n.locales.includes(lang) ? lang : i18n.defaultLocale;

  // Новини про власні сервіси, опубліковані локально через markdown (content/news/uk/*.md)
  const localArticle = getContentBySlug("news", safeLocale, slug);
  if (localArticle) {
    return {
      title: localArticle.title,
      description: localArticle.excerpt,
      alternates: { canonical: `https://crmcustoms.com/${safeLocale}/news/${localArticle.slug}` },
      openGraph: {
        title: localArticle.title,
        description: localArticle.excerpt,
        type: "article",
        images: localArticle.image ? [{ url: localArticle.image }] : undefined,
      },
    };
  }

  try {
    const article = await getBlogPostBySlug(slug);

    if (!article) {
      return {
        title: 'Новину не знайдено',
        description: '',
      };
    }

    return {
      title: article.name || article.title || 'Новини',
      description: article.property_description || article.description || '',
      alternates: { canonical: `https://crmcustoms.com/${safeLocale}/news/${slug}` },
      openGraph: {
        title: article.name || article.title || 'Новини',
        description: article.property_description || article.description || '',
        images: article.property_2 ? [article.property_2] : [],
      },
    };
  } catch (error) {
    console.error('Ошибка при генерации метаданных:', error);
    return {
      title: 'Новини',
      description: '',
    };
  }
}

export default async function NewsArticlePage({
  params,
}: {
  params: { lang: string; slug: string };
}) {
  const { lang, slug } = params;
  const safeLocale = i18n.locales.includes(lang) ? lang : i18n.defaultLocale;

  if (!slug) {
    return notFound();
  }

  // Новини про власні сервіси, опубліковані локально через markdown (content/news/uk/*.md)
  const localArticle = getContentBySlug("news", safeLocale, slug);
  if (localArticle) {
    return (
      <ArticleRenderer
        title={localArticle.title}
        date={localArticle.date}
        excerpt={localArticle.excerpt}
        body={localArticle.body}
        tag={localArticle.tag}
        readTime={localArticle.readTime}
        author={localArticle.author}
        image={localArticle.image}
        url={`https://crmcustoms.com/${safeLocale}/news/${localArticle.slug}`}
        ctaTitle={localArticle.ctaTitle}
        ctaText={localArticle.ctaText}
        ctaLabel={localArticle.ctaLabel}
        ctaHref={localArticle.ctaHref}
      />
    );
  }

  try {
    const dict = await getDictionary(lang).catch(() => ({} as any));
    const article = await getBlogPostBySlug(slug);

    if (!article) {
      notFound();
    }

    if (!article.id) {
      return (
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl font-bold mb-4">Помилка завантаження</h1>
          <p className="text-gray-500 mb-4">Не вдалося завантажити новину. Спробуйте пізніше.</p>
          <Link href={`/${lang}/news`} className="text-blue-600 hover:underline mt-4 inline-block">
            ← Назад до новин
          </Link>
        </div>
      );
    }

    let content = await getBlogPostContent(article.id, true).catch(() => null);
    if (!content) content = [];

    const rawHtmlContent = renderNotionContent(content || []);
    const processedHtml = prepareHtmlForServer(rawHtmlContent);

    const relatedArticles = (await getBlogPostsFromAPI().catch(() => [] as any[]))
      .filter((a: any) => a.property_categorytext === "Новини");

    return (
      <ErrorBoundary fallback={<div>Произошла ошибка при загрузке статьи</div>}>
        <BlogDetail
          articleData={article}
          lang={lang}
          htmlContent={processedHtml}
          backLinkText={dict.news?.back_to_news || "Назад до новин"}
          backLinkHref={`/${lang}/news`}
          relatedArticles={relatedArticles.filter((a: any) => a.id !== article.id).slice(0, 5)}
        />
      </ErrorBoundary>
    );
  } catch (error) {
    console.error('Ошибка при загрузке новости:', error);
    return notFound();
  }
}

function prepareHtmlForServer(html: string): string {
  if (!html) return '';

  try {
    let processedHtml = html.replace(
      /<img([^>]*)src=["']([^"']+)["']([^>]*)>/gi,
      (match, before, src, after) => {
        try {
          const isAwsPresigned = src && (
            src.includes('X-Amz-Algorithm') ||
            src.includes('X-Amz-Credential') ||
            src.includes('X-Amz-Date')
          );
          const isNotion = src && (
            src.includes('prod-files-secure.s3') ||
            src.includes('notion-static.com')
          );
          const containsProxy = src && src.includes('/api/s3-proxy/');
          const isRelative = src && (
            src.includes('http://localhost') ||
            src.includes('https://localhost') ||
            (!src.startsWith('http') && !src.startsWith('/api/'))
          );

          let finalSrc = src;

          if (isRelative) {
            finalSrc = `/api/placeholder?text=${encodeURIComponent('Відносний URL')}`;
          } else if ((isAwsPresigned || isNotion) && containsProxy) {
            try {
              const m = src.match(/\/api\/s3-proxy\/(.+)$/);
              if (m && m[1]) {
                const decodedUrl = decodeURIComponent(m[1]);
                if (decodedUrl.startsWith('http://') || decodedUrl.startsWith('https://')) {
                  finalSrc = decodedUrl;
                }
              }
            } catch {}
          }

          let attributes = ' loading="lazy" decoding="async"';
          if (!after.includes('onerror=')) {
            attributes += ` onerror="this.onerror=null;this.src='/api/placeholder?text=${encodeURIComponent('Помилка завантаження')}';"`;
          }
          if (!before.includes('style=') && !after.includes('style=')) {
            attributes += ' style="max-width: 100%; height: auto;"';
          }
          if (!before.includes('class=') && !after.includes('class=')) {
            attributes += ' class="my-4"';
          }

          return `<img${before}src="${finalSrc}"${after}${attributes}>`;
        } catch {
          return match;
        }
      }
    );

    return processedHtml;
  } catch {
    return html;
  }
}
