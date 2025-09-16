import { Metadata } from "next"
import { getBlogArticles } from "@/lib/blog"
import { getDictionary } from "@/lib/dictionaries"
import TypedStaticCases, { CasePost } from "@/components/landing/typed-static-cases"
import { i18n } from "@/lib/i18n-config"

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

  try {
    // Используем try/catch для безопасного получения данных
    const dict = await getDictionary(safeLocale).catch(() => ({}));
    const articles = await getBlogArticles().catch(() => []) || [];
    
    // Собираем все виды ключевых слов из статей
    const allKeywords = new Set<string>();
    const allTags = new Set<string>();
    
    if (Array.isArray(articles)) {
      articles.forEach((article: any) => {
        // Добавляем AI ключевые слова
        if (article?.property_ai_keywords && Array.isArray(article.property_ai_keywords)) {
          article.property_ai_keywords.forEach((keyword: string) => {
            allKeywords.add(keyword);
          });
        }
        
        // Добавляем мета-ключевые слова
        if (article?.property_meta_keywords) {
          const metaKeywords = article.property_meta_keywords
            .split(',')
            .map((k: string) => k.trim())
            .filter((k: string) => k);
          
          metaKeywords.forEach((kw: string) => allKeywords.add(kw));
        }
        
        // Добавляем теги как ключевые слова
        if (article?.property_tags && Array.isArray(article.property_tags)) {
          article.property_tags.forEach((tag: string) => {
            allKeywords.add(tag);
            allTags.add(tag);
          });
        }
        
        // Добавляем категории как ключевые слова
        if (article?.property_category && Array.isArray(article.property_category)) {
          article.property_category.forEach((category: string) => {
            allKeywords.add(category);
          });
        }
      });
    }
    
    // Создаем SEO описание из словаря или используем первое доступное описание статьи
    let description = dict?.cases?.description || "Кейси компании - последние статьи и новости";
    if (!dict?.cases?.description && Array.isArray(articles) && articles.length > 0) {
      const firstArticleWithDesc = articles.find((a: any) => a?.property_description);
      if (firstArticleWithDesc?.property_description) {
        description = firstArticleWithDesc.property_description;
      }
    }
    
    // Собираем метаданные
    return {
      title: dict?.cases?.title || "Кейси",
      description: description,
      keywords: Array.from(allKeywords).length > 0 
        ? Array.from(allKeywords) 
        : ["кейсы", "статьи", "новости", "автоматизация", "бизнес"],
      openGraph: {
        title: dict?.cases?.title || "Кейси",
        description: description,
        type: "website",
        locale: safeLocale,
        images: Array.isArray(articles) && articles.length > 0 && articles[0]?.property_background_photo
          ? [{ url: articles[0].property_background_photo }]
          : undefined
      },
      twitter: {
        card: "summary_large_image",
        title: dict?.cases?.title || "Кейси",
        description: description,
      }
    };
  } catch (error) {
    console.error("Ошибка при генерации метаданных:", error);
    return {
      title: "Кейси",
      description: "Кейси компании - последние статьи и новости",
    };
  }
}

export default async function CasesPage({
  params
}: {
  params: Promise<{ lang: string }>
}) {
  // Получаем параметры безопасно с await
  const resolvedParams = await params;
  const paramsLang = resolvedParams.lang;
  const safeLocale = (paramsLang && i18n.locales.includes(paramsLang)) 
    ? paramsLang 
    : i18n.defaultLocale;

  try {
    // Используем try/catch для безопасного получения данных
    const dict = await getDictionary(safeLocale).catch(() => ({}));
    // Принудительно обновляем кеш для получения актуальных данных
    const articles = await getBlogArticles(true).catch(() => []) || [];
    
    // Безопасная адаптация статей
    const adaptedPosts: CasePost[] = Array.isArray(articles) 
      ? articles.map((article: any) => {
          if (!article) return null;
          
          // Извлекаем сервисы из API данных
          const services = article.property_services || [];
          
          // Извлекаем категории из API данных
          const categories = article.property_category || [];
          
          return {
            id: article.id || Math.random().toString(36).substring(7),
            title: article.property_name || 'Без названия',
            slug: article.property_slug || 'untitled',
            excerpt: article.property_description || article.property_meta_description || '',
            date: article.property_format_date || '',
            image: article.property_background_photo || article.property_social_network_img || '/placeholder.svg',
            tags: article.property_tags || [],
            services: services,
            categories: categories,
            likes: article.likes || 0,
            comments: article.comments || 0,
          };
        })
        .filter((post): post is CasePost => post !== null)
      : [];

    // Используем типизированный компонент
    return <TypedStaticCases casesData={adaptedPosts} lang={safeLocale} />;
  } catch (error) {
    console.error("Ошибка при загрузке кейсов:", error);
    return <TypedStaticCases casesData={[]} lang={safeLocale} />;
  }
}

// Уменьшаем время ревалидации до 10 минут для частого обновления данных
export const revalidate = 600; 