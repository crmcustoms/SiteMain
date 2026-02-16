import "server-only"

// Імітація отримання даних блогу
export async function getBlogPosts(lang: string) {
  // В реальному проекті тут буде запит до API або бази даних
  const posts = [
    {
      id: 1,
      title:
        lang === "uk"
          ? "Як автоматизація допомогла збільшити продажі на 40%"
          : "Как автоматизация помогла увеличить продажи на 40%",
      slug: "how-automation-increased-sales",
      excerpt:
        lang === "uk"
          ? "Дізнайтеся, як компанія використала автоматизацію для значного збільшення продажів та оптимізації процесів."
          : "Узнайте, как компания использовала автоматизацию для значительного увеличения продаж и оптимизации процессов.",
      date: lang === "uk" ? "10 травня 2023" : "10 мая 2023",
      image: "/placeholder.svg?height=200&width=300&query=business growth chart",
      author: {
        name: lang === "uk" ? "Олександр Петренко" : "Александр Петренко",
        avatar: "/placeholder.svg?height=40&width=40&query=business person avatar",
      },
      likes: 42,
      comments: 15,
      lang: lang,
    },
    {
      id: 2,
      title:
        lang === "uk"
          ? "5 ознак того, що вашому бізнесу потрібна автоматизація"
          : "5 признаков того, что вашему бизнесу нужна автоматизация",
      slug: "5-signs-your-business-needs-automation",
      excerpt:
        lang === "uk"
          ? "Розглянемо ключові індикатори, які свідчать про необхідність впровадження автоматизації у вашому бізнесі."
          : "Рассмотрим ключевые индикаторы, которые свидетельствуют о необходимости внедрения автоматизации в вашем бизнесе.",
      date: lang === "uk" ? "2 квітня 2023" : "2 апреля 2023",
      image: "/placeholder.svg?height=200&width=300&query=business automation signs",
      author: {
        name: lang === "uk" ? "Марія Коваленко" : "Мария Коваленко",
        avatar: "/placeholder.svg?height=40&width=40&query=business woman avatar",
      },
      likes: 38,
      comments: 9,
      lang: lang,
    },
    {
      id: 3,
      title: lang === "uk" ? "Порівняння CRM-систем для малого бізнесу" : "Сравнение CRM-систем для малого бизнеса",
      slug: "crm-comparison-for-small-business",
      excerpt:
        lang === "uk"
          ? "Детальний аналіз популярних CRM-систем, їх переваги, недоліки та рекомендації щодо вибору."
          : "Детальный анализ популярных CRM-систем, их преимущества, недостатки и рекомендации по выбору.",
      date: lang === "uk" ? "15 березня 2023" : "15 марта 2023",
      image: "/placeholder.svg?height=200&width=300&query=crm system comparison",
      author: {
        name: lang === "uk" ? "Ігор Сидоренко" : "Игорь Сидоренко",
        avatar: "/placeholder.svg?height=40&width=40&query=tech expert avatar",
      },
      likes: 56,
      comments: 23,
      lang: lang,
    },
    {
      id: 4,
      title:
        lang === "uk"
          ? "Автоматизація логістики: від складу до доставки"
          : "Автоматизация логистики: от склада до доставки",
      slug: "logistics-automation",
      excerpt:
        lang === "uk"
          ? "Як сучасні технології допомагають оптимізувати логістичні процеси та скоротити витрати на доставку."
          : "Как современные технологии помогают оптимизировать логистические процессы и сократить расходы на доставку.",
      date: lang === "uk" ? "5 лютого 2023" : "5 февраля 2023",
      image: "/placeholder.svg?height=200&width=300&query=logistics automation warehouse",
      author: {
        name: lang === "uk" ? "Наталія Шевченко" : "Наталия Шевченко",
        avatar: "/placeholder.svg?height=40&width=40&query=logistics expert avatar",
      },
      likes: 29,
      comments: 7,
      lang: lang,
    },
  ]

  return posts
}

// Интерфейсы для типизации кеша
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

interface ArticleCache {
  [slug: string]: CacheEntry<any>;
}

interface ContentCache {
  [id: string]: CacheEntry<any>;
}

// Отдельные кеши для кейсов и блога
let articlesCache: ArticleCache = {}; // для кейсов
let blogCache: ArticleCache = {}; // для блога
let articleContentCache: ContentCache = {}; // для контента кейсов
let blogContentCache: ContentCache = {}; // для контента блога

// API endpoints
const ARTICLES_API =
  process.env.N8N_CASES_LIST_URL ||
  "https://n8n.crmcustoms.com/webhook/list-page-cases" // для кейсов
const ARTICLE_CONTENT_API =
  process.env.N8N_CASE_PAGE_URL ||
  "https://n8n.crmcustoms.com/webhook/get-page-cese" // для контента кейсов
const BLOG_API =
  process.env.N8N_BLOG_LIST_URL ||
  "https://n8n.crmcustoms.com/webhook/ListPageBlog" // для блога
const BLOG_CONTENT_API =
  process.env.N8N_BLOG_PAGE_URL ||
  "https://n8n.crmcustoms.com/webhook/PageNotionBlog" // для контента блога

// Константа времени жизни кеша (15 минут)
const CACHE_DURATION = 15 * 60 * 1000;

// Время кеширования в миллисекундах (5 минут)
const CACHE_TTL = 300 * 1000;

// В режиме разработки можно отключить кеш через переменную окружения
const DISABLE_CACHE = process.env.NODE_ENV === 'development' && process.env.DISABLE_BLOG_CACHE === 'true';

// Таймаут для запросов в миллисекундах (используем только в dev)
const FETCH_TIMEOUT = 10000;

/**
 * Функция для выполнения fetch запроса с таймаутом
 */
async function fetchWithTimeout(url: string, options: RequestInit = {}) {
  const useTimeout = process.env.NODE_ENV === 'development';
  const controller = useTimeout ? new AbortController() : null;
  const id = useTimeout ? setTimeout(() => controller?.abort(), FETCH_TIMEOUT) : null;
  const webhookSecret = process.env.WEBHOOK_SECRET
  const method = options.method || "GET"
  if (!webhookSecret) {
    console.error("WEBHOOK_SECRET not configured for content fetch")
  }
  
  try {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/de426b11-629a-4d11-809b-e48b79b36174',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'services-pre',hypothesisId:'H1',location:'lib/blog.ts:138',message:'content_fetch_start',data:{url:new URL(url).origin + new URL(url).pathname,method,hasWebhookSecret:!!webhookSecret},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    const nextOptions =
      (options as RequestInit & { next?: { revalidate?: number } }).next ??
      { revalidate: 3600 };

    const response = await fetch(url, {
      ...options,
      ...(controller ? { signal: controller.signal } : {}),
      headers: {
        ...(options.headers || {}),
        ...(webhookSecret ? { "x-webhook-secret": webhookSecret, "WEBHOOK_SECRET": webhookSecret } : {}),
      },
      next: nextOptions
    });
    
    if (id) clearTimeout(id);
    
    if (!response.ok) {
      console.error("Content fetch failed:", {
        status: response.status,
        url: new URL(url).origin + new URL(url).pathname,
        method,
      });
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/de426b11-629a-4d11-809b-e48b79b36174',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'services-pre',hypothesisId:'H1',location:'lib/blog.ts:147',message:'content_fetch_not_ok',data:{status:response.status,url:new URL(url).origin + new URL(url).pathname},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      throw new Error(`Ошибка API: ${response.status}`);
    }
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/de426b11-629a-4d11-809b-e48b79b36174',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'services-pre',hypothesisId:'H1',location:'lib/blog.ts:151',message:'content_fetch_ok',data:{status:response.status,url:new URL(url).origin + new URL(url).pathname},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    
    return response;
  } catch (error) {
    if (id) clearTimeout(id);
    console.error("Content fetch error:", {
      errorName: (error as Error)?.name || "Unknown",
      errorMessage: (error as Error)?.message || "Unknown",
      url: new URL(url).origin + new URL(url).pathname,
      method,
    });
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/de426b11-629a-4d11-809b-e48b79b36174',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'services-pre',hypothesisId:'H1',location:'lib/blog.ts:155',message:'content_fetch_error',data:{errorName:(error as Error)?.name || 'Unknown',errorMessage:(error as Error)?.message || 'Unknown'},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    if ((error as Error).name === 'AbortError') {
      throw new Error('Таймаут запроса');
    }
    throw error;
  }
}

/**
 * Проверка актуальности кеша
 */
function isCacheValid<T>(cache: CacheEntry<T> | undefined, forceRefresh = false): boolean {
  if (forceRefresh || DISABLE_CACHE) return false;
  if (!cache) return false;
  return Date.now() - cache.timestamp < CACHE_TTL;
}

/**
 * Получение списка КЕЙСОВ с проверкой актуальности кеша
 * ВАЖНО: Эта функция для КЕЙСОВ, НЕ для блога!
 * Использует старый API endpoint и property_slug
 */
export async function getBlogArticles(forceRefresh = false) {
  // Проверяем актуальность кеша для любой статьи
  const anyCache = Object.values(articlesCache)[0];
  if (anyCache && isCacheValid(anyCache, forceRefresh)) {
    return Object.values(articlesCache).map(entry => entry.data);
  }

  try {
    const response = await fetchWithTimeout(ARTICLES_API);
    const articles = await response.json();
    
    if (!Array.isArray(articles)) {
      console.error("Cases API returned non-array:", {
        type: Array.isArray(articles) ? "array" : typeof articles,
        keys: articles && typeof articles === "object" ? Object.keys(articles).slice(0, 8) : [],
      });
      return Object.keys(articlesCache).length > 0 
        ? Object.values(articlesCache).map(entry => entry.data) 
        : [];
    }
    
    console.log("Cases API items:", { count: articles.length });
    
    // Очищаем старый кеш
    Object.keys(articlesCache).forEach(key => delete articlesCache[key]);
    
    // Кешируем результаты
    const now = Date.now();
    articles.forEach((article: any) => {
      articlesCache[article.property_slug] = {
        data: article,
        timestamp: now
      };
    });
    
    return articles;
  } catch (error) {
    console.error("Ошибка при получении статей блога:", error);
    
    // Возвращаем кешированные данные, даже если они устарели
    if (Object.keys(articlesCache).length > 0) {
      console.log("Возвращаем устаревший кеш");
      return Object.values(articlesCache).map(entry => entry.data);
    }
    
    return [];
  }
}

/**
 * Получение контента статьи по ID с проверкой актуальности кеша
 */
export async function getBlogArticleContent(id: string, forceRefresh = false) {
  if (!id) {
    console.error("getBlogArticleContent: передан пустой id");
    return null;
  }

  try {
    // Проверяем актуальность кеша
    const cachedContent = articleContentCache[id];
    if (cachedContent && isCacheValid(cachedContent, forceRefresh)) {
      return cachedContent.data;
    }

    const response = await fetchWithTimeout(`${ARTICLE_CONTENT_API}?id=${id}`);
    const content = await response.json();
    
    // Проверяем формат данных
    if (!content || (Array.isArray(content) && content.length === 0)) {
      throw new Error("Получены пустые данные контента");
    }
    
    // Если данные в новом формате (массив объектов с контентом и метаданными)
    if (Array.isArray(content) && content[0] && content[0].results) {
      // Обновляем кеш для статьи, если пришли метаданные
      if (content[0].property_slug && articlesCache[content[0].property_slug]) {
        articlesCache[content[0].property_slug] = {
          data: content[0],
          timestamp: Date.now()
        };
      }
    }
    
    // Кешируем результаты
    articleContentCache[id] = {
      data: content,
      timestamp: Date.now()
    };
    
    return content;
  } catch (error) {
    console.error(`Ошибка при получении контента статьи ${id}:`, error);
    
    // Возвращаем кешированные данные, даже если они устарели
    if (articleContentCache[id]) {
      console.log(`Возвращаем устаревший кеш для статьи ${id}`);
      return articleContentCache[id].data;
    }
    
    return null;
  }
}

/**
 * Получение статьи по slug
 */
export async function getBlogArticleBySlug(slug: string, forceRefresh = false) {
  if (!slug) {
    console.error("getBlogArticleBySlug: передан пустой slug");
    return null;
  }
  
  try {
    // Сначала проверяем кеш
    if (articlesCache[slug] && isCacheValid(articlesCache[slug], forceRefresh)) {
      return articlesCache[slug].data;
    }
    
    const articles = await getBlogArticles(forceRefresh);
    
    if (!Array.isArray(articles)) {
      console.error("getBlogArticleBySlug: getBlogArticles не вернул массив");
      
      // Пытаемся вернуть из кеша, даже если устарел
      if (articlesCache[slug]) {
        return articlesCache[slug].data;
      }
      
      return null;
    }
    
    const article = articles.find((article: any) => {
      if (!article) return false;
      return article.property_slug === slug;
    });
    
    if (article) {
      // Обновляем кеш для этой статьи
      articlesCache[slug] = {
        data: article,
        timestamp: Date.now()
      };
    }
    
    return article || null;
  } catch (error) {
    console.error(`Ошибка при получении статьи по slug ${slug}:`, error);
    
    // Возвращаем из кеша, даже если устарел
    if (articlesCache[slug]) {
      return articlesCache[slug].data;
    }
    
    return null;
  }
}

/**
 * Преобразование блоков Notion в HTML с оптимизацией
 */
export function renderNotionContent(blocks: any[]) {
  // Базовая проверка входных данных
  if (!blocks) {
    console.log("renderNotionContent: blocks is undefined");
    return '';
  }
  
  // Защита от неправильного формата данных
  if (!Array.isArray(blocks)) {
    console.log("renderNotionContent: blocks не является массивом:", typeof blocks);
    return '';
  }
  
  // Проверяем наличие результатов в новом формате (один объект с results)
  if (blocks.length === 0) {
    console.log("renderNotionContent: blocks - пустой массив");
    return '';
  }
  
  // Поддержка пагинации/чанков: объединяем все results/blocks из ответа.
  // API может вернуть массив объектов, каждый со своим results или blocks.
  const mergedResults = blocks.flatMap((chunk: any) =>
    Array.isArray(chunk?.results)
      ? chunk.results
      : Array.isArray(chunk?.blocks)
        ? chunk.blocks
        : []
  );

  let results = mergedResults.length > 0 ? mergedResults : blocks;
  
  // Финальная проверка на массив результатов
  if (!results || !Array.isArray(results)) {
    console.log("renderNotionContent: результаты не найдены или не являются массивом");
    return '';
  }
  
  // Проверяем на наличие элементов
  if (results.length === 0) {
    console.log("renderNotionContent: пустой массив результатов");
    return '';
  }
  
  // Используем строковую конкатенацию вместо массива и join для экономии памяти
  let html = '';
  let openListType: 'ul' | 'ol' | null = null;
  
  for (let i = 0; i < results.length; i++) {
    const block = results[i];
    if (!block) {
      console.log(`renderNotionContent: блок #${i} равен null или undefined`);
      continue;
    }
    
    if (!block.type) {
      console.log(`renderNotionContent: блок #${i} не имеет свойства type`);
      continue;
    }
    
    try {
      // Закрываем список при переходе на блоки вне list_item
      if (
        openListType &&
        block.type !== 'bulleted_list_item' &&
        block.type !== 'numbered_list_item'
      ) {
        html += openListType === 'ul' ? '</ul>' : '</ol>';
        openListType = null;
      }

      switch (block.type) {
        case 'heading_1':
          if (!getBlockRichText(block.heading_1).length) {
            html += `<h1 class="text-3xl font-bold my-4"></h1>`;
          } else {
            html += `<h1 class="text-3xl font-bold my-4">${renderRichText(getBlockRichText(block.heading_1))}</h1>`;
          }
          break;
        case 'heading_2':
          if (!getBlockRichText(block.heading_2).length) {
            html += `<h2 class="text-2xl font-bold my-4"></h2>`;
          } else {
            html += `<h2 class="text-2xl font-bold my-4">${renderRichText(getBlockRichText(block.heading_2))}</h2>`;
          }
          break;
        case 'heading_3':
          if (!getBlockRichText(block.heading_3).length) {
            html += `<h3 class="text-xl font-bold my-3"></h3>`;
          } else {
            html += `<h3 class="text-xl font-bold my-3">${renderRichText(getBlockRichText(block.heading_3))}</h3>`;
          }
          break;
        case 'paragraph':
          if (!getBlockRichText(block.paragraph).length) {
            html += `<p class="my-4"></p>`;
          } else {
            html += `<p class="my-4">${renderRichText(getBlockRichText(block.paragraph))}</p>`;
          }
          break;
        case 'quote':
          if (!getBlockRichText(block.quote).length) {
            html += `<blockquote class="border-l-4 border-gray-300 pl-4 italic my-4"></blockquote>`;
          } else {
            html += `<blockquote class="border-l-4 border-gray-300 pl-4 italic my-4">${renderRichText(getBlockRichText(block.quote))}</blockquote>`;
          }
          break;
        case 'bulleted_list_item':
          if (openListType !== 'ul') {
            if (openListType === 'ol') html += '</ol>';
            html += '<ul class="my-4 ml-6 list-disc space-y-2">';
            openListType = 'ul';
          }
          html += `<li>${renderRichText(getBlockRichText(block.bulleted_list_item))}</li>`;
          break;
        case 'numbered_list_item':
          if (openListType !== 'ol') {
            if (openListType === 'ul') html += '</ul>';
            html += '<ol class="my-4 ml-6 list-decimal space-y-2">';
            openListType = 'ol';
          }
          html += `<li>${renderRichText(getBlockRichText(block.numbered_list_item))}</li>`;
          break;
        case 'callout':
          if (!getBlockRichText(block.callout).length) {
            html += `<blockquote class="border-l-4 border-amber pl-4 my-4"></blockquote>`;
          } else {
            html += `<blockquote class="border-l-4 border-amber pl-4 my-4">${renderRichText(getBlockRichText(block.callout))}</blockquote>`;
          }
          break;
        case 'image':
          try {
            const imageUrl = block.image?.file?.url || block.image?.external?.url || '';
            if (imageUrl) {
              // Преобразуем URL изображения, если он из S3
              let processedImageUrl = imageUrl;
              
              // Больше не проксируем принудительно: оставляем абсолютные URL как есть
              
              // Проверяем URL изображения
              const isValidImageUrl = processedImageUrl.startsWith('http') || processedImageUrl.startsWith('/');
              
              if (isValidImageUrl) {
                html += `<div class="my-6">
                  <img 
                    src="${processedImageUrl}" 
                    alt="Изображение из статьи" 
                    class="max-w-full rounded-lg mx-auto shadow-md" 
                    loading="lazy" 
                    style="max-height: 500px; object-fit: contain;"
                    onerror="this.onerror=null;this.src='/api/placeholder?text=%D0%9E%D1%88%D0%B8%D0%B1%D0%BA%D0%B0%20%D0%B7%D0%B0%D0%B3%D1%80%D1%83%D0%B7%D0%BA%D0%B8';"
                  />
                </div>`;
              } else {
                // Для относительных путей добавляем основной URL
                html += `<div class="my-6">
                  <img 
                    src="/${processedImageUrl}" 
                    alt="Изображение из статьи" 
                    class="max-w-full rounded-lg mx-auto shadow-md" 
                    loading="lazy" 
                    style="max-height: 500px; object-fit: contain;"
                    onerror="this.onerror=null;this.src='/api/placeholder?text=%D0%9E%D1%88%D0%B8%D0%B1%D0%BA%D0%B0%20%D0%B7%D0%B0%D0%B3%D1%80%D1%83%D0%B7%D0%BA%D0%B8';"
                  />
                </div>`;
              }
            } else {
              // Изображение без URL (заглушка)
              html += `<div class="my-6">
                <div class="w-full h-40 bg-gray-100 flex items-center justify-center rounded-lg">
                  <span class="text-gray-400">Изображение недоступно</span>
                </div>
              </div>`;
            }
          } catch (error) {
            console.error("Ошибка при обработке изображения:", error);
            html += `<div class="my-6">
              <div class="w-full h-40 bg-gray-100 flex items-center justify-center rounded-lg">
                <span class="text-gray-400">Ошибка загрузки изображения</span>
              </div>
            </div>`;
          }
          break;
        
        case 'video':
          try {
            const videoUrl = block.video?.file?.url || block.video?.external?.url || '';
            const caption = block.video?.caption ? renderRichText(block.video.caption) : '';
            
            if (videoUrl) {
              // Проверяем если это YouTube видео
              if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
                let videoId = '';
                if (videoUrl.includes('youtu.be/')) {
                  videoId = videoUrl.split('youtu.be/')[1]?.split('?')[0];
                } else if (videoUrl.includes('watch?v=')) {
                  videoId = videoUrl.split('watch?v=')[1]?.split('&')[0];
                }
                
                if (videoId) {
                  html += `<div class="my-6">
                    <div class="relative w-full aspect-video">
                      <iframe 
                        src="https://www.youtube.com/embed/${videoId}" 
                        title="YouTube видео" 
                        frameborder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                        allowfullscreen
                        class="w-full h-full rounded-lg"
                      ></iframe>
                    </div>
                    ${caption ? `<p class="text-center text-sm text-gray-600 mt-2">${caption}</p>` : ''}
                  </div>`;
                }
              }
              // Проверяем если это Vimeo видео
              else if (videoUrl.includes('vimeo.com')) {
                const videoId = videoUrl.split('vimeo.com/')[1]?.split('?')[0];
                if (videoId) {
                  html += `<div class="my-6">
                    <div class="relative w-full aspect-video">
                      <iframe 
                        src="https://player.vimeo.com/video/${videoId}" 
                        title="Vimeo видео" 
                        frameborder="0" 
                        allow="autoplay; fullscreen; picture-in-picture" 
                        allowfullscreen
                        class="w-full h-full rounded-lg"
                      ></iframe>
                    </div>
                    ${caption ? `<p class="text-center text-sm text-gray-600 mt-2">${caption}</p>` : ''}
                  </div>`;
                }
              }
              // Для обычных видео файлов
              else {
                html += `<div class="my-6">
                  <video 
                    controls 
                    class="w-full rounded-lg shadow-md" 
                    style="max-height: 500px;"
                  >
                    <source src="${videoUrl}" type="video/mp4">
                    Ваш браузер не поддерживает воспроизведение видео.
                  </video>
                  ${caption ? `<p class="text-center text-sm text-gray-600 mt-2">${caption}</p>` : ''}
                </div>`;
              }
            }
          } catch (error) {
            console.error("Ошибка при обработке видео блока:", error);
          }
          break;
          
        case 'embed':
          try {
            const embedUrl = block.embed?.url || '';
            const caption = block.embed?.caption ? renderRichText(block.embed.caption) : '';
            
            console.log(`renderNotionContent: обработка embed блока с URL: ${embedUrl}`);
            
            if (embedUrl) {
              // Проверяем если это SoundCloud embed
              if (embedUrl.includes('soundcloud.com')) {
                html += `<div class="my-6">
                  <div class="relative w-full">
                    <iframe 
                      width="100%" 
                      height="166" 
                      scrolling="no" 
                      frameborder="no" 
                      allow="autoplay" 
                      src="${embedUrl}"
                      class="w-full rounded-lg"
                    ></iframe>
                  </div>
                  ${caption ? `<p class="text-center text-sm text-gray-600 mt-2">${caption}</p>` : ''}
                </div>`;
              }
              // Проверяем если это Spotify embed
              else if (embedUrl.includes('spotify.com')) {
                html += `<div class="my-6">
                  <div class="relative w-full">
                    <iframe 
                      src="${embedUrl}" 
                      width="100%" 
                      height="352" 
                      frameborder="0" 
                      allowtransparency="true" 
                      allow="encrypted-media"
                      class="w-full rounded-lg"
                    ></iframe>
                  </div>
                  ${caption ? `<p class="text-center text-sm text-gray-600 mt-2">${caption}</p>` : ''}
                </div>`;
              }
              // Проверяем если это CodePen embed
              else if (embedUrl.includes('codepen.io')) {
                html += `<div class="my-6">
                  <div class="relative w-full aspect-video">
                    <iframe 
                      src="${embedUrl}" 
                      title="CodePen" 
                      frameborder="0" 
                      loading="lazy" 
                      allowfullscreen
                      class="w-full h-full rounded-lg"
                    ></iframe>
                  </div>
                  ${caption ? `<p class="text-center text-sm text-gray-600 mt-2">${caption}</p>` : ''}
                </div>`;
              }
              // Проверяем если это Figma embed
              else if (embedUrl.includes('figma.com')) {
                html += `<div class="my-6">
                  <div class="relative w-full aspect-video">
                    <iframe 
                      src="${embedUrl}" 
                      title="Figma" 
                      frameborder="0" 
                      allowfullscreen
                      class="w-full h-full rounded-lg"
                    ></iframe>
                  </div>
                  ${caption ? `<p class="text-center text-sm text-gray-600 mt-2">${caption}</p>` : ''}
                </div>`;
              }
              // Проверяем если это Twitter/X embed
              else if (embedUrl.includes('twitter.com') || embedUrl.includes('x.com')) {
                html += `<div class="my-6">
                  <div class="relative w-full">
                    <iframe 
                      src="${embedUrl}" 
                      title="Twitter/X Post" 
                      frameborder="0" 
                      scrolling="no" 
                      width="100%" 
                      height="500"
                      class="w-full rounded-lg"
                    ></iframe>
                  </div>
                  ${caption ? `<p class="text-center text-sm text-gray-600 mt-2">${caption}</p>` : ''}
                </div>`;
              }
              // Для остальных embed'ов - универсальный iframe
              else {
                html += `<div class="my-6">
                  <div class="relative w-full aspect-video">
                    <iframe 
                      src="${embedUrl}" 
                      title="Embedded content" 
                      frameborder="0" 
                      allowfullscreen
                      class="w-full h-full rounded-lg"
                    ></iframe>
                  </div>
                  ${caption ? `<p class="text-center text-sm text-gray-600 mt-2">${caption}</p>` : ''}
                </div>`;
              }
            }
          } catch (error) {
            console.error("Ошибка при обработке embed блока:", error);
          }
          break;
          
        default:
          console.log(`renderNotionContent: неизвестный тип блока: ${block.type}`);
          // Fallback: если в неизвестном блоке есть текст, не теряем его
          const fallbackText = getBlockRichText(block[block.type]);
          if (fallbackText.length) {
            html += `<p class="my-4">${renderRichText(fallbackText)}</p>`;
          }
          break;
      }
    } catch (error) {
      console.error(`Ошибка обработки блока типа ${block.type}:`, error);
      // Продолжаем выполнение, пропуская проблемный блок
    }
  }

  if (openListType) {
    html += openListType === 'ul' ? '</ul>' : '</ol>';
  }
  
  return html;
}

function getBlockRichText(blockData: any): any[] {
  if (!blockData) return [];
  if (Array.isArray(blockData.rich_text)) return blockData.rich_text;
  if (Array.isArray(blockData.text)) return blockData.text;
  return [];
}

/**
 * Оптимизированная обработка rich text из Notion
 */
function renderRichText(richTextArray: any[] = []) {
  // Проверка на наличие массива
  if (!richTextArray) {
    console.log("renderRichText: richTextArray is undefined");
    return '';
  }
  
  // Проверка на тип массива
  if (!Array.isArray(richTextArray)) {
    console.log("renderRichText: richTextArray не является массивом:", typeof richTextArray);
    return String(richTextArray || '');
  }
  
  // Проверка на пустой массив
  if (richTextArray.length === 0) {
    return '';
  }
  
  let result = '';
  
  try {
    for (let i = 0; i < richTextArray.length; i++) {
      const textObj = richTextArray[i];
      
      // Проверка на наличие объекта текста
      if (!textObj) {
        console.log(`renderRichText: элемент массива #${i} равен null или undefined`);
        continue;
      }
      
      // Получаем текст безопасно
      let text = '';
      if (textObj.plain_text !== undefined) {
        text = String(textObj.plain_text);
      } else {
        console.log(`renderRichText: элемент #${i} не имеет свойства plain_text`);
        continue;
      }
      
      // Применяем форматирование, проверяя каждое свойство
      if (textObj.annotations) {
        if (textObj.annotations.bold) text = `<strong>${text}</strong>`;
        if (textObj.annotations.italic) text = `<em>${text}</em>`;
        if (textObj.annotations.underline) text = `<u>${text}</u>`;
        if (textObj.annotations.strikethrough) text = `<s>${text}</s>`;
        if (textObj.annotations.code) text = `<code>${text}</code>`;
      }
      
      // Добавляем ссылку, если она есть
      if (textObj.text && textObj.text.link && textObj.text.link.url) {
        text = `<a href="${textObj.text.link.url}" target="_blank" class="text-amber hover:underline">${text}</a>`;
      }
      
      result += text;
    }
  } catch (error) {
    console.error("Ошибка при рендеринге rich text:", error);
    // Возвращаем то, что успели сформировать
  }
  
  return result;
}

/**
 * Получение статей блога с нового API endpoint 
 */
export async function getBlogPostsFromAPI(forceRefresh = false) {
  // Проверяем актуальность кеша для любой статьи БЛОГА
  const anyCache = Object.values(blogCache)[0];
  if (anyCache && isCacheValid(anyCache, forceRefresh)) {
    return Object.values(blogCache).map(entry => entry.data);
  }

  try {
    const response = await fetchWithTimeout(BLOG_API);
    const articles = await response.json();
    
    if (!Array.isArray(articles)) {
      console.error("API вернул некорректный формат данных (не массив)");
      return Object.keys(blogCache).length > 0 
        ? Object.values(blogCache).map(entry => entry.data) 
        : [];
    }
    
    // Очищаем старый кеш блога
    Object.keys(blogCache).forEach(key => delete blogCache[key]);
    
    // Кешируем результаты в кеш блога
    const now = Date.now();
    articles.forEach((article: any) => {
      // Для блога используем property_link_name
      blogCache[article.property_link_name] = {
        data: article,
        timestamp: now
      };
    });
    
    return articles;
  } catch (error) {
    console.error("Ошибка при получении статей блога:", error);
    
    // Возвращаем кешированные данные, даже если они устарели
    if (Object.keys(blogCache).length > 0) {
      console.log("Возвращаем устаревший кеш");
      return Object.values(blogCache).map(entry => entry.data);
    }
    
    return [];
  }
}

/**
 * Получение статьи блога по slug (для нового API)
 */
export async function getBlogPostBySlug(slug: string, forceRefresh = false) {
  if (!slug) {
    console.error("getBlogPostBySlug: передан пустой slug");
    return null;
  }
  
  try {
    // Сначала проверяем кеш блога
    if (blogCache[slug] && isCacheValid(blogCache[slug], forceRefresh)) {
      return blogCache[slug].data;
    }
    
    const articles = await getBlogPostsFromAPI(forceRefresh);
    
    if (!Array.isArray(articles)) {
      console.error("getBlogPostBySlug: getBlogPostsFromAPI не вернул массив");
      
      // Пытаемся вернуть из кеша блога, даже если устарел
      if (blogCache[slug]) {
        return blogCache[slug].data;
      }
      
      return null;
    }
    
    const article = articles.find((article: any) => {
      if (!article) return false;
      return article.property_link_name === slug;
    });
    
    if (!article) {
      console.log(`getBlogPostBySlug: статья с slug "${slug}" не найдена`);
      return null;
    }
    
    // Кешируем результат в кеш блога
    blogCache[slug] = {
      data: article,
      timestamp: Date.now()
    };
    
    return article;
  } catch (error) {
    console.error(`Ошибка при получении статьи блога по slug ${slug}:`, error);
    
    // Пытаемся вернуть из кеша блога, даже если устарел
    if (blogCache[slug]) {
      console.log(`Возвращаем устаревший кеш для блога ${slug}`);
      return blogCache[slug].data;
    }
    
    return null;
  }
}

/**
 * Сортировка статей по дате (новые сверху)
 */
export function sortArticlesByDate(articles: any[]): any[] {
  if (!Array.isArray(articles)) return [];

  return [...articles].sort((a, b) => {
    const dateA = parseArticleDate(a.property_format_date || a.property_date || '');
    const dateB = parseArticleDate(b.property_format_date || b.property_date || '');

    // Если обе даты невалидны, оставляем исходный порядок
    if (!dateA && !dateB) return 0;
    // Если только одна дата валидна, она идет первой
    if (!dateA) return 1;
    if (!dateB) return -1;

    // Сортируем по убыванию (новые первыми)
    return dateB.getTime() - dateA.getTime();
  });
}

/**
 * Сортировка блога по дате (новые сверху)
 */
export function sortBlogPostsByDate(articles: any[]): any[] {
  if (!Array.isArray(articles)) return [];

  return [...articles].sort((a, b) => {
    // Для блога используем property_date
    const dateA = parseArticleDate(a.property_date || a.property_created_date || '');
    const dateB = parseArticleDate(b.property_date || b.property_created_date || '');

    // Если обе даты невалидны, оставляем исходный порядок
    if (!dateA && !dateB) return 0;
    // Если только одна дата валидна, она идет первой
    if (!dateA) return 1;
    if (!dateB) return -1;

    // Сортируем по убыванию (новые первыми)
    return dateB.getTime() - dateA.getTime();
  });
}

/**
 * Парсинг даты из строки с различными форматами
 */
function parseArticleDate(dateStr: string): Date | null {
  if (!dateStr || typeof dateStr !== 'string') return null;

  const trimmed = dateStr.trim();
  if (!trimmed) return null;

  // Проверяем ISO формат (2024-01-15)
  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const date = new Date(trimmed);
    if (!isNaN(date.getTime())) return date;
  }

  // Проверяем формат (15 января 2024)
  // Поддерживаем русский и украинский языки
  const months = {
    'января': 0, 'февраля': 1, 'марта': 2, 'апреля': 3, 'мая': 4, 'июня': 5,
    'июля': 6, 'августа': 7, 'сентября': 8, 'октября': 9, 'ноября': 10, 'декабря': 11,
    'січня': 0, 'лютого': 1, 'березня': 2, 'квітня': 3, 'травня': 4, 'червня': 5,
    'липня': 6, 'серпня': 7, 'вересня': 8, 'жовтня': 9, 'листопада': 10, 'грудня': 11
  };

  let wordMatch = trimmed.match(/(\d{1,2})\s+(\w+)\s+(\d{4})/);
  if (wordMatch) {
    const [, day, month, year] = wordMatch;
    const monthKey = (month as keyof typeof months);
    if (monthKey in months) {
      return new Date(parseInt(year), months[monthKey], parseInt(day));
    }
  }

  // Пытаемся использовать встроенный парсер
  const date = new Date(trimmed);
  if (!isNaN(date.getTime())) return date;

  return null;
}

/**
 * Получение контента статьи блога по id
 */
export async function getBlogPostContent(id: string, forceRefresh = false) {
  if (!id) {
    console.error("getBlogPostContent: передан пустой id");
    return null;
  }

  console.log(`getBlogPostContent: запрос контента для статьи блога с ID: ${id}`);

  try {
    if (forceRefresh && blogContentCache[id]) {
      delete blogContentCache[id];
    }

    // Проверяем актуальность кеша для контента блога
    const cachedContent = blogContentCache[id];
    if (cachedContent && isCacheValid(cachedContent, forceRefresh)) {
      console.log(`getBlogPostContent: возвращаем кешированный контент для ID: ${id}`);
      return cachedContent.data;
    }

    // Формируем URL с параметром id
    const url = `${BLOG_CONTENT_API}?id=${id}`;
    console.log(`getBlogPostContent: делаем запрос к API: ${url}`);
    
    const response = await fetchWithTimeout(url, {
      cache: forceRefresh ? 'no-store' : 'default',
      next: { revalidate: forceRefresh ? 0 : 300 },
    } as RequestInit & { next: { revalidate: number } });
    const content = await response.json();
    
    console.log(`getBlogPostContent: получен ответ от API для ID: ${id}`, { 
      hasContent: !!content, 
      isArray: Array.isArray(content), 
      length: Array.isArray(content) ? content.length : 'не массив'
    });
    
    // Проверяем формат данных
    if (!content || (Array.isArray(content) && content.length === 0)) {
      throw new Error("Получены пустые данные контента блога");
    }
    
    // Если данные в новом формате (массив объектов с контентом и метаданными)
    if (Array.isArray(content) && content[0] && content[0].results) {
      console.log(`getBlogPostContent: контент в новом формате с results для ID: ${id}`);
      // Обновляем кеш для статьи блога, если пришли метаданные
      if (content[0].property_link_name && blogCache[content[0].property_link_name]) {
        blogCache[content[0].property_link_name] = {
          data: content[0],
          timestamp: Date.now()
        };
      }
    }
    
    // Кешируем результаты в кеш контента блога
    blogContentCache[id] = {
      data: content,
      timestamp: Date.now()
    };
    
    console.log(`getBlogPostContent: успешно получен и кеширован контент для ID: ${id}`);
    return content;
  } catch (error) {
    console.error(`Ошибка при получении контента статьи блога ${id}:`, error);
    
    // Возвращаем кешированные данные, даже если они устарели
    if (blogContentCache[id]) {
      console.log(`Возвращаем устаревший кеш для статьи блога ${id}`);
      return blogContentCache[id].data;
    }
    
    return null;
  }
}
