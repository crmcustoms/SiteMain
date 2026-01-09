"use client"

import React from "react"
import { CheckCircle2, Star } from "lucide-react"

export default function Pricing() {
  const plans = [
    {
      id: 1,
      name: "СТАРТ",
      price: "від 25,000₴",
      duration: "2-4 тижні",
      description: "Базове впровадження для швидкого старту",
      features: [
        "Обов'язковий аудит (5,000₴, 2 години)",
        "Підбір CRM під ваш бізнес",
        "Налаштування воронок та статусів",
        "Налаштування полів та карток",
        "До 3 базових інтеграцій",
        "Базові автоматизації",
        "Вебінар для команди (1-2 години)",
        "Тиждень технічної підтримки",
      ],
      forWho: "Малий бізнес до 20 осіб, перше впровадження CRM",
      popular: false,
    },
    {
      id: 2,
      name: "ПРОФЕСІЙНИЙ",
      price: "від 70,000₴",
      duration: "1-2 місяці",
      description: "Повне впровадження з автоматизацією",
      features: [
        "Глибокий аудит бізнес-процесів (2-3 дні)",
        "CRM впровадження під ключ",
        "До 7 інтеграцій",
        "n8n автоматизація",
        "Налаштування логіки роботи команди",
        "Вебінар для команди (4-8 годин)",
        "Місяць технічної підтримки",
        "Документація (за потребою)",
      ],
      forWho: "Середній бізнес 20-100 осіб, потрібна автоматизація рутини",
      popular: true,
      badge: "Найпопулярніший варіант",
    },
    {
      id: 3,
      name: "ІНДИВІДУАЛЬНИЙ",
      price: "від 120,000₴",
      duration: "від 2 місяців",
      description: "Комплексні рішення для складних завдань",
      features: [
        "Передпроєктне дослідження",
        "Детальний аналіз бізнес-процесів",
        "Визначення точок автоматизації",
        "Повне впровадження",
        "Кастомна розробка модулів",
        "Необмежені інтеграції",
        "AI в бізнес-процеси",
        "Складні n8n сценарії",
        "Виділений менеджер проєкту",
        "3 місяці технічної підтримки",
        "Повна документація",
      ],
      forWho: "Унікальні процеси, багато інтеграцій, потрібна розробка",
      popular: false,
    },
  ]

  return (
    <div className="relative w-full bg-white pt-16 pb-0 overflow-hidden">
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
              <div className="text-xs font-mono font-bold text-black">04</div>
            </div>
            <div>
              <h2 className="text-5xl font-black text-black uppercase tracking-tighter">
                Ціноутворення
              </h2>
            </div>
          </div>
          <p className="text-lg text-black/60 max-w-3xl">
            Скільки це коштує? Кожне впровадження CRM — унікальне. Без попереднього вивчення
            бізнес-процесів неможливо коректно оцінити обсяг робіт і назвати
            точну ціну. Але щоб у вас було розуміння порядку цифр — ось базові варіанти.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative border-2 p-8 flex flex-col h-full transition-all hover:shadow-lg ${
                plan.popular
                  ? "border-[#FFD700] bg-yellow-50"
                  : "border-black/10"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-8 bg-white px-4 py-1 border-2 border-[#FFD700]">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 fill-[#FFD700] text-[#FFD700]" />
                    <span className="text-xs font-bold text-black">{plan.badge}</span>
                  </div>
                </div>
              )}

              <div className="mb-6 pt-4">
                <h3 className="text-2xl font-black text-black mb-2 uppercase tracking-tight">
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl font-bold text-black">{plan.price}</span>
                  <span className="text-sm text-black/60">· {plan.duration}</span>
                </div>
                <p className="text-sm text-black/70">{plan.description}</p>
              </div>

              <div className="space-y-3 mb-6 flex-1">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#FFD700] flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-black/80">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="border-t-2 border-black/10 pt-6 mt-6">
                <p className="text-xs font-mono text-black/40 mb-2">ДЛЯ КОГО</p>
                <p className="text-sm font-medium text-black/80">{plan.forWho}</p>
              </div>

              <button className={`w-full mt-6 py-3 font-bold transition-all uppercase tracking-tight ${
                plan.popular
                  ? "bg-[#FFD700] text-black hover:bg-black hover:text-[#FFD700] border-2 border-[#FFD700]"
                  : "border-2 border-black/20 text-black hover:border-[#FFD700] hover:bg-[#FFD700] hover:text-black"
              }`}>
                Розглянути варіант
              </button>
            </div>
          ))}
        </div>

        {/* Budget callout */}
        <div className="relative max-w-2xl mx-auto bg-black/5 border-2 border-[#FFD700]/30 p-8 rounded-sm">
          <div className="absolute -top-3 left-8 bg-white px-3 py-0.5">
            <h3 className="text-sm font-bold text-black">💰 ЩО ЯКЩО БЮДЖЕТ ДУЖЕ ОБМЕЖЕНИЙ?</h3>
          </div>

          <div className="space-y-4 mt-4">
            <p className="text-sm text-black/80">
              Ми можемо налаштувати базову систему від <span className="font-bold text-black">5,000₴</span>:
            </p>

            <ul className="space-y-2">
              <li className="flex items-start gap-3 text-sm text-black/80">
                <span className="text-[#FFD700] font-bold mt-0.5">·</span>
                <span>Налаштування статусів та полів</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-black/80">
                <span className="text-[#FFD700] font-bold mt-0.5">·</span>
                <span>1-2 прості автоматизації</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-black/80">
                <span className="text-[#FFD700] font-bold mt-0.5">·</span>
                <span>3 дні підтримки в чаті</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-black/80">
                <span className="text-[#FFD700] font-bold mt-0.5">·</span>
                <span>30-хвилинний вебінар</span>
              </li>
            </ul>

            <div className="border-t border-[#FFD700]/20 pt-4 mt-4">
              <p className="text-xs font-mono text-black/40 mb-2">⚠️ ВАЖЛИВО</p>
              <p className="text-sm text-black/70">
                Це технічне налаштування без аудиту. Підходить якщо у вас вже є готова CRM і дуже прості процеси.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="h-16"></div>
    </div>
  )
}
