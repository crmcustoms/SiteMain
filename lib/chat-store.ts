import "server-only"
import { Redis } from "@upstash/redis"

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

const TTL_SECONDS = 60 * 60 * 24 * 7 // 7 днів

let redis: Redis | null = null
function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  if (!redis) redis = new Redis({ url, token })
  return redis
}

function messagesKey(chatId: string) {
  return `chat:${chatId}:messages`
}
function metaKey(chatId: string) {
  return `chat:${chatId}:meta`
}

export async function appendMessage(chatId: string, message: ChatMessage): Promise<void> {
  const r = getRedis()
  if (!r) return
  const key = messagesKey(chatId)
  await r.rpush(key, JSON.stringify(message))
  await r.expire(key, TTL_SECONDS)
}

export async function getMessages(chatId: string, fromIndex = 0): Promise<{ messages: ChatMessage[]; total: number }> {
  const r = getRedis()
  if (!r) return { messages: [], total: 0 }
  const key = messagesKey(chatId)
  const total = await r.llen(key)
  if (total === 0 || fromIndex >= total) return { messages: [], total }
  const raw = await r.lrange<string>(key, fromIndex, -1)
  const messages = raw
    .map((item) => {
      try {
        return typeof item === "string" ? (JSON.parse(item) as ChatMessage) : (item as unknown as ChatMessage)
      } catch {
        return null
      }
    })
    .filter((m): m is ChatMessage => m !== null)
  return { messages, total }
}

export async function setMeta(chatId: string, meta: Partial<ChatMeta>): Promise<void> {
  const r = getRedis()
  if (!r) return
  const key = metaKey(chatId)
  const clean = Object.fromEntries(Object.entries(meta).filter(([, v]) => v !== undefined && v !== null && v !== ""))
  if (Object.keys(clean).length === 0) return
  await r.hset(key, clean)
  await r.expire(key, TTL_SECONDS)
}

export async function getMeta(chatId: string): Promise<ChatMeta> {
  const r = getRedis()
  if (!r) return {}
  const key = metaKey(chatId)
  const data = await r.hgetall<Record<string, string>>(key)
  return (data || {}) as ChatMeta
}
