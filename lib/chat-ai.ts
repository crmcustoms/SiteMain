import "server-only"
import { faqAsPlainText, pricingTiersText } from "@/lib/faq-data"
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

Знайомство з відвідувачем:
- Якщо ще не знаєш імені співрозмовника — природно запитай, як до нього звертатися, десь у перших 1-2 репліках (не як анкету, по-людськи: "До речі, як до вас звертатися?"). Не питай повторно, якщо ім'я вже відоме з історії діалогу.
- Коли розмова стає змістовною (питає ціну, хоче почати, цікавиться консультацією) — природно попроси залишити номер телефону, щоб менеджер зміг зв'язатися.

${pricingTiersText}

Матеріали FAQ сайту (питання/відповіді по категоріях):
${faqAsPlainText()}`

export type ChatContactInfo = { name?: string; phone?: string }
export type ChatReplyResult = { reply: string; contact?: ChatContactInfo }

const EXTRACT_MODEL = "google/gemini-2.5-flash-lite"
const EXTRACT_SYSTEM_PROMPT = `Ти видобуваєш структуровані дані з одного повідомлення відвідувача чату. Якщо людина явно назвала своє ім'я (представилась) і/або залишила номер телефону — виведи ЛИШЕ JSON, без жодного іншого тексту, коментарів чи markdown-огорожі: {"name": "..." або null, "phone": "..." або null}. Якщо в повідомленні нема ні імені, ні телефону — виведи {"name": null, "phone": null}. Не плутай назву компанії чи випадкові числа (ціни, кількість співробітників) з іменем чи телефоном.`

async function extractContactFromMessage(message: string): Promise<ChatContactInfo | undefined> {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) return undefined
  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://crmcustoms.com",
        "X-Title": "CRMCUSTOMS site chat — contact extraction",
      },
      body: JSON.stringify({
        model: EXTRACT_MODEL,
        messages: [
          { role: "system", content: EXTRACT_SYSTEM_PROMPT },
          { role: "user", content: message },
        ],
        temperature: 0,
        max_tokens: 80,
      }),
    })
    if (!res.ok) {
      console.error("extractContactFromMessage: OpenRouter not ok", res.status, await res.text().catch(() => ""))
      return undefined
    }
    const data = await res.json()
    const raw = data?.choices?.[0]?.message?.content?.trim()
    console.log("extractContactFromMessage raw:", JSON.stringify(raw))
    if (!raw) return undefined
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error("extractContactFromMessage: no JSON found in", JSON.stringify(raw))
      return undefined
    }
    const parsed = JSON.parse(jsonMatch[0])
    const contact: ChatContactInfo = {}
    if (parsed.name && typeof parsed.name === "string" && parsed.name.toLowerCase() !== "null") contact.name = parsed.name.trim()
    if (parsed.phone && typeof parsed.phone === "string" && parsed.phone.toLowerCase() !== "null") contact.phone = parsed.phone.trim()
    console.log("extractContactFromMessage parsed:", JSON.stringify(contact))
    return Object.keys(contact).length ? contact : undefined
  } catch (err) {
    console.error("extractContactFromMessage failed:", err)
    return undefined
  }
}

export async function generateChatReply(history: ChatMessage[], userMessage: string): Promise<ChatReplyResult> {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    return {
      reply:
        "Наразі не можу відповісти автоматично — напишіть, будь ласка, ваш номер чи email, і менеджер зв'яжеться з вами найближчим часом.",
    }
  }

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history.slice(-8).map((m) => ({
      role: m.role === "user" ? "user" : ("assistant" as const),
      content: m.role === "agent" ? `[Повідомлення від менеджера ${m.userName || ""}]: ${m.text}` : m.text,
    })),
    { role: "user", content: userMessage },
  ]

  const [chatRes, contact] = await Promise.all([
    fetch("https://openrouter.ai/api/v1/chat/completions", {
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
    }),
    extractContactFromMessage(userMessage),
  ])

  if (!chatRes.ok) {
    const text = await chatRes.text().catch(() => "")
    console.error("OpenRouter chat error:", chatRes.status, text)
    return { reply: "Вибачте, тимчасові технічні неполадки. Спробуйте ще раз або залиште контакт — менеджер відповість особисто." }
  }

  const data = await chatRes.json()
  const rawReply = data?.choices?.[0]?.message?.content?.trim()
  if (!rawReply) {
    return { reply: "Не зовсім зрозумів питання — можете переформулювати, або залишіть контакт і менеджер відповість особисто." }
  }
  return { reply: rawReply, contact }
}
