import type { Metadata } from "next"
import { getDictionary } from "@/lib/dictionaries"
import { Button } from "@/components/ui/button"
import { ContactFormDialog } from "@/components/contact-form-dialog"

export async function generateMetadata(): Promise<Metadata> {
  // Используем только украинский язык
  const locale = 'ua';
  const dict = await getDictionary(locale)

  return {
    title: dict.implementation?.metaTitle || "Впровадження CRM",
    description: dict.implementation?.metaDescription || "Вивчимо процеси вашої компанії, налаштуємо воронки продажів, інтеграції та навчимо співробітників роботі з системою."
  }
}

export default async function ImplementationCrmPage() {
  // Используем только украинский язык
  const locale = 'ua';
  
  // Получаем словарь для украинского языка
  const dict = await getDictionary(locale)
  
  return (
    <div className="container mx-auto">
      {/* Hero секция */}
      <section className="py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Впровадження CRM</h1>
            <p className="text-xl mb-8">Вивчимо процеси вашої компанії, налаштуємо воронки продажів, інтеграції та навчимо співробітників роботі з системою.</p>
            
            <div className="grid grid-cols-2 gap-x-4 gap-y-6 mb-8">
              <div>
                <p className="text-sm text-muted-foreground">Вартість</p>
                <p className="font-semibold text-xl">Від 62 500 ₴</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Термін</p>
                <p className="font-semibold text-xl">1-3 місяці</p>
              </div>
            </div>
            
            <ContactFormDialog
              trigger={<Button className="bg-amber hover:bg-amber-hover text-black">Замовити впровадження</Button>}
              title="Замовити впровадження CRM"
              description="Залиште свої контактні дані, і наш спеціаліст зв'яжеться з вами протягом робочого дня"
              formType="implementation_crm"
              buttonText="Відправити"
              dict={dict.common}
            />
          </div>
          
          <img
            src="/images/landings/implementation/hero.jpg"
            alt="Впровадження CRM"
            className="h-80 w-full rounded-lg object-cover"
          />
        </div>
      </section>
      
      {/* Секция "Наша технология внедрения" */}
      <section className="py-16 bg-gray-50 rounded-lg my-16">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Наша технологія впровадження</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-amber text-4xl font-bold mb-4">01</div>
              <h3 className="text-xl font-semibold mb-3">Перша зустріч з менеджером</h3>
              <p>Формуємо запит та проводимо онлайн-демонстрацію системи на прикладах з вашого бізнесу</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-amber text-4xl font-bold mb-4">02</div>
              <h3 className="text-xl font-semibold mb-3">Передпроектне дослідження</h3>
              <p>Підключаємо бізнес-аналітика, проводимо первинний аудит бізнесу та готуємо попереднє завдання</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-amber text-4xl font-bold mb-4">03</div>
              <h3 className="text-xl font-semibold mb-3">Старт першого етапу робіт</h3>
              <p>Проводимо глибокий аудит процесів через серію відео-інтерв'ю та занурення в ваш бізнес</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-amber text-4xl font-bold mb-4">04</div>
              <h3 className="text-xl font-semibold mb-3">Складання детального ТЗ</h3>
              <p>Готуємо завдання на впровадження з детальним описом майбутньої CRM</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-amber text-4xl font-bold mb-4">05</div>
              <h3 className="text-xl font-semibold mb-3">Налаштування CRM</h3>
              <p>Налаштовуємо систему відповідно до ТЗ, проводимо доопрацювання та інтеграції за потреби</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-amber text-4xl font-bold mb-4">06</div>
              <h3 className="text-xl font-semibold mb-3">Навчання співробітників</h3>
              <p>Етапна подача інформації з прикладами з вашого бізнесу, запис уроків та домашні завдання</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm md:col-span-2 lg:col-span-3">
              <div className="text-amber text-4xl font-bold mb-4">07</div>
              <h3 className="text-xl font-semibold mb-3">Супровід бізнесу</h3>
              <p>Стартовий пакет: 2 місяці до 6 годин. Постійна підтримка та розвиток системи</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Секция Пакеты услуг */}
      <section className="py-16 my-16">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Пакети послуг</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-2xl font-bold mb-4">Пакет "Початківець"</h3>
              <p className="text-xl text-amber font-semibold mb-6">5 000 - 10 000 ₴</p>
              
              <h4 className="font-semibold mb-2">Що включено:</h4>
              <ul className="space-y-2 mb-6">
                <li className="flex gap-2">
                  <div className="text-amber">✓</div>
                  <div>Вся інформація по клієнтах у CRM</div>
                </li>
                <li className="flex gap-2">
                  <div className="text-amber">✓</div>
                  <div>Ведення угод по етапах</div>
                </li>
                <li className="flex gap-2">
                  <div className="text-amber">✓</div>
                  <div>Проектна діяльність в системі</div>
                </li>
                <li className="flex gap-2">
                  <div className="text-amber">✓</div>
                  <div>Внутрішні комунікації в CRM</div>
                </li>
                <li className="flex gap-2">
                  <div className="text-amber">✓</div>
                  <div>Навчання співробітників</div>
                </li>
                <li className="flex gap-2">
                  <div className="text-amber">✓</div>
                  <div>Переписка та дзвінки в картці клієнта</div>
                </li>
                <li className="flex gap-2">
                  <div className="text-amber">✓</div>
                  <div>Автоматизація основних етапів продажів</div>
                </li>
              </ul>
              
              <ContactFormDialog
                trigger={<Button variant="outline" className="w-full">Дізнатися більше</Button>}
                title="Пакет 'Початківець'"
                description="Залиште свої контактні дані, і наш спеціаліст зв'яжеться з вами для консультації"
                formType="implementation_crm_basic"
                buttonText="Відправити"
                dict={dict.common}
              />
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-sm border border-amber border-2">
              <div className="bg-amber text-black text-xs px-2 py-1 inline-block rounded mb-2">Рекомендуємо</div>
              <h3 className="text-2xl font-bold mb-4">Пакет "Експертний"</h3>
              <p className="text-xl text-amber font-semibold mb-6">40 000 - 113 000 ₴</p>
              
              <h4 className="font-semibold mb-2">Все з пакету "Початківець" плюс:</h4>
              <ul className="space-y-2 mb-6">
                <li className="flex gap-2">
                  <div className="text-amber">✓</div>
                  <div>Генерація шаблонних документів</div>
                </li>
                <li className="flex gap-2">
                  <div className="text-amber">✓</div>
                  <div>Прозора аналітика по ключових показниках</div>
                </li>
                <li className="flex gap-2">
                  <div className="text-amber">✓</div>
                  <div>Інтеграція з інтернет-джерелами</div>
                </li>
                <li className="flex gap-2">
                  <div className="text-amber">✓</div>
                  <div>Наскрізна аналітика реклами</div>
                </li>
                <li className="flex gap-2">
                  <div className="text-amber">✓</div>
                  <div>Автоматизація бізнес-процесів (узгодження, відпустки, HR)</div>
                </li>
              </ul>
              
              <p className="text-sm mb-6">Навчання включено в вартість</p>
              
              <ContactFormDialog
                trigger={<Button className="w-full bg-amber hover:bg-amber-hover text-black">Замовити</Button>}
                title="Пакет 'Експертний'"
                description="Залиште свої контактні дані, і наш спеціаліст зв'яжеться з вами для консультації"
                formType="implementation_crm_expert"
                buttonText="Відправити"
                dict={dict.common}
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Секция CTA */}
      <section className="py-16 my-16 bg-amber-50 rounded-lg">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Готові до впровадження CRM?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">Зробіть перший крок до ефективної автоматизації вашого бізнесу. Отримайте детальну консультацію щодо впровадження CRM.</p>
          
          <ContactFormDialog
            trigger={<Button className="bg-amber hover:bg-amber-hover text-black">Замовити впровадження зараз</Button>}
            title="Замовити впровадження CRM"
            description="Залиште свої контактні дані, і наш спеціаліст зв'яжеться з вами протягом робочого дня"
            formType="implementation_crm"
            buttonText="Відправити"
            dict={dict.common}
          />
        </div>
      </section>
    </div>
  )
} 