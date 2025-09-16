import { getBlogPostBySlug, getBlogPostContent, renderNotionContent, getBlogPostsFromAPI } from "@/lib/blog";
import BlogDetail from '@/components/blog/blog-detail';
import { Metadata } from 'next';
import { getDictionary } from '@/lib/dictionaries';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { i18n } from "@/lib/i18n-config";
import ErrorBoundary from '../components/ErrorBoundary';

// Статическая генерация путей для всех статей блога
export async function generateStaticParams() {
  try {
    const posts = await getBlogPostsFromAPI();
    
    return i18n.locales.flatMap(locale => {
      return posts
        .filter(post => post && post.slug) // Фильтруем посты без slug
        .map(post => ({
          slug: post.slug,
          lang: locale
        }));
    });
  } catch (error) {
    console.error('Ошибка при генерации статических путей:', error);
    return [];
  }
}

// Генерация метаданных для страницы
export async function generateMetadata({
  params,
}: {
  params: { slug: string; lang: string };
}): Promise<Metadata> {
  const { slug, lang } = params;
  
  try {
    // Получаем данные статьи блога
    const article = await getBlogPostBySlug(slug);
    
    if (!article) {
      return {
        title: 'Статья не найдена',
        description: 'Запрашиваемая статья не найдена',
      };
    }
    
    // Формируем метаданные
    return {
      title: article.name || article.title || 'Блог',
      description: article.property_description || article.description || '',
      openGraph: {
        title: article.name || article.title || 'Блог',
        description: article.property_description || article.description || '',
        images: article.property_2 ? [article.property_2] : [],
      },
    };
  } catch (error) {
    console.error('Ошибка при генерации метаданных:', error);
    return {
      title: 'Блог',
      description: '',
    };
  }
}

// Основной компонент страницы
export default async function BlogArticlePage({
  params,
}: {
  params: { lang: string; slug: string };
}) {
  const { lang, slug } = params;

  if (!slug) {
    return notFound();
  }
  
  try {
    console.log(`Начинаем загрузку статьи блога: ${slug}`);
    
    // Загружаем словарь
    const dict = await getDictionary(lang).catch(() => ({}));
    
    // Получаем данные статьи блога (в dev режиме можно отключить кеш)
    const article = await getBlogPostBySlug(slug);
    
    // Если статья не найдена
    if (!article) {
      console.log(`Статья не найдена: ${slug}`);
      notFound();
    }

    console.log(`BlogArticlePage: получена статья блога "${article.name}" с ID: ${article.id}`);
    
    // Проверяем, что у статьи есть ID
    if (!article.id) {
      console.error('Ошибка: у статьи нет ID!', article);
      return (
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl font-bold mb-4">Ошибка загрузки</h1>
          <p className="text-gray-500 mb-4">Не удалось загрузить статью. Попробуйте позже.</p>
          <p className="text-sm text-gray-400">Ошибка: Отсутствует ID статьи</p>
          <Link href={`/${lang}/blog`} className="text-blue-600 hover:underline mt-4 inline-block">
            ← Назад к блогу
          </Link>
        </div>
      );
    }
    
    // Получаем контент статьи блога с передачей id
    let content = await getBlogPostContent(article.id).catch(() => null);
    
    if (!content) {
      console.log(`Контент статьи не найден: ${slug}`);
      content = [];
    }
    
    // Рендерим HTML-контент
    const rawHtmlContent = renderNotionContent(content || []);
    console.log(`HTML-контент сгенерирован, длина: ${rawHtmlContent.length}`);
    
    // Выводим первые несколько URL изображений для отладки
    const imgRegex = /<img[^>]*src=[\"']([^\"']+)[\"'][^>]*>/gi;
    let match;
    let imgCount = 0;
    while ((match = imgRegex.exec(rawHtmlContent)) !== null && imgCount < 3) {
      console.log(`Изображение ${imgCount + 1}: ${match[1].substring(0, 100)}...`);
      imgCount++;
    }
    
    // Предварительно обрабатываем HTML на сервере
    const processedHtml = prepareHtmlForServer(rawHtmlContent);
    
    // Получаем связанные статьи для сайдбара
    const relatedArticles = await getBlogPostsFromAPI().catch(() => [] as any[]);
    console.log(`Получено ${relatedArticles.length} связанных статей`);

    return (
      <ErrorBoundary fallback={<div>Произошла ошибка при загрузке статьи</div>}>
        <BlogDetail 
          articleData={article}
          lang={lang} 
          htmlContent={processedHtml}
          backLinkText={dict.blog?.back_to_blog || "Назад к блогу"}
          relatedArticles={relatedArticles.filter(a => a.id !== article.id).slice(0, 5)}
        />
      </ErrorBoundary>
    );
  } catch (error) {
    console.error('Ошибка при загрузке статьи блога:', error);
    return notFound();
  }
}

/**
 * Функция для предварительной обработки HTML на сервере
 */
function prepareHtmlForServer(html: string): string {
  if (!html) return '';
  
  try {
    // Заменяем все img теги с пресайнутыми URL
    let processedHtml = html.replace(
      /<img([^>]*)src=[\"']([^\"']+)[\"']([^>]*)>/gi,
      (match, before, src, after) => {
        try {
          // Проверяем, является ли URL пресайнутым из AWS
          const isAwsPresigned = src && (
            src.includes('X-Amz-Algorithm') || 
            src.includes('X-Amz-Credential') || 
            src.includes('X-Amz-Date')
          );
          
          // Проверяем, является ли URL из Notion
          const isNotion = src && (
            src.includes('prod-files-secure.s3') || 
            src.includes('notion-static.com')
          );
          
          // Проверяем, содержит ли URL прокси
          const containsProxy = src && src.includes('/api/s3-proxy/');
          
          // Проверяем, является ли URL относительным
          const isRelative = src && (
            src.includes('http://localhost') || 
            src.includes('https://localhost') || 
            (!src.startsWith('http') && !src.startsWith('/api/'))
          );
          
          let finalSrc = src;
          
          // Если URL относительный, заменяем его на заглушку
          if (isRelative) {
            console.log(`Сервер: Обнаружен относительный URL: ${src}`);
            finalSrc = `/api/placeholder?text=${encodeURIComponent('Относительный URL')}`;
          } 
          // Если URL пресайнутый и содержит прокси, извлекаем оригинальный URL только если он абсолютный
          else if ((isAwsPresigned || isNotion) && containsProxy) {
            try {
              const match = src.match(/\/api\/s3-proxy\/(.+)$/);
              if (match && match[1]) {
                const decodedUrl = decodeURIComponent(match[1]);
                if (decodedUrl.startsWith('http://') || decodedUrl.startsWith('https://')) {
                  finalSrc = decodedUrl;
                  console.log(`Сервер: Заменяем прокси URL на прямой: ${finalSrc.substring(0, 50)}...`);
                } else {
                  console.log('Сервер: Внутри прокси не абсолютный URL, оставляем исходный src');
                }
              }
            } catch (decodeError) {
              console.error('Сервер: Ошибка при декодировании URL:', decodeError);
            }
          }
          // Если URL пресайнутый, но не содержит прокси, оставляем как есть
          else if (isAwsPresigned || isNotion) {
            // Оставляем URL как есть
            console.log(`Сервер: Обнаружен пресайнутый URL без прокси: ${src.substring(0, 50)}...`);
          }
          // Для всех остальных URL добавляем атрибуты
          
          // Добавляем атрибуты для улучшения загрузки
          let attributes = ' loading="lazy" decoding="async"';
          
          // Проверяем, есть ли уже атрибут onerror
          if (!after.includes('onerror=')) {
            attributes += ` onerror="this.onerror=null;this.src='/api/placeholder?text=${encodeURIComponent('Ошибка загрузки')}';"`;
          }
          
          // Проверяем, есть ли уже атрибут style
          if (!before.includes('style=') && !after.includes('style=')) {
            attributes += ' style="max-width: 100%; height: auto;"';
          }
          
          // Проверяем, есть ли уже класс
          if (!before.includes('class=') && !after.includes('class=')) {
            attributes += ' class="my-4"';
          }
          
          return `<img${before}src="${finalSrc}"${after}${attributes}>`;
        } catch (error) {
          console.error('Сервер: Ошибка при обработке тега img:', error);
          return match; // Возвращаем исходный тег в случае ошибки
        }
      }
    );
    
    return processedHtml;
  } catch (error) {
    console.error('Сервер: Ошибка при подготовке HTML для сервера:', error);
    return html;
  }
}