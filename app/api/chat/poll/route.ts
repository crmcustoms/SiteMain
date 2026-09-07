import { NextRequest, NextResponse } from "next/server"
import { getMessages } from "@/lib/chat-store"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const chatId = searchParams.get("chatId") || ""
  const after = Number(searchParams.get("after") || "0")

  if (!/^[a-zA-Z0-9_-]{8,64}$/.test(chatId)) {
    return NextResponse.json({ error: "Некоректний chatId" }, { status: 400 })
  }

  const { messages, total } = await getMessages(chatId, Number.isFinite(after) ? after : 0)
  return NextResponse.json({ messages, cursor: total })
}
