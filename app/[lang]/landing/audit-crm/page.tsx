import type { Metadata } from "next"
import { getDictionary } from "@/lib/dictionaries"
import { i18n } from "@/lib/i18n-config"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ContactFormDialog } from "@/components/contact-form-dialog"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  // Получаем словарь для выбранного языка
  const resolvedParams = await params;
  const lang = resolvedParams?.lang || 'ua'
  const dict = await getDictionary(lang)

  return {
    title: dict.audit?.metaTitle || "Аудит і стратегія розвитку CRM",
    description: dict.audit?.metaDescription || "Проаналізуємо вашу систему продажів і складемо карту впровадження або розвитку вашої CRM."
  }
}

export default async function AuditCrmPage({ params }: { params: Promise<{ lang: string }> }) {
  const resolvedParams = await params;
  const lang = resolvedParams?.lang || 'ua'
  
  // Проверяем, поддерживается ли язык
  if (!i18n.locales.includes(lang)) {
    notFound()
  }
  
  // Получаем словарь для выбранного языка
  const dict = await getDictionary(lang)
  
  return (
    <div className="container mx-auto">
      {/* Hero секция */}
      <section className="py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Аудит і стратегія розвитку CRM</h1>
            <p className="text-xl mb-8">Проаналізуємо вашу систему продажів і складемо карту впровадження або розвитку вашої CRM.</p>
            
            <div className="grid grid-cols-2 gap-x-4 gap-y-6 mb-8">
              <div>
                <p className="text-sm text-muted-foreground">Вартість</p>
                <p className="font-semibold text-xl">Від 7 500 ₴</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Термін</p>
                <p className="font-semibold text-xl">7-14 днів</p>
              </div>
            </div>
            
            <ContactFormDialog
              trigger={<Button className="bg-amber hover:bg-amber-hover text-black">Замовити аудит</Button>}
              title="Замовити аудит CRM"
              description="Залиште свої контактні дані, і наш спеціаліст зв'яжеться з вами протягом робочого дня"
              formType="audit_crm"
              buttonText="Відправити"
              dict={dict}
            />
          </div>
          
          <div className="bg-gray-100 h-80 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <p className="text-2xl font-semibold mb-2">Зображення аудиту CRM</p>
              <p className="text-gray-500">Візуалізація процесу аудиту CRM</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Секция проблемы */}
      <section className="py-16 bg-gray-50 rounded-lg my-16">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Проблеми, які ми вирішуємо</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-amber text-4xl font-bold mb-4">01</div>
              <h3 className="text-xl font-semibold mb-3">Відсутність чіткого розуміння</h3>
              <p>Відсутність чіткого розуміння, як ефективно використовувати CRM для вашого бізнесу</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-amber text-4xl font-bold mb-4">02</div>
              <h3 className="text-xl font-semibold mb-3">Низька віддача</h3>
              <p>Низька віддача від існуючої CRM-системи, команда не користується всіма можливостями</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-amber text-4xl font-bold mb-4">03</div>
              <h3 className="text-xl font-semibold mb-3">Неструктурований підхід</h3>
              <p>Неструктурований підхід до автоматизації бізнес-процесів компанії</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-amber text-4xl font-bold mb-4">04</div>
              <h3 className="text-xl font-semibold mb-3">Відсутність стратегії</h3>
              <p>Відсутність стратегії розвитку CRM та дорожньої карти автоматизації</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Секция Что включает аудит */}
      <section className="py-16 my-16">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Що включає аудит</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-8">
            <div className="flex gap-4">
              <div className="bg-amber h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="font-bold">1</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Аналіз поточних бізнес-процесів</h3>
                <p>Детальний аналіз усіх бізнес-процесів компанії, виявлення проблемних місць та можливостей для оптимізації</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="bg-amber h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="font-bold">2</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Оцінка існуючої CRM</h3>
                <p>Якщо у вас вже є CRM, ми проведемо аудит її використання, налаштувань та ефективності</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="bg-amber h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="font-bold">3</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Виявлення вузьких місць</h3>
                <p>Ідентифікація проблемних зон у бізнес-процесах та визначення можливостей для автоматизації</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="bg-amber h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="font-bold">4</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Розробка карти впровадження</h3>
                <p>Створення детальної карти впровадження або розвитку CRM з урахуванням специфіки вашого бізнесу</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="bg-amber h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="font-bold">5</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Прогноз ROI</h3>
                <p>Розрахунок очікуваної віддачі від інвестицій у впровадження або розвиток CRM-системи</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="bg-amber h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="font-bold">6</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Рекомендації з вибору системи</h3>
                <p>Якщо у вас ще немає CRM, ми допоможемо вибрати оптимальне рішення для вашого бізнесу</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Секция Результат аудита */}
      <section className="py-16 bg-gray-50 rounded-lg my-16">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Результат аудиту</h2>
          
          <div className="bg-white p-8 rounded-lg shadow-sm">
            <ul className="space-y-4">
              <li className="flex gap-3">
                <div className="text-amber text-xl">✓</div>
                <div>
                  <strong>Детальний звіт</strong> з аналізом поточного стану автоматизації та рекомендаціями
                </div>
              </li>
              <li className="flex gap-3">
                <div className="text-amber text-xl">✓</div>
                <div>
                  <strong>Стратегічна карта розвитку CRM</strong> на 1-2 роки з етапами та пріоритетами
                </div>
              </li>
              <li className="flex gap-3">
                <div className="text-amber text-xl">✓</div>
                <div>
                  <strong>Конкретні рекомендації</strong> з оптимізації бізнес-процесів та їх автоматизації
                </div>
              </li>
              <li className="flex gap-3">
                <div className="text-amber text-xl">✓</div>
                <div>
                  <strong>Пріоритезація задач автоматизації</strong> для максимального ефекту від інвестицій
                </div>
              </li>
              <li className="flex gap-3">
                <div className="text-amber text-xl">✓</div>
                <div>
                  <strong>Бюджетне планування проекту</strong> з урахуванням всіх етапів впровадження
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>
      
      {/* Секция CTA */}
      <section className="py-16 my-16 bg-amber-50 rounded-lg">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Готові до аудиту вашої CRM?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">Зробіть перший крок до ефективної автоматизації вашого бізнесу. Отримайте детальний аудит та стратегію розвитку CRM.</p>
          
          <ContactFormDialog
            trigger={<Button className="bg-amber hover:bg-amber-hover text-black">Замовити аудит зараз</Button>}
            title="Замовити аудит CRM"
            description="Залиште свої контактні дані, і наш спеціаліст зв'яжеться з вами протягом робочого дня"
            formType="audit_crm"
            buttonText="Відправити"
            dict={dict}
          />
        </div>
      </section>
    </div>
  )
} 