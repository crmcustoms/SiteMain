import { Metadata } from "next"
import { getBlogPostsFromAPI, sortBlogPostsByDate } from "@/lib/blog"
import { getDictionary } from "@/lib/dictionaries"
import { getAllContent, ogImageUrl } from "@/lib/content"
import TypedStaticCases, { CasePost } from "@/components/landing/typed-static-cases"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { i18n } from "@/lib/i18n-config"

export const dynamic = "force-dynamic"

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
  const safeLocale = (paramsLang && i18n.locales.includes(paramsLang))
    ? paramsLang
    : i18n.defaultLocale;

  try {
    const articles = await getBlogPostsFromAPI(true).catch(() => []) || [];
    const sortedArticles = sortBlogPostsByDate(articles);

    const newsArticles = Array.isArray(sortedArticles)
      ? sortedArticles.filter((article: any) => article?.property_categorytext === NEWS_CATEGORY)
      : [];

    const adaptedPosts: CasePost[] = newsArticles.map((article: any): CasePost => {
      const title = article.name || article.property_title || 'Без назви';
      return {
        id: article.id || Math.random().toString(36).substring(7),
        title,
        slug: article.property_link_name || 'untitled',
        excerpt: article.property_description || '',
        date: article.property_ || '',
        image: article.property_2 || article.property_photo1 || ogImageUrl(title, NEWS_CATEGORY),
        tags: [],
        services: [] as string[],
        categories: [NEWS_CATEGORY],
        likes: 0,
        comments: 0,
      };
    });

    // Новини про власні сервіси, опубліковані локально через markdown (content/news/uk/*.md)
    const markdownPosts: CasePost[] = getAllContent("news", safeLocale).map((entry) => ({
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
    }))

    const allPosts = [...markdownPosts, ...adaptedPosts]

    return (
      <>
        <Breadcrumbs items={[{ label: 'Новини' }]} lang={safeLocale} />
        <TypedStaticCases
          casesData={allPosts}
          lang={safeLocale}
          pageType="news"
        />
      </>
    );
  } catch (error) {
    console.error("Ошибка при загрузке новостей:", error);
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Новини</h1>
        <p className="text-gray-500">Помилка завантаження новин. Спробуйте пізніше.</p>
      </div>
    );
  }
}

export const revalidate = 0;
