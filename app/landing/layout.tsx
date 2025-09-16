import Header from '@/components/header'
import Footer from '@/components/footer'
import { getDictionary } from '@/lib/dictionaries'

export default async function LandingLayout({ children }: { children: React.ReactNode }) {
  // Для лендингов используем язык по умолчанию (например, 'uk')
  const lang = 'uk'
  const dict = await getDictionary(lang)

  return (
    <div className="flex flex-col min-h-screen">
      <Header dict={dict} lang={lang} />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <Footer dict={dict} lang={lang} />
    </div>
  )
} 