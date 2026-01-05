"use client"

import { AnimatedElement } from "@/components/ui/animated-element"

export default function TeamSection() {
  return (
    <section className="w-full py-16 md:py-24 lg:py-32 bg-gray-50 relative overflow-hidden">
      {/* Фоновая анимация */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 right-0 w-80 h-80 bg-amber/5 rounded-full blur-3xl opacity-30"></div>
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Team image */}
          <AnimatedElement delay={0}>
            <div className="relative flex items-center justify-center">
              <img
                src="/images/komanda.png"
                alt="Команда CRM Customs"
                className="w-full h-auto rounded-2xl shadow-lg"
              />
            </div>
          </AnimatedElement>

          {/* Right side - Text content */}
          <AnimatedElement delay={100}>
            <div className="space-y-6">
              <div>
                <p className="text-sm font-semibold text-amber mb-3 uppercase tracking-wide">Про нас</p>
                <h2 className="text-4xl md:text-5xl font-bold text-black mb-4 leading-tight">
                  Ми працюємо <span className="text-amber">невеликою</span> командою
                </h2>
                <p className="text-lg text-gray-700 leading-relaxed mb-3">
                  У нас немає мети «заробити всі гроші світу» — нам важливо робити проєкти якісно, а не на конвеєрі.
                </p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  <span className="font-bold">Саме це дозволяє нам створювати унікальні системи, максимально пристосовані під ваш бізнес.</span>
                </p>
              </div>

              {/* Main message */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-xl font-bold text-black mb-3">
                  Якщо ви бачите нашу рекламу
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  це означає просту річ: у нас з'явився вільний час і ми готові взяти ще кілька нових проєктів.
                </p>

                {/* Benefits */}
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-start gap-4">
                    <span className="text-4xl flex-shrink-0 text-amber">✓</span>
                    <p className="text-lg font-semibold text-black leading-relaxed">
                      Без черг, без «запишемо вас на наступний квартал» і без зникнень у тумані після передоплати 🙂
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedElement>
        </div>
      </div>
    </section>
  )
}
