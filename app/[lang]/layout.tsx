import type React from "react"
import { getDictionary } from "@/lib/dictionaries"
import { i18n } from "@/lib/i18n-config"
import Header from "@/components/header"
import Footer from "@/components/footer"

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

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
      <Header dict={dict} lang={lang} />
          <main className="flex-1">{children}</main>
      <Footer dict={dict} lang={lang} />
    </>
  );
}
