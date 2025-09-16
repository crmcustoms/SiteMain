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
const ARTICLES_API = "https://n8n.crmcustoms.com/webhook/9c73af6e-7c74-40b3-a04a-0b4edb481358"; // для кейсов
const ARTICLE_CONTENT_API = "https://n8n.crmcustoms.com/webhook/521ced60-5d5f-4985-ad15-744a7b9fa81e"; // для контента кейсов
const BLOG_API = "https://n8n.crmcustoms.com/webhook/9a7536da-ef13-4b37-9e64-6d9b0f1fe1a0ListPageBlog"; // для блога
const BLOG_CONTENT_API = "https://n8n.crmcustoms.com/webhook/bded422c-2a94-416c-ba2a-2d013838ef80"; // для контента блога

// Константа времени жизни кеша (15 минут)
const CACHE_DURATION = 15 * 60 * 1000;

// Время кеширования в миллисекундах (5 минут)
const CACHE_TTL = 300 * 1000;

// В режиме разработки можно отключить кеш через переменную окружения
const DISABLE_CACHE = process.env.NODE_ENV === 'development' && process.env.DISABLE_BLOG_CACHE === 'true';

// Таймаут для запросов в миллисекундах (10 секунд)
const FETCH_TIMEOUT = 10000;

/**
 * Функция для выполнения fetch запроса с таймаутом
 */
async function fetchWithTimeout(url: string, options: RequestInit = {}) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      next: { revalidate: 3600 }
    });
    
    clearTimeout(id);
    
    if (!response.ok) {
      throw new Error(`Ошибка API: ${response.status}`);
    }
    
    return response;
  } catch (error) {
    clearTimeout(id);
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
      console.error("API вернул некорректный формат данных (не массив)");
      return Object.keys(articlesCache).length > 0 
        ? Object.values(articlesCache).map(entry => entry.data) 
        : [];
    }
    
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
  
  // Проверяем структуру данных
  // Если в новом формате - один объект с полем results
  const firstBlock = blocks[0];
  if (!firstBlock) {
    console.log("renderNotionContent: первый элемент blocks равен null или undefined");
    return '';
  }
  
  let results;
  
  // Проверяем наличие поля results в первом блоке
  if (firstBlock.results) {
    results = firstBlock.results;
    
    // Проверяем что results массив
    if (!Array.isArray(results)) {
      console.log("renderNotionContent: firstBlock.results не является массивом:", typeof results);
      return '';
    }
  } 
  // Если это массив блоков Notion напрямую
  else if (Array.isArray(blocks)) {
    results = blocks;
  } 
  else {
    console.log("renderNotionContent: не удалось найти результаты блоков");
    return '';
  }
  
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
      switch (block.type) {
        case 'heading_1':
          if (!block.heading_1 || !block.heading_1.text) {
            html += `<h1 class="text-3xl font-bold my-4"></h1>`;
          } else {
            html += `<h1 class="text-3xl font-bold my-4">${renderRichText(block.heading_1.text)}</h1>`;
          }
          break;
        case 'heading_2':
          if (!block.heading_2 || !block.heading_2.text) {
            html += `<h2 class="text-2xl font-bold my-4"></h2>`;
          } else {
            html += `<h2 class="text-2xl font-bold my-4">${renderRichText(block.heading_2.text)}</h2>`;
          }
          break;
        case 'heading_3':
          if (!block.heading_3 || !block.heading_3.text) {
            html += `<h3 class="text-xl font-bold my-3"></h3>`;
          } else {
            html += `<h3 class="text-xl font-bold my-3">${renderRichText(block.heading_3.text)}</h3>`;
          }
          break;
        case 'paragraph':
          if (!block.paragraph || !block.paragraph.text) {
            html += `<p class="my-4"></p>`;
          } else {
            html += `<p class="my-4">${renderRichText(block.paragraph.text)}</p>`;
          }
          break;
        case 'quote':
          if (!block.quote || !block.quote.text) {
            html += `<blockquote class="border-l-4 border-gray-300 pl-4 italic my-4"></blockquote>`;
          } else {
            html += `<blockquote class="border-l-4 border-gray-300 pl-4 italic my-4">${renderRichText(block.quote.text)}</blockquote>`;
          }
          break;
        case 'bulleted_list_item':
          if (!block.bulleted_list_item || !block.bulleted_list_item.text) {
            html += `<li class="ml-6 list-disc"></li>`;
          } else {
            html += `<li class="ml-6 list-disc">${renderRichText(block.bulleted_list_item.text)}</li>`;
          }
          break;
        case 'numbered_list_item':
          if (!block.numbered_list_item || !block.numbered_list_item.text) {
            html += `<li class="ml-6 list-decimal"></li>`;
          } else {
            html += `<li class="ml-6 list-decimal">${renderRichText(block.numbered_list_item.text)}</li>`;
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
          break;
      }
    } catch (error) {
      console.error(`Ошибка обработки блока типа ${block.type}:`, error);
      // Продолжаем выполнение, пропуская проблемный блок
    }
  }
  
  return html;
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
 * Получение контента статьи блога по id
 */
export async function getBlogPostContent(id: string, forceRefresh = false) {
  if (!id) {
    console.error("getBlogPostContent: передан пустой id");
    return null;
  }

  console.log(`getBlogPostContent: запрос контента для статьи блога с ID: ${id}`);

  try {
    // Проверяем актуальность кеша для контента блога
    const cachedContent = blogContentCache[id];
    if (cachedContent && isCacheValid(cachedContent, forceRefresh)) {
      console.log(`getBlogPostContent: возвращаем кешированный контент для ID: ${id}`);
      return cachedContent.data;
    }

    // Формируем URL с параметром id
    const url = `${BLOG_CONTENT_API}?id=${id}`;
    console.log(`getBlogPostContent: делаем запрос к API: ${url}`);
    
    const response = await fetchWithTimeout(url);
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
