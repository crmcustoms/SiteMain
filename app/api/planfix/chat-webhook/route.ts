import { NextRequest, NextResponse } from "next/server"
import { appendMessage } from "@/lib/chat-store"
import { verifyIncomingPlanfixToken } from "@/lib/planfix-chat"

// Сюди PlanFix стукається сам, коли менеджер відповідає в задачі чату
// (Інтеграції → Чати → API ПланФікса для чатів → "Адреса для прийому повідомлень").
export async function POST(request: NextRequest) {
  try {
    const form = await request.formData()
    const cmd = String(form.get("cmd") || "")
    const token = form.get("token") ? String(form.get("token")) : null

    if (!verifyIncomingPlanfixToken(token)) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    if (cmd !== "newMessage") {
      return NextResponse.json({ error: "Unsupported cmd" }, { status: 400 })
    }

    const chatId = String(form.get("chatId") || "")
    const message = String(form.get("message") || "")
    const userName = String(form.get("userName") || "")
    const userLastName = String(form.get("userLastName") || "")

    if (!chatId || !message) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 })
    }

    await appendMessage(chatId, {
      role: "agent",
      text: message,
      ts: Date.now(),
      userName: [userName, userLastName].filter(Boolean).join(" ") || undefined,
    })

    return NextResponse.json({ chatId, contactId: chatId })
  } catch (error) {
    console.error("PlanFix chat webhook error:", error)
    return NextResponse.json({ error: "Invalid parameters" }, { status: 400 })
  }
}
