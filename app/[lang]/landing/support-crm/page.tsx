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
    title: dict.support?.metaTitle || "Супровід CRM",
    description: dict.support?.metaDescription || "Отримайте в розпорядження команду експертів для щомісячного розвитку і гарантії працездатності CRM-системи."
  }
}

export default async function SupportCrmPage({ params }: { params: Promise<{ lang: string }> }) {
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
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Супровід CRM</h1>
            <p className="text-xl mb-8">Отримайте в розпорядження команду експертів для щомісячного розвитку і гарантії працездатності CRM-системи.</p>
            
            <div className="grid grid-cols-2 gap-x-4 gap-y-6 mb-8">
              <div>
                <p className="text-sm text-muted-foreground">Вартість</p>
                <p className="font-semibold text-xl">Від 12 500 ₴</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Термін</p>
                <p className="font-semibold text-xl">Щомісячно</p>
              </div>
            </div>
            
            <ContactFormDialog
              trigger={<Button className="bg-amber hover:bg-amber-hover text-black">Замовити супровід</Button>}
              title="Замовити супровід CRM"
              description="Залиште свої контактні дані, і наш спеціаліст зв'яжеться з вами протягом робочого дня"
              formType="support_crm"
              buttonText="Відправити"
              dict={dict}
            />
          </div>
          
          <div className="bg-gray-100 h-80 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <p className="text-2xl font-semibold mb-2">Супровід і підтримка CRM</p>
              <p className="text-gray-500">Схема супроводу CRM-системи</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Заглушка для остальных секций */}
      <section className="py-16 bg-gray-50 rounded-lg my-16">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">Контент сторінки в розробці</h2>
          <p className="text-xl mb-6">Детальний опис послуги "Супровід CRM" буде додано найближчим часом.</p>
          <p>Якщо у вас є питання щодо супроводу CRM-системи, ви можете зв'язатися з нами прямо зараз.</p>
          
          <div className="mt-8">
            <ContactFormDialog
              trigger={<Button className="bg-amber hover:bg-amber-hover text-black">Зв'язатися з нами</Button>}
              title="Консультація щодо супроводу CRM"
              description="Залиште свої контактні дані, і наш спеціаліст зв'яжеться з вами"
              formType="support_consultation"
              buttonText="Відправити"
              dict={dict}
            />
          </div>
        </div>
      </section>
    </div>
  )
} 