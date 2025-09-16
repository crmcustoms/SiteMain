"use client"

import React, { useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import OptimizedImage from "@/components/ui/optimized-image"

interface CaseSidebarProps {
  popularCases?: Array<{
    id: string
    title: string
    slug: string
    image?: string
    excerpt?: string
  }>
  categories?: string[]
  tags?: string[]
  lang: string
  className?: string
  dictionary?: {
    popularCases?: string
    categories?: string
    tags?: string
    readMore?: string
  }
}

export function CaseSidebar({
  popularCases = [],
  categories = [],
  tags = [],
  lang = "ua",
  className = "",
  dictionary = {
    popularCases: "Популярні кейси",
    categories: "Категорії",
    tags: "Теги",
    readMore: "Детальніше"
  }
}: CaseSidebarProps) {
  // Состояние для отслеживания ошибок загрузки изображений
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  // Обработчик ошибки загрузки изображения
  const handleImageError = (caseId: string) => {
    setImageErrors(prev => ({
      ...prev,
      [caseId]: true
    }));
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Популярные кейсы */}
      {popularCases && popularCases.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-4">{dictionary.popularCases || "Популярні кейси"}</h3>
            <div className="space-y-4">
              {popularCases.map((caseItem) => (
                <div key={caseItem.id} className="flex gap-3">
                  {caseItem.image && !imageErrors[caseItem.id] ? (
                    <div className="w-20 h-20 flex-shrink-0">
                      <OptimizedImage
                        src={caseItem.image}
                        alt={caseItem.title}
                        width={80}
                        height={80}
                        className="rounded-md object-cover w-full h-full"
                        onError={() => handleImageError(caseItem.id)}
                      />
                    </div>
                  ) : (
                    <div className="w-20 h-20 flex-shrink-0 bg-muted rounded-md flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-muted-foreground"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}
                  <div>
                    <Link 
                      href={`/${lang}/cases/${caseItem.slug}`}
                      className="font-medium hover:text-amber transition-colors line-clamp-2"
                    >
                      {caseItem.title}
                    </Link>
                    {caseItem.excerpt && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {caseItem.excerpt}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Категории */}
      {categories && categories.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-4">{dictionary.categories || "Категорії"}</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((category, index) => (
                <Link
                  key={index}
                  href={`/${lang}/cases?category=${encodeURIComponent(category)}`}
                  className="px-3 py-1 bg-muted rounded-full text-sm hover:bg-muted/80 transition-colors"
                >
                  {category}
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Теги */}
      {tags && tags.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-4">{dictionary.tags || "Теги"}</h3>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <Link
                  key={index}
                  href={`/${lang}/cases?tag=${encodeURIComponent(tag)}`}
                  className="px-3 py-1 bg-amber/10 text-amber-900 dark:text-amber-100 rounded-full text-sm hover:bg-amber/20 transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 