import type { Metadata } from "next"
import { getDictionary } from "@/lib/dictionaries"
import { Button } from "@/components/ui/button"
import { ContactFormDialog } from "@/components/contact-form-dialog"
import FinalCta from "@/components/landing/final-cta"

export async function generateMetadata(): Promise<Metadata> {
  // Используем только украинский язык
  const locale = 'ua';
  const dict = await getDictionary(locale)

  return {
    title: dict.support?.metaTitle || "Технічна підтримка CRM",
    description: dict.support?.metaDescription || "Отримайте професійну технічну підтримку для вашої CRM системи. Оперативне вирішення проблем і регулярні оновлення."
  }
}

export default async function SupportCrmPage() {
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
                    {dict.support?.heroTitle || "Технічна підтримка вашої CRM системи"}
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    {dict.support?.heroSubtitle || "Вирішуємо технічні проблеми, консультуємо користувачів та забезпечуємо безперебійну роботу вашої CRM"}
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <ContactFormDialog
                    trigger={<Button>Замовити підтримку</Button>}
                    title={commonDict.form.supportFormTitle || "Замовити технічну підтримку"}
                    description={commonDict.form.supportFormDescription || "Залиште свої контактні дані, і ми зв'яжемося з вами для обговорення умов технічної підтримки"}
                    formType="support_request"
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
                  src="/images/landings/support/hero.jpg"
                  alt="Технічна підтримка CRM"
                  className="aspect-square overflow-hidden rounded-xl object-cover object-center sm:w-full"
                  width={600}
                  height={600}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  {dict.support?.featuresTitle || "Переваги нашої технічної підтримки"}
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  {dict.support?.featuresSubtitle || "Ми пропонуємо повний комплекс послуг з підтримки вашої CRM системи"}
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6">
                <div className="p-2">
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
                    className="h-10 w-10"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Оперативне реагування</h3>
                <p className="text-center text-muted-foreground">
                  Швидке вирішення будь-яких технічних проблем у вашій CRM системі
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6">
                <div className="p-2">
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
                    className="h-10 w-10"
                  >
                    <path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5Z" />
                    <path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Консультації користувачів</h3>
                <p className="text-center text-muted-foreground">
                  Допомога співробітникам у використанні всіх можливостей CRM
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6">
                <div className="p-2">
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
                    className="h-10 w-10"
                  >
                    <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7Z" />
                    <path d="m5 16 3 4" />
                    <path d="m19 16-3 4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Регулярні оновлення</h3>
                <p className="text-center text-muted-foreground">
                  Встановлення оновлень та підтримка актуальної версії вашої CRM
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  {dict.support?.pricingTitle || "Тарифи на технічну підтримку"}
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  {dict.support?.pricingSubtitle || "Виберіть оптимальний пакет технічної підтримки для вашого бізнесу"}
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col rounded-lg border p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">Базовий</h3>
                  <span className="text-sm text-muted-foreground">Від 5000 грн/міс</span>
                </div>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-center">
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
                      className="h-4 w-4 mr-2 text-green-500"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>Реагування протягом 24 годин</span>
                  </li>
                  <li className="flex items-center">
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
                      className="h-4 w-4 mr-2 text-green-500"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>Email підтримка</span>
                  </li>
                  <li className="flex items-center">
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
                      className="h-4 w-4 mr-2 text-green-500"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>Оновлення системи</span>
                  </li>
                </ul>
                <div className="mt-6">
                  <ContactFormDialog
                    trigger={<Button className="w-full">Замовити</Button>}
                    title={commonDict.form.supportFormTitle || "Замовити технічну підтримку"}
                    description={commonDict.form.supportFormDescription || "Залиште свої контактні дані, і ми зв'яжемося з вами для обговорення умов технічної підтримки"}
                    formType="support_basic"
                    buttonText={commonDict.form.submitButton}
                    dict={commonDict}
                  />
                </div>
              </div>
              <div className="flex flex-col rounded-lg border p-6 bg-amber text-black">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">Стандарт</h3>
                  <span className="text-sm">Від 10000 грн/міс</span>
                </div>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-center">
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
                      className="h-4 w-4 mr-2 text-black"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>Реагування протягом 8 годин</span>
                  </li>
                  <li className="flex items-center">
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
                      className="h-4 w-4 mr-2 text-black"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>Email і телефонна підтримка</span>
                  </li>
                  <li className="flex items-center">
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
                      className="h-4 w-4 mr-2 text-black"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>Регулярні оновлення</span>
                  </li>
                  <li className="flex items-center">
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
                      className="h-4 w-4 mr-2 text-black"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>Щомісячний аудит системи</span>
                  </li>
                </ul>
                <div className="mt-6">
                  <ContactFormDialog
                    trigger={<Button className="w-full bg-black hover:bg-black/80 text-amber">Замовити</Button>}
                    title={commonDict.form.supportFormTitle || "Замовити технічну підтримку"}
                    description={commonDict.form.supportFormDescription || "Залиште свої контактні дані, і ми зв'яжемося з вами для обговорення умов технічної підтримки"}
                    formType="support_standard"
                    buttonText={commonDict.form.submitButton}
                    dict={commonDict}
                  />
                </div>
              </div>
              <div className="flex flex-col rounded-lg border p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">Преміум</h3>
                  <span className="text-sm text-muted-foreground">Від 20000 грн/міс</span>
                </div>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-center">
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
                      className="h-4 w-4 mr-2 text-green-500"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>Реагування протягом 2 годин</span>
                  </li>
                  <li className="flex items-center">
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
                      className="h-4 w-4 mr-2 text-green-500"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>24/7 підтримка</span>
                  </li>
                  <li className="flex items-center">
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
                      className="h-4 w-4 mr-2 text-green-500"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>Пріоритетні оновлення</span>
                  </li>
                  <li className="flex items-center">
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
                      className="h-4 w-4 mr-2 text-green-500"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>Щотижневий аудит системи</span>
                  </li>
                  <li className="flex items-center">
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
                      className="h-4 w-4 mr-2 text-green-500"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>Виділений фахівець</span>
                  </li>
                </ul>
                <div className="mt-6">
                  <ContactFormDialog
                    trigger={<Button className="w-full">Замовити</Button>}
                    title={commonDict.form.supportFormTitle || "Замовити технічну підтримку"}
                    description={commonDict.form.supportFormDescription || "Залиште свої контактні дані, і ми зв'яжемося з вами для обговорення умов технічної підтримки"}
                    formType="support_premium"
                    buttonText={commonDict.form.submitButton}
                    dict={commonDict}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <div className="mt-auto">
          {/* @ts-ignore */}
          <FinalCta 
            dict={{
              ...dict.support?.finalCta || {},
              form: commonDict.form,
              auditButton: dict.support?.finalCta?.auditButton || "Безкоштовний аудит",
              consultationButton: dict.support?.finalCta?.consultationButton || "Консультація"
            }} 
            commonDict={dict.common} 
          />
        </div>
      </main>
    </div>
  )
} 