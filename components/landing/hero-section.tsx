"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { Play, ChevronLeft, ChevronRight, X } from "lucide-react"
import { submitForm } from "@/lib/actions"
import Link from "next/link"
import { CallbackFormDialog } from "@/components/callback-form-dialog"

const services = [
  {
    id: 1,
    title: "Впровадження CRM",
    description: "Planfix для автоматизації бізнесу",
    icon: "💼",
    image: "/images/Group 1.png",
    isImage: true,
  },
  {
    id: 2,
    title: "Штучний інтелект",
    description: "AI в бізнес-процеси",
    icon: "🤖",
    image: "/images/aichat.png",
    isImage: true,
  },
  {
    id: 3,
    title: "Інтеграції та розробка",
    description: "Сервіси та додатки для CRM",
    icon: "⚙️",
    image: "/images/Group 10.png",
    isImage: true,
  },
]

interface RecentCase {
  title: string
  slug: string
  tags: string[]
  date: string
}

export default function HeroSection({ dict, commonDict, lang = 'uk', recentCases = [] }: { dict?: any; commonDict?: any; lang?: string; recentCases?: RecentCase[] }) {
  const heroRef = useRef<HTMLDivElement>(null)
  const characterRef = useRef<HTMLDivElement>(null)
  const circleRef = useRef<HTMLDivElement>(null)
  const [currentService, setCurrentService] = useState(0)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [showAuditForm, setShowAuditForm] = useState(false)
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "")
    if (!digits) return ""
    if (digits.startsWith("380")) {
      const rest = digits.slice(3)
      const parts = [
        rest.slice(0, 2),
        rest.slice(2, 5),
        rest.slice(5, 7),
        rest.slice(7, 9),
      ].filter(Boolean)
      return `+380 ${parts.join(" ")}`
    }
    return `+${digits}`
  }

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

  const handleAuditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('name', contactForm.name)
      formData.append('phone', contactForm.phone)
      formData.append('formType', 'audit')

      const result = await submitForm(formData)

      if (result.success) {
        setContactForm({ name: '', email: '', phone: '' })
        setShowAuditForm(false)
        alert(result.message)
      } else {
        alert(result.message)
      }
    } catch (error) {
      console.error('Помилка при відправці:', error)
      alert('Помилка при відправці. Спробуйте ще раз.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div ref={heroRef} className="relative min-h-screen overflow-hidden bg-white w-full">
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


      <div className="relative px-8 py-12 max-w-[1800px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left side - Content */}
          <div className="lg:col-span-5 relative z-20 space-y-6">
            {/* Services Carousel - Top Left */}
            <div className="hidden md:block relative border border-black/10 bg-white/80 backdrop-blur-sm overflow-visible" style={{ minHeight: '200px' }}>
              <div className="flex items-center justify-between p-6 pb-4 relative z-20">
                <div className="text-xs font-mono text-black/40 tracking-wider">// ПОСЛУГИ</div>
                <div className="text-xs font-mono text-black/40">0{currentService + 1}/03</div>
              </div>

              <div className="relative h-40 px-6 pb-6" style={{ display: 'flex', alignItems: 'center' }}>
                {services.map((service, idx) => (
                  <div
                    key={service.id}
                    className={`absolute inset-0 transition-all duration-700 flex items-center ${
                      idx === currentService
                        ? "opacity-100 translate-x-0"
                        : idx < currentService
                          ? "opacity-0 -translate-x-full"
                          : "opacity-0 translate-x-full"
                    }`}
                  >
                    {/* Text on the left with padding */}
                    <div className="relative z-10 flex-1 pr-8" style={{ paddingLeft: '10px' }}>
                      <div className="text-lg font-bold text-black mb-1">{service.title}</div>
                      <div className="text-sm text-black/60">{service.description}</div>
                    </div>

                    {/* Image right aligned with 20px offset, can overflow vertically */}
                    {service.isImage && service.image ? (
                      <div className="absolute right-[20px] top-[40%] transform -translate-y-1/2 w-[446px] h-[446px] flex items-center justify-center pointer-events-none">
                        <Image
                          src={service.image}
                          alt={service.title}
                          width={446}
                          height={446}
                          className="w-full h-full object-contain drop-shadow-lg"
                        />
                      </div>
                    ) : (
                      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-8xl opacity-30">{service.icon}</div>
                    )}
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
                CRM ДЛЯ ВАШОГО
                <br />
                <span className="relative inline-block">
                  БІЗНЕСУ
                  <div className="absolute -right-8 top-1/2 -translate-y-1/2 w-20 h-[2px] bg-[#FFD700]" />
                </span>
                <br />
                <span className="text-[#FFD700]">ВІД 25,000₴ ЗА 2-4 ТИЖНІ</span>
              </h1>

              {/* Benefits list */}
              <div className="mt-6 space-y-2">
                <div className="flex items-center gap-2 text-lg text-black">
                  <span className="text-[#FFD700] font-bold">✓</span>
                  <span>Підберемо під ваш бізнес</span>
                </div>
                <div className="flex items-center gap-2 text-lg text-black">
                  <span className="text-[#FFD700] font-bold">✓</span>
                  <span>Навчимо команду</span>
                </div>
                <div className="flex items-center gap-2 text-lg text-black">
                  <span className="text-[#FFD700] font-bold">✓</span>
                  <span>Технічна підтримка включена</span>
                </div>
              </div>

              {/* Tech label */}
              <div className="absolute -right-4 top-0 rotate-90 origin-left">
                <div className="text-xs font-mono text-black/30 tracking-[0.3em]">TECH_INTERFACE</div>
              </div>
            </div>

            {/* Stats block */}
            <div className="flex gap-4 pt-4">
              <div className="border border-black/10 p-4 flex-1 bg-white/80">
                <div className="text-3xl font-bold text-black">300+</div>
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
            <div className="flex flex-col gap-3 pt-4">
              <div className="flex items-start gap-4 flex-wrap">
                <CallbackFormDialog
                  title="Безкоштовна консультація"
                  description="Залиште ім'я та телефон — ми передзвонимо найближчим часом."
                  buttonText="Безкоштовна консультація"
                  trigger={
                    <button className="relative group w-[300px] h-12 bg-[#FFD700] text-black font-bold overflow-hidden hover:cursor-pointer inline-flex items-center justify-center border-2 border-[#FFD700] transition-all hover:bg-black hover:text-[#FFD700]">
                      <span className="relative z-10">БЕЗКОШТОВНА КОНСУЛЬТАЦІЯ</span>
              </button>
                  }
                />
              <div className="border-l-2 border-black/20 pl-4">
                <div className="text-xs text-black/40 font-mono">SYSTEM_ID</div>
                <div className="text-sm font-bold text-black font-mono">#CRM_2024</div>
                </div>
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
                {recentCases.length > 0 ? recentCases.map((case_item, idx) => (
                  <a key={idx} href={`/${lang}/cases/${case_item.slug}`} className="group cursor-pointer block">
                    <div className="flex items-start gap-3 pb-3 border-b border-black/5 hover:border-[#FFD700] transition-colors">
                      <div className="text-xs font-mono text-[#FFD700] mt-1">0{idx + 1}</div>
                      <div className="flex-1">
                        <div className="text-sm font-bold text-black group-hover:text-[#FFD700] transition-colors">
                          {case_item.title}
                        </div>
                        <div className="text-xs text-black/60 mt-1">
                          {case_item.tags.length > 0 ? case_item.tags.join(', ') : 'Без тегов'}
                        </div>
                        <div className="text-xs text-black/40 font-mono mt-1">{case_item.date}</div>
                      </div>
                    </div>
                  </a>
                )) : (
                  <div className="text-xs text-black/60">Кейсы не доступны</div>
                )}
              </div>

              <a href={`/${lang}/cases`} className="w-full mt-4 py-2 border border-black/20 text-sm font-medium hover:bg-black hover:text-white transition-colors block text-center">
                Всі кейси →
              </a>
            </div>

            {/* Video preview */}
            <div className="relative group cursor-pointer overflow-hidden border border-black/10">
              <div className="relative aspect-video bg-gray-100">
                <Image
                  src="/images/herosektion.png"
                  alt="Hero section preview"
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
                    Швидкий запуск продажів з мінімальним бюджетом за три дні
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

      {/* Audit Form Modal */}
      {showAuditForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full border border-black/10 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-black">Безкоштовний аудит</h2>
              <button
                onClick={() => setShowAuditForm(false)}
                className="w-8 h-8 flex items-center justify-center hover:bg-black/5 rounded transition-colors"
              >
                <X className="w-5 h-5 text-black" />
              </button>
            </div>
            <div className="text-xs text-black/60 mb-4">
              Відповідаємо за 5–15 хв
            </div>

            <form onSubmit={handleAuditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">Ім'я</label>
                <input
                  type="text"
                  required
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  className="w-full px-4 py-2 border border-black/20 rounded focus:outline-none focus:border-[#FFD700] transition-colors"
                  placeholder="Ваше ім'я"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">Телефон</label>
                <input
                  type="tel"
                  required
                  value={contactForm.phone}
                  onChange={(e) => setContactForm({ ...contactForm, phone: formatPhone(e.target.value) })}
                  className="w-full px-4 py-2 border border-black/20 rounded focus:outline-none focus:border-[#FFD700] transition-colors"
                  placeholder="+380 67 123 45 67"
                  inputMode="tel"
                />
                <p className="text-xs text-black/50 mt-2">Формат: +380 67 123 45 67</p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-6 py-3 bg-black text-white font-medium hover:bg-[#FFD700] hover:text-black transition-colors disabled:opacity-50 cursor-disabled"
              >
                {isSubmitting ? 'Відправлення...' : 'Отримати аудит'}
              </button>
              <p className="text-xs text-black/50 text-center">Без спаму — тільки по справі.</p>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
