import { Metadata } from "next"
import { getDictionary } from "@/lib/dictionaries"
import Header from "@/components/header"
import Footer from "@/components/footer"

export const metadata: Metadata = {
  title: {
    default: "CRMCUSTOMS - Лендинги",
    template: "%s | CRMCUSTOMS",
  },
  description: "Специализированные лендинги по услугам компании CRMCUSTOMS",
}

export default async function LandingLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { lang: string }
}) {
  const lang = params.lang || "ua"
  const dict = await getDictionary(lang)

  return (
    <div className="flex min-h-screen flex-col">
      <Header dict={dict} lang={lang} />
      <main className="flex-1">{children}</main>
      <Footer dict={dict} lang={lang} />
    </div>
  )
} 