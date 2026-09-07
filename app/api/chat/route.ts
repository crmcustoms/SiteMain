import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { checkRateLimit } from "@/lib/rate-limit"
import { appendMessage, getMessages, setMeta, getMeta } from "@/lib/chat-store"
import { generateChatReply } from "@/lib/chat-ai"
import { sendMessageToPlanfix } from "@/lib/planfix-chat"

const bodySchema = z.object({
  chatId: z.string().regex(/^[a-zA-Z0-9_-]{8,64}$/),
  message: z.string().min(1).max(2000),
  contactName: z.string().max(120).optional(),
  contactEmail: z.string().email().optional().or(z.literal("")),
  contactPhone: z.string().max(40).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown"
    const rate = await checkRateLimit(`chat:send:${clientIp}`)
    if (!rate.ok) {
      return NextResponse.json({ error: "Занадто багато повідомлень, зачекайте хвилину" }, { status: 429 })
    }

    const parsed = bodySchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json({ error: "Некоректні дані" }, { status: 400 })
    }
    const { chatId, message, contactName, contactEmail, contactPhone } = parsed.data

    if (contactName || contactEmail || contactPhone) {
      await setMeta(chatId, { contactName, contactEmail, contactPhone })
    }
    const meta = await getMeta(chatId)

    const { messages: history } = await getMessages(chatId)
    await appendMessage(chatId, { role: "user", text: message, ts: Date.now() })

    const reply = await generateChatReply(history, message)
    await appendMessage(chatId, { role: "assistant", text: reply, ts: Date.now() })

    // Реле в PlanFix — не блокуємо відповідь відвідувачу, якщо PlanFix недоступний
    sendMessageToPlanfix({
      chatId,
      message,
      title: `Чат з сайту${meta.contactName ? ` — ${meta.contactName}` : ""}`,
      contactId: chatId,
      contactName: meta.contactName || "Відвідувач сайту",
      contactEmail: meta.contactEmail,
      contactPhone: meta.contactPhone,
    })
      .then(() =>
        sendMessageToPlanfix({
          chatId,
          message: `🤖 AI-бот: ${reply}`,
          contactId: chatId,
          isEcho: true,
          userEmail: process.env.PLANFIX_WEBCHAT_BOT_USER_EMAIL || "tm@crmcustoms.com",
        })
      )
      .catch((err) => console.error("PlanFix relay error:", err))

    const { total } = await getMessages(chatId)
    return NextResponse.json({ reply, chatId, cursor: total })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json({ error: "Помилка сервера" }, { status: 500 })
  }
}
