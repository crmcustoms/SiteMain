"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { Play, ChevronLeft, ChevronRight } from "lucide-react"

const services = [
  {
    id: 1,
    title: "Впровадження CRM",
    description: "Planfix для автоматизації бізнесу",
    icon: "💼",
  },
  {
    id: 2,
    title: "Штучний інтелект",
    description: "AI в бізнес-процеси",
    icon: "🤖",
  },
  {
    id: 3,
    title: "Автоматизація n8n",
    description: "Workflow автоматизація",
    icon: "⚙️",
  },
]

const recentCases = [
  { company: "ВІТ Маркет", result: "+45% ефективності", date: "Грудень 2024" },
  { company: "TechPro", result: "20 год/тиждень", date: "Листопад 2024" },
  { company: "Digital Agency", result: "+60% конверсія", date: "Жовтень 2024" },
]

export function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null)
  const characterRef = useRef<HTMLDivElement>(null)
  const circleRef = useRef<HTMLDivElement>(null)
  const [currentService, setCurrentService] = useState(0)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current) return

      const { clientX, clientY } = e
      const { innerWidth, innerHeight } = window

      const moveX = (clientX - innerWidth / 2) / 40
      const moveY = (clientY - innerHeight / 2) / 40

      setMousePos({ x: moveX, y: moveY })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentService((prev) => (prev + 1) % services.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div ref={heroRef} className="relative min-h-screen overflow-hidden bg-white">
      {/* Decorative grid lines */}
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

      {/* Top navigation */}
      <nav className="relative z-50 flex items-center justify-between px-8 py-6 border-b border-black/5">
        <div className="flex items-center gap-12">
          <div className="font-bold text-xl text-black tracking-tight">CRM CUSTOMS</div>
          <div className="hidden md:flex items-center gap-8 text-sm text-black/70 font-medium">
            <a href="#cases" className="hover:text-[#FFD700] transition-colors">
              Кейси
            </a>
            <a href="#about" className="hover:text-[#FFD700] transition-colors">
              Про нас
            </a>
          </div>
        </div>
        <button className="px-6 py-2 bg-black text-white text-sm font-medium hover:bg-[#FFD700] hover:text-black transition-colors">
          Контакти
        </button>
      </nav>

      <div className="relative px-8 py-12 max-w-[1800px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left side - Content */}
          <div className="lg:col-span-5 relative z-20 space-y-6">
            {/* Services Carousel - Top Left */}
            <div className="relative border border-black/10 p-6 bg-white/80 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="text-xs font-mono text-black/40 tracking-wider">// ПОСЛУГИ</div>
                <div className="text-xs font-mono text-black/40">0{currentService + 1}/03</div>
              </div>

              <div className="relative overflow-hidden h-32">
                {services.map((service, idx) => (
                  <div
                    key={service.id}
                    className={`absolute inset-0 transition-all duration-700 ${
                      idx === currentService
                        ? "opacity-100 translate-x-0"
                        : idx < currentService
                          ? "opacity-0 -translate-x-full"
                          : "opacity-0 translate-x-full"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-5xl">{service.icon}</div>
                      <div>
                        <div className="text-lg font-bold text-black mb-1">{service.title}</div>
                        <div className="text-sm text-black/60">{service.description}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 mt-4">
                {services.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentService(idx)}
                    className={`h-1 transition-all ${idx === currentService ? "w-12 bg-[#FFD700]" : "w-6 bg-black/20"}`}
                  />
                ))}
              </div>
            </div>

            {/* Main heading with decorative elements */}
            <div className="relative">
              {/* Decorative corner */}
              <div className="absolute -left-4 -top-4 w-16 h-16 border-l-2 border-t-2 border-[#FFD700]" />

              <h1 className="text-6xl xl:text-7xl font-black leading-[0.9] text-black uppercase tracking-tighter">
                АВТОМАТИЗАЦІЯ
                <br />
                <span className="relative inline-block">
                  БІЗНЕСУ
                  <div className="absolute -right-8 top-1/2 -translate-y-1/2 w-20 h-[2px] bg-[#FFD700]" />
                </span>
                <br />
                <span className="text-[#FFD700]">ЗА 30 ДНІВ</span>
              </h1>

              {/* Tech label */}
              <div className="absolute -right-4 top-0 rotate-90 origin-left">
                <div className="text-xs font-mono text-black/30 tracking-[0.3em]">TECH_INTERFACE</div>
              </div>
            </div>

            {/* Stats block */}
            <div className="flex gap-4 pt-4">
              <div className="border border-black/10 p-4 flex-1 bg-white/80">
                <div className="text-3xl font-bold text-black">48+</div>
                <div className="text-xs text-black/60 mt-1 font-medium">Проектів</div>
              </div>
              <div className="border border-black/10 p-4 flex-1 bg-white/80">
                <div className="text-3xl font-bold text-[#FFD700]">4.9</div>
                <div className="text-xs text-black/60 mt-1 font-medium">Рейтинг</div>
              </div>
              <div className="border border-black/10 p-4 flex-1 bg-white/80">
                <div className="text-3xl font-bold text-black">30</div>
                <div className="text-xs text-black/60 mt-1 font-medium">Днів</div>
              </div>
            </div>

            {/* CTA */}
            <div className="flex items-center gap-4 pt-4">
              <button className="relative group px-8 py-4 bg-black text-white font-bold overflow-hidden">
                <span className="relative z-10">БЕЗКОШТОВНИЙ АУДИТ</span>
                <div className="absolute inset-0 bg-[#FFD700] transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
                <span className="absolute inset-0 flex items-center justify-center text-black opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-bold z-20">
                  БЕЗКОШТОВНИЙ АУДИТ
                </span>
              </button>
              <div className="border-l-2 border-black/20 pl-4">
                <div className="text-xs text-black/40 font-mono">SYSTEM_ID</div>
                <div className="text-sm font-bold text-black font-mono">#CRM_2024</div>
              </div>
            </div>

            {/* Decorative tech lines */}
            <div className="flex items-center gap-2 pt-6 text-xs font-mono text-black/30">
              <div className="w-3 h-3 border border-black/20" />
              <div className="h-[1px] w-12 bg-black/20" />
              <div>INTERFACE.V2</div>
              <div className="h-[1px] flex-1 bg-black/20" />
            </div>
          </div>

          {/* Center - Character with geometric shape */}
          <div className="lg:col-span-4 relative flex items-center justify-center min-h-[700px]">
            {/* Large yellow circle background */}
            <div
              ref={circleRef}
              className="absolute w-[500px] h-[500px] rounded-full bg-[#FFD700] transition-transform duration-300 ease-out"
              style={{
                transform: `translate(${mousePos.x * 0.3}px, ${mousePos.y * 0.3}px)`,
              }}
            />

            {/* Decorative rings */}
            <div className="absolute w-[600px] h-[600px] rounded-full border border-black/5" />
            <div className="absolute w-[700px] h-[700px] rounded-full border border-black/5" />

            {/* Character */}
            <div
              ref={characterRef}
              className="relative z-10 transition-transform duration-300 ease-out"
              style={{
                transform: `translate(${mousePos.x}px, ${mousePos.y}px)`,
              }}
            >
              <Image
                src="/images/professor.png"
                alt="CRM Expert"
                width={450}
                height={600}
                quality={95}
                priority
                className="w-[450px] h-auto drop-shadow-2xl"
              />
            </div>

            {/* Floating tech UI elements */}
            <div className="absolute top-20 left-0 border border-black/20 bg-white p-3 text-xs font-mono shadow-lg">
              <div className="text-black/40">STATUS:</div>
              <div className="text-[#FFD700] font-bold">● ACTIVE</div>
            </div>

            <div className="absolute bottom-32 left-8 border border-black/20 bg-white p-3 text-xs font-mono shadow-lg">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#FFD700]" />
                <div>
                  <div className="text-black/40">VER</div>
                  <div className="font-bold text-black">2.0</div>
                </div>
              </div>
            </div>

            <div className="absolute top-40 right-0 w-20 h-[1px] bg-black/20" />
            <div className="absolute top-40 right-0 w-[1px] h-12 bg-black/20" />
          </div>

          {/* Right side - Recent cases & video */}
          <div className="lg:col-span-3 relative z-20 space-y-6">
            {/* Recent cases */}
            <div className="border border-black/10 p-6 bg-white/80 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="text-xs font-mono text-black/40 tracking-wider">// ОСТАННІ КЕЙСИ</div>
              </div>

              <div className="space-y-4">
                {recentCases.map((case_item, idx) => (
                  <div key={idx} className="group cursor-pointer">
                    <div className="flex items-start gap-3 pb-3 border-b border-black/5 hover:border-[#FFD700] transition-colors">
                      <div className="text-xs font-mono text-[#FFD700] mt-1">0{idx + 1}</div>
                      <div className="flex-1">
                        <div className="text-sm font-bold text-black group-hover:text-[#FFD700] transition-colors">
                          {case_item.company}
                        </div>
                        <div className="text-xs text-black/60 mt-1">{case_item.result}</div>
                        <div className="text-xs text-black/40 font-mono mt-1">{case_item.date}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button className="w-full mt-4 py-2 border border-black/20 text-sm font-medium hover:bg-black hover:text-white transition-colors">
                Всі кейси →
              </button>
            </div>

            {/* Video preview */}
            <div className="relative group cursor-pointer overflow-hidden border border-black/10">
              <div className="relative aspect-video bg-gray-100">
                <Image
                  src="/docs/Референси/e6810a718ce1283b432e3ca704cf2d7a.jpg"
                  alt="Video preview"
                  width={400}
                  height={225}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-[#FFD700] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Play className="w-7 h-7 text-black ml-1" fill="black" />
                  </div>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="text-white text-sm font-bold drop-shadow-lg">
                    Як ми автоматизували бізнес за 30 днів
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation dots */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex gap-2">
                <div className="w-8 h-1 bg-[#FFD700]" />
                <div className="w-8 h-1 bg-black/10" />
                <div className="w-8 h-1 bg-black/10" />
              </div>
              <div className="flex gap-2">
                <button className="w-8 h-8 border border-black/20 flex items-center justify-center hover:bg-black hover:text-white transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button className="w-8 h-8 border border-black/20 flex items-center justify-center hover:bg-black hover:text-white transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative corner frames */}
      <div className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-black/5 pointer-events-none" />
      <div className="absolute top-0 right-0 w-32 h-32 border-r-2 border-t-2 border-black/5 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 border-l-2 border-b-2 border-black/5 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-black/5 pointer-events-none" />

      {/* Bottom tech info bar */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-black/5 bg-white/80 backdrop-blur-sm py-3 px-8">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between text-xs font-mono text-black/40">
          <div className="flex items-center gap-8">
            <div>SYSTEM: CRM_CUSTOMS</div>
            <div>VERSION: 2.0.24</div>
            <div>
              STATUS: <span className="text-[#FFD700]">● OPERATIONAL</span>
            </div>
          </div>
          <div>SCROLL TO EXPLORE ↓</div>
        </div>
      </div>
    </div>
  )
}
