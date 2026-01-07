"use client"

import Image from "next/image"
import { CheckCircle2 } from "lucide-react"

export default function TeamSection() {
  return (
    <div className="relative min-h-screen bg-white py-20 overflow-hidden">
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
              <h2 className="text-5xl font-black text-black uppercase tracking-tighter">Про нас</h2>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Team photo */}
          <div className="relative">
            <div className="relative border-2 border-black/10 p-2 bg-white">
              <div className="absolute -top-3 left-4 bg-white px-2">
                <span className="text-xs font-mono text-black/40 tracking-wider">TEAM.PHOTO</span>
              </div>
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image src="/images/komanda.png" alt="Команда CRM Customs" fill className="object-cover" />
              </div>
              <div className="absolute -bottom-3 right-4 bg-white px-2">
                <span className="text-xs font-mono text-[#FFD700] tracking-wider">READY_TO_HELP</span>
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
                Ми працюємо <span className="font-bold text-black">невеликою командою</span>.
              </p>
              <p className="text-lg text-black/80 leading-relaxed mb-4">
                У нас немає мети «заробити всі гроші світу» — нам важливо робити проєкти{" "}
                <span className="font-bold text-black">якісно</span>, а не на конвеєрі.
              </p>
              <p className="text-lg text-black/80 leading-relaxed">
                Саме це дозволяє нам створювати <span className="font-bold text-black">унікальні системи</span>,
                максимально пристосовані під ваш бізнес.
              </p>
            </div>

            <div className="border-2 border-black/10 p-6 bg-black/5">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-8 h-8 bg-[#FFD700] flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-lg font-black text-black">!</span>
                </div>
                <p className="text-base text-black/80 leading-relaxed">
                  Якщо ви бачите нашу рекламу — це означає просту річ: у нас з'явився{" "}
                  <span className="font-bold text-black">вільний час</span> і ми готові взяти ще кілька нових проєктів.
                </p>
              </div>
            </div>

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

            {/* Tech label decoration */}
            <div className="flex items-center gap-4 pt-6">
              <div className="flex-1 h-[1px] bg-black/10" />
              <div className="text-xs font-mono text-black/40 tracking-wider">TRANSPARENT_WORKFLOW</div>
              <div className="flex-1 h-[1px] bg-black/10" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
