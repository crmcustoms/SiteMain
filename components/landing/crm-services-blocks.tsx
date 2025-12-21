"use client"

import { CheckCircle2 } from "@/components/icons"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function CrmServicesBlocks() {

  const logos = [
    { id: 1, name: "Logo 1", src: "/images/logo_servises/2.png" },
    { id: 2, name: "Logo 2", src: "/images/logo_servises/5.png" },
    { id: 3, name: "Logo 3", src: "/images/logo_servises/6.png" },
    { id: 4, name: "Logo 4", src: "/images/logo_servises/7.png" },
    { id: 5, name: "Logo 5", src: "/images/logo_servises/9.png" },
    { id: 6, name: "Logo 6", src: "/images/logo_servises/10.png" },
    { id: 7, name: "Logo 7", src: "/images/logo_servises/11.png" },
    { id: 8, name: "Logo 8", src: "/images/logo_servises/13.png" },
    { id: 9, name: "Logo 9", src: "/images/logo_servises/14.png" },
    { id: 10, name: "Logo 10", src: "/images/logo_servises/21.png" },
    { id: 11, name: "Logo 11", src: "/images/logo_servises/24.png" },
    { id: 12, name: "Logo 12", src: "/images/logo_servises/images.png" },
  ]

  const services = [
    {
      title: "Якщо CRM ще немає",
      subtitle: "Ми допоможемо вам без хаосу та зайвих витрат запустити CRM, яка реально працює на бізнес.",
      items: [
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
    },
    {
      title: "Якщо CRM вже використовується",
      subtitle: "Знайдемо слабкі місця в поточній системі та зробимо її ефективною.",
      items: [
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
    },
    {
      title: "Індивідуальна розробка та доопрацювання",
      subtitle: "Коли стандартного функціоналу недостатньо — створюємо рішення під ваш бізнес.",
      items: [
        "Наскрізна аналітика та кастомні дашборди",
        "Вебдодатки та внутрішні бізнес-системи",
        "Сайти, лендинги та онлайн-магазини",
        "Чат-боти для продажів і підтримки",
        "Інтеграції з 1С, складом, телефонією",
        "Доопрацювання та масштабування існуючих систем",
      ],
      result: "Система, яка повністю підлаштована під ваші процеси.",
    },
  ]

  return (
    <section className="w-full pt-4 md:pt-6 pb-12 md:pb-24 lg:pb-32">
      <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .carousel-scroll {
          animation: scroll 40s linear infinite;
        }
        .carousel-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* Карусель логотипов - полная ширина */}
      <div className="w-screen relative left-[50%] right-[50%] -mx-[50vw] mb-12 overflow-hidden bg-white py-8">
        <div className="carousel-scroll flex gap-4">
          {/* Первый набор логотипов */}
          {logos.map((logo) => (
            <div key={`carousel-${logo.id}`} className="flex-shrink-0 w-40 h-28 flex items-center justify-center">
              <div className="flex h-28 w-40 items-center justify-center rounded-lg border-2 border-muted bg-white p-3 hover:border-amber hover:shadow-md transition-all">
                <img
                  src={logo.src}
                  alt={logo.name}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            </div>
          ))}

          {/* Дублированный набор для непрерывного скролла */}
          {logos.map((logo) => (
            <div key={`carousel-dup-${logo.id}`} className="flex-shrink-0 w-40 h-28 flex items-center justify-center">
              <div className="flex h-28 w-40 items-center justify-center rounded-lg border-2 border-muted bg-white p-3 hover:border-amber hover:shadow-md transition-all">
                <img
                  src={logo.src}
                  alt={logo.name}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Як ми допомагаємо з CRM
          </h2>
          <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            Незалежно від того, чи тільки починаєте з CRM чи вже її використовуєте — у нас є рішення для вас
          </p>
        </div>
      </div>

      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 lg:gap-12 mt-8">
        {services.map((service, index) => (
          <Card key={index} className="border-2 border-muted h-full flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">{service.title}</CardTitle>
              <CardDescription className="text-base mt-2">
                {service.subtitle}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 flex-grow">
              <div className="space-y-2">
                {service.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-amber mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-start gap-2 bg-muted p-3 rounded-md mt-auto">
                <CheckCircle2 className="h-5 w-5 text-amber mt-0.5 flex-shrink-0" />
                <p className="text-sm font-medium">
                  <span className="text-amber font-semibold">Результат:</span> {service.result}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
