import "server-only"
import { faqAsPlainText } from "@/lib/faq-data"
import type { ChatMessage } from "@/lib/chat-store"

const MODEL = "google/gemini-2.5-flash-lite"

const SYSTEM_PROMPT = `Ти — AI-асистент CRMCUSTOMS на сайті crmcustoms.com. CRMCUSTOMS впроваджує CRM-системи (Planfix, KeepinCRM, Pipedrive, Bitrix24 та ін.), робить інтеграції, автоматизацію на n8n та кастомну розробку для бізнесу в Україні. На ринку 10+ років, 100+ проєктів.

Правила:
- Відповідай українською, коротко і по суті (2-5 речень), без води і без канцеляриту.
- Це чат-бульбашка, не markdown-документ: НІКОЛИ не використовуй **зірочки**, #, -, нумеровані списки чи інше markdown-форматування. Тільки звичайний текст і перенос рядка, де треба.
- Спирайся ТІЛЬКИ на інформацію нижче (FAQ сайту). Якщо точної відповіді там нема — чесно скажи, що краще уточнити на аудиті/консультації, і запропонуй забронювати дзвінок. Не вигадуй цін, термінів чи фактів, яких нема в матеріалах.
- Ніколи не називай конкретних клієнтів, їх борги, внутрішні фінансові показники CRMCUSTOMS чи технічну інфраструктуру — цього немає і не повинно бути в публічній відповіді.
- Якщо питання явно не про послуги CRMCUSTOMS (наприклад, стороння тема) — ввічливо поверни розмову до того, чим можеш допомогти по CRM/автоматизації.
- Якщо відчуваєш, що людина готова рухатись далі (питає ціну, хоче почати, лишає контакти) — прямо запропонуй забронювати безкоштовну консультацію на сайті.
- Тебе можуть підключити до реального менеджера в PlanFix — якщо в історії діалогу з'являються повідомлення з роллю "менеджер", це людина взяла розмову на себе; далі просто підтримуй контекст, не дублюй її відповіді.

Матеріали FAQ сайту (питання/відповіді по категоріях):
${faqAsPlainText()}`

export async function generateChatReply(history: ChatMessage[], userMessage: string): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    return "Наразі не можу відповісти автоматично — напишіть, будь ласка, ваш номер чи email, і менеджер зв'яжеться з вами найближчим часом."
  }

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history.slice(-8).map((m) => ({
      role: m.role === "user" ? "user" : ("assistant" as const),
      content: m.role === "agent" ? `[Повідомлення від менеджера ${m.userName || ""}]: ${m.text}` : m.text,
    })),
    { role: "user", content: userMessage },
  ]

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://crmcustoms.com",
      "X-Title": "CRMCUSTOMS site chat",
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.4,
      max_tokens: 500,
    }),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    console.error("OpenRouter chat error:", res.status, text)
    return "Вибачте, тимчасові технічні неполадки. Спробуйте ще раз або залиште контакт — менеджер відповість особисто."
  }

  const data = await res.json()
  const reply = data?.choices?.[0]?.message?.content?.trim()
  return reply || "Не зовсім зрозумів питання — можете переформулювати, або залишіть контакт і менеджер відповість особисто."
}
