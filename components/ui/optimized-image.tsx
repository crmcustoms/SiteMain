"use client"

import Image from 'next/image'
import { useState, useCallback, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  fill?: boolean
  className?: string
  priority?: boolean
  sizes?: string
  quality?: number
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  onLoad?: () => void
  onError?: () => void
}

// Константа для запасного изображения
const FALLBACK_IMAGE = '/placeholder.jpg';

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className,
  priority = false,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  quality = 85,
  placeholder = 'empty',
  blurDataURL,
  onLoad,
  onError
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [imageSrc, setImageSrc] = useState<string>(src || FALLBACK_IMAGE)
  const [retryCount, setRetryCount] = useState(0)

  // Преобразование URL
  useEffect(() => {
    if (!src) {
      setImageSrc(FALLBACK_IMAGE);
      return;
    }

    // Обработка относительных URL
    if (!src.startsWith('http') && !src.startsWith('/')) {
      setImageSrc(`/${src}`);
      return;
    }
    
    // Используем исходный URL
    setImageSrc(src);
  }, [src]);

  const handleLoad = useCallback(() => {
    setIsLoading(false)
    setHasError(false)
    onLoad?.()
  }, [onLoad])

  const handleError = useCallback(() => {
    setIsLoading(false)
    
    // Если ошибка загрузки изображения и еще не было попыток, используем запасное
    if (retryCount < 1) {
      console.log(`OptimizedImage: Ошибка загрузки изображения, используем запасное: ${imageSrc}`);
      setRetryCount(prev => prev + 1);
      setImageSrc(FALLBACK_IMAGE);
      return;
    }
    
    // Если и запасное не загрузилось или это уже запасное, показываем ошибку
    setHasError(true);
    onError?.()
  }, [imageSrc, retryCount, onError])

  // Генерируем простой blur placeholder
  const generateBlurDataURL = (w: number = 10, h: number = 10) => {
    if (typeof window === 'undefined') {
      return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFklEQVR42mN8//HLfwYiAOOoQvoqBABbWyZJf74GZgAAAABJRU5ErkJggg==';
    }
    
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (ctx) {
      const gradient = ctx.createLinearGradient(0, 0, w, h)
      gradient.addColorStop(0, '#f3f4f6')
      gradient.addColorStop(1, '#e5e7eb')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, w, h)
    }
    return canvas.toDataURL()
  }

  if (hasError) {
    return (
      <div 
        className={cn(
          "flex items-center justify-center bg-gray-200 text-gray-500",
          fill ? "absolute inset-0" : "",
          className
        )}
        style={!fill ? { width, height } : undefined}
      >
        <svg
          className="w-12 h-12"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    )
  }

  return (
    <div 
      className={cn(
        "relative overflow-hidden",
        fill ? "w-full h-full" : "",
        className
      )}
    >
      {/* Скелетон загрузки */}
      {isLoading && (
        <div 
          className={cn(
            "absolute inset-0 bg-gray-200 animate-pulse",
            fill ? "" : "w-full h-full"
          )}
          style={!fill ? { width, height } : undefined}
        />
      )}
      
      <Image
        src={imageSrc}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100",
          className
        )}
        sizes={sizes}
        priority={priority}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={blurDataURL || (placeholder === 'blur' ? generateBlurDataURL() : undefined)}
        onLoad={handleLoad}
        onError={handleError}
        loading={priority ? undefined : "lazy"}
        unoptimized={true}
        style={fill ? undefined : {
          width: 'auto',
          height: 'auto',
          maxWidth: width ? `${width}px` : '100%',
          maxHeight: height ? `${height}px` : '100%'
        }}
      />
    </div>
  )
} 