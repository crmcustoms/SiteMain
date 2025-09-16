"use client"

import React from "react"
import Link from "next/link"
import { CaseSidebar } from "@/components/sidebar-case"
import OptimizedImage from "@/components/ui/optimized-image"

interface CaseDetailWrapperProps {
  caseData: {
    id: string
    title: string
    slug: string
    excerpt?: string
    date?: string
    image?: string
    background_photo?: string
    property_image?: string
    property_background_photo?: string
    social_network_img?: string
    tags?: string[]
    categories?: string[]
    services?: string[]
  }
  htmlContent: string
  lang: string
  backLinkText?: string
  popularCases?: Array<{
    id: string
    title: string
    slug: string
    image?: string
    excerpt?: string
  }>
  dictionary?: {
    popularCases?: string
    categories?: string
    tags?: string
    readMore?: string
  }
}

// Константа для запасного изображения
const FALLBACK_IMAGE = '/placeholder.jpg';

export default function CaseDetailWrapper({
  caseData,
  htmlContent,
  lang,
  backLinkText = "Назад до кейсів",
  popularCases = [],
  dictionary = {
    popularCases: "Популярні кейси",
    categories: "Категорії",
    tags: "Теги",
    readMore: "Детальніше"
  }
}: CaseDetailWrapperProps) {
  // Выбираем изображение для отображения
  const caseImage = caseData.image || 
    caseData.background_photo || 
    caseData.property_image || 
    caseData.property_background_photo || 
    caseData.social_network_img || 
    FALLBACK_IMAGE;

  // Обработчик ошибки загрузки изображения
  const [imageError, setImageError] = React.useState(false);

  // Проверяем, является ли URL изображения валидным (не placeholder и не пустой)
  const hasValidImage = caseImage && caseImage !== FALLBACK_IMAGE && !imageError;

  // Функция для обработки URL изображения
  const getImageUrl = (url: string) => {
    if (!url || url === 'null' || url === 'undefined') {
      return FALLBACK_IMAGE;
    }
    
    try {
      // Если URL относительный, добавляем слеш
      if (!url.startsWith('http') && !url.startsWith('/')) {
        return `/${url}`;
      }
      
      return url;
    } catch (error) {
      console.error('Error processing image URL:', error);
      return FALLBACK_IMAGE;
    }
  };

  // Функция для обработки HTML-контента и замены URL изображений + добавления отступов между блоками
  const processHtmlContent = (html: string) => {
    if (!html) return '';
    let processed = html;
    try {
      // Заменяем относительные URL на абсолютные
      processed = processed.replace(/(<img[^>]*src=["'])([^"']+)(["'][^>]*>)/g, (match, p1, p2, p3) => {
        try {
          const imageUrl = getImageUrl(p2);
          return `${p1}${imageUrl}${p3}`;
        } catch (e) {
          console.error('Error parsing URL in HTML:', e);
          return match;
        }
      });
      // Добавляем fallback для картинок
      processed = processed.replace(/<img([^>]+)>/g, '<img$1 onerror="this.onerror=null;this.src=\'/placeholder.jpg\';">');
      // Добавляем отступы и оформление как в блоге
      processed = processed.replace(/<p/g, '<p class="mb-6"');
      processed = processed.replace(/<h([1-6])/g, '<h$1 class="mt-8 mb-4 font-bold"');
      processed = processed.replace(/<img/g, '<img class="my-6 rounded-lg mx-auto max-w-full h-auto"');
      processed = processed.replace(/<ul/g, '<ul class="list-disc pl-6 mb-6 space-y-2"');
      processed = processed.replace(/<ol/g, '<ol class="list-decimal pl-6 mb-6 space-y-2"');
      processed = processed.replace(/<li/g, '<li class="mb-2"');
      return processed;
    } catch (error) {
      console.error('Error processing HTML content:', error);
      return html;
    }
  };

  const processedHtmlContent = processHtmlContent(htmlContent);

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Link 
          href={`/${lang}/cases`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-amber transition-colors"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="mr-2"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          {backLinkText}
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Заголовок и мета-информация */}
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{caseData.title}</h1>
            {caseData.date && (
              <div className="text-sm text-muted-foreground mb-4">
                {caseData.date}
              </div>
            )}
            {caseData.excerpt && (
              <p className="text-lg">{caseData.excerpt}</p>
            )}
          </div>

          {/* Изображение кейса */}
          {hasValidImage && (
            <div className="mb-8 rounded-lg overflow-hidden h-[400px]">
              <OptimizedImage
                src={getImageUrl(caseImage)}
                alt={caseData.title}
                width={800}
                height={400}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
                priority={true}
              />
            </div>
          )}

          {/* Если изображения нет — добавляем отступ */}
          {!hasValidImage && <div className="mb-8" />}

          {/* Контент кейса */}
          <div 
            className="prose prose-lg max-w-none dark:prose-invert mt-0"
            dangerouslySetInnerHTML={{ __html: processedHtmlContent }}
          />

          {/* Теги кейса */}
          {caseData.tags && caseData.tags.length > 0 && (
            <div className="mt-8 pt-6 border-t">
              <div className="flex flex-wrap gap-2">
                {caseData.tags.map((tag, index) => (
                  <Link
                    key={index}
                    href={`/${lang}/cases?tag=${encodeURIComponent(tag)}`}
                    className="px-3 py-1 bg-amber/10 text-amber-900 dark:text-amber-100 rounded-full text-sm hover:bg-amber/20 transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Сайдбар */}
        <div>
          <CaseSidebar
            popularCases={popularCases.map(item => ({
              ...item,
              image: getImageUrl(item.image || '')
            }))}
            categories={caseData.categories}
            tags={caseData.tags}
            lang={lang}
            dictionary={dictionary}
          />
        </div>
      </div>
    </div>
  )
} 