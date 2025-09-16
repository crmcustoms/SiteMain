"use client"

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface DirectImageProps {
  src: string;
  alt?: string;
  className?: string;
  width?: number;
  height?: number;
}

/**
 * Компонент для отображения изображений напрямую без прокси
 */
export default function DirectImage({ 
  src, 
  alt = '', 
  className = '', 
  width = 800, 
  height = 600 
}: DirectImageProps) {
  const [imageSrc, setImageSrc] = useState<string>(src);
  const [error, setError] = useState<boolean>(false);
  
  useEffect(() => {
    try {
      // Проверяем, является ли URL пресайнутым из AWS
      const isAwsPresigned = 
        src.includes('X-Amz-Algorithm') || 
        src.includes('X-Amz-Credential') || 
        src.includes('X-Amz-Date');
      
      // Проверяем, является ли URL из Notion
      const isNotion = 
        src.includes('prod-files-secure.s3') || 
        src.includes('notion-static.com');
      
      // Проверяем, содержит ли URL прокси
      const containsProxy = src.includes('/api/s3-proxy/');
      
      // Если URL содержит прокси, пробуем развернуть в абсолютный URL
      if (containsProxy) {
        try {
          const match = src.match(/\/api\/s3-proxy\/(.+)$/);
          if (match && match[1]) {
            const decodedUrl = decodeURIComponent(match[1]);
            if (decodedUrl.startsWith('http://') || decodedUrl.startsWith('https://')) {
              console.log(`DirectImage: Заменяем прокси URL на прямой`);
              setImageSrc(decodedUrl);
              return;
            }
          }
        } catch (decodeError) {
          console.error('DirectImage: Ошибка при декодировании URL:', decodeError);
        }
      }
      
      // Если URL относительный или локальный, используем заглушку
      if (!src.startsWith('http') && !src.startsWith('/api/')) {
        console.log(`DirectImage: Обнаружен относительный URL: ${src}`);
        setImageSrc(`/api/placeholder?text=${encodeURIComponent('Относительный URL')}`);
        return;
      }
      
      // Если URL начинается с http://localhost или https://localhost, заменяем его на заглушку
      if (src.includes('http://localhost') || src.includes('https://localhost')) {
        console.log(`DirectImage: Обнаружен локальный URL: ${src}`);
        setImageSrc(`/api/placeholder?text=${encodeURIComponent('Локальный URL')}`);
        return;
      }
      
      // Для обычных URL оставляем как есть
      setImageSrc(src);
    } catch (error) {
      console.error('DirectImage: Ошибка при обработке URL:', error);
      setImageSrc(`/api/placeholder?text=${encodeURIComponent('Ошибка обработки URL')}`);
    }
  }, [src]);
  
  // Обработчик ошибки загрузки изображения
  const handleError = () => {
    console.error(`DirectImage: Ошибка загрузки изображения: ${imageSrc.substring(0, 100)}...`);
    setError(true);
    setImageSrc(`/api/placeholder?text=${encodeURIComponent('Ошибка загрузки')}`);
  };
  
  // Для изображений с пресайнутыми URL используем обычный тег img
  if (imageSrc.includes('X-Amz-Algorithm') || 
      imageSrc.includes('X-Amz-Credential') || 
      imageSrc.includes('X-Amz-Date') ||
      imageSrc.includes('notion-static.com') ||
      imageSrc.includes('prod-files-secure.s3') ||
      error) {
    return (
      <img 
        src={imageSrc} 
        alt={alt} 
        className={className}
        width={width} 
        height={height}
        loading="lazy"
        decoding="async"
        onError={handleError}
        style={{
          maxWidth: '100%',
          height: 'auto',
          objectFit: 'cover'
        }}
      />
    );
  }
  
  // Для обычных изображений используем компонент Image из Next.js
  return (
    <Image 
      src={imageSrc} 
      alt={alt} 
      className={className}
      width={width} 
      height={height}
      loading="lazy"
      onError={handleError}
      style={{
        maxWidth: '100%',
        height: 'auto',
        objectFit: 'cover'
      }}
    />
  );
} 