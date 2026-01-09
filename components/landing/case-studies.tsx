"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Building2 } from "lucide-react"
import Image from "next/image"

export default function CaseStudies({ dict }: { dict: any }) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const caseStudies = [
    {
      id: 1,
      company: "Будівельна компанія 'Фундамент'",
      industry: "Будівництво",
      problem: "Складнощі з відстеженням проєктів та координацією роботи бригад.",
      solution: "Впровадження комплексної системи управління проєктами.",
      result: "Скорочення термінів будівництва на 20% та зниження витрат на 15%.",
      image: "/images/landings/industry-solutions/industry.jpg",
    },
    {
      id: 2,
      company: "Меблева компанія ВМКК",
      industry: "Виробництво",
      problem: "Менеджери вручну контролювали роботу аутсорсингових збирачів меблів через дзвінки та Viber.",
      solution: "Інтегрована Airtable-форма для звітів збирачів, що працює безпосередньо з CRM-системою.",
      result: "100% замовлень мають фото-звіт, економія 1,5 години щодня для кожного менеджера.",
      image: "/images/landings/industry-solutions/furniture.jpg",
    },
    {
      id: 3,
      company: "PR-компанія ITComms",
      industry: "IT та технології",
      problem: "Витрати фіксувалися вручну, часто постфактум. Угоди перевищували бюджет без відома керівника.",
      solution: "Автоматизована система на базі CRM, завдань та Google Таблиць, що об'єднує управління витратами.",
      result: "Прозорі витрати, автоматичні звіти, зниження перевищення бюджету на 70%.",
      image: "/images/case-studies/pr-agency.jpg",
    },
  ]

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? caseStudies.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === caseStudies.length - 1 ? 0 : prev + 1))
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
              <div className="text-xs font-mono font-bold text-black">06</div>
            </div>
            <div>
              <h2 className="text-5xl font-black text-black uppercase tracking-tighter">
                Історії успіху наших клієнтів
              </h2>
            </div>
          </div>
          <p className="text-lg text-black/60 max-w-2xl">
            Дізнайтеся, як наші рішення допомогли реальним бізнесам досягти успіху.
          </p>
        </div>

        {/* Carousel */}
        <div className="relative">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {caseStudies.map((story) => (
                <div key={story.id} className="w-full flex-shrink-0">
                  <div className="max-w-5xl mx-auto">
                    <div className="border-2 border-black/10 bg-white p-8 relative">
                      {/* Tech label */}
                      <div className="absolute -top-3 left-8 bg-white px-2">
                        <span className="text-xs font-mono text-black/40 tracking-wider">SUCCESS_CASE</span>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left side - Image */}
                        <div className="relative">
                          <div className="relative aspect-[4/3] overflow-hidden border border-black/10">
                            <Image
                              src={story.image || "/placeholder.svg"}
                              alt={story.company}
                              fill
                              className="object-cover"
                            />
                          </div>
                          {/* Corner decorations */}
                          <div className="absolute -top-2 -left-2 w-6 h-6 border-t-2 border-l-2 border-[#FFD700]" />
                          <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-2 border-r-2 border-[#FFD700]" />
                        </div>

                        {/* Right side - Content */}
                        <div className="space-y-6">
                          {/* Company info */}
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-black/5 border border-black/10 flex items-center justify-center flex-shrink-0">
                              <Building2 className="w-6 h-6 text-black/60" />
                            </div>
                            <div>
                              <h3 className="text-2xl font-bold text-black mb-1">{story.company}</h3>
                              <div className="inline-block px-3 py-1 bg-[#FFD700]/20 border border-[#FFD700]/30">
                                <span className="text-xs font-mono text-black/70">{story.industry}</span>
                              </div>
                            </div>
                          </div>

                          {/* Problem */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-black/5 border border-black/20 flex items-center justify-center">
                                <span className="text-xs font-mono text-black/70">!</span>
                              </div>
                              <h4 className="text-sm font-bold text-black uppercase tracking-wider">Проблема</h4>
                            </div>
                            <p className="text-base text-black/70 leading-relaxed pl-8">{story.problem}</p>
                          </div>

                          {/* Solution */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-black/5 border border-black/20 flex items-center justify-center">
                                <span className="text-xs font-mono text-black/70">→</span>
                              </div>
                              <h4 className="text-sm font-bold text-black uppercase tracking-wider">Рішення</h4>
                            </div>
                            <p className="text-base text-black/70 leading-relaxed pl-8">{story.solution}</p>
                          </div>

                          {/* Result */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-[#FFD700]/10 border border-[#FFD700]/30 flex items-center justify-center">
                                <span className="text-xs font-mono text-[#FFD700]">✓</span>
                              </div>
                              <h4 className="text-sm font-bold text-black uppercase tracking-wider">Результат</h4>
                            </div>
                            <p className="text-base font-semibold text-black leading-relaxed pl-8">{story.result}</p>
                          </div>

                          {/* Tech decoration */}
                          <div className="flex items-center gap-2 pt-4">
                            <div className="flex-1 h-[1px] bg-black/10" />
                            <span className="text-xs font-mono text-[#FFD700]">
                              {String(story.id).padStart(2, "0")}/{String(caseStudies.length).padStart(2, "0")}
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
            aria-label="Previous case"
          >
            <ChevronLeft className="w-6 h-6 text-black group-hover:text-[#FFD700]" />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white border-2 border-black/20 hover:border-[#FFD700] hover:bg-[#FFD700]/10 transition-all flex items-center justify-center group"
            aria-label="Next case"
          >
            <ChevronRight className="w-6 h-6 text-black group-hover:text-[#FFD700]" />
          </button>

          {/* Dots indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {caseStudies.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 transition-all ${index === currentIndex ? "bg-[#FFD700] w-8" : "bg-black/20"}`}
                aria-label={`Go to case ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
