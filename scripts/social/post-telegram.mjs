#!/usr/bin/env node
// Announces a published article/case/news post in the CRM Customs Telegram channel.
//
// Usage:
//   node scripts/social/post-telegram.mjs \
//     --title "..." --excerpt "..." --url "https://crmcustoms.com/uk/blog/slug" \
//     [--image "https://crmcustoms.com/api/og?..."]
//
// Reads TELEGRAM_BOT_TOKEN and TELEGRAM_CHANNEL_CHAT_ID from .env.local.

import fs from "fs"

function loadEnvLocal() {
  const envPath = new URL("../../.env.local", import.meta.url)
  if (!fs.existsSync(envPath)) return {}
  const raw = fs.readFileSync(envPath, "utf-8")
  return Object.fromEntries(
    raw
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith("#") && l.includes("="))
      .map((l) => {
        const idx = l.indexOf("=")
        return [l.slice(0, idx).trim(), l.slice(idx + 1).trim().replace(/^"|"$/g, "")]
      }),
  )
}

function parseArgs(argv) {
  const args = {}
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith("--")) {
      args[argv[i].slice(2)] = argv[i + 1]
      i++
    }
  }
  return args
}

function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

async function main() {
  const env = { ...loadEnvLocal(), ...process.env }
  const token = env.TELEGRAM_BOT_TOKEN
  const chatId = env.TELEGRAM_CHANNEL_CHAT_ID

  if (!token || !chatId) {
    console.error("Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHANNEL_CHAT_ID in .env.local")
    process.exit(1)
  }

  const { title, excerpt, url, image } = parseArgs(process.argv.slice(2))
  if (!title || !url) {
    console.error("Usage: post-telegram.mjs --title \"...\" --url \"https://...\" [--excerpt \"...\"] [--image \"https://...\"]")
    process.exit(1)
  }

  const caption = [
    `<b>${escapeHtml(title)}</b>`,
    excerpt ? escapeHtml(excerpt) : null,
    `\n<a href="${url}">Читати далі →</a>`,
  ]
    .filter(Boolean)
    .join("\n\n")

  const method = image ? "sendPhoto" : "sendMessage"
  const body = image
    ? { chat_id: chatId, photo: image, caption, parse_mode: "HTML" }
    : { chat_id: chatId, text: caption, parse_mode: "HTML" }

  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

  const data = await res.json()
  if (!data.ok) {
    console.error("Telegram API error:", data.description)
    process.exit(1)
  }

  console.log(`Posted to Telegram: message_id=${data.result.message_id}`)
}

main()
