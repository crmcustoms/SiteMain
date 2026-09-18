import { i18n } from "@/lib/i18n-config"
import { getDictionary } from "@/lib/dictionaries"
import LangHome from "./[lang]/page"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { ChatWidget } from "@/components/chat-widget"

// Редирект с корневой страницы на локализованную версию
export default async function Home() {
  const lang = i18n.defaultLocale
  const dict = await getDictionary(lang)
  const content = await LangHome({ params: Promise.resolve({ lang }) })

  // Рендерим украинскую версию без языкового префикса
  return (
    <>
      <Header dict={dict} lang={lang} />
      <main className="flex-1">{content}</main>
      <Footer dict={dict} lang={lang} />
      <ChatWidget />
    </>
  )
}

// Включаем SSG с редким обновлением - страница будет обновляться раз в день
export const revalidate = 86400; // 24 часа 