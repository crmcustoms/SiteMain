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
    title: dict.projectManagement?.metaTitle || "Управління проектами",
    description: dict.projectManagement?.metaDescription || "Професійне управління проектами впровадження та розвитку CRM систем. Точно в строк і в рамках бюджету."
  }
}

export default async function ProjectManagementPage() {
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
                    {dict.projectManagement?.heroTitle || "Професійне управління проектами"}
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    {dict.projectManagement?.heroSubtitle || "Забезпечуємо успішне впровадження CRM систем в рамках термінів і бюджету"}
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <ContactFormDialog
                    trigger={<Button>Замовити управління проектом</Button>}
                    title={commonDict.form.projectManagementFormTitle || "Замовити управління проектом"}
                    description={commonDict.form.projectManagementFormDescription || "Залиште свої контактні дані, і ми зв'яжемося з вами для обговорення деталей проекту"}
                    formType="pm_request"
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
                  src="/images/landings/project-management/project-management-hero.jpg"
                  alt="Управління проектами"
                  className="aspect-square overflow-hidden rounded-xl object-cover object-center sm:w-full"
                  width={600}
                  height={600}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Methodology Section */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  {dict.projectManagement?.methodologyTitle || "Наш підхід до управління проектами"}
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  {dict.projectManagement?.methodologySubtitle || "Ми налаштовуємо бізнес-процеси та підбираємо оптимальні системи для вашого бізнесу"}
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-2">
              <div className="flex flex-col items-start space-y-4 rounded-lg border p-6">
                <div className="flex items-center justify-center rounded-full bg-amber p-2 text-black">
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
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Налаштування бізнес-процесів</h3>
                <p className="text-muted-foreground">
                  Аналізуємо та оптимізуємо ваші бізнес-процеси для максимальної ефективності. Створюємо чіткі алгоритми роботи та взаємодії між відділами.
                </p>
                <ul className="mt-2 space-y-2">
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
                    <span>Аналіз існуючих процесів</span>
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
                    <span>Розробка оптимальних схем роботи</span>
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
                    <span>Автоматизація рутинних завдань</span>
                  </li>
                </ul>
              </div>
              <div className="flex flex-col items-start space-y-4 rounded-lg border p-6">
                <div className="flex items-center justify-center rounded-full bg-amber p-2 text-black">
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
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                    <line x1="8" y1="21" x2="16" y2="21" />
                    <line x1="12" y1="17" x2="12" y2="21" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Підбір оптимальних систем</h3>
                <p className="text-muted-foreground">
                  Допомагаємо обрати та налаштувати найбільш підходящі системи управління проектами для вашого бізнесу, включаючи Планфікс та інші рішення.
                </p>
                <ul className="mt-2 space-y-2">
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
                    <span>Планфікс - ідеальне рішення для більшості задач</span>
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
                    <span>Налаштування під ваші бізнес-процеси</span>
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
                    <span>Інтеграція з іншими системами</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  {dict.projectManagement?.servicesTitle || "Що ми пропонуємо"}
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  {dict.projectManagement?.servicesSubtitle || "Комплексний підхід до управління проектами впровадження CRM"}
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 bg-background">
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
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Виділений Project Manager</h3>
                <p className="text-center text-muted-foreground">
                  Досвідчений керівник проекту, який координує всі етапи та комунікацію
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 bg-background">
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
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Планування і контроль</h3>
                <p className="text-center text-muted-foreground">
                  Детальний план проекту з контрольними точками та відстеженням прогресу
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 bg-background">
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
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Комунікація та звітність</h3>
                <p className="text-center text-muted-foreground">
                  Регулярні зустрічі, статус-звіти та прозора комунікація з усіма учасниками
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 bg-background">
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
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Управління командою</h3>
                <p className="text-center text-muted-foreground">
                  Координація роботи технічних фахівців, консультантів та інших учасників проекту
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 bg-background">
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
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Документація</h3>
                <p className="text-center text-muted-foreground">
                  Підготовка повної документації проекту, включаючи технічні специфікації та інструкції
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 bg-background">
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
                <h3 className="text-xl font-bold">Управління ризиками</h3>
                <p className="text-center text-muted-foreground">
                  Ідентифікація, оцінка та пом'якшення потенційних ризиків проекту
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
                  {dict.projectManagement?.caseStudiesTitle || "Історії успіху"}
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  {dict.projectManagement?.caseStudiesSubtitle || "Проекти, які ми успішно реалізували"}
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 py-12 md:grid-cols-2">
              <div className="flex flex-col rounded-lg border overflow-hidden">
                <img
                  src="/images/landings/project-management/retail-crm.jpg"
                  alt="PR агентство для IT-компаний"
                  className="aspect-video w-full object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-bold">PR агентство для IT-компаний і стартапів</h3>
                  <p className="mt-2 text-muted-foreground">
                    Розробили систему врахування витрат по проекту, трекер для роботи з рахунками, створили мікросервіс для оплати витрат по проектам. Працюємо разом вже 7 років.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-muted px-3 py-1 text-sm">PR</span>
                    <span className="rounded-full bg-muted px-3 py-1 text-sm">Планфікс</span>
                    <span className="rounded-full bg-muted px-3 py-1 text-sm">7 років</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col rounded-lg border overflow-hidden">
                <img
                  src="/images/landings/project-management/retail-crm1.jpg"
                  alt="Меблева компанія ВМКК"
                  className="aspect-video w-full object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-bold">Меблева компанія ВМКК</h3>
                  <p className="mt-2 text-muted-foreground">
                    Налаштовано мікросервіс для підтвердження креслень клієнтом після розробки проєкту. Розроблено мікросервіс «Лист відвантаження», який забезпечує контроль деталей під час відвантаження, щоб уникнути втрат. Впроваджено систему збору відгуків та тригерні розсилки.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-muted px-3 py-1 text-sm">Меблі</span>
                    <span className="rounded-full bg-muted px-3 py-1 text-sm">Мікросервіси</span>
                    <span className="rounded-full bg-muted px-3 py-1 text-sm">Планфікс</span>
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
              ...dict.projectManagement?.finalCta || {},
              form: commonDict.form,
              auditButton: dict.projectManagement?.finalCta?.auditButton || "Безкоштовний аудит",
              consultationButton: dict.projectManagement?.finalCta?.consultationButton || "Консультація"
            }} 
            commonDict={dict.common} 
          />
        </div>
      </main>
    </div>
  )
} 