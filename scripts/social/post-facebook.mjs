#!/usr/bin/env node
// Posts a link to the CRM Customs Facebook Page feed ("CRM на прокачку",
// page_id 614226188972824).
//
// Usage:
//   node scripts/social/post-facebook.mjs \
//     --title "..." --excerpt "..." --url "https://crmcustoms.com/uk/blog/slug"
//
// Reads FACEBOOK_PAGE_TOKEN and FACEBOOK_PAGE_ID from .env.local or env.
// If either is missing, exits 0 (soft-skip) rather than failing — Facebook
// posting is optional until the token is generated (see setup notes).

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

async function main() {
  const env = { ...loadEnvLocal(), ...process.env }
  const token = env.FACEBOOK_PAGE_TOKEN
  const pageId = env.FACEBOOK_PAGE_ID

  if (!token || !pageId) {
    console.error("FACEBOOK_PAGE_TOKEN or FACEBOOK_PAGE_ID not set — skipping Facebook post (not a failure, not yet configured)")
    process.exit(0)
  }

  const { title, excerpt, url } = parseArgs(process.argv.slice(2))
  if (!title || !url) {
    console.error('Usage: post-facebook.mjs --title "..." --url "https://..." [--excerpt "..."]')
    process.exit(1)
  }

  const message = [title, excerpt].filter(Boolean).join("\n\n")

  const res = await fetch(`https://graph.facebook.com/v21.0/${pageId}/feed`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, link: url, access_token: token }),
  })

  const data = await res.json()
  if (data.error) {
    console.error("Facebook API error:", data.error.message)
    process.exit(1)
  }

  console.log(`Posted to Facebook: post_id=${data.id}`)
}

main()
