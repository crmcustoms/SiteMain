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
          {/* Left side - Team member card */}
          <AnimatedElement delay={0}>
            <div className="relative h-96 md:h-full min-h-96 flex flex-col items-center justify-center">
              {/* Profile card */}
              <div className="relative z-10">
                {/* Circular photo */}
                <div className="mb-6 relative">
                  <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-white shadow-lg mx-auto">
                    <img
                      src="/286793332_5146371592111874_3646856194339008700_n.jpg"
                      alt="Ткаченко Максим"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Decorative circle background */}
                  <div className="absolute -inset-6 bg-amber/10 rounded-full -z-10"></div>
                </div>

                {/* Business card */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-md text-center max-w-xs">
                  <h3 className="text-2xl font-bold text-black mb-1">
                    Ткаченко Максим
                  </h3>
                  <p className="text-sm text-amber font-semibold mb-3">
                    Засновник
                  </p>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    Бізнес аналітик та проект менеджер
                  </p>

                  {/* Divider */}
                  <div className="border-t border-gray-100 my-4"></div>

                  {/* Additional info */}
                  <p className="text-xs text-gray-500">
                    CRM Customs — якісні рішення для бізнесу
                  </p>
                </div>
              </div>
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
                <p className="text-lg text-gray-700 leading-relaxed">
                  У нас немає мети «заробити всі гроші світу» — нам важливо робити проєкти якісно, а не на конвеєрі.
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
                <div className="space-y-3 pt-4 border-t border-gray-100">
                  <div className="flex items-start gap-3">
                    <span className="text-xl flex-shrink-0 text-amber">✓</span>
                    <div>
                      <p className="font-semibold text-black text-sm">Без черг</p>
                      <p className="text-xs text-gray-600">Початок проєкту без очікування</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-xl flex-shrink-0 text-amber">✓</span>
                    <div>
                      <p className="font-semibold text-black text-sm">Без затримок</p>
                      <p className="text-xs text-gray-600">Немає «запишемо на наступний квартал»</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-xl flex-shrink-0 text-amber">✓</span>
                    <div>
                      <p className="font-semibold text-black text-sm">Без зникнень</p>
                      <p className="text-xs text-gray-600">Прямий контакт після передоплати 🙂</p>
                    </div>
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
