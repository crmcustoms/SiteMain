"use client"

import { AnimatedElement } from "@/components/ui/animated-element"

export default function TeamSection() {
  return (
    <section className="w-full py-16 md:py-24 lg:py-32 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Text content */}
          <AnimatedElement delay={0}>
            <div className="space-y-6">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold text-black mb-4 leading-tight">
                  Ми працюємо невеликою <span className="text-amber">командою</span>
                </h2>
                <p className="text-lg text-gray-700 leading-relaxed">
                  У нас немає мети «заробити всі гроші світу» — нам важливо робити проєкти якісно, а не на конвеєрі.
                </p>
              </div>

              <div className="space-y-4 bg-amber/5 p-6 rounded-2xl border border-amber/20">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-2 h-2 rounded-full bg-amber mt-2"></div>
                  <p className="text-base text-gray-700">
                    <span className="font-semibold text-black">Якщо ви бачите нашу рекламу,</span> це означає просту річ: у нас з'явився вільний час і ми готові взяти ще кілька нових проєктів.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">✓</div>
                  <div>
                    <h3 className="font-bold text-black mb-1">Без черг</h3>
                    <p className="text-sm text-gray-600">Початок проєкту не залежить від чергу</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-2xl">✓</div>
                  <div>
                    <h3 className="font-bold text-black mb-1">Без затримок</h3>
                    <p className="text-sm text-gray-600">Немає «запишемо вас на наступний квартал»</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-2xl">✓</div>
                  <div>
                    <h3 className="font-bold text-black mb-1">Без зникнень</h3>
                    <p className="text-sm text-gray-600">Без зникнень у тумані після передоплати 🙂</p>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedElement>

          {/* Right side - Visual elements */}
          <AnimatedElement delay={200}>
            <div className="relative h-96 md:h-full min-h-96">
              {/* Decorative circles */}
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Large circle background */}
                <div className="absolute w-64 h-64 bg-amber/10 rounded-full blur-3xl animate-pulse"></div>

                {/* Content cards */}
                <div className="relative z-10 space-y-4">
                  {/* Card 1 */}
                  <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    <div className="bg-white rounded-xl p-4 shadow-lg border border-amber/20 max-w-xs hover:shadow-xl transition-shadow">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-amber/20 flex items-center justify-center">
                          <span className="text-xl">👥</span>
                        </div>
                        <h3 className="font-bold text-black text-sm">Команда</h3>
                      </div>
                      <p className="text-xs text-gray-600">Невелика, але дружна</p>
                    </div>
                  </div>

                  {/* Card 2 */}
                  <div className="animate-fade-in-up ml-12" style={{ animationDelay: '0.4s' }}>
                    <div className="bg-white rounded-xl p-4 shadow-lg border border-amber/20 max-w-xs hover:shadow-xl transition-shadow">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-amber/20 flex items-center justify-center">
                          <span className="text-xl">⚡</span>
                        </div>
                        <h3 className="font-bold text-black text-sm">Якість</h3>
                      </div>
                      <p className="text-xs text-gray-600">Проєкти робимо якісно</p>
                    </div>
                  </div>

                  {/* Card 3 */}
                  <div className="animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                    <div className="bg-white rounded-xl p-4 shadow-lg border border-amber/20 max-w-xs hover:shadow-xl transition-shadow">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-amber/20 flex items-center justify-center">
                          <span className="text-xl">🎯</span>
                        </div>
                        <h3 className="font-bold text-black text-sm">Вільний час</h3>
                      </div>
                      <p className="text-xs text-gray-600">Готові до нових проєктів</p>
                    </div>
                  </div>
                </div>
              </div>

              <style>{`
                @keyframes fadeInUp {
                  from {
                    opacity: 0;
                    transform: translateY(20px);
                  }
                  to {
                    opacity: 1;
                    transform: translateY(0);
                  }
                }
                .animate-fade-in-up {
                  animation: fadeInUp 0.6s ease-out forwards;
                  opacity: 0;
                }
              `}</style>
            </div>
          </AnimatedElement>
        </div>
      </div>
    </section>
  )
}
