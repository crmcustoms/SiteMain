"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { submitForm } from "@/lib/actions"
import { faqCategories, faqData } from "@/lib/faq-data"

export default function Faq({ dict, commonDict }: { dict?: any; commonDict?: any }) {
  const [activeTab, setActiveTab] = useState("price")
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [callForm, setCallForm] = useState({ name: "", phone: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCallSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("name", callForm.name)
      formData.append("phone", callForm.phone)
      formData.append("formType", "contact")

      const result = await submitForm(formData)

      if (result.success) {
        setCallForm({ name: "", phone: "" })
        alert(result.message)
      } else {
        alert(result.message)
      }
    } catch (error) {
      console.error("Помилка при відправці:", error)
      alert("Помилка при відправці. Спробуйте ще раз.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const categories = faqCategories

  const currentFaqs = faqData[activeTab] || faqData.price

  return (
    <div className="relative w-full bg-white pt-16 pb-16 overflow-hidden">
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
              <div className="text-xs font-mono font-bold text-black">08</div>
            </div>
            <div>
              <h2 className="text-5xl font-black text-black uppercase tracking-tighter">FAQ</h2>
            </div>
          </div>
          <p className="text-lg text-black/60 max-w-3xl">Закриваємо всі сумніви та заперечення</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-12">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`px-6 py-3 font-bold uppercase tracking-wide transition-all border-2 text-sm ${
                activeTab === cat.id
                  ? "bg-[#FFD700] text-black border-[#FFD700]"
                  : "border-[#FFD700] text-black hover:bg-[#FFD700]/10"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {currentFaqs.map((item) => (
            <div key={item.id} className="border border-black/10 bg-white/80 overflow-hidden">
              <button
                onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                className="w-full px-8 py-6 flex items-center justify-between hover:bg-black/5 transition-all"
              >
                <span className="text-lg font-bold text-black text-left">{item.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-[#FFD700] flex-shrink-0 transition-transform ${
                    expandedId === item.id ? "rotate-180" : ""
                  }`}
                />
              </button>

              {expandedId === item.id && (
                <div className="px-8 pb-6 space-y-3 border-t border-black/10 bg-white/80">
                  <div className="text-[#FFD700] font-bold whitespace-pre-line">{item.short}</div>
                  <div className="text-black/80 text-base leading-relaxed whitespace-pre-line">{item.full}</div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <h3 className="text-2xl font-black text-black mb-4">Залишились питання?</h3>
          <p className="text-black/60 mb-8 max-w-2xl mx-auto">
            Зателефонуємо за 5 хвилин та відповімо на всі ваші запитання
          </p>
          <form onSubmit={handleCallSubmit} className="max-w-2xl mx-auto">
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                type="text"
                required
                value={callForm.name}
                onChange={(e) => setCallForm({ ...callForm, name: e.target.value })}
                className="w-full px-4 py-3 border-2 border-black/10 bg-white text-black placeholder-black/40 focus:outline-none focus:border-[#FFD700] transition-colors"
                placeholder="Ваше ім'я"
              />
              <input
                type="tel"
                required
                value={callForm.phone}
                onChange={(e) => setCallForm({ ...callForm, phone: e.target.value })}
                className="w-full px-4 py-3 border-2 border-black/10 bg-white text-black placeholder-black/40 focus:outline-none focus:border-[#FFD700] transition-colors"
                placeholder="+380671706703"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-4 px-8 py-4 bg-[#FFD700] text-black font-bold uppercase tracking-wide hover:bg-black hover:text-[#FFD700] transition-all border-2 border-[#FFD700] disabled:opacity-50 cursor-disabled"
            >
              {isSubmitting ? "Відправлення..." : "Зателефонуємо за 5 хв"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
