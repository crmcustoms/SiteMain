"use client"

import React from "react"
import Image from "next/image"

export default function AuditWhy() {
  return (
    <div className="relative w-full bg-white pt-16 pb-0 overflow-hidden">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center pb-16">
          {/* Left side - Text */}
          <div className="space-y-6">
            <div className="border-l-4 border-[#FFD700] pl-6">
              <p className="text-lg text-black/80 leading-relaxed mb-4">
                Для якісного впровадження потрібні <span className="font-bold text-black">двоє</span>:
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">👤</span>
                  <span className="text-base text-black/80"><span className="font-bold">Ви</span> — знаєте свої бізнес-процеси</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🔧</span>
                  <span className="text-base text-black/80"><span className="font-bold">Ми</span> — знаємо як їх покласти на систему</span>
                </div>
              </div>
            </div>

            <p className="text-base text-black/70 leading-relaxed italic">
              Разом створюємо правильне технічне завдання.
            </p>

            <div className="bg-black/5 border border-black/10 p-6">
              <p className="text-sm text-black/80 mb-3">
                Це як з проектом будинку: архітектор має знати що хоче власник, а власник має почути що можливо технічно.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-black uppercase tracking-wider mb-3">📋 Що потрібно від вас на аудиті:</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-3 text-sm text-black/80">
                    <span className="text-black/40 mt-0.5">•</span>
                    <span>2 години часу</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-black/80">
                    <span className="text-black/40 mt-0.5">•</span>
                    <span>Розуміння своїх процесів</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-black/80">
                    <span className="text-black/40 mt-0.5">•</span>
                    <span>Відповідальна особа з повноваженнями</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-bold text-black uppercase tracking-wider mb-3">🎯 Що ви отримаєте:</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-3 text-sm text-black/80">
                    <span className="text-black/40 mt-0.5">•</span>
                    <span>Технічне завдання</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-black/80">
                    <span className="text-black/40 mt-0.5">•</span>
                    <span>Точний кошторис</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-black/80">
                    <span className="text-black/40 mt-0.5">•</span>
                    <span>Roadmap впровадження</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-black/80">
                    <span className="text-black/40 mt-0.5">•</span>
                    <span>Розуміння термінів</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Right side - Image with background */}
          <div className="relative flex items-center justify-center">
            {/* Background geometric shape with yellow */}
            <div className="absolute w-[500px] h-[500px] rounded-full bg-[#FFD700]/20 blur-3xl"></div>
            <div className="absolute w-[400px] h-[400px] rounded-full bg-[#FFD700]/10"></div>
            <div className="absolute w-[350px] h-[350px] border-2 border-[#FFD700]/20 rounded-full"></div>

            {/* Image container */}
            <div className="relative z-10 flex items-center justify-center">
              <div className="relative w-[300px] h-[400px] overflow-hidden">
                <div className="absolute -top-2 -left-2 w-6 h-6 border-t-2 border-l-2 border-[#FFD700]"></div>
                <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-2 border-r-2 border-[#FFD700]"></div>
                <Image
                  src="/images/professor2.png"
                  alt="Аудит CRM"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="h-16"></div>
    </div>
  )
}
