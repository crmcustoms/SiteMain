import type React from "react"
import { getDictionary } from "@/lib/dictionaries"
import { i18n } from "@/lib/i18n-config"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { ChatWidget } from "@/components/chat-widget"

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

// Only the locales in i18n.locales are real routes — any other value (e.g. /ua/*, /en/*)
// was being rendered as a duplicate uk page since getDictionary silently falls back to uk.
// This 404s those instead of duplicate-indexing them.
export const dynamicParams = false

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ lang: string }> | { lang: string }
}) {
  // Получаем параметры безопасно с await
  const resolvedParams = params instanceof Promise ? await params : params;
  const lang = resolvedParams.lang || 'uk'; // Добавляем значение по умолчанию для безопасности
  const dict = await getDictionary(lang);

  // Возвращаем только children, но с контекстом словаря
  return (
    <>
      <Header dict={dict} lang={lang} hideOnHome={false} pathname={`/${lang}`} />
          <main className="flex-1">{children}</main>
      <Footer dict={dict} lang={lang} />
      <ChatWidget />
    </>
  );
}
