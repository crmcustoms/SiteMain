import "server-only"

export type ChatRole = "user" | "assistant" | "agent"

export type ChatMessage = {
  role: ChatRole
  text: string
  ts: number
  userName?: string // ім'я менеджера PlanFix, якщо role === "agent"
}

export type ChatMeta = {
  contactName?: string
  contactEmail?: string
  contactPhone?: string
  planfixTaskNumber?: string
}

type ChatDoc = { messages: ChatMessage[]; meta: ChatMeta }

const BUCKET = "chat-transcripts"

function supabaseUrl(): string {
  return process.env.SUPABASE_URL || "http://supabasekong-uuqpzylk6tuwfgn9kav3b437.65.109.8.78.sslip.io"
}
function serviceKey(): string | undefined {
  return process.env.SUPABASE_SERVICE_ROLE_KEY
}

async function readDoc(chatId: string): Promise<ChatDoc> {
  const key = serviceKey()
  if (!key) return { messages: [], meta: {} }
  try {
    const res = await fetch(`${supabaseUrl()}/storage/v1/object/${BUCKET}/${chatId}.json`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      cache: "no-store",
    })
    if (!res.ok) return { messages: [], meta: {} }
    const data = (await res.json()) as Partial<ChatDoc>
    return { messages: data.messages || [], meta: data.meta || {} }
  } catch {
    return { messages: [], meta: {} }
  }
}

async function writeDoc(chatId: string, doc: ChatDoc): Promise<void> {
  const key = serviceKey()
  if (!key) return
  try {
    const res = await fetch(`${supabaseUrl()}/storage/v1/object/${BUCKET}/${chatId}.json`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        "x-upsert": "true",
      },
      body: JSON.stringify(doc),
    })
    if (!res.ok) {
      const text = await res.text().catch(() => "")
      console.error("chat-store writeDoc non-OK response:", res.status, text)
    }
  } catch (err) {
    console.error("chat-store writeDoc failed:", err)
  }
}

export async function appendMessage(chatId: string, message: ChatMessage): Promise<void> {
  const doc = await readDoc(chatId)
  doc.messages.push(message)
  await writeDoc(chatId, doc)
}

export async function getMessages(chatId: string, fromIndex = 0): Promise<{ messages: ChatMessage[]; total: number }> {
  const doc = await readDoc(chatId)
  const total = doc.messages.length
  return { messages: doc.messages.slice(fromIndex), total }
}

export async function setMeta(chatId: string, meta: Partial<ChatMeta>): Promise<void> {
  const clean = Object.fromEntries(Object.entries(meta).filter(([, v]) => v !== undefined && v !== null && v !== ""))
  if (Object.keys(clean).length === 0) return
  const doc = await readDoc(chatId)
  doc.meta = { ...doc.meta, ...clean }
  await writeDoc(chatId, doc)
}

export async function getMeta(chatId: string): Promise<ChatMeta> {
  const doc = await readDoc(chatId)
  return doc.meta
}
