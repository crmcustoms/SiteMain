import { i18n } from "@/lib/i18n-config"
import LangCaseDetailPage, {
  generateMetadata as generateLangMetadata,
  generateStaticParams as generateLangParams,
} from "../../[lang]/cases/[slug]/page"

export const dynamic = "force-dynamic"

export async function generateStaticParams() {
  const params = await generateLangParams()
  return params
    .filter((p) => p.lang === i18n.defaultLocale)
    .map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  return generateLangMetadata({ params: Promise.resolve({ slug: params.slug, lang: i18n.defaultLocale }) })
}

export default async function CaseDetailPage({ params }: { params: { slug: string } }) {
  return LangCaseDetailPage({ params: Promise.resolve({ slug: params.slug, lang: i18n.defaultLocale }) })
}

export const revalidate = 0