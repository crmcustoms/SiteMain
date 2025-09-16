"use client"

import React from 'react';
import Image from 'next/image';

interface PresignedImageProps {
  src: string;
  alt?: string;
  className?: string;
  width?: number;
  height?: number;
}

/**
 * Компонент для отображения пресайнутых изображений напрямую
 * Использует обычный тег img для пресайнутых URL, чтобы избежать проблем с Next.js Image
 */
export function PresignedImage({ src, alt = '', className = '', width, height }: PresignedImageProps) {
  // Проверяем, является ли URL пресайнутым
  const isPresigned = src && (
    src.includes('X-Amz-Algorithm') || 
    src.includes('X-Amz-Credential') || 
    src.includes('X-Amz-Date')
  );
  
  // Для пресайнутых URL используем обычный тег img
  if (isPresigned) {
    return (
      <img 
        src={src} 
        alt={alt} 
        className={`max-w-full h-auto ${className}`}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.onerror = null; // Предотвращаем бесконечный цикл
          target.src = '/placeholder.jpg';
        }}
        loading="lazy"
        style={{ maxWidth: '100%', height: 'auto' }}
      />
    );
  }
  
  // Для обычных URL используем SafeImage
  return (
    <SafeImage 
      src={src} 
      alt={alt} 
      className={className}
      width={width}
      height={height}
    />
  );
}

interface SafeImageProps {
  src: string;
  alt?: string;
  className?: string;
  width?: number;
  height?: number;
}

/**
 * Компонент для безопасного отображения изображений с обработкой ошибок
 */
export default function SafeImage({ src, alt = '', className = '', width, height }: SafeImageProps) {
  // Если URL не предоставлен, возвращаем заглушку
  if (!src) {
    return (
      <div className={`bg-gray-200 ${className}`} style={{ width: width || '100%', height: height || 200 }}>
        <div className="flex items-center justify-center h-full text-gray-500">
          Нет изображения
        </div>
      </div>
    );
  }
  
  // Обработка URL изображения
  const imageUrl = processImageUrl(src);
  
  return (
    <img 
      src={imageUrl} 
      alt={alt} 
      className={`max-w-full h-auto ${className}`}
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.onerror = null; // Предотвращаем бесконечный цикл
        target.src = '/placeholder.jpg';
      }}
      loading="lazy"
      width={width}
      height={height}
      style={{ maxWidth: '100%', height: 'auto' }}
    />
  );
}

/**
 * Функция для обработки URL изображения
 */
export function processImageUrl(url: string): string {
  if (!url) return '/placeholder.jpg';
  
  // Проверяем, является ли URL пресайнутым
  if (url.includes('X-Amz-Algorithm') || url.includes('X-Amz-Credential') || url.includes('X-Amz-Date')) {
    // Для пресайнутых URL возвращаем оригинальный URL без изменений
    return url;
  }
  
  // Проверяем, начинается ли URL с http или https
  if (url.startsWith('http')) {
    // Для внешних URL используем прокси
    return `/api/s3-proxy/${encodeURIComponent(url)}`;
  }
  
  // Для локальных файлов возвращаем как есть
  return url;
} 