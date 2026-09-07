import "server-only"

// Клієнт для окремого PlanFix "API для чатів" (webchat/api) — НЕ звичайний REST API PlanFix.
// Документація: Інтеграції → Чати → API ПланФікса для чатів.

function requiredEnv(name: string): string {
  const v = process.env[name]
  if (!v) throw new Error(`Missing env var: ${name}`)
  return v
}

function buildForm(params: Record<string, string | undefined>): URLSearchParams {
  const form = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") form.append(key, value)
  }
  return form
}

async function callPlanfixChatApi(cmd: string, params: Record<string, string | undefined>) {
  const url = requiredEnv("PLANFIX_WEBCHAT_URL")
  const providerId = requiredEnv("PLANFIX_WEBCHAT_PROVIDER_ID")
  const token = requiredEnv("PLANFIX_WEBCHAT_TOKEN")

  const form = buildForm({ cmd, providerId, planfix_token: token, ...params })

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form.toString(),
  })

  const text = await res.text()
  let data: any = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = null
  }

  if (!res.ok) {
    throw new Error(`PlanFix chat API ${cmd} failed: ${res.status} ${text}`)
  }
  return data
}

export async function sendMessageToPlanfix(args: {
  chatId: string
  message: string
  title?: string
  contactId?: string
  contactName?: string
  contactLastName?: string
  contactEmail?: string
  contactPhone?: string
  contactData?: string
  isEcho?: boolean
  userEmail?: string
}) {
  return callPlanfixChatApi("newMessage", {
    chatId: args.chatId,
    message: args.message,
    title: args.title,
    contactId: args.contactId,
    contactName: args.contactName,
    contactLastName: args.contactLastName,
    contactEmail: args.contactEmail,
    contactPhone: args.contactPhone,
    contactData: args.contactData,
    isEcho: args.isEcho ? "1" : undefined,
    userEmail: args.userEmail,
  })
}

export async function getPlanfixTaskNumber(chatId: string): Promise<number | null> {
  try {
    const data = await callPlanfixChatApi("getTask", { chatId })
    return data?.data?.number ?? null
  } catch {
    return null
  }
}

/** Перевіряє токен, який PlanFix підставляє у власні запити на наш вебхук (поле "token"). */
export function verifyIncomingPlanfixToken(token: string | null | undefined): boolean {
  const expected = process.env.PLANFIX_WEBCHAT_INCOMING_TOKEN
  if (!expected) return false
  return token === expected
}
