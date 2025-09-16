import { Metadata } from "next"
import { getBlogArticleBySlug, getBlogArticleContent, renderNotionContent, getBlogArticles } from "@/lib/blog"
import { getDictionary } from "@/lib/dictionaries"
import Link from "next/link"
import { notFound } from "next/navigation"
import { i18n } from "@/lib/i18n-config"
import StaticCaseDetail from "@/components/landing/static-case-detail"
import CaseDetailWrapper from "@/components/case-detail-wrapper"

// Статическая генерация путей для всех кейсов
export async function generateStaticParams() {
  try {
    // Получаем все статьи блога, принудительно обновляя кеш
    const articles = await getBlogArticles(true);
    
    // Генерируем параметры для всех языков и статей
    const paths = [];
    
    for (const lang of i18n.locales) {
      for (const article of articles) {
        if (article && article.property_slug) {
          paths.push({
            lang,
            slug: article.property_slug
          });
        }
      }
    }
    
    return paths;
  } catch (error) {
    console.error("Ошибка при генерации статических путей:", error);
    return [];
  }
}

// Динамическая генерация метаданных
export async function generateMetadata({
  params
}: {
  params: Promise<{ lang?: string; slug?: string }>
}): Promise<Metadata> {
  const resolvedParams = await params;
  const lang = resolvedParams?.lang || 'ua';
  const slug = resolvedParams?.slug || '';

  try {
    const dict = await getDictionary(lang).catch(() => ({}));
    
    // Получаем данные статьи с принудительным обновлением кеша
    const article = await getBlogArticleBySlug(slug, true).catch(() => null);
    
    if (!article) {
      return {
        title: dict.metadata?.notFound?.title || 'Кейс не найден',
        description: dict.metadata?.notFound?.description || 'Запрашиваемый кейс не существует'
      };
    }
    
    // Извлекаем данные для мета-тегов
    const title = article.property_name || 'Кейс';
    const description = article.property_description || article.excerpt || '';
    
    // Получаем теги и ключевые слова
    const tags = article.tags && Array.isArray(article.tags) ? article.tags : [];
    const keywords = article.keywords && Array.isArray(article.keywords) ? article.keywords : [];
    const metaKeywords = article.meta_keywords || '';
    
    // Объединяем все ключевые слова
    const allKeywords = [...new Set([
      ...tags, 
      ...keywords,
      ...(metaKeywords ? metaKeywords.split(',').map((k: string) => k.trim()) : [])
    ])];
    
    // Создаем структурированные данные для JSON-LD
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      'headline': title,
      'image': article.image || article.background_photo || '/placeholder.jpg',
      'publisher': {
        '@type': 'Organization',
        'name': 'Автоматизація бізнесу',
        'logo': {
          '@type': 'ImageObject',
          'url': 'https://crmcustoms.site/logo.png'
        }
      },
      'datePublished': article.publishDate || article.date || new Date().toISOString(),
      'dateModified': article.updateDate || article.publishDate || article.date || new Date().toISOString(),
      'description': description,
      'keywords': allKeywords.join(', ')
    };
    
    return {
      title,
      description,
      keywords: allKeywords.join(', '),
      openGraph: {
        title,
        description,
        type: 'article',
        publishedTime: article.publishDate || article.date,
        modifiedTime: article.updateDate || article.publishDate || article.date,
        images: [
          {
            url: article.image || article.background_photo || '/placeholder.jpg',
            alt: title
          }
        ]
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [article.image || article.background_photo || '/placeholder.jpg']
      },
      other: {
        'script:ld+json': JSON.stringify(jsonLd)
      }
    };
  } catch (error) {
    console.error("Ошибка при генерации метаданных:", error);
    return {
      title: 'Кейс',
      description: 'Подробная информация о кейсе'
    };
  }
}

export default async function CaseArticlePage({
  params
}: {
  params: Promise<{ lang?: string; slug?: string }>
}) {
  // Получаем параметры безопасно с await
  const resolvedParams = await params;
  const lang = resolvedParams?.lang || 'ua';
  const slug = resolvedParams?.slug || '';

  if (!slug) {
    return (
      <div>
        <h1>Ошибка</h1>
        <p>URL кейса не указан</p>
        <Link href={`/${lang}/cases`}>Вернуться к списку кейсов</Link>
      </div>
    );
  }

  try {
    // Получаем словарь для текущего языка
    const dict = await getDictionary(lang);
    
    // Получаем данные статьи с принудительным обновлением кеша
    const article = await getBlogArticleBySlug(slug, true);
    
    if (!article) {
      notFound();
    }
    
    // Получаем ID статьи
    const articleId = article.id;
    
    if (!articleId) {
      return (
        <div>
          <h1>Ошибка загрузки</h1>
          <p>Не удалось получить данные кейса</p>
          <Link href={`/${lang}/cases`}>Вернуться к списку кейсов</Link>
        </div>
      );
    }
    
    // Получаем контент статьи с принудительным обновлением кеша
    const content = await getBlogArticleContent(articleId, true);
    
    if (!content) {
      return (
        <div>
          <h1>Контент недоступен</h1>
          <p>Контент кейса временно недоступен</p>
          <Link href={`/${lang}/cases`}>Вернуться к списку кейсов</Link>
        </div>
      );
    }
    
    // Рендерим контент из Notion
    const htmlContent = renderNotionContent(content);
    
    // Адаптируем данные для компонента
    const adaptedCaseData = {
      id: article.id || '',
      title: article.property_name || 'Без назви',
      slug: article.property_slug || '',
      excerpt: article.property_description || article.property_meta_description || '',
      date: article.property_format_date || '',
      image: article.property_background_photo || article.property_social_network_img || '/placeholder.jpg',
      background_photo: article.property_background_photo || article.property_social_network_img || '/placeholder.jpg',
      property_image: article.property_image || article.image || '/placeholder.jpg',
      property_background_photo: article.property_background_photo || '/placeholder.jpg',
      social_network_img: article.property_social_network_img || article.social_network_img || '/placeholder.jpg',
      tags: article.property_tags || [],
      services: article.property_services || [],
      categories: article.property_category || [],
      likes: article.likes || 0,
      comments: article.comments || 0,
    };
    
    // Получаем популярные кейсы (можно заменить на реальную логику получения популярных кейсов)
    const allCases = await getBlogArticles();
    const popularCases = allCases
      .filter(caseItem => caseItem.id !== article.id)
      .slice(0, 3)
      .map(caseItem => ({
        id: caseItem.id || '',
        title: caseItem.property_name || 'Без назви',
        slug: caseItem.property_slug || '',
        image: caseItem.property_background_photo || caseItem.property_social_network_img || '/placeholder.jpg',
        excerpt: caseItem.property_description || ''
      }));
    
    console.log('Case page: Данные для кейса:', {
      id: article.id,
      title: article.property_name,
      image_fields: {
        property_background_photo: article.property_background_photo,
        property_social_network_img: article.property_social_network_img,
        property_image: article.property_image,
        image: article.image,
        background_photo: article.background_photo,
        social_network_img: article.social_network_img
      }
    });

    // Используем новый компонент с сайдбаром
    return (
      <CaseDetailWrapper
        caseData={adaptedCaseData} 
        htmlContent={htmlContent}
        lang={lang} 
        backLinkText={dict.cases?.backToList || "Назад до кейсів"}
        popularCases={popularCases}
        dictionary={{
          popularCases: dict.cases?.popularCases || "Популярні кейси",
          categories: dict.cases?.categories || "Категорії",
          tags: dict.cases?.tags || "Теги",
          readMore: dict.common?.readMore || "Детальніше"
        }}
      />
    );
  } catch (error) {
    console.error("Ошибка при загрузке кейса:", error);
    return (
      <div>
        <h1>Ошибка</h1>
        <p>Произошла ошибка при загрузке кейса</p>
        <Link href={`/${lang}/cases`}>Вернуться к списку кейсов</Link>
      </div>
    );
  }
}

// Уменьшаем время ревалидации до 10 минут для частого обновления данных
export const revalidate = 600; 