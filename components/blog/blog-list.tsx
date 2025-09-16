'use client';

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

export default function BlogList({ posts = [], dict = {} }: { posts?: any[]; dict?: any }) {
  // Состояние для отслеживания ошибок загрузки изображений
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  
  // Защита от отсутствия данных
  if (!Array.isArray(posts) || posts.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">Статьи временно недоступны</p>
      </div>
    )
  }

  // Функция для безопасного преобразования URL изображений
  const getImageUrl = (url: string) => {
    if (!url || url === '' || url === 'null' || url === 'undefined') {
      return '/placeholder.jpg';
    }
    
    try {
      // Проверяем, является ли URL абсолютным
      const isAbsoluteUrl = url.startsWith('http://') || url.startsWith('https://');
      
      // Если URL относительный, добавляем базовый URL
      if (!isAbsoluteUrl && !url.startsWith('/')) {
        return `/${url}`;
      }
      
      // Используем прямой URL для всех изображений
      return url;
    } catch (error) {
      console.error('Error processing image URL:', error, url);
      return '/placeholder.jpg';
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      {posts.map((post, index) => {
        // Проверка на наличие необходимых данных
        if (!post) return null;
        
        const title = post.name || post.property_title || 'Без названия';
        const slug = post.property_link_name || `post-${index}`;
        const excerpt = post.property_description || '';
        const image = post.property_2 || post.property_photo1 || '/placeholder.svg';
        const authorName = 'CRM Customs'; // Статичный автор
        const authorAvatar = '/logo.svg'; // Логотип компании
        const date = post.property_ || '';
        const category = post.property_categorytext || '';
        const lang = 'ua'; // Украинский язык по умолчанию
        
        // Преобразуем URL изображения
        const processedImageUrl = getImageUrl(image);
        
        return (
          <Card key={index} className="overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/3 relative">
                {imageErrors[index] ? (
                  // Показываем заглушку, если изображение не загрузилось
                  <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400 text-xs">Зображення недоступне</span>
                  </div>
                ) : (
                <Image
                    src={processedImageUrl}
                  alt={title}
                  width={300}
                  height={200}
                  className="h-full w-full object-cover"
                    unoptimized={true} // Отключаем оптимизацию для прямого доступа к S3
                    onError={(e) => {
                      // Если изображение не загрузилось, заменяем на заглушку
                      console.error("Ошибка загрузки изображения:", image);
                      setImageErrors(prev => ({...prev, [index]: true}));
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder.jpg';
                      target.onerror = null; // Предотвращаем бесконечный цикл
                    }}
                />
                )}
              </div>
              <div className="md:w-2/3">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={authorAvatar} alt={authorName} />
                      <AvatarFallback>{authorName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-muted-foreground">{authorName}</span>
                    <span className="text-sm text-muted-foreground">•</span>
                    <span className="flex items-center text-sm text-muted-foreground">
                      {date}
                    </span>
                  </div>
                  <CardTitle className="mt-2">
                    <Link href={`/${lang}/blog/${slug}`} className="hover:underline">
                      {title}
                    </Link>
                  </CardTitle>
                  <CardDescription className="line-clamp-2">{excerpt}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    {category && (
                      <span className="text-sm bg-amber/10 text-amber px-2 py-1 rounded">
                        {category}
                      </span>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" className="p-0 text-amber hover:text-amber-hover">
                    {dict.readMore || 'Читать далее'}
                  </Button>
                </CardFooter>
              </div>
            </div>
          </Card>
        );
      })}
      <div className="flex justify-center mt-6">
        <Button variant="outline" className="mr-2">
          {dict.prevPage || 'Назад'}
        </Button>
        <Button variant="outline">{dict.nextPage || 'Вперед'}</Button>
      </div>
    </div>
  )
}
