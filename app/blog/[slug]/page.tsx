import { i18n } from "@/lib/i18n-config"
import LangBlogDetailPage, {
  generateMetadata as generateLangMetadata,
  generateStaticParams as generateLangParams,
} from "../../[lang]/blog/[slug]/page"

export async function generateStaticParams() {
  const params = await generateLangParams()
  return params
    .filter((p) => p.lang === i18n.defaultLocale)
    .map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return generateLangMetadata({ params: Promise.resolve({ slug, lang: i18n.defaultLocale }) })
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return LangBlogDetailPage({ params: Promise.resolve({ slug, lang: i18n.defaultLocale }) })
}
