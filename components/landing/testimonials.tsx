"use client"

import React, { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Star } from "lucide-react"

interface Testimonial {
  id: number
  name: string
  position: string
  company: string
  photo: string
  text: string
  rating: number
  documentLink: string | null
}

export default function Testimonials({ dict }: { dict: any }) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: "Александр Лихтман",
      position: "PR агентство для IT-компаний и стартапов",
      company: "itcomms.io",
      photo: "/images/testimonials/lihtman.jpg",
      text: "Команда itcomms.io получила удобное решение для контроля расходов! Система на базе CRM и Google Таблиц сделала процесс прозрачным: каждый расход — это задача, а отчеты формируются автоматически. Результат — экономия времени менеджеров, уменьшение превышений бюджета на 70% за два месяца и полный контроль над финансами.",
      rating: 5,
      documentLink: "https://s3.us-east-1.amazonaws.com/crmcustoms.site/1111.pdf",
    },
    {
      id: 2,
      name: "Олександр Петренко",
      position: "Генеральний директор",
      company: "ТОВ 'Смак'",
      photo: "/placeholder.svg?height=100&width=100&query=business man portrait",
      text: "Завдяки автоматизації ми змогли значно покращити контроль над запасами та збільшити продажі. Система проста у використанні, а підтримка завжди оперативна. Рекомендую CRMCUSTOMS як надійного партнера для розвитку вашого бізнесу.",
      rating: 5,
      documentLink: null,
    },
    {
      id: 3,
      name: "Ірина Коваленко",
      position: "Фінансовий директор",
      company: "ТОВ 'ТехноПром'",
      photo: "/placeholder.svg?height=100&width=100&query=business woman portrait",
      text: "Впровадження системи автоматизації дозволило нам скоротити витрати на 20% та підвищити ефективність роботи персоналу на 35%. Команда CRMCUSTOMS дала нам именно те, що нам було потрібно.",
      rating: 5,
      documentLink: null,
    },
  ]

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1))
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i < rating ? "fill-[#FFD700] text-[#FFD700]" : "text-black/20"}`}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-white py-20 overflow-hidden">
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
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="w-full flex-shrink-0">
                  <div className="max-w-4xl mx-auto">
                    <div className="border-2 border-black/10 bg-white p-8 relative">
                      {/* Tech label */}
                      <div className="absolute -top-3 left-8 bg-white px-2">
                        <span className="text-xs font-mono text-black/40 tracking-wider">TESTIMONIAL</span>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left side - Avatar and info */}
                        <div className="relative flex flex-col items-center justify-start">
                          <div className="relative w-32 h-32 mb-6">
                            <div className="relative aspect-square overflow-hidden border-2 border-black/10">
                              <Image
                                src={testimonial.photo}
                                alt={testimonial.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            {/* Corner decorations */}
                            <div className="absolute -top-2 -left-2 w-6 h-6 border-t-2 border-l-2 border-[#FFD700]" />
                            <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-2 border-r-2 border-[#FFD700]" />
                          </div>

                          <h3 className="text-xl font-bold text-black mb-1 text-center">{testimonial.name}</h3>
                          <p className="text-sm font-medium text-black/70 text-center mb-2">
                            {testimonial.position}
                          </p>
                          <div className="inline-block px-3 py-1 bg-[#FFD700]/20 border border-[#FFD700]/30 mb-4">
                            <span className="text-xs font-mono text-black/70">{testimonial.company}</span>
                          </div>

                          {/* Rating */}
                          <div className="mb-4">{renderStars(testimonial.rating)}</div>

                          {/* Document link */}
                          {testimonial.documentLink && (
                            <a
                              href={testimonial.documentLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2 bg-[#FFD700]/10 border border-[#FFD700]/30 hover:bg-[#FFD700]/20 transition-colors"
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
                              <span className="text-xs font-mono text-black/70">Лист подяки</span>
                            </a>
                          )}
                        </div>

                        {/* Right side - Quote */}
                        <div className="lg:col-span-2 flex flex-col justify-between">
                          <div className="space-y-6">
                            {/* Quotation mark decoration */}
                            <svg
                              className="w-12 h-12 text-[#FFD700]/30"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                            </svg>

                            <p className="text-lg text-black/80 leading-relaxed font-medium">
                              {testimonial.text}
                            </p>
                          </div>

                          {/* Tech decoration */}
                          <div className="flex items-center gap-2 pt-6">
                            <div className="flex-1 h-[1px] bg-black/10" />
                            <span className="text-xs font-mono text-[#FFD700]">
                              {String(testimonial.id).padStart(2, "0")}/{String(testimonials.length).padStart(2, "0")}
                            </span>
                            <div className="flex-1 h-[1px] bg-black/10" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation buttons */}
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white border-2 border-black/20 hover:border-[#FFD700] hover:bg-[#FFD700]/10 transition-all flex items-center justify-center group"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-6 h-6 text-black group-hover:text-[#FFD700]" />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white border-2 border-black/20 hover:border-[#FFD700] hover:bg-[#FFD700]/10 transition-all flex items-center justify-center group"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-6 h-6 text-black group-hover:text-[#FFD700]" />
          </button>

          {/* Dots indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 transition-all ${index === currentIndex ? "bg-[#FFD700] w-8" : "bg-black/20"}`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
