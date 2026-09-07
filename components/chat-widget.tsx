"use client"

import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { MessageCircle, Send, X } from "lucide-react"

type Role = "user" | "assistant" | "agent"
type Message = { role: Role; text: string; ts: number; userName?: string }

const CHAT_ID_KEY = "cc_chat_id"
const POLL_INTERVAL_MS = 3500

function getOrCreateChatId(): string {
  if (typeof window === "undefined") return ""
  try {
    const existing = window.localStorage.getItem(CHAT_ID_KEY)
    if (existing) return existing
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID().replace(/-/g, "")
        : `${Date.now()}${Math.random().toString(36).slice(2)}`
    window.localStorage.setItem(CHAT_ID_KEY, id)
    return id
  } catch {
    return `${Date.now()}${Math.random().toString(36).slice(2)}`
  }
}

function Bubble({ message }: { message: Message }) {
  const isVisitor = message.role === "user"
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ type: "spring", stiffness: 300, damping: 26 }}
      className={`flex ${isVisitor ? "justify-end" : "justify-start"} px-1`}
    >
      <div
        className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-xl backdrop-blur-2xl ${
          isVisitor
            ? "bg-[#FFD700]/95 text-black rounded-br-sm"
            : message.role === "agent"
              ? "bg-black/95 text-white rounded-bl-sm border border-[#FFD700]/40"
              : "bg-white/95 text-black rounded-bl-sm border border-black/10"
        }`}
      >
        {message.role === "agent" && message.userName && (
          <div className="mb-0.5 text-[10px] font-bold uppercase tracking-wide text-[#FFD700]">
            {message.userName}
          </div>
        )}
        <div className="whitespace-pre-line">{message.text}</div>
      </div>
    </motion.div>
  )
}

export function ChatWidget() {
  const [chatId, setChatId] = useState("")
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)
  const cursorRef = useRef(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  const sendingRef = useRef(false)
  const seenKeysRef = useRef<Set<string>>(new Set())

  const appendUnique = (incoming: Message[]) => {
    setMessages((prev) => {
      const fresh = incoming.filter((m) => {
        const key = `${m.role}:${m.text}`
        if (seenKeysRef.current.has(key)) return false
        seenKeysRef.current.add(key)
        return true
      })
      return fresh.length ? [...prev, ...fresh] : prev
    })
  }

  useEffect(() => {
    setChatId(getOrCreateChatId())
  }, [])

  useEffect(() => {
    if (!open || !chatId) return
    const poll = async () => {
      if (sendingRef.current) return // не опитувати, поки триває власна відправка — уникаємо гонки з дублюванням
      try {
        const res = await fetch(`/api/chat/poll?chatId=${chatId}&after=${cursorRef.current}`)
        if (!res.ok) return
        const data = await res.json()
        if (data.messages?.length) {
          appendUnique(data.messages)
        }
        if (typeof data.cursor === "number") cursorRef.current = data.cursor
      } catch {
        // тиха невдача — спробуємо на наступному тіку
      }
    }
    poll()
    const id = setInterval(poll, POLL_INTERVAL_MS)
    return () => clearInterval(id)
  }, [open, chatId])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages, open])

  const send = async () => {
    const text = input.trim()
    if (!text || sendingRef.current || !chatId) return
    sendingRef.current = true
    setSending(true)
    setInput("")
    appendUnique([{ role: "user", text, ts: Date.now() }])
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId, message: text }),
      })
      const data = await res.json()
      if (data.reply) {
        appendUnique([{ role: "assistant", text: data.reply, ts: Date.now() }])
      }
      if (typeof data.cursor === "number") cursorRef.current = data.cursor
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Не вдалось надіслати. Спробуйте ще раз за хвилину.", ts: Date.now() },
      ])
    } finally {
      sendingRef.current = false
      setSending(false)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            className="flex w-[min(92vw,380px)] flex-col gap-2"
          >
            <div
              ref={scrollRef}
              className="flex max-h-[60vh] min-h-[200px] flex-col gap-3 overflow-y-auto rounded-3xl bg-gradient-to-t from-black/5 via-transparent to-transparent p-3"
              style={{ scrollbarWidth: "thin" }}
            >
              {messages.length === 0 && (
                <Bubble
                  message={{
                    role: "assistant",
                    text: "Привіт! Я AI-асистент CRMCUSTOMS. Питайте про ціни, терміни, впровадження CRM — відповім одразу, а якщо треба — підключу живого менеджера.",
                    ts: 0,
                  }}
                />
              )}
              <AnimatePresence initial={false}>
                {messages.map((m, i) => (
                  <Bubble key={i} message={m} />
                ))}
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-2 rounded-full bg-white/90 px-2 py-1.5 shadow-2xl backdrop-blur-xl border border-black/5">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
                placeholder="Напишіть питання..."
                className="flex-1 bg-transparent px-2 py-1.5 text-sm text-black placeholder-black/40 outline-none"
              />
              <button
                onClick={send}
                disabled={sending || !input.trim()}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FFD700] text-black transition-transform hover:scale-105 disabled:opacity-40"
                aria-label="Надіслати"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setOpen((v) => !v)}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.96 }}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FFD700] text-black shadow-xl"
        aria-label={open ? "Закрити чат" : "Відкрити чат"}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </motion.button>
    </div>
  )
}
