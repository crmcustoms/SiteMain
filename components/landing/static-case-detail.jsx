"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useState, useRef } from "react"

export default function StaticCaseDetail({ caseData = {}, lang = 'ua', htmlContent = '', backLinkText = "Назад до кейсів" }) {
  // Добавляем состояние для отслеживания ошибок изображения
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [processedHtml, setProcessedHtml] = useState('');
  // Используем useRef вместо useState для отладочной информации
  const debugInfoRef = useRef([]);
  const [debugInfoState, setDebugInfoState] = useState([]);
  
  // Функция для логирования - использует useRef вместо прямого вызова setState
  const logDebug = (message) => {
    console.log(`[StaticCaseDetail] ${message}`);
    // Сохраняем в ref без вызова setState
    debugInfoRef.current = [...debugInfoRef.current, message];
  };
  
  // Обновляем состояние отладочной информации только один раз при монтировании
  useEffect(() => {
    // Устанавливаем таймер для периодического обновления отладочной информации
    const timer = setInterval(() => {
      if (debugInfoRef.current.length !== debugInfoState.length) {
        setDebugInfoState([...debugInfoRef.current]);
      }
    }, 1000); // Обновляем каждую секунду
    
    return () => clearInterval(timer);
  }, [debugInfoState.length]);
  
  // Убедимся, что caseData - это объект
  const validCaseData = caseData && typeof caseData === 'object' ? caseData : {};
  
  // Функция для безопасного преобразования URL изображений
  const getImageUrl = (url) => {
    if (!url || url === '' || url === 'null' || url === 'undefined') {
      logDebug(`Пустой URL изображения, используем заглушку`);
      return '/placeholder.jpg';
    }
    
    try {
      // Проверяем, является ли URL абсолютным
      const isAbsoluteUrl = url.startsWith('http://') || url.startsWith('https://');
      
      // Если URL относительный, добавляем базовый URL
      if (!isAbsoluteUrl && !url.startsWith('/')) {
        logDebug(`Относительный URL: ${url} -> /${url}`);
        return `/${url}`;
      }
      
      // Проверяем, является ли это проблемным файлом nesr6r5hdnrmc0cqf0es5v5bww
      if (url.includes('nesr6r5hdnrmc0cqf0es5v5bww')) {
        logDebug(`Обнаружен проблемный файл, используем локальную заглушку`);
        return '/placeholder.jpg';
      }
      
      // Если URL содержит параметры безопасности AWS, используем его напрямую
      if (url.includes('X-Amz-Algorithm') || url.includes('X-Amz-Credential')) {
        logDebug(`URL содержит параметры безопасности AWS, используем напрямую: ${url.substring(0, 50)}...`);
        return url;
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
          logDebug(`Преобразован S3 URL: ${url.substring(0, 50)}... -> ${proxyUrl}`);
          return proxyUrl;
        } catch (e) {
          console.error('Error processing S3 URL:', e);
          logDebug(`Ошибка при обработке S3 URL: ${url}`);
          return '/placeholder.jpg';
        }
      }
    
      return url;
    } catch (e) {
      console.error('Error in getImageUrl:', e);
      logDebug(`Исключение в getImageUrl: ${e}`);
      return '/placeholder.jpg';
    }
  };
  
  // Безопасно извлекаем данные
  const rawCaseImage = validCaseData.image || validCaseData.background_photo || validCaseData.property_image || validCaseData.property_background_photo || validCaseData.social_network_img || validCaseData.property_social_network_img || '';
  
  // Преобразуем URL изображения
  const caseImage = getImageUrl(rawCaseImage);
  logDebug(`Основное изображение кейса: ${rawCaseImage} -> ${caseImage}`);
  
  // Обработка HTML-контента
  useEffect(() => {
    if (!caseData?.content) return;
    
    try {
      // Функция для обработки HTML-контента
      const processHtmlContent = (html) => {
        if (!html) return '';
        
        try {
          logDebug(`Начало обработки HTML контента длиной ${html.length} символов`);
          
          // Заменяем все URL изображений из S3 на прокси URL, но сохраняем URL с параметрами безопасности AWS
          let processed = html.replace(
            /(src=[\"'])(https?:\/\/[^\"']*(?:s3\.amazonaws\.com\/crmcustoms\.site|crmcustoms\.site\.s3[^\"']*amazonaws\.com|s3[^\"']*\/crmcustoms\.site|s3[^\"']*crmcustoms\.site)[^\"']+)([\"'])/gi, 
            (match, p1, p2, p3) => {
              try {
                // Проверяем, является ли это проблемным файлом
                if (p2.includes('nesr6r5hdnrmc0cqf0es5v5bww')) {
                  logDebug(`Обнаружен проблемный файл в HTML: ${p2}`);
                  return `${p1}/placeholder.jpg${p3}`;
                }
                
                // Если URL содержит параметры безопасности AWS, используем его напрямую
                if (p2.includes('X-Amz-Algorithm') || p2.includes('X-Amz-Credential')) {
                  logDebug(`URL в HTML содержит параметры безопасности AWS, используем напрямую: ${p2.substring(0, 50)}...`);
                  return match;
                }
                
                // Передаем полный URL в API-маршрут
                const proxyUrl = `/api/s3-proxy/${encodeURIComponent(p2)}`;
                logDebug(`Заменен URL в HTML: ${p2.substring(0, 50)}... -> ${proxyUrl}`);
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
                logDebug(`Исправлен относительный путь: ${p2} -> /${p2}`);
                return newUrl;
              } catch (e) {
                console.error('Error processing relative URL:', e);
                return match;
              }
            }
          );
          
          // Добавляем обработчики ошибок для всех изображений
          processed = processed.replace(
            /<img([^>]*)>/gi,
            '<img$1 onerror="this.onerror=null;this.src=\'/placeholder.jpg\';" loading="lazy" style="max-height: 500px; object-fit: contain;">'
          );
          
          // Добавляем классы для оформления изображений
          processed = processed.replace(
            /<img([^>]*)>/gi,
            '<img$1 class="max-w-full rounded-lg mx-auto my-4 shadow-md">'
          );
          
          // Оборачиваем изображения в div для лучшего отображения
          processed = processed.replace(
            /<img([^>]*)>/gi,
            '<div class="my-6 flex justify-center"><img$1></div>'
          );
          
          logDebug(`Обработка HTML завершена`);
          return processed;
        } catch (e) {
          console.error('Error processing HTML content:', e);
          return html;
        }
      };
      
      const processedContent = processHtmlContent(caseData.content);
      setProcessedHtml(processedContent);
    } catch (e) {
      console.error('Error in useEffect:', e);
    }
  }, [caseData]);
  
  // Получаем теги
  const tags = validCaseData.tags && Array.isArray(validCaseData.tags) 
    ? validCaseData.tags 
    : (validCaseData.property_tags && Array.isArray(validCaseData.property_tags) 
        ? validCaseData.property_tags 
        : []);
  
  // Получаем сервисы
  const services = validCaseData.services && Array.isArray(validCaseData.services) 
    ? validCaseData.services 
    : (validCaseData.property_services && Array.isArray(validCaseData.property_services) 
        ? validCaseData.property_services 
        : []);
  
  // Получаем ключевые слова
  const keywords = validCaseData.keywords && Array.isArray(validCaseData.keywords) ? validCaseData.keywords : [];
  const allTags = [...new Set([...tags, ...keywords])]; // Объединяем теги и ключевые слова
  
  // Безопасно извлечение дат
  const publishDate = validCaseData.publishDate || '';
  const updateDate = validCaseData.updateDate || '';
  
  // Безопасно извлекаем описание
  const description = validCaseData.description || validCaseData.property_description || '';
  
  // Убедимся, что lang имеет значение по умолчанию
  const safeLang = lang || 'ua';
  
  // Проверяем, является ли URL изображения валидным (не placeholder и не пустой)
  const hasValidImage = caseImage && caseImage !== '/placeholder.jpg' && !imageError;
  
  // Обработчик ошибки загрузки изображения
  const handleImageError = () => {
    logDebug(`Ошибка загрузки изображения: ${caseImage}`);
    setImageError(true);
  };
  
  // Обработчик успешной загрузки изображения
  const handleImageLoad = () => {
    logDebug(`Изображение успешно загружено: ${caseImage}`);
    setImageLoaded(true);
  };
  
  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Хлебные крошки */}
        <div className="mb-8">
          <Link href={`/${safeLang}/cases`} className="text-amber hover:underline flex items-center gap-2 mb-4">
            <span className="text-lg">←</span>
            <span>{backLinkText}</span>
          </Link>
        </div>
        
        {/* Заголовок и обложка */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-6">{validCaseData.title || 'Кейс'}</h1>
          
          {/* Отображаем обложку с обработкой ошибок */}
          <div className="relative w-full h-[300px] md:h-[400px] rounded-lg overflow-hidden mb-6" style={{minHeight: '300px'}}>
            {hasValidImage ? (
              <>
                <Image
                  src={caseImage}
                  alt={validCaseData.title || 'Кейс'}
                  fill
                  sizes="(max-width: 768px) 100vw, 80vw"
                  className={`object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                  onError={handleImageError}
                  onLoad={handleImageLoad}
                  priority
                  unoptimized={true}
                />
                {!imageLoaded && (
                  <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
                )}
              </>
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <Image
                  src="/placeholder.jpg"
                  alt={validCaseData.title || 'Кейс'}
                  width={600}
                  height={400}
                  className="object-contain max-h-full"
                  priority
                  unoptimized={true}
                />
              </div>
            )}
          </div>
          
          {/* Метаданные */}
          <div className="flex flex-wrap gap-4 mb-6">
            {publishDate && (
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <span>📅</span>
                <span>Опубликовано: {publishDate}</span>
              </div>
            )}
            
            {updateDate && (
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <span>🔄</span>
                <span>Обновлено: {updateDate}</span>
              </div>
            )}

            {services.length > 0 && (
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <span>🛠️</span>
                <span>Сервисы: {services.join(', ')}</span>
              </div>
            )}
          </div>
          
          {/* Описание */}
          {description && (
            <div className="text-lg text-gray-600 mb-8 p-4 bg-gray-50 rounded-lg border-l-4 border-amber">
              {description}
            </div>
          )}
        </div>
        
        {/* Основной контент */}
        <div className="prose prose-lg max-w-none mb-12">
          {processedHtml ? (
            <div dangerouslySetInnerHTML={{ __html: processedHtml }} />
          ) : (
            <div className="py-8 text-center text-gray-500">
              <p>Контент кейса загружается или временно недоступен</p>
            </div>
          )}
          
          {/* Отладочная информация (только в режиме разработки) */}
          {process.env.NODE_ENV === 'development' && debugInfoState.length > 0 && (
            <div className="mt-8 p-4 bg-gray-100 rounded-lg">
              <h3 className="font-semibold mb-2">Отладочная информация:</h3>
              <ul className="text-xs text-gray-600 space-y-1">
                {debugInfoState.map((info, index) => (
                  <li key={index}>{info}</li>
                ))}
              </ul>
                </div>
              )}
        </div>
        
        {/* Теги */}
        {allTags.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Теги</h3>
                  <div className="flex flex-wrap gap-2">
              {allTags.map((tag, index) => (
                <span 
                  key={index}
                  className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-600"
                >
                  {tag}
                </span>
                    ))}
                  </div>
                </div>
              )}
              
        {/* Контактная информация */}
        <div className="bg-amber-50 p-6 rounded-lg border border-amber-100">
          <h3 className="text-xl font-semibold mb-4">Нужна помощь с похожим проектом?</h3>
          <p className="mb-4">Свяжитесь с нами для консультации и получите индивидуальное предложение.</p>
          <div className="flex flex-wrap gap-3">
                      <Link
              href={`/${safeLang}/contact`}
              className="bg-amber hover:bg-amber-dark text-white px-4 py-2 rounded transition-colors"
                      >
              Связаться с нами
                      </Link>
                <Link
              href={`/${safeLang}/services`}
              className="bg-white border border-amber text-amber px-4 py-2 rounded hover:bg-gray-50 transition-colors"
                >
              Наши услуги
                </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 