"use client"

import React from 'react';

interface HtmlContentProps {
  html: string;
}

/**
 * Компонент для отображения HTML-контента с поддержкой пресайнутых изображений
 */
export default function HtmlContent({ html }: HtmlContentProps) {
  // Добавляем обработчики ошибок для изображений на клиенте
  React.useEffect(() => {
    // Находим все изображения на странице
    const images = document.querySelectorAll('.blog-content img');
    
    // Добавляем обработчики ошибок
    images.forEach(img => {
      img.addEventListener('error', function() {
        (this as HTMLImageElement).src = '/placeholder.jpg';
      });
    });
  }, []);
  
  return (
    <div 
      className="prose max-w-none blog-content"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
} 