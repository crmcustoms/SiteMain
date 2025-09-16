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
    title: dict.industrySolutions?.metaTitle || "Галузеві рішення для CRM",
    description: dict.industrySolutions?.metaDescription || "Спеціалізовані CRM-рішення для різних галузей бізнесу: роздрібна торгівля, сфера послуг, виробництво та інші."
  }
}

export default async function IndustrySolutionsPage({ params }: { params: Promise<{ lang: string }> }) {
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
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Галузеві рішення для CRM</h1>
            <p className="text-xl mb-8">Спеціалізовані CRM-рішення для різних галузей бізнесу: роздрібна торгівля, сфера послуг, виробництво та інші.</p>
            
            <div className="grid grid-cols-2 gap-x-4 gap-y-6 mb-8">
              <div>
                <p className="text-sm text-muted-foreground">Вартість</p>
                <p className="font-semibold text-xl">Від 65 000 ₴</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Термін</p>
                <p className="font-semibold text-xl">1-3 місяці</p>
              </div>
            </div>
            
            <ContactFormDialog
              trigger={<Button className="bg-amber hover:bg-amber-hover text-black">Дізнатися більше</Button>}
              title="Галузеві рішення для CRM"
              description="Залиште свої контактні дані, і наш спеціаліст зв'яжеться з вами протягом робочого дня"
              formType="industry_solutions"
              buttonText="Відправити"
              dict={dict}
            />
          </div>
          
          <div className="bg-gray-100 h-80 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <p className="text-2xl font-semibold mb-2">Галузеві рішення для CRM</p>
              <p className="text-gray-500">Спеціалізовані рішення для вашої галузі</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Заглушка для галузевых разделов */}
      <section className="py-16 my-16">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Рішення для різних галузей</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-8 rounded-lg">
              <h3 className="text-xl font-bold mb-4">Роздрібна торгівля</h3>
              <p className="mb-6">Управління товарними запасами, програми лояльності, аналітика продажів та інтеграція з касовими системами.</p>
              <p className="text-sm text-gray-500">Детальний опис буде доступний незабаром</p>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-lg">
              <h3 className="text-xl font-bold mb-4">Сфера послуг</h3>
              <p className="mb-6">Онлайн-бронювання, управління завантаженістю фахівців, облік часу та аналітика ефективності.</p>
              <p className="text-sm text-gray-500">Детальний опис буде доступний незабаром</p>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-lg">
              <h3 className="text-xl font-bold mb-4">Виробництво</h3>
              <p className="mb-6">Управління замовленнями, контроль виробничих процесів, облік матеріалів та планування ресурсів.</p>
              <p className="text-sm text-gray-500">Детальний опис буде доступний незабаром</p>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-lg">
              <h3 className="text-xl font-bold mb-4">Логістика</h3>
              <p className="mb-6">Відстеження вантажів, управління маршрутами, інтеграція з GPS-системами та документообіг.</p>
              <p className="text-sm text-gray-500">Детальний опис буде доступний незабаром</p>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-lg">
              <h3 className="text-xl font-bold mb-4">Нерухомість</h3>
              <p className="mb-6">Управління об'єктами, автоматизація комунікацій з клієнтами, облік показників та аналітика продажів.</p>
              <p className="text-sm text-gray-500">Детальний опис буде доступний незабаром</p>
            </div>
            
            <div className="bg-amber-50 p-8 rounded-lg">
              <h3 className="text-xl font-bold mb-4">Ваша галузь</h3>
              <p className="mb-6">Не знайшли своєї галузі? Зв'яжіться з нами, і ми розробимо індивідуальне рішення для вашого бізнесу.</p>
              <ContactFormDialog
                trigger={<Button variant="outline" className="w-full">Зв'язатися з нами</Button>}
                title="Індивідуальне рішення для вашої галузі"
                description="Залиште свої контактні дані, і наш спеціаліст зв'яжеться з вами"
                formType="custom_industry_solution"
                buttonText="Відправити"
                dict={dict}
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Секция CTA */}
      <section className="py-16 my-16 bg-amber-50 rounded-lg">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Потрібна консультація?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">Отримайте безкоштовну консультацію щодо галузевих рішень для вашого бізнесу.</p>
          
          <ContactFormDialog
            trigger={<Button className="bg-amber hover:bg-amber-hover text-black">Отримати консультацію</Button>}
            title="Консультація щодо галузевих рішень"
            description="Залиште свої контактні дані, і наш спеціаліст зв'яжеться з вами"
            formType="industry_consultation"
            buttonText="Відправити"
            dict={dict}
          />
        </div>
      </section>
    </div>
  )
} 