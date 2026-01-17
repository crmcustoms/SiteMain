import { i18n } from "@/lib/i18n-config"
import LangBlogPage, { generateMetadata as generateLangMetadata } from "../[lang]/blog/page"

export const dynamic = "force-dynamic"

export async function generateMetadata() {
  return generateLangMetadata({ params: Promise.resolve({ lang: i18n.defaultLocale }) })
}

export default async function BlogPage() {
  return LangBlogPage({ params: Promise.resolve({ lang: i18n.defaultLocale }) })
}

export const revalidate = 0