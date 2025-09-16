"use client"

import React, { useEffect, useRef } from 'react';

interface DirectHtmlContentProps {
  html: string;
}

/**
 * Компонент для отображения HTML-контента с прямыми ссылками на изображения
 */
export default function DirectHtmlContent({ html }: DirectHtmlContentProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    try {
      if (!contentRef.current) return;
      
      // Находим все изображения в контенте
      const images = contentRef.current.querySelectorAll('img');
      console.log(`Найдено ${images.length} изображений в HTML-контенте`);
      
      // Добавляем обработчики ошибок для всех изображений
      images.forEach((img, index) => {
        try {
          const originalSrc = img.getAttribute('src');
          if (!originalSrc) return;
          
          // Проверяем, является ли URL пресайнутым из AWS
          const isAwsPresigned = 
            originalSrc.includes('X-Amz-Algorithm') || 
            originalSrc.includes('X-Amz-Credential') || 
            originalSrc.includes('X-Amz-Date');
          
          // Проверяем, является ли URL из Notion
          const isNotion = 
            originalSrc.includes('prod-files-secure.s3') || 
            originalSrc.includes('notion-static.com');
          
          // Проверяем, содержит ли URL прокси
          const containsProxy = originalSrc.includes('/api/s3-proxy/');
          
          // Если URL содержит прокси, пробуем развернуть в абсолютный URL
          if (containsProxy) {
            try {
              const match = originalSrc.match(/\/api\/s3-proxy\/(.+)$/);
              if (match && match[1]) {
                const decodedUrl = decodeURIComponent(match[1]);
                if (decodedUrl.startsWith('http://') || decodedUrl.startsWith('https://')) {
                  console.log(`Изображение ${index}: Заменяем прокси URL на прямой`);
                  img.src = decodedUrl;
                } else {
                  // Если внутри прокси не абсолютный URL, оставляем как есть
                  console.log(`Изображение ${index}: Внутри прокси не абсолютный URL, оставляем src без изменений`);
                }
              }
            } catch (decodeError) {
              console.error('Ошибка при декодировании URL:', decodeError);
            }
          }
          
          // Если URL относительный или локальный, используем заглушку
          if (originalSrc.startsWith('/') && !originalSrc.startsWith('/api/')) {
            img.src = `/api/placeholder?text=${encodeURIComponent('Локальное изображение')}`;
          }
          
          // Добавляем атрибуты для улучшения загрузки
          img.setAttribute('loading', 'lazy');
          img.setAttribute('decoding', 'async');
          
          // Добавляем стили
          img.style.maxWidth = '100%';
          img.style.height = 'auto';
          img.classList.add('my-4');
          
          // Добавляем обработчик ошибок
          img.onerror = function() {
            console.error(`Ошибка загрузки изображения: ${originalSrc.substring(0, 100)}...`);
            img.src = `/api/placeholder?text=${encodeURIComponent('Ошибка загрузки')}`;
            img.style.border = '1px solid #ff0000';
            img.style.padding = '5px';
          };
          
          // Добавляем обработчик успешной загрузки
          img.onload = function() {
            console.log(`Изображение ${index}: ${originalSrc.substring(0, 50)}... загружено успешно`);
          };
        } catch (imgError) {
          console.error('Ошибка при обработке изображения:', imgError);
        }
      });
      
      // Находим все iframe'ы в контенте (для embed'ов)
      const iframes = contentRef.current.querySelectorAll('iframe');
      console.log(`Найдено ${iframes.length} iframe'ов в HTML-контенте`);
      
      // Добавляем обработчики для всех iframe'ов
      iframes.forEach((iframe, index) => {
        try {
          const originalSrc = iframe.getAttribute('src');
          if (!originalSrc) return;
          
          console.log(`iframe ${index}: ${originalSrc.substring(0, 50)}...`);
          
          // Добавляем атрибуты для улучшения загрузки
          iframe.setAttribute('loading', 'lazy');
          
          // Добавляем обработчик ошибок
          iframe.onerror = function() {
            console.error(`Ошибка загрузки iframe: ${originalSrc.substring(0, 100)}...`);
            // Заменяем на сообщение об ошибке
            const errorDiv = document.createElement('div');
            errorDiv.className = 'w-full h-40 bg-gray-100 flex items-center justify-center rounded-lg border';
            errorDiv.innerHTML = '<span class="text-gray-400">Ошибка загрузки embed-контента</span>';
            iframe.parentNode?.replaceChild(errorDiv, iframe);
          };
          
          // Добавляем обработчик успешной загрузки
          iframe.onload = function() {
            console.log(`iframe ${index}: ${originalSrc.substring(0, 50)}... загружен успешно`);
          };
        } catch (iframeError) {
          console.error('Ошибка при обработке iframe:', iframeError);
        }
      });
    } catch (error) {
      console.error('Ошибка в DirectHtmlContent:', error);
    }
  }, [html]);
  
  return (
    <div 
      className="prose max-w-none" 
      dangerouslySetInnerHTML={{ __html: html }} 
      ref={contentRef}
    />
  );
} 