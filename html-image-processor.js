/**
 * Утилиты для обработки HTML-контента и замены URL изображений
 * Используется для страниц блога и кейсов
 */

/**
 * Обрабатывает HTML-контент, заменяя URL изображений из S3 на локальные прокси-URL
 * @param {string} html - HTML-контент для обработки
 * @return {string} - Обработанный HTML-контент
 */
function processHtmlContent(html) {
  if (!html) return '';
  
  try {
    console.log(`Начало обработки HTML контента длиной ${html.length} символов`);
    
    // Заменяем все URL изображений из S3 на прокси URL
    let processed = html.replace(
      /(src=[\"'])(https?:\/\/[^\"']*(?:s3\.amazonaws\.com\/crmcustoms\.site|crmcustoms\.site\.s3[^\"']*amazonaws\.com|s3[^\"']*\/crmcustoms\.site|s3[^\"']*crmcustoms\.site)[^\"']+)([\"'])/gi, 
      (match, p1, p2, p3) => {
        try {
          // Проверяем, является ли это проблемным файлом
          if (p2.includes('nesr6r5hdnrmc0cqf0es5v5bww')) {
            console.log(`Обнаружен проблемный файл в HTML: ${p2}`);
            return `${p1}/placeholder.jpg${p3}`;
          }
          
          // Передаем полный URL в API-маршрут
          const proxyUrl = `/api/s3-proxy/${encodeURIComponent(p2)}`;
          console.log(`Заменен URL в HTML: ${p2.substring(0, 50)}... -> ${proxyUrl}`);
          return `${p1}${proxyUrl}${p3}`;
        } catch (e) {
          console.error('Error processing S3 URL:', e);
          return match;
        }
      }
    );
    
    // Заменяем относительные URL изображений
    processed = processed.replace(
      /(src=[\"'])(?!https?:\/\/)(?!\/api\/s3-proxy\/)([^\"']+)([\"'])/gi,
      (match, p1, p2, p3) => {
        try {
          if (p2.startsWith('/')) {
            return match; // Оставляем абсолютные пути без изменений
          }
          const newUrl = `${p1}/${p2}${p3}`; // Добавляем слеш к относительным путям
          console.log(`Исправлен относительный путь: ${p2} -> /${p2}`);
          return newUrl;
        } catch (e) {
          console.error('Error processing relative URL:', e);
          return match;
        }
      }
    );
    
    // Добавляем обработчики ошибок для изображений
    processed = processed.replace(
      /<img([^>]*)>/gi,
      '<img$1 onerror="this.onerror=null;this.src=\'/placeholder.jpg\';" loading="lazy">'
    );
    
    // Добавляем классы для оформления изображений
    processed = processed.replace(
      /<img([^>]*)>/gi,
      '<img$1 class="max-w-full rounded-lg mx-auto shadow-md">'
    );
    
    // Оборачиваем изображения в div для лучшего отображения
    processed = processed.replace(
      /<img([^>]*)>/gi,
      '<div class="my-6 flex justify-center"><img$1></div>'
    );
    
    console.log(`Обработка HTML завершена`);
    return processed;
  } catch (e) {
    console.error('Error processing HTML content:', e);
    return html;
  }
}

/**
 * Преобразует URL изображения из S3 в локальный прокси-URL
 * @param {string} url - URL изображения
 * @return {string} - Преобразованный URL
 */
function getImageUrl(url) {
  if (!url || url === '' || url === 'null' || url === 'undefined') {
    console.log('Пустой URL изображения, используем заглушку');
    return '/placeholder.jpg';
  }
  
  try {
    // Проверяем, является ли URL абсолютным
    const isAbsoluteUrl = url.startsWith('http://') || url.startsWith('https://');
    
    // Если URL относительный, добавляем базовый URL
    if (!isAbsoluteUrl && !url.startsWith('/')) {
      console.log(`Относительный URL: ${url} -> /${url}`);
      return `/${url}`;
    }
    
    // Проверяем, является ли это проблемным файлом
    if (url.includes('nesr6r5hdnrmc0cqf0es5v5bww')) {
      console.log(`Обнаружен проблемный файл, используем локальную заглушку`);
      return '/placeholder.jpg';
    }
    
    // Проверяем различные форматы URL S3
    const s3Patterns = [
      /s3\.amazonaws\.com\/crmcustoms\.site/i,
      /crmcustoms\.site\.s3/i,
      /s3\..*\.amazonaws\.com\/crmcustoms\.site/i,
      /s3-.*\.amazonaws\.com\/crmcustoms\.site/i,
      /crmcustoms\.site\.s3\..*\.amazonaws\.com/i
    ];
    
    const isS3Url = isAbsoluteUrl && s3Patterns.some(pattern => pattern.test(url));
    
    if (isS3Url) {
      try {
        // Передаем полный URL в API-маршрут
        const proxyUrl = `/api/s3-proxy/${encodeURIComponent(url)}`;
        console.log(`Преобразован S3 URL: ${url.substring(0, 50)}... -> ${proxyUrl}`);
        return proxyUrl;
      } catch (error) {
        console.error('Ошибка при обработке S3 URL:', error, url);
        return '/placeholder.jpg';
      }
    }
    
    return url;
  } catch (error) {
    console.error('Ошибка в getImageUrl:', error);
    return '/placeholder.jpg';
  }
}

/**
 * Обрабатывает HTML-контент для кейсов, добавляя стили и классы
 * @param {string} html - HTML-контент для обработки
 * @return {string} - Обработанный HTML-контент
 */
function processCaseHtmlContent(html) {
  if (!html) return '';
  
  // Сначала обрабатываем все изображения
  let processed = processHtmlContent(html);
  
  try {
    // Добавляем отступы и оформление как в блоге
    processed = processed.replace(/<p/g, '<p class="mb-6"');
    processed = processed.replace(/<h([1-6])/g, '<h$1 class="mt-8 mb-4 font-bold"');
    processed = processed.replace(/<ul/g, '<ul class="list-disc pl-6 mb-6 space-y-2"');
    processed = processed.replace(/<ol/g, '<ol class="list-decimal pl-6 mb-6 space-y-2"');
    processed = processed.replace(/<li/g, '<li class="mb-2"');
    
    // Добавляем оформление для таблиц
    processed = processed.replace(/<table/g, '<table class="w-full border-collapse mb-6"');
    processed = processed.replace(/<th/g, '<th class="border border-gray-300 p-2 bg-gray-100"');
    processed = processed.replace(/<td/g, '<td class="border border-gray-300 p-2"');
    
    return processed;
  } catch (e) {
    console.error('Error processing case HTML content:', e);
    return processed;
  }
}

// Экспортируем функции
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    processHtmlContent,
    getImageUrl,
    processCaseHtmlContent
  };
} 