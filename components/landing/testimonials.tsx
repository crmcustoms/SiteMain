"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel"

// Иконки без зависимости от lucide-react
const FileText = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
)

const Star = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
)

// Типы данных
interface Testimonial {
  id: number;
  name: string;
  position: string;
  company: string;
  photo: string;
  text: string;
  rating: number;
  documentLink: string | null;
  documentName: string | null;
  isReal: boolean;
}

// API эндпоинт для получения реальных отзывов
const TESTIMONIALS_API_ENDPOINT = "https://n8n.crmcustoms.com/webhook/296758a4-5831-41dc-a9dc-058e7c9dd609";

export default function Testimonials({ dict }: { dict: any }) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [allTestimonials, setAllTestimonials] = useState<Testimonial[]>([]) // Хранит все отзывы для пагинации
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({}) // Для отслеживания ошибок загрузки изображений
  const itemsPerPage = 3
  
  // Отладочная информация
  console.log("Dict в компоненте Testimonials:", dict);

  // Получаем отзывы из API
  useEffect(() => {
    async function fetchTestimonials() {
      try {
        // Создаем реальный отзыв с фиксированными данными
        const realTestimonial: Testimonial = {
          id: 1,
          name: "Александр Лихтман",
          position: "PR агентство для IT-компаний и стартапов",
          company: "itcomms.io",
          photo: "/images/testimonials/lihtman.jpg",
          text: "Команда itcomms.io получила удобное решение для контроля расходов! Система на базе CRM и Google Таблиц сделала процесс прозрачным: каждый расход — это задача, а отчеты формируются автоматически. Результат — экономия времени менеджеров, уменьшение превышений бюджета на 70% за два месяца и полный контроль над финансами. Рекомендую CRMCUSTOMS для эффективной автоматизации!",
          rating: 5,
          documentLink: "https://s3.us-east-1.amazonaws.com/crmcustoms.site/1111.pdf",
          documentName: "Лист подяки",
          isReal: true
        };
        
        // Добавляем тестовые отзывы
        const testTestimonials: Testimonial[] = [
          {
            id: 1001,
            name: 'Олександр Петренко',
            position: 'Генеральний директор',
            company: "ТОВ 'Смак'",
            photo: '/images/testimonials/businessman1.jpg',
            text: 'Завдяки автоматизації ми змогли значно покращити контроль над запасами та збільшити продажі. Система проста у використанні, а підтримка завжди оперативна.',
            rating: 5,
            documentLink: null,
            documentName: null,
            isReal: false
          },
          {
            id: 1002,
            name: 'Ірина Коваленко',
            position: 'Фінансовий директор',
            company: "ТОВ 'ТехноПром'",
            photo: '/images/testimonials/businesswoman1.jpg',
            text: 'Впровадження системи автоматизації дозволило нам скоротити витрати на 20% та підвищити ефективність роботи персоналу. Рекомендую цю компанію як надійного партнера.',
            rating: 5,
            documentLink: null,
            documentName: null,
            isReal: false
          },
          {
            id: 1003,
            name: 'Микола Шевченко',
            position: 'Власник',
            company: "Сервісний центр 'Майстер'",
            photo: '/images/testimonials/business-owner2.jpg',
            text: 'Ми довго шукали рішення для автоматизації нашого сервісного центру. Ця система перевершила всі наші очікування. Клієнти задоволені, а наш бізнес зростає.',
            rating: 4,
            documentLink: null,
            documentName: null,
            isReal: false
          }
        ];
        
        // Объединяем реальный отзыв и тестовые
        const allTestimonialsData = [realTestimonial, ...testTestimonials];
        
        console.log("All testimonials:", allTestimonialsData);
        setAllTestimonials(allTestimonialsData);
        setLoading(false);
      } catch (err) {
        console.error("Ошибка при загрузке отзывов:", err);
        setError("Помилка завантаження відгуків: " + (err as Error).message);
        setLoading(false);
      }
    }

    fetchTestimonials();
  }, [])

  // Обработка пагинации
  useEffect(() => {
    if (allTestimonials.length > 0) {
      const startIndex = (currentPage - 1) * itemsPerPage
      const endIndex = startIndex + itemsPerPage
      const currentItems = allTestimonials.slice(startIndex, endIndex)
      setTestimonials(currentItems)
    }
  }, [currentPage, allTestimonials])

  // Обработчик ошибок загрузки изображений
  const handleImageError = (id: number) => {
    setImageErrors(prev => ({ ...prev, [id]: true }))
  }

  // Получаем инициалы из имени
  const getInitials = (name: string) => {
    if (!name) return "??";
    
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  // Рендерим пагинацию
  const totalPages = Math.ceil(allTestimonials.length / itemsPerPage)
  
  const renderPagination = () => {
    const pages = []
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <Button
          key={i}
          variant={i === currentPage ? "default" : "outline"}
          size="icon"
          className="w-8 h-8"
          onClick={() => setCurrentPage(i)}
        >
          {i}
        </Button>
      )
    }
    return (
      <div className="flex justify-center mt-8 space-x-2">
        {pages}
      </div>
    )
  }

  // Рендерим звезды рейтинга
  const renderStars = (rating: number) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={`text-lg ${i <= rating ? "text-yellow-400" : "text-gray-300"}`}>
          ★
        </span>
      )
    }
    return <div className="flex space-x-1">{stars}</div>
  }

  // Текст по умолчанию для украинского языка
  const defaultTitle = "Відгуки наших клієнтів";
  const defaultSubtitle = "Що кажуть про нас керівники компаній, які вже впровадили наші рішення";

  if (loading) {
    return (
      <section className="py-12 md:py-16 bg-background">
        <div className="container px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold tracking-tight mb-2">
              {dict?.testimonials?.title || defaultTitle}
            </h2>
            <p className="text-muted-foreground">
              {dict?.testimonials?.subtitle || defaultSubtitle}
            </p>
          </div>
          <div className="flex justify-center items-center min-h-[300px]">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-6 w-24 bg-muted rounded mb-2"></div>
              <div className="h-4 w-48 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-12 md:py-16 bg-background">
        <div className="container px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold tracking-tight mb-2">
              {dict?.testimonials?.title || defaultTitle}
            </h2>
            <p className="text-muted-foreground">
              {dict?.testimonials?.subtitle || defaultSubtitle}
            </p>
          </div>
          <div className="flex justify-center items-center min-h-[300px]">
            <p className="text-red-500">{error}</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="container px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold tracking-tight mb-2">
            {dict?.testimonials?.title || defaultTitle}
          </h2>
          <p className="text-muted-foreground">
            {dict?.testimonials?.subtitle || defaultSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="h-full flex flex-col border-primary/10 shadow-sm">
              <CardContent className="p-5 flex-grow">
                <div className="flex items-center mb-3">
                  <div className="relative mr-3 flex-shrink-0">
                    {testimonial.photo && !imageErrors[testimonial.id] ? (
                      <div className="aspect-square w-14 h-14 relative overflow-hidden rounded-full border border-primary/10">
                        <Image
                          src={testimonial.photo}
                          alt={testimonial.name}
                          fill
                          sizes="56px"
                          className="object-cover"
                          onError={() => handleImageError(testimonial.id)}
                          priority={testimonial.isReal}
                        />
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-white font-medium">
                        {getInitials(testimonial.name)}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-base">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {testimonial.position}, <span className="font-medium">{testimonial.company}</span>
                    </p>
                    <div className="mt-1">{renderStars(testimonial.rating)}</div>
                  </div>
                </div>
                <div className="relative">
                  <svg className="absolute top-0 left-0 text-primary/20 w-8 h-8 -ml-2 -mt-2" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                  <p className="text-muted-foreground text-sm pl-6 mb-3">{testimonial.text}</p>
                </div>
              </CardContent>
              {testimonial.documentLink && (
                <CardFooter className="px-5 py-3 border-t bg-muted/20">
                  <a
                    href={testimonial.documentLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline flex items-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                    {dict?.testimonials?.viewDocument || "Переглянути лист подяки"}
                  </a>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>

        {totalPages > 1 && renderPagination()}
      </div>
    </section>
  )
}

