"use client"

import { useEffect, useState } from "react"

const services = [
  { icon: "🖥️", text: "Впровадження CRM" },
  { icon: "🤖", text: "AI в бізнес-процесах" },
  { icon: "⚡", text: "Автоматизація n8n" },
  { icon: "🔗", text: "Інтеграції систем" },
]

export function ServicesCarousel() {
  const [currentService, setCurrentService] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (isPaused) return

    const interval = setInterval(() => {
      setCurrentService((prev) => (prev + 1) % services.length)
    }, 3500)

    return () => clearInterval(interval)
  }, [isPaused])

  return (
    <div
      className="absolute -top-20 -left-10 w-[200px] h-[200px] cursor-pointer"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Outer ring - rotating */}
      <div
        className={`absolute inset-0 rounded-full border-2 border-black/10 shadow-lg ${!isPaused ? "animate-spin-slow" : ""}`}
      />

      {/* Inner ring - static */}
      <div className="absolute inset-5 rounded-full border border-black/5" />

      {/* Center content - counter-rotating */}
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center ${!isPaused ? "animate-spin-reverse" : ""}`}
      >
        <div className="text-5xl mb-3 transition-all duration-300">{services[currentService].icon}</div>
        <div className="font-mono text-[11px] font-semibold uppercase tracking-wider text-black text-center px-4 leading-tight">
          {services[currentService].text}
        </div>
      </div>

      <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        
        .animate-spin-reverse {
          animation: spin-reverse 20s linear infinite;
        }
      `}</style>
    </div>
  )
}
