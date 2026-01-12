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
    title: dict.customDev?.metaTitle || "Індивідуальна розробка",
    description: dict.customDev?.metaDescription || "Розробка індивідуальних рішень для автоматизації бізнесу та інтеграції з іншими системами."
  }
}

export default async function CustomDevelopmentPage() {
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
                    {dict.customDev?.heroTitle || "Індивідуальна розробка під ваш бізнес"}
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    {dict.customDev?.heroSubtitle || "Створюємо унікальні рішення, які повністю відповідають особливостям вашого бізнесу"}
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <ContactFormDialog
                    trigger={<Button>Замовити розробку</Button>}
                    title={commonDict.form.developmentFormTitle || "Замовити індивідуальну розробку"}
                    description={commonDict.form.developmentFormDescription || "Розкажіть про ваші потреби, і ми зв'яжемося з вами для обговорення деталей проекту"}
                    formType="development_request"
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
                  src="/images/landings/development/hero.jpg"
                  alt="Індивідуальна розробка"
                  className="aspect-square overflow-hidden rounded-xl object-cover object-center sm:w-full"
                  width={600}
                  height={600}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  {dict.customDev?.processTitle || "Процес розробки"}
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  {dict.customDev?.processSubtitle || "Наш підхід до створення індивідуальних рішень"}
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 py-12 md:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber text-xl font-bold text-black">1</div>
                <h3 className="text-xl font-bold">Аналіз вимог</h3>
                <p className="text-center text-muted-foreground">
                  Вивчаємо процеси вашого бізнесу та формуємо технічне завдання
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber text-xl font-bold text-black">2</div>
                <h3 className="text-xl font-bold">Проектування</h3>
                <p className="text-center text-muted-foreground">
                  Створюємо архітектуру рішення та дизайн інтерфейсів
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber text-xl font-bold text-black">3</div>
                <h3 className="text-xl font-bold">Розробка</h3>
                <p className="text-center text-muted-foreground">
                  Програмуємо функціонал та проводимо регулярні демонстрації
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber text-xl font-bold text-black">4</div>
                <h3 className="text-xl font-bold">Впровадження</h3>
                <p className="text-center text-muted-foreground">
                  Тестуємо, запускаємо рішення та навчаємо ваших співробітників
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Solutions Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  {dict.customDev?.solutionsTitle || "Наші рішення"}
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  {dict.customDev?.solutionsSubtitle || "Приклади індивідуальних розробок, які ми створили для наших клієнтів"}
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col rounded-lg border bg-background p-6">
                <div className="mb-4">
                  <img
                    src="/images/landings/development/crm-1c.jpg"
                    alt="Інтеграція CRM з 1С"
                    className="aspect-video w-full rounded-lg object-cover"
                  />
                </div>
                <h3 className="text-xl font-bold">Інтеграція CRM з 1С</h3>
                <p className="mt-2 text-muted-foreground">
                  Автоматичний обмін даними між CRM системою та 1С: клієнти, товари, замовлення
                </p>
                <div className="mt-6">
                  <Button variant="outline" className="w-full">Детальніше</Button>
                </div>
              </div>
              <div className="flex flex-col rounded-lg border bg-background p-6">
                <div className="mb-4">
                  <img
                    src="/images/landings/development/mobile-app.jpg"
                    alt="Мобільний додаток для менеджерів"
                    className="aspect-video w-full rounded-lg object-cover"
                  />
                </div>
                <h3 className="text-xl font-bold">Мобільний додаток для менеджерів</h3>
                <p className="mt-2 text-muted-foreground">
                  Додаток для роботи з клієнтами в полі з офлайн-режимом та синхронізацією
                </p>
                <div className="mt-6">
                  <Button variant="outline" className="w-full">Детальніше</Button>
                </div>
              </div>
              <div className="flex flex-col rounded-lg border bg-background p-6">
                <div className="mb-4">
                  <img
                    src="/images/landings/development/analytics.jpg"
                    alt="Система аналітики продажів"
                    className="aspect-video w-full rounded-lg object-cover"
                  />
                </div>
                <h3 className="text-xl font-bold">Система аналітики продажів</h3>
                <p className="mt-2 text-muted-foreground">
                  Інтерактивні дашборди з ключовими показниками та можливістю глибокого аналізу
                </p>
                <div className="mt-6">
                  <Button variant="outline" className="w-full">Детальніше</Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Technologies Section */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  {dict.customDev?.technologiesTitle || "Технології, які ми використовуємо"}
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  {dict.customDev?.technologiesSubtitle || "Сучасний стек технологій для створення надійних та масштабованих рішень"}
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 py-12 md:grid-cols-4 lg:grid-cols-6">
              <div className="flex flex-col items-center space-y-2">
                <div className="p-2">
                  <img
                    src="/images/landings/development/icons/react.svg"
                    alt="React"
                    className="h-12 w-12"
                  />
                </div>
                <span className="text-center font-medium">React</span>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <div className="p-2">
                  <img
                    src="/images/landings/development/icons/nodejs.svg"
                    alt="Node.js"
                    className="h-12 w-12"
                  />
                </div>
                <span className="text-center font-medium">Node.js</span>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <div className="p-2">
                  <img
                    src="/images/landings/development/icons/python.svg"
                    alt="Python"
                    className="h-12 w-12"
                  />
                </div>
                <span className="text-center font-medium">Python</span>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <div className="p-2">
                  <img
                    src="/images/landings/development/icons/aws_logo.svg"
                    alt="AWS"
                    className="h-12 w-12"
                  />
                </div>
                <span className="text-center font-medium">AWS</span>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <div className="p-2">
                  <img
                    src="/images/landings/development/icons/docker.svg"
                    alt="Docker"
                    className="h-12 w-12"
                  />
                </div>
                <span className="text-center font-medium">Docker</span>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <div className="p-2">
                  <img
                    src="/images/landings/development/icons/postgresql.svg"
                    alt="PostgreSQL"
                    className="h-12 w-12"
                  />
                </div>
                <span className="text-center font-medium">PostgreSQL</span>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <div className="mt-auto">
          {/* @ts-ignore */}
          <FinalCta 
            dict={{
              ...dict.customDev?.finalCta || {},
              form: commonDict.form,
              auditButton: dict.customDev?.finalCta?.auditButton || "Безкоштовний аудит",
              consultationButton: dict.customDev?.finalCta?.consultationButton || "Консультація"
            }} 
            commonDict={dict.common} 
          />
        </div>
      </main>
    </div>
  )
} 