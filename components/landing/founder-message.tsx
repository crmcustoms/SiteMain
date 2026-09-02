"use client"

import Image from "next/image"
import Link from "next/link"
import { CheckCircle2, ChevronRight } from "lucide-react"

export default function FounderMessage({ lang }: { lang: string }) {
  return (
    <div id="about" className="relative w-full bg-white pt-16 pb-0 overflow-hidden">
      {/* Background grid pattern */}
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
              <div className="text-xs font-mono font-bold text-black">03</div>
            </div>
            <div>
              <h2 className="text-5xl font-black text-black uppercase tracking-tighter">Хто за CRMCUSTOMS</h2>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Founder photo */}
          <div className="relative">
            <div className="relative border-2 border-black/10 p-2 bg-white">
              <div className="absolute -top-3 left-4 bg-white px-2">
                <span className="text-xs font-mono text-black/40 tracking-wider">FOUNDER.PHOTO</span>
              </div>
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src="/images/Tkachenko.jpg"
                  alt="Максим Ткаченко, засновник CRMCUSTOMS"
                  fill
                  className="object-cover object-[center_25%]"
                />
              </div>
              <div className="absolute -bottom-3 right-4 bg-white px-2">
                <span className="text-xs font-mono text-[#FFD700] tracking-wider">NOT_A_CONTRACTOR</span>
              </div>
            </div>

            {/* Corner decorations */}
            <div className="absolute -top-4 -left-4 w-8 h-8 border-t-2 border-l-2 border-[#FFD700]" />
            <div className="absolute -bottom-4 -right-4 w-8 h-8 border-b-2 border-r-2 border-[#FFD700]" />
          </div>

          {/* Right side - Content */}
          <div className="space-y-8">
            <div className="border-l-4 border-[#FFD700] pl-6">
              <p className="text-lg text-black/80 leading-relaxed mb-4">
                Я не виконую технічне завдання. Спочатку розбираюсь, що насправді{" "}
                <span className="font-bold text-black">гальмує бізнес</span> — і тільки тоді кажу, що варто будувати.
              </p>
              <p className="text-lg text-black/80 leading-relaxed">
                CRM, AI-агенти чи сайт — це інструменти, а не мета. Мета — щоб стало{" "}
                <span className="font-bold text-black">помітно краще</span>, а не щоб здати проєкт за актом.
              </p>
            </div>

            <div className="border-2 border-black/10 p-6 bg-black/5">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-8 h-8 bg-[#FFD700] flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-lg font-black text-black">!</span>
                </div>
                <p className="text-base text-black/80 leading-relaxed">
                  Якщо після запуску з'являється нова ідея, що варто автоматизувати — це нормально.{" "}
                  <span className="font-bold text-black">Саме так і працює партнерство</span>: не одне ТЗ, а розвиток
                  разом.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-[#FFD700] flex-shrink-0 mt-0.5" />
                <span className="text-base text-black/80">Розмова, а не бриф на підпис</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-[#FFD700] flex-shrink-0 mt-0.5" />
                <span className="text-base text-black/80">Рішення маленькими кроками, а не один великий проєкт</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-[#FFD700] flex-shrink-0 mt-0.5" />
                <span className="text-base text-black/80">На зв'язку і після здачі проєкту</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-6 flex-wrap">
              <div>
                <p className="text-base font-bold text-black">Максим Ткаченко</p>
                <p className="text-sm text-black/60">Засновник CRMCUSTOMS · 10+ років у CRM та автоматизації</p>
              </div>
              <Link
                href={`/${lang}/about`}
                className="inline-flex items-center gap-1 px-6 py-3 bg-black text-white text-sm font-medium hover:bg-[#FFD700] hover:text-black transition-colors whitespace-nowrap"
              >
                Дізнатись більше
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Tech label decoration */}
            <div className="flex items-center gap-4 pt-6">
              <div className="flex-1 h-[1px] bg-black/10" />
              <div className="text-xs font-mono text-black/40 tracking-wider">LONG_TERM_PARTNERSHIP</div>
              <div className="flex-1 h-[1px] bg-black/10" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
