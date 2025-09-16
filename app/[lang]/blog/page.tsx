import { Metadata } from "next"
import { getBlogPostsFromAPI } from "@/lib/blog"
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
    const articles = await getBlogPostsFromAPI().catch(() => []) || [];
    
    // Собираем все виды ключевых слов из статей блога
    const allKeywords = new Set<string>();
    const allTags = new Set<string>();
    
    if (Array.isArray(articles)) {
      articles.forEach((article: any) => {
        // Добавляем LSI ключевые слова (новое поле для блога)
        if (article?.property_lsi_keywords) {
          const lsiKeywords = article.property_lsi_keywords
            .split(',')
            .map((k: string) => k.trim())
            .filter((k: string) => k);
          
          lsiKeywords.forEach((kw: string) => allKeywords.add(kw));
        }
        
        // Добавляем категории текст как ключевые слова
        if (article?.property_categorytext) {
          allKeywords.add(article.property_categorytext);
        }
        
        // Добавляем название как ключевое слово
        if (article?.name || article?.property_title) {
          const title = article.name || article.property_title;
          allKeywords.add(title);
        }
      });
    }
    
    // Создаем SEO описание из словаря или используем первое доступное описание статьи
    let description = dict?.blog?.description || "Блог компании - корисні статті про автоматизацію бізнесу";
    if (!dict?.blog?.description && Array.isArray(articles) && articles.length > 0) {
      const firstArticleWithDesc = articles.find((a: any) => a?.property_description);
      if (firstArticleWithDesc?.property_description) {
        description = firstArticleWithDesc.property_description;
      }
    }
    
    // Собираем метаданные
    return {
      title: dict?.blog?.title || "Блог",
      description: description,
      keywords: Array.from(allKeywords).length > 0 
        ? Array.from(allKeywords) 
        : ["блог", "статті", "автоматизація", "бізнес", "CRM"],
      openGraph: {
        title: dict?.blog?.title || "Блог",
        description: description,
        type: "website",
        locale: safeLocale,
        images: Array.isArray(articles) && articles.length > 0 && (articles[0]?.property_2 || articles[0]?.property_photo1)
          ? [{ url: articles[0].property_2 || articles[0].property_photo1 }]
          : undefined
      },
      twitter: {
        card: "summary_large_image",
        title: dict?.blog?.title || "Блог",
        description: description,
      }
    };
  } catch (error) {
    console.error("Ошибка при генерации метаданных:", error);
    return {
      title: "Блог",
      description: "Блог компании - корисні статті про автоматизацію бізнесу",
    };
  }
}

export default async function BlogPage({
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
    // Принудительно обновляем кеш для получения актуальных данных блога
    const articles = await getBlogPostsFromAPI(true).catch(() => []) || [];
    
    // Безопасная адаптация статей блога в формат кейсов
    const adaptedPosts: CasePost[] = Array.isArray(articles) 
      ? articles.map((article: any): CasePost | null => {
          if (!article) return null;
          
          // Извлекаем категории из blog API данных
          const categories: string[] = article.property_categorytext ? [article.property_categorytext] : [];
          
          return {
            id: article.id || Math.random().toString(36).substring(7),
            title: article.name || article.property_title || 'Без назви',
            slug: article.property_link_name || 'untitled',
            excerpt: article.property_description || '',
            date: article.property_ || '',
            image: article.property_2 || article.property_photo1 || '/placeholder.svg',
            tags: [], // В блоге не используем теги
            services: [] as string[], // В блоге нет сервисов - явно типизированный пустой массив
            categories: categories,
            likes: 0, // В блоге нет лайков
            comments: 0, // В блоге нет комментариев
          };
        })
        .filter((post): post is CasePost => post !== null) // Правильный предикат типа
      : [];

    // Используем тот же типизированный компонент что и кейсы
    return (
      <TypedStaticCases 
        casesData={adaptedPosts} 
        lang={safeLocale}
        pageType="blog"
      />
    );
  } catch (error) {
    console.error("Ошибка при загрузке блога:", error);
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Блог</h1>
        <p className="text-gray-500">Помилка завантаження статей. Спробуйте пізніше.</p>
      </div>
    );
  }
}

// Уменьшаем время ревалидации до 10 минут для частого обновления данных
export const revalidate = 600; 