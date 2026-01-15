import { i18n } from "@/lib/i18n-config"
import LangCasesPage, { generateMetadata as generateLangMetadata } from "../[lang]/cases/page"

export async function generateMetadata() {
  return generateLangMetadata({ params: Promise.resolve({ lang: i18n.defaultLocale }) })
}

export default async function CasesPage() {
  return LangCasesPage({ params: Promise.resolve({ lang: i18n.defaultLocale }) })
}

export const revalidate = 86400