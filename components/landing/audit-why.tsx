"use client"

import React from "react"
import Image from "next/image"
import { CheckCircle2, Users, Zap } from "lucide-react"

export default function AuditWhy() {
  const requirements = [
    { label: "2 години часу" },
    { label: "Розуміння своїх процесів" },
    { label: "Відповідальна особа з повноваженнями" },
  ]

  const benefits = [
    { label: "Технічне завдання" },
    { label: "Точний кошторис" },
    { label: "Roadmap впровадження" },
    { label: "Розуміння термінів" },
  ]

  return (
    <div className="relative w-full bg-white pt-16 pb-0 overflow-hidden">
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
              <div className="text-xs font-mono font-bold text-black">05</div>
            </div>
            <div>
              <h2 className="text-5xl font-black text-black uppercase tracking-tighter">
                Чому ми не працюємо без аудиту?
              </h2>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start pb-16">
          {/* Left side - Text */}
          <div className="space-y-8">
            {/* Partnership concept */}
            <div className="border border-black/10 p-8">
              <div className="text-xs font-mono text-black/40 tracking-wider mb-4">// PARTNERSHIP</div>
              <p className="text-base text-black/80 leading-relaxed mb-6">
                Для якісного впровадження потрібні <span className="font-bold">двоє</span>:
              </p>

              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-4 pl-4 border-l-2 border-black/10">
                  <Users className="w-5 h-5 text-[#FFD700] flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-bold text-black">ВИ</div>
                    <div className="text-sm text-black/70">знаєте свої бізнес-процеси</div>
                  </div>
                </div>
                <div className="flex items-start gap-4 pl-4 border-l-2 border-black/10">
                  <Zap className="w-5 h-5 text-[#FFD700] flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-bold text-black">МИ</div>
                    <div className="text-sm text-black/70">знаємо як їх покласти на систему</div>
                  </div>
                </div>
              </div>

              <div className="h-[1px] bg-black/10 my-6" />

              <p className="text-sm text-black/70 leading-relaxed">
                <span className="text-black/40 font-mono text-xs">// CONCEPT</span>
                <br className="mb-2" />
                Разом створюємо правильне технічне завдання. Це як з проектом будинку: архітектор має знати що хоче власник, а власник має почути що можливо технічно.
              </p>
            </div>

            {/* Requirements and Benefits Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Requirements */}
              <div className="border border-black/10 p-6">
                <div className="text-xs font-mono text-black/40 tracking-wider mb-4">REQUIREMENTS</div>
                <ul className="space-y-3">
                  {requirements.map((req, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-[#FFD700] mt-2 flex-shrink-0" />
                      <span className="text-sm text-black/80">{req.label}</span>
                    </div>
                  ))}
                </ul>
              </div>

              {/* Benefits */}
              <div className="border border-black/10 p-6">
                <div className="text-xs font-mono text-black/40 tracking-wider mb-4">DELIVERABLES</div>
                <ul className="space-y-3">
                  {benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-[#FFD700] mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-black/80">{benefit.label}</span>
                    </div>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Right side - Image */}
          <div className="relative flex items-center justify-center">
            {/* Decorative corner elements */}
            <div className="absolute -top-8 -left-8 w-16 h-16 border-l-2 border-t-2 border-[#FFD700]" />
            <div className="absolute -bottom-8 -right-8 w-16 h-16 border-b-2 border-r-2 border-[#FFD700]" />

            {/* Image container - clean and minimal */}
            <div className="relative w-full max-w-sm">
              <div className="border-2 border-black/10 p-4 bg-white">
                <div className="relative w-full aspect-[3/4] overflow-hidden bg-black/5">
                  <Image
                    src="/images/professor2.png"
                    alt="CRM Expert"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="h-16"></div>
    </div>
  )
}
