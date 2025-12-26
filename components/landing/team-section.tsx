"use client"

import { AnimatedElement } from "@/components/ui/animated-element"

export default function TeamSection() {
  const teamValues = [
    {
      icon: "👥",
      title: "Невелика команда",
      description: "Ми працюємо невеликою, але дружною командою"
    },
    {
      icon: "⚡",
      title: "Якість над кількістю",
      description: "Робимо проєкти якісно, а не на конвеєрі"
    },
    {
      icon: "🎯",
      title: "Готові до проєктів",
      description: "Якщо бачите нашу рекламу — у нас вільний час"
    }
  ]

  return (
    <section className="w-full py-16 md:py-24 lg:py-32 bg-gradient-to-b from-white to-amber/5 relative overflow-hidden">
      {/* Фоновая анимация */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 right-0 w-80 h-80 bg-amber/10 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute -bottom-40 left-0 w-96 h-96 bg-amber/5 rounded-full blur-3xl opacity-30"></div>
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Заголовок и подзаголовок */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <AnimatedElement delay={0}>
            <div className="inline-block mb-4 px-4 py-2 bg-amber/10 rounded-full border border-amber/20">
              <p className="text-sm font-semibold text-amber">Про нас</p>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black mb-6 leading-tight">
              Ми працюємо <span className="text-amber">невеликою</span> командою
            </h2>
            <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
              У нас немає мети «заробити всі гроші світу» — нам важливо робити проєкти якісно, а не на конвеєрі.
            </p>
          </AnimatedElement>
        </div>

        {/* Карточки с основной информацией */}
        <div className="max-w-4xl mx-auto mb-12">
          <AnimatedElement delay={100}>
            <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm">
              <h3 className="text-xl md:text-2xl font-bold text-black mb-4">
                Якщо ви бачите нашу рекламу
              </h3>
              <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-6">
                це означає просту річ: у нас з'явився вільний час і ми готові взяти ще кілька нових проєктів.
              </p>

              {/* Список преимуществ */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="text-xl flex-shrink-0">✓</div>
                  <div>
                    <p className="text-black font-semibold">Без черг</p>
                    <p className="text-sm text-gray-600">Початок проєкту не залежить від черги</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-xl flex-shrink-0">✓</div>
                  <div>
                    <p className="text-black font-semibold">Без «запишемо на наступний квартал»</p>
                    <p className="text-sm text-gray-600">Прямий старт без затримок</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-xl flex-shrink-0">✓</div>
                  <div>
                    <p className="text-black font-semibold">Без зникнень у тумані</p>
                    <p className="text-sm text-gray-600">Після передоплати ви вас не покинемо 🙂</p>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedElement>
        </div>

        {/* Сетка с преимуществами */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {teamValues.map((value, index) => (
            <AnimatedElement key={index} delay={200 + index * 100}>
              <div
                className="group relative rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:border-amber/40"
                style={{
                  animation: `fadeInUp 0.6s ease-out forwards`,
                  animationDelay: `${(index + 1) * 0.2}s`,
                  opacity: 0
                }}
              >
                <div className="mb-4 inline-block w-12 h-12 rounded-full bg-amber/10 flex items-center justify-center text-2xl">
                  {value.icon}
                </div>
                <h3 className="text-lg font-bold text-black mb-2">
                  {value.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {value.description}
                </p>
              </div>
            </AnimatedElement>
          ))}
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
      `}</style>
    </section>
  )
}
