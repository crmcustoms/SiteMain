import type { Metadata } from "next"
import { getDictionary } from "@/lib/dictionaries"
import { i18n } from "@/lib/i18n-config"
import { notFound } from "next/navigation"
import { CheckCircle2 } from "lucide-react"
import TeamSection from "@/components/landing/team-section"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const resolvedParams = await params
  const lang = resolvedParams?.lang || "uk"
  await getDictionary(lang)

  return {
    title: "Про нас | CRMCUSTOMS",
    description:
      "CRMCUSTOMS — не підрядник на одну задачу, а технічний партнер: CRM, автоматизація та AI-агенти для бізнесу. Хто ми і як працюємо.",
  }
}

export default async function AboutPage({ params }: { params: Promise<{ lang: string }> }) {
  const resolvedParams = await params
  const lang = resolvedParams?.lang || "uk"

  if (!i18n.locales.includes(lang)) {
    notFound()
  }

  return (
    <div className="flex flex-col items-center">
      <TeamSection />

      {/* Founder story */}
      <div className="relative w-full bg-white pt-16 pb-0 overflow-hidden">
        <div className="relative max-w-[1400px] mx-auto px-8">
          <div className="mb-16">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 border-2 border-[#FFD700] flex items-center justify-center">
                <div className="text-xs font-mono font-bold text-black">04</div>
              </div>
              <div>
                <h2 className="text-5xl font-black text-black uppercase tracking-tighter">Історія</h2>
              </div>
            </div>
          </div>

          <div className="max-w-3xl border-l-4 border-[#FFD700] pl-6 space-y-4">
            <p className="text-lg text-black/80 leading-relaxed">
              Мене звати Максим Ткаченко, я засновник CRMCUSTOMS. У CRM та автоматизації бізнесу —{" "}
              <span className="font-bold text-black">з 2016 року</span>, а CRMCUSTOMS веду з 2019-го.
            </p>
            <p className="text-lg text-black/80 leading-relaxed">
              За цей час — понад <span className="font-bold text-black">300 проєктів</span>: впровадження Planfix,
              amoCRM, Bitrix24, інтеграції, боти, а останнім часом — AI-агенти, які беруть на себе рутину, що раніше
              тримали люди вручну.
            </p>
            <p className="text-lg text-black/80 leading-relaxed">
              Planfix — окрема історія: це система, з якою працюю на експертному рівні і яку знаю зсередини краще, ніж
              більшість українських інтеграторів.
            </p>
          </div>
        </div>
      </div>

      {/* Partnership philosophy */}
      <div className="relative w-full bg-white pt-16 pb-24 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(0deg, transparent 24%, rgba(0, 0, 0, .05) 25%, rgba(0, 0, 0, .05) 26%, transparent 27%, transparent 74%, rgba(0, 0, 0, .05) 75%, rgba(0, 0, 0, .05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(0, 0, 0, .05) 25%, rgba(0, 0, 0, .05) 26%, transparent 27%, transparent 74%, rgba(0, 0, 0, .05) 75%, rgba(0, 0, 0, .05) 76%, transparent 77%, transparent)",
              backgroundSize: "50px 50px",
            }}
          />
        </div>

        <div className="relative max-w-[1400px] mx-auto px-8">
          <div className="mb-16">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 border-2 border-[#FFD700] flex items-center justify-center">
                <div className="text-xs font-mono font-bold text-black">05</div>
              </div>
              <div>
                <h2 className="text-5xl font-black text-black uppercase tracking-tighter">
                  Партнерство, а не підряд
                </h2>
              </div>
            </div>
            <p className="text-lg text-black/70 max-w-2xl">
              Ми свідомо не працюємо за схемою «клієнт ставить задачу — підрядник виконує». Найкращі рішення
              народжуються не з готового ТЗ, а з розмови: що насправді гальмує бізнес, і що варто побудувати, щоб
              стало помітно краще.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="border-2 border-black/10 p-6 bg-white">
              <div className="text-xs font-mono text-black/40 mb-3">01</div>
              <h3 className="text-lg font-bold text-black mb-2">Занурення, а не бриф</h3>
              <p className="text-sm text-black/70 leading-relaxed">
                Перш ніж щось пропонувати — розбираємось, як бізнес працює насправді: де губиться час, де немає
                видимості, де рішення ухвалюються навпомацки.
              </p>
            </div>
            <div className="border-2 border-black/10 p-6 bg-white">
              <div className="text-xs font-mono text-black/40 mb-3">02</div>
              <h3 className="text-lg font-bold text-black mb-2">Спільний пошук напрямку</h3>
              <p className="text-sm text-black/70 leading-relaxed">
                Обговорюємо варіанти разом, а не приносимо готовий кошторис. Часто найкорисніше рішення — не те, з
                яким прийшли спочатку.
              </p>
            </div>
            <div className="border-2 border-black/10 p-6 bg-white">
              <div className="text-xs font-mono text-black/40 mb-3">03</div>
              <h3 className="text-lg font-bold text-black mb-2">Маленькі кроки</h3>
              <p className="text-sm text-black/70 leading-relaxed">
                Замість одного великого проєкту на пів року — послідовність рішень, кожне з яких можна відчути й
                оцінити, перш ніж братися за наступне.
              </p>
            </div>
            <div className="border-2 border-black/10 p-6 bg-white">
              <div className="text-xs font-mono text-black/40 mb-3">04</div>
              <h3 className="text-lg font-bold text-black mb-2">Постійний партнер</h3>
              <p className="text-sm text-black/70 leading-relaxed">
                Після запуску не зникаємо. Система розвивається разом із бізнесом — нові ідеї з'являються з
                практики, а не за графіком.
              </p>
            </div>
          </div>

          <div className="mt-12 border-2 border-black/10 p-6 bg-black/5 max-w-2xl">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-[#FFD700] flex-shrink-0 mt-0.5" />
                <span className="text-base text-black/80">Без черг</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-[#FFD700] flex-shrink-0 mt-0.5" />
                <span className="text-base text-black/80">Без «запишемо вас на наступний квартал»</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-[#FFD700] flex-shrink-0 mt-0.5" />
                <span className="text-base text-black/80">Без зникнень у тумані після передоплати</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
