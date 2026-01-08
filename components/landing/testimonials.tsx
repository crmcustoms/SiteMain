"use client"

import React, { useState } from "react"
import Image from "next/image"
import { Star, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"

interface Testimonial {
  id: number
  name: string
  position: string
  company: string
  photo: string
  shortText: string
  fullText: string
  rating: number
  documentLink: string | null
}

export default function Testimonials({ dict }: { dict: any }) {
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: "Александр Лихтман",
      position: "PR агентство для IT-компаний",
      company: "itcomms.io",
      photo: "/images/testimonials/lihtman.jpg",
      shortText: "Система на базе CRM и Google Таблиц сделала процесс контроля расходов прозрачным.",
      fullText: "Команда itcomms.io получила удобное решение для контроля расходов! Система на базе CRM и Google Таблиц сделала процесс прозрачным: каждый расход — это задача, а отчеты формируются автоматически. Результат — экономия времени менеджеров, уменьшение превышений бюджета на 70% за два месяца и полный контроль над финансами. Рекомендую CRMCUSTOMS для эффективной автоматизации!",
      rating: 5,
      documentLink: "https://s3.us-east-1.amazonaws.com/crmcustoms.site/1111.pdf",
    },
    {
      id: 2,
      name: "Олександр Петренко",
      position: "Генеральний директор",
      company: "ТОВ 'Смак'",
      photo: "/images/testimonials/businessman1.jpg",
      shortText: "Автоматизація дозволила покращити контроль над запасами та збільшити продажі.",
      fullText: "Завдяки автоматизації ми змогли значно покращити контроль над запасами та збільшити продажі. Система проста у використанні, а підтримка завжди оперативна. Рекомендую CRMCUSTOMS як надійного партнера для розвитку вашого бізнесу. Команда дійсно розуміється на тому, що робить.",
      rating: 5,
      documentLink: null,
    },
    {
      id: 3,
      name: "Ірина Коваленко",
      position: "Фінансовий директор",
      company: "ТОВ 'ТехноПром'",
      photo: "/images/testimonials/businesswoman1.jpg",
      shortText: "Скоротили витрати на 20% та підвищили ефективність роботи персоналу на 35%.",
      fullText: "Впровадження системи автоматизації дозволило нам скоротити витрати на 20% та підвищити ефективність роботи персоналу на 35%. Команда CRMCUSTOMS дала нам imenно те, що нам було потрібно. Тепер ми можемо сконцентруватися на розвитку бізнесу, а не на рутинних операціях.",
      rating: 5,
      documentLink: null,
    },
    {
      id: 4,
      name: "Микола Шевченко",
      position: "Власник",
      company: "Сервісний центр 'Майстер'",
      photo: "/images/testimonials/business-owner2.jpg",
      shortText: "Система перевершила всі наші очікування. Клієнти задоволені, а бізнес зростає.",
      fullText: "Ми довго шукали рішення для автоматизації нашого сервісного центру. Ця система перевершила всі наші очікування. Клієнти задоволені, а наш бізнес зростає. Команда CRMCUSTOMS забезпечила чудову підтримку протягом усього процесу впровадження.",
      rating: 4,
      documentLink: null,
    },
    {
      id: 5,
      name: "Марина Борисенко",
      position: "Директор з маркетингу",
      company: "Мережа 'Затишок'",
      photo: "/images/testimonials/businesswoman2.jpg",
      shortText: "Автоматизація маркетингових процесів дозволила збільшити конверсію на 35%.",
      fullText: "Автоматизація маркетингових процесів дозволила нам збільшити конверсію на 35%. Тепер ми можемо ефективніше аналізувати дані та приймати кращі рішення. Інструменти, які надала CRMCUSTOMS, стали невід'ємною частиною нашої маркетингової стратегії.",
      rating: 5,
      documentLink: null,
    },
    {
      id: 6,
      name: "Дмитро Коваль",
      position: "Керівник проекту",
      company: "IT Solutions Ltd",
      photo: "/images/testimonials/businessman1.jpg",
      shortText: "Сумісність із нашими поточними системами була безпроблемною.",
      fullText: "Сумісність із нашими поточними системами була безпроблемною. Команда розробників CRMCUSTOMS показала глибоке розуміння наших потреб та надала кастомізоване рішення, яке перевершило наші очікування. Результат — підвищення продуктивності на 40%.",
      rating: 5,
      documentLink: null,
    },
  ]

  const cardsPerView = 3
  const maxIndex = Math.max(0, testimonials.length - cardsPerView)

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? maxIndex : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === maxIndex ? 0 : prev + 1))
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-3 h-3 ${i < rating ? "fill-[#FFD700] text-[#FFD700]" : "text-black/20"}`}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="relative w-full bg-white pt-16 pb-0 overflow-hidden">
      {/* Background grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(0deg, transparent 24%, rgba(0, 0, 0, .05) 25%, rgba(0, 0, 0, .05) 26%, transparent 27%, transparent 74%, rgba(0, 0, 0, .05) 75%, rgba(0, 0, 0, .05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(0, 0, 0, .05) 25%, rgba(0, 0, 0, .05) 26%, transparent 27%, transparent 74%, rgba(0, 0, 0, .05) 75%, rgba(0, 0, 0, .05) 76%, transparent 77%, transparent)",
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      <div className="relative max-w-[1400px] mx-auto px-8">
        {/* Section Header */}
        <div className="mb-16">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 border-2 border-[#FFD700] flex items-center justify-center">
              <div className="text-xs font-mono font-bold text-black">05</div>
            </div>
            <div>
              <h2 className="text-5xl font-black text-black uppercase tracking-tighter">
                Відгуки наших клієнтів
              </h2>
            </div>
          </div>
          <p className="text-lg text-black/60 max-w-2xl">
            Що кажуть про нас керівники компаній, які вже впровадили наші рішення
          </p>
        </div>

        {/* Carousel */}
        <div className="relative">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-out gap-6"
              style={{ transform: `translateX(-${currentIndex * (100 / cardsPerView)}%)` }}
            >
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="flex-shrink-0 w-[calc(33.333%-1rem)]"
                >
                  <div className="border-2 border-black/10 bg-white p-6 flex flex-col h-full hover:border-[#FFD700]/50 transition-colors relative">
                    {/* Tech label */}
                    <div className="absolute -top-3 left-6 bg-white px-2">
                      <span className="text-xs font-mono text-black/40 tracking-wider">TESTIMONIAL</span>
                    </div>

                    {/* Avatar and Info */}
                    <div className="flex items-center gap-4 mb-6 pt-2">
                      <div className="relative w-20 h-20 flex-shrink-0">
                        <div className="relative aspect-square overflow-hidden border border-black/10">
                          <Image
                            src={testimonial.photo}
                            alt={testimonial.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        {/* Corner decoration */}
                        <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-[#FFD700]" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-black truncate">{testimonial.name}</h3>
                        <p className="text-xs text-black/70 truncate">{testimonial.position}</p>
                        <div className="inline-block px-2 py-0.5 bg-[#FFD700]/20 border border-[#FFD700]/30 mt-1">
                          <span className="text-xs font-mono text-black/70">{testimonial.company}</span>
                        </div>
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="mb-4">{renderStars(testimonial.rating)}</div>

                    {/* Text with Spoiler */}
                    <div className="flex-1 mb-4">
                      <p className="text-sm text-black/80 leading-relaxed mb-3">
                        {testimonial.shortText}
                      </p>

                      {testimonial.fullText !== testimonial.shortText && (
                        <button
                          onClick={() =>
                            setExpandedId(expandedId === testimonial.id ? null : testimonial.id)
                          }
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#FFD700]/10 border border-[#FFD700]/30 hover:bg-[#FFD700]/20 transition-colors text-xs font-medium text-black/70"
                        >
                          <span>
                            {expandedId === testimonial.id ? "Скрити" : "Читати далі"}
                          </span>
                          <ChevronDown
                            className={`w-3 h-3 transition-transform ${
                              expandedId === testimonial.id ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                      )}

                      {expandedId === testimonial.id && (
                        <div className="mt-3 p-3 bg-black/5 border-l-4 border-[#FFD700]">
                          <p className="text-sm text-black/80 leading-relaxed">
                            {testimonial.fullText}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Document link */}
                    {testimonial.documentLink && (
                      <a
                        href={testimonial.documentLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-2 bg-[#FFD700]/10 border border-[#FFD700]/30 hover:bg-[#FFD700]/20 transition-colors text-xs font-mono text-black/70 mt-auto"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-3 h-3"
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
                        Лист подяки
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation buttons */}
          <button
            onClick={goToPrevious}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-16 w-12 h-12 bg-white border-2 border-black/20 hover:border-[#FFD700] hover:bg-[#FFD700]/10 transition-all flex items-center justify-center group"
            aria-label="Previous testimonials"
          >
            <ChevronLeft className="w-6 h-6 text-black group-hover:text-[#FFD700]" />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-16 w-12 h-12 bg-white border-2 border-black/20 hover:border-[#FFD700] hover:bg-[#FFD700]/10 transition-all flex items-center justify-center group"
            aria-label="Next testimonials"
          >
            <ChevronRight className="w-6 h-6 text-black group-hover:text-[#FFD700]" />
          </button>

          {/* Dots indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: maxIndex + 1 }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 transition-all ${index === currentIndex ? "bg-[#FFD700] w-8" : "bg-black/20"}`}
                aria-label={`Go to group ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
