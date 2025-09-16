import type { Metadata } from "next"
import { getDictionary } from "@/lib/dictionaries"
import { Button } from "@/components/ui/button"
import { ContactFormDialog } from "@/components/contact-form-dialog"
import FinalCta from "@/components/landing/final-cta"
import Link from "next/link"

export async function generateMetadata(): Promise<Metadata> {
  // Используем только украинский язык
  const locale = 'ua';
  const dict = await getDictionary(locale)

  return {
    title: dict.industrySolutions?.metaTitle || "Галузеві рішення",
    description: dict.industrySolutions?.metaDescription || "Спеціалізовані CRM рішення для різних галузей бізнесу: ритейл, виробництво, сфера послуг, логістика та будівництво."
  }
}

export default async function IndustrySolutionsPage() {
  // Используем только украинский язык
  const locale = 'ua';
  
  // Получаем словарь для украинского языка
  const dict = await getDictionary(locale)
  const commonDict = dict.common

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    {dict.industrySolutions?.heroTitle || "Галузеві CRM рішення"}
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    {dict.industrySolutions?.heroSubtitle || "Спеціалізовані рішення для автоматизації, адаптовані під особливості вашої галузі"}
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <ContactFormDialog
                    trigger={<Button>Підібрати рішення</Button>}
                    title={commonDict.form.solutionFormTitle || "Підібрати галузеве рішення"}
                    description={commonDict.form.solutionFormDescription || "Залиште свої контактні дані, і ми зв'яжемося з вами для обговорення рішення для вашої галузі"}
                    formType="industry_solution_request"
                    buttonText={commonDict.form.submitButton}
                    dict={commonDict}
                  />
                  <ContactFormDialog
                    trigger={<Button variant="outline">Отримати консультацію</Button>}
                    title={commonDict.form.consultationFormTitle}
                    description={commonDict.form.consultationFormDescription}
                    formType="consultation_request"
                    buttonText={commonDict.form.submitButton}
                    dict={commonDict}
                  />
                </div>
              </div>
              <div className="flex justify-center">
                <img
                  src="/images/landings/industry-solutions/industry.jpg"  
                  alt="Галузеві CRM рішення"
                  className="aspect-square overflow-hidden rounded-xl object-cover object-center sm:w-full"
                  width={600}
                  height={600}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Industries Section */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  {dict.industrySolutions?.industriesTitle || "Для яких галузей ми пропонуємо рішення"}
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  {dict.industrySolutions?.industriesSubtitle || "Ми розробили спеціалізовані рішення для різних сфер бізнесу"}
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col rounded-lg border overflow-hidden">
                <div className="bg-amber h-3"></div>
                <div className="p-6">
                  <h3 className="text-xl font-bold">Електронна комерція</h3>
                  <p className="mt-2 text-muted-foreground">
                    Управління інтернет-магазинами, автоматизація продажів, інтеграція з маркетплейсами
                  </p>
                  <div className="mt-6">
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/cases?category=Електронна комерція">Детальніше</Link>
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex flex-col rounded-lg border overflow-hidden">
                <div className="bg-amber h-3"></div>
                <div className="p-6">
                  <h3 className="text-xl font-bold">Маркетинг і PR</h3>
                  <p className="mt-2 text-muted-foreground">
                    Лідогенерація, збір відгуків, управління маркетинговими кампаніями, PR активності
                  </p>
                  <div className="mt-6">
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/cases?category=Маркетинг">Детальніше</Link>
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex flex-col rounded-lg border overflow-hidden">
                <div className="bg-amber h-3"></div>
                <div className="p-6">
                  <h3 className="text-xl font-bold">Меблева промисловість</h3>
                  <p className="mt-2 text-muted-foreground">
                    Автоматизація виробництва меблів, контроль якості, управління замовленнями та відвантаженням
                  </p>
                  <div className="mt-6">
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/cases?category=Меблева фабрика">Детальніше</Link>
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex flex-col rounded-lg border overflow-hidden">
                <div className="bg-amber h-3"></div>
                <div className="p-6">
                  <h3 className="text-xl font-bold">Проектна робота (виробництво)</h3>
                  <p className="mt-2 text-muted-foreground">
                    Управління проектами, контроль за витратами, робота з підрядниками, звітність
                  </p>
                  <div className="mt-6">
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/cases?category=Проектна робота">Детальніше</Link>
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex flex-col rounded-lg border overflow-hidden">
                <div className="bg-amber h-3"></div>
                <div className="p-6">
                  <h3 className="text-xl font-bold">Віконна промисловість</h3>
                  <p className="mt-2 text-muted-foreground">
                    Розрахунок і проектування вікон, управління виробництвом, контроль монтажу та сервісне обслуговування
                  </p>
                  <div className="mt-6">
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/cases?category=Віконна промисловість">Детальніше</Link>
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex flex-col rounded-lg border overflow-hidden">
                <div className="bg-amber h-3"></div>
                <div className="p-6">
                  <h3 className="text-xl font-bold">Логістика і склад</h3>
                  <p className="mt-2 text-muted-foreground">
                    Управління складськими запасами, оптимізація маршрутів, автоматизація документообігу
                  </p>
                  <div className="mt-6">
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/cases?category=Робота складу">Детальніше</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-center mt-8">
              <Button asChild>
                <Link href="/cases">Переглянути всі кейси</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  {dict.industrySolutions?.featuresTitle || "Переваги наших галузевих рішень"}
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  {dict.industrySolutions?.featuresSubtitle || "Чому спеціалізовані рішення краще за універсальні"}
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 py-12 md:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 bg-background">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber text-black">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                  >
                    <path d="M17 6.1H3" />
                    <path d="M21 12.1H3" />
                    <path d="M15.1 18H3" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Спеціалізована функціональність</h3>
                <p className="text-center text-muted-foreground">
                  Функції та можливості, розроблені саме для вашої галузі
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 bg-background">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber text-black">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="m16 8-8 8" />
                    <path d="m8 8 8 8" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Швидке впровадження</h3>
                <p className="text-center text-muted-foreground">
                  Скорочення термінів впровадження завдяки готовим галузевим налаштуванням
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 bg-background">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber text-black">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                  >
                    <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" />
                    <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
                    <path d="M12 2v2" />
                    <path d="M12 22v-2" />
                    <path d="m17 20.66-1-1.73" />
                    <path d="M11 10.27 7 3.34" />
                    <path d="m20.66 17-1.73-1" />
                    <path d="m3.34 7 1.73 1" />
                    <path d="M22 12h-2" />
                    <path d="M2 12h2" />
                    <path d="m20.66 7-1.73 1" />
                    <path d="m3.34 17 1.73-1" />
                    <path d="m17 3.34-1 1.73" />
                    <path d="m7 20.66 1-1.73" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Галузева аналітика</h3>
                <p className="text-center text-muted-foreground">
                  Специфічні для вашої галузі звіти, метрики та показники ефективності
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 bg-background">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber text-black">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                  >
                    <path d="M21 6H3" />
                    <path d="M10 12H3" />
                    <path d="M10 18H3" />
                    <circle cx="17" cy="15" r="3" />
                    <path d="m21 19-1.9-1.9" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Готові інтеграції</h3>
                <p className="text-center text-muted-foreground">
                  Інтеграція з популярними в вашій галузі сервісами та системами
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Case Studies */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  {dict.industrySolutions?.caseStudiesTitle || "Історії успіху"}
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  {dict.industrySolutions?.caseStudiesSubtitle || "Приклади успішного впровадження наших галузевих рішень"}
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 py-12 md:grid-cols-3">
              <div className="flex flex-col rounded-lg border overflow-hidden">
                <img
                  src="/images/landings/industry-solutions/furniture.jpg"
                  alt="Меблева компанія ВМКК"
                  className="aspect-video w-full object-cover"
                />
                <div className="p-6">
                  <div className="mb-2">
                    <span className="inline-block rounded-full bg-amber px-3 py-1 text-xs font-medium text-black">
                      Меблева промисловість
                    </span>
                  </div>
                  <h3 className="text-xl font-bold">Меблева компанія ВМКК</h3>
                  <p className="mt-2 text-muted-foreground">
                    Налаштовано мікросервіс для підтвердження креслень клієнтом. Розроблено мікросервіс «Лист відвантаження» для контролю деталей.
                  </p>
                  <div className="mt-4">
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/cases?category=Меблева фабрика">Детальніше</Link>
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex flex-col rounded-lg border overflow-hidden">
                <img
                  src="/images/landings/industry-solutions/pr-agency.jpg"
                  alt="PR агентство для IT-компаний"
                  className="aspect-video w-full object-cover"
                />
                <div className="p-6">
                  <div className="mb-2">
                    <span className="inline-block rounded-full bg-amber px-3 py-1 text-xs font-medium text-black">
                      Маркетинг і PR
                    </span>
                  </div>
                  <h3 className="text-xl font-bold">PR агентство для IT-компаний</h3>
                  <p className="mt-2 text-muted-foreground">
                    Розроблено систему врахування витрат по проекту, трекер для роботи з рахунками та мікросервіс для оплати витрат.
                  </p>
                  <div className="mt-4">
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/cases?category=PR агентство">Детальніше</Link>
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex flex-col rounded-lg border overflow-hidden">
                <img
                  src="/images/landings/industry-solutions/ecommerce.jpg"
                  alt="Інтернет-магазин електроніки"
                  className="aspect-video w-full object-cover"
                />
                <div className="p-6">
                  <div className="mb-2">
                    <span className="inline-block rounded-full bg-amber px-3 py-1 text-xs font-medium text-black">
                      Електронна комерція
                    </span>
                  </div>
                  <h3 className="text-xl font-bold">Інтернет-магазин електроніки</h3>
                  <p className="mt-2 text-muted-foreground">
                    Впровадження CRM з омніканальними продажами та інтеграцією з маркетплейсами збільшило конверсію на 35%.
                  </p>
                  <div className="mt-4">
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/cases?category=Електронна комерція">Детальніше</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <Button variant="outline" asChild>
                <Link href="/cases">Переглянути всі кейси</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <div className="mt-auto">
          {/* @ts-ignore */}
          <FinalCta 
            dict={{
              ...dict.industrySolutions?.finalCta || {},
              form: commonDict.form,
              auditButton: dict.industrySolutions?.finalCta?.auditButton || "Безкоштовний аудит",
              consultationButton: dict.industrySolutions?.finalCta?.consultationButton || "Консультація"
            }} 
            commonDict={dict.common} 
          />
        </div>
      </main>
    </div>
  )
} 