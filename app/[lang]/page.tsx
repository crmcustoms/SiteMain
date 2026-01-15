import { getDictionary } from "@/lib/dictionaries"
import dynamic from "next/dynamic"
import { i18n } from "@/lib/i18n-config"
import { getBlogArticles, sortArticlesByDate } from "@/lib/blog"
import { headers } from "next/headers"

import StaticFinalCta from "@/components/landing/static-final-cta"
import TeamSection from "@/components/landing/team-section"
import LogosCarousel from "@/components/landing/logos-carousel"
import AuditWhy from "@/components/landing/audit-why"
import BookingDemoSection from "@/components/landing/booking-demo-section"

// Используем динамический импорт для остальных компонентов лендинга с SSR
const HeroSection = dynamic(() => import("@/components/landing/hero-section"), { ssr: true })
const QuizSection = dynamic(() => import("@/components/landing/quiz-section"), { ssr: true })
const WhyChooseUs = dynamic(() => import("@/components/landing/why-choose-us"), { ssr: true })
const Faq = dynamic(() => import("@/components/landing/faq"), { ssr: true })
const Testimonials = dynamic(() => import("@/components/landing/testimonials"), { ssr: true })
const Pricing = dynamic(() => import("@/components/landing/pricing"), { ssr: true })

export default async function Home({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const hdrs = headers()
  const host = hdrs.get("host") || ""
  const proto = hdrs.get("x-forwarded-proto") || ""
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/de426b11-629a-4d11-809b-e48b79b36174',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'redirect-pre',hypothesisId:'H3',location:'app/[lang]/page.tsx:25',message:'lang_page_render',data:{host,proto},timestamp:Date.now()})}).catch(()=>{});
  // #endregion
  // Получаем параметр языка безопасно с await
  const resolvedParams = await params;
  const lang = resolvedParams?.lang || '';
  
  // Проверяем, поддерживается ли язык
  const safeLocale = i18n.locales.includes(lang) ? lang : i18n.defaultLocale;
  
  // Получаем словарь для выбранного языка
  const dict = await getDictionary(safeLocale);

  // Получаем последние 3 кейса для отображения в hero-section
  let recentCases: Array<{
    title: string
    slug: string
    tags: string[]
    date: string
  }> = [];
  try {
    const articles = await getBlogArticles(true).catch(() => []) || [];
    const sortedArticles = sortArticlesByDate(articles);
    recentCases = sortedArticles.slice(0, 3).map((article: any) => ({
      title: article.property_name || 'Без названия',
      slug: article.property_slug || 'untitled',
      tags: article.property_tags || [],
      date: article.property_format_date || article.property_date || '',
    }));
  } catch (error) {
    console.error("Ошибка при получении кейсов для hero-section:", error);
  }

  return (
    <div className="flex flex-col items-center">
      <HeroSection dict={dict.landing.hero} commonDict={dict.common} lang={safeLocale} recentCases={recentCases} />
      <LogosCarousel />
      <WhyChooseUs />
      <TeamSection />
      <Pricing />
      <AuditWhy />
      <QuizSection />
      <Testimonials dict={dict.landing.testimonials} />
      <Faq dict={dict.landing.faq} commonDict={dict.common} />
      <BookingDemoSection />
    </div>
  )
}

// Включаем SSG с редким обновлением - страница будет обновляться раз в день
export const revalidate = 86400; // 24 часа

// Статическая генерация путей для всех поддерживаемых языков
export async function generateStaticParams() {
  return i18n.locales.map((lang) => ({
    lang,
  }));
}
