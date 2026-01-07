"use client"

import { CheckCircle2, ChevronRight } from "lucide-react"
import { useState } from "react"

const servicesData = [
  {
    id: 1,
    title: "Якщо CRM ще немає",
    subtitle: "Ми допоможемо вам без хаосу та зайвих витрат запустити CRM, яка реально працює на бізнес.",
    features: [
      "Підберемо CRM під вашу нішу та процеси",
      "Підключимо телефонію, месенджери, сайт і форми",
      "Налаштуємо автоматичну обробку лідів",
      "Навчимо команду працювати в системі",
      "Запустимо перші продажі вже в перші тижні",
      "Автоматизуємо рутинні дії менеджерів",
      "Адаптуємо систему під конкретні задачи бізнесу",
      "Підготуємо технічну документацію та інструкції",
    ],
    result: "Зрозуміла система продажів замість хаосу в таблицях.",
    buttonTitle: "Базовий",
    buttonSubtitle: "CRM ще немає",
    number: "01",
  },
  {
    id: 2,
    title: "Якщо CRM вже використовується",
    subtitle: "Знайдемо слабкі місця в поточній системі та зробимо її ефективною.",
    features: [
      "Проведемо аудит та діагностику CRM",
      "Виявимо, де втрачаються клієнти та гроші",
      "Оптимізуємо поточні процеси",
      "Автоматизуємо нові сценарії роботи",
      "Налаштуємо зрозумілі звіти та аналітику",
      "Забезпечимо підтримку та супровід",
      "Перенесемо дані на нову CRM за потреби",
      "Допоможемо з вибором і продовженням ліцензій",
    ],
    result: "CRM починає допомагати продавати, а не заважати.",
    buttonTitle: "Оптимальний",
    buttonSubtitle: "CRM використовується",
    number: "02",
  },
  {
    id: 3,
    title: "Індивідуальна розробка та доопрацювання",
    subtitle: "Коли стандартного функціоналу недостатньо — створюємо рішення під ваш бізнес.",
    features: [
      "Наскрізна аналітика та кастомні дашборди",
      "Вебдодатки та внутрішні бізнес-системи",
      "Сайти, лендинги та онлайн-магазини",
      "Чат-боти для продажів і підтримки",
      "Інтеграції з 1С, складом, телефонією",
      "Доопрацювання та масштабування існуючих систем",
    ],
    result: "Система, яка повністю підлаштована під ваші процеси.",
    buttonTitle: "Індивідуальний",
    buttonSubtitle: "розробка та доопрацювання",
    number: "03",
  },
]

export default function WhyChooseUs() {
  const [activeService, setActiveService] = useState(0)

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
        <div className="mb-16">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 border-2 border-[#FFD700] flex items-center justify-center">
              <div className="text-xs font-mono font-bold text-black">02</div>
            </div>
            <div>
              <h2 className="text-5xl font-black text-black uppercase tracking-tighter">Як ми допомагаємо з CRM</h2>
            </div>
          </div>
          <p className="text-lg text-black/70 max-w-3xl ml-16">
            Незалежно від того, чи тільки починаєте з CRM чи вже її використовуєте — у нас є рішення для вас
          </p>
        </div>

        <div className="flex flex-wrap gap-4 mb-12">
          {servicesData.map((service, idx) => {
            return (
              <button
                key={service.id}
                onClick={() => setActiveService(idx)}
                className={`group relative px-8 py-4 border-2 transition-all ${
                  activeService === idx
                    ? "border-[#FFD700] bg-[#FFD700] text-black"
                    : "border-black/20 bg-white text-black/70 hover:border-black/40"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 flex items-center justify-center border-2 border-current flex-shrink-0">
                    <span className="text-lg font-black font-mono">{service.number}</span>
                  </div>
                  <div className="text-left">
                    <div className="text-base font-bold mb-1">{service.buttonTitle}</div>
                    <div className="text-xs opacity-60">{service.buttonSubtitle}</div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left side - Service details */}
          <div className="lg:col-span-2 relative">
            {servicesData.map((service, idx) => (
              <div
                key={service.id}
                className={`transition-all duration-500 ${
                  activeService === idx
                    ? "opacity-100 translate-x-0 relative"
                    : "opacity-0 translate-x-8 absolute inset-0 pointer-events-none"
                }`}
              >
                <div className="border-2 border-black/10 p-8 bg-white mb-6">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="text-6xl font-black text-[#FFD700]/20">0{idx + 1}</div>
                    <div className="flex-1">
                      <h3 className="text-3xl font-black text-black mb-3">{service.title}</h3>
                      <p className="text-base text-black/70 leading-relaxed">{service.subtitle}</p>
                    </div>
                  </div>

                  <div className="h-[2px] bg-black/10 my-6" />

                  {/* Features list in two columns */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    {service.features.map((feature, featureIdx) => (
                      <div key={featureIdx} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-[#FFD700] flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-black/80">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-l-4 border-[#FFD700] bg-black/5 p-6">
                  <div className="text-xs font-mono text-black/40 mb-2 tracking-wider">РЕЗУЛЬТАТ</div>
                  <p className="text-xl font-bold text-black leading-relaxed">{service.result}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            {/* CTA Card */}
            <div className="sticky top-8 border-2 border-[#FFD700] p-8 bg-white">
              <h3 className="text-2xl font-black text-black mb-4 uppercase">Отримайте аудит вашої CRM</h3>
              <p className="text-sm text-black/70 mb-6 leading-relaxed">
                Проаналізуємо вашу поточну систему та покажемо, як збільшити продажі на 30-50%
              </p>

              <button className="group relative w-full py-4 bg-black text-white font-bold overflow-hidden transition-colors hover:bg-[#FFD700] hover:text-black">
                <span className="flex items-center justify-center gap-2">
                  ЗАМОВИТИ АУДИТ
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>

              {/* Trust indicators */}
              <div className="flex items-center justify-around mt-6 pt-6 border-t border-black/10">
                <div className="text-center">
                  <div className="text-2xl font-black text-black">4.9</div>
                  <div className="text-xs text-black/50">Рейтинг</div>
                </div>
                <div className="w-[1px] h-10 bg-black/10" />
                <div className="text-center">
                  <div className="text-2xl font-black text-black">48+</div>
                  <div className="text-xs text-black/50">Проектів</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
