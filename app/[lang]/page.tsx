import { getDictionary } from "@/lib/dictionaries"
import dynamic from "next/dynamic"
import { i18n } from "@/lib/i18n-config"

// Заменяем динамический импорт на обычный импорт для компонента Services
import StaticServices from "@/components/landing/static-services"
import StaticFinalCta from "@/components/landing/static-final-cta"

// Используем динамический импорт для остальных компонентов лендинга с SSR
const HeroSection = dynamic(() => import("@/components/landing/hero-section"), { ssr: true })
const WhyAutomation = dynamic(() => import("@/components/landing/why-automation"), { ssr: true })
const Features = dynamic(() => import("@/components/landing/features"), { ssr: true })
const Industries = dynamic(() => import("@/components/landing/industries"), { ssr: true })
const CaseStudies = dynamic(() => import("@/components/landing/case-studies"), { ssr: true })
const WhyChooseUs = dynamic(() => import("@/components/landing/why-choose-us"), { ssr: true })
const Faq = dynamic(() => import("@/components/landing/faq"), { ssr: true })
const Testimonials = dynamic(() => import("@/components/landing/testimonials"), { ssr: true })

export default async function Home({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  // Получаем параметр языка безопасно с await
  const resolvedParams = await params;
  const lang = resolvedParams?.lang || '';
  
  // Проверяем, поддерживается ли язык
  const safeLocale = i18n.locales.includes(lang) ? lang : i18n.defaultLocale;
  
  // Получаем словарь для выбранного языка
  const dict = await getDictionary(safeLocale);

  // Создаем локальную копию данных для Services чтобы избежать проблем с сериализацией
  const servicesData = dict.landing.services ? { ...dict.landing.services } : null;
  const commonData = { ...dict.common };

  return (
    <div className="flex flex-col items-center">
      <HeroSection dict={dict.landing.hero} commonDict={dict.common} />
      <WhyAutomation dict={dict.landing.whyAutomation} />
      <Features dict={dict.landing.features} commonDict={dict.common} />
      <Industries dict={dict.landing.industries} />
      <CaseStudies dict={dict.landing.caseStudies} />
      <Testimonials dict={dict.landing.testimonials} />
      <WhyChooseUs dict={dict.landing.whyChooseUs} />
      <StaticServices dict={servicesData} commonDict={commonData} />
      <Faq dict={dict.landing.faq} commonDict={dict.common} />
      <StaticFinalCta dict={dict.landing.finalCta} commonDict={dict.common} />
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
