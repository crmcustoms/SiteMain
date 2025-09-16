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
    title: dict.projectManagement?.metaTitle || "Управління проектами в CRM",
    description: dict.projectManagement?.metaDescription || "Впровадження проектного управління в CRM: ефективна організація завдань, контроль виконання та підвищення прозорості процесів."
  }
}

export default async function ProjectManagementPage({ params }: { params: { lang: string } }) {
  const lang = await Promise.resolve(params?.lang || 'ua')
  
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
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Управління проектами в CRM</h1>
            <p className="text-xl mb-8">Впровадження проектного управління в CRM: ефективна організація завдань, контроль виконання та підвищення прозорості процесів.</p>
            
            <div className="grid grid-cols-2 gap-x-4 gap-y-6 mb-8">
              <div>
                <p className="text-sm text-muted-foreground">Вартість</p>
                <p className="font-semibold text-xl">Від 45 000 ₴</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Термін</p>
                <p className="font-semibold text-xl">1-2 місяці</p>
              </div>
            </div>
            
            <ContactFormDialog
              trigger={<Button className="bg-amber hover:bg-amber-hover text-black">Замовити впровадження</Button>}
              title="Замовити впровадження проектного управління"
              description="Залиште свої контактні дані, і наш спеціаліст зв'яжеться з вами протягом робочого дня"
              formType="project_management"
              buttonText="Відправити"
              dict={dict}
            />
          </div>
          
          <div className="bg-gray-100 h-80 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <p className="text-2xl font-semibold mb-2">Управління проектами в CRM</p>
              <p className="text-gray-500">Ефективне управління завданнями та ресурсами</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Заглушка для остальных секций */}
      <section className="py-16 bg-gray-50 rounded-lg my-16">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">Контент сторінки в розробці</h2>
          <p className="text-xl mb-6">Детальний опис послуги "Управління проектами в CRM" буде додано найближчим часом.</p>
          <p>Якщо у вас є питання щодо впровадження проектного управління, ви можете зв'язатися з нами прямо зараз.</p>
          
          <div className="mt-8">
            <ContactFormDialog
              trigger={<Button className="bg-amber hover:bg-amber-hover text-black">Зв'язатися з нами</Button>}
              title="Консультація щодо проектного управління"
              description="Залиште свої контактні дані, і наш спеціаліст зв'яжеться з вами"
              formType="project_management_consultation"
              buttonText="Відправити"
              dict={dict}
            />
          </div>
        </div>
      </section>
    </div>
  )
} 