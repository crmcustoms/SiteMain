#!/usr/bin/env node
// Publishes a single-image post to Instagram (@crmcustomsua) via the
// Content Publishing API — a two-step flow: create a media container from
// a public image URL, then publish that container.
//
// Usage:
//   node scripts/social/post-instagram.mjs \
//     --title "..." --excerpt "..." --url "https://crmcustoms.com/uk/blog/slug" \
//     --image "https://crmcustoms.com/images/blog/slug-illustration-1.jpg"
//
// Reads FACEBOOK_PAGE_TOKEN and INSTAGRAM_BUSINESS_ACCOUNT_ID from
// .env.local or env. If either is missing, exits 0 (soft-skip) — same
// pattern as post-facebook.mjs.
//
// Notes:
// - Instagram's servers fetch --image themselves, so it must already be
//   publicly reachable (i.e. the post is already live, not a local file).
// - Captions can't carry a clickable link — the article URL is included as
//   plain text per standard IG practice.

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

async function graphPost(path, body) {
  const res = await fetch(`https://graph.facebook.com/v21.0/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (data.error) throw new Error(`Graph API error (${path}): ${data.error.message}`)
  return data
}

async function main() {
  const env = { ...loadEnvLocal(), ...process.env }
  const token = env.FACEBOOK_PAGE_TOKEN
  const igUserId = env.INSTAGRAM_BUSINESS_ACCOUNT_ID

  if (!token || !igUserId) {
    console.error("FACEBOOK_PAGE_TOKEN or INSTAGRAM_BUSINESS_ACCOUNT_ID not set — skipping Instagram post (not a failure, not yet configured)")
    process.exit(0)
  }

  const { title, excerpt, url, image } = parseArgs(process.argv.slice(2))
  if (!title || !url || !image) {
    console.error('Usage: post-instagram.mjs --title "..." --url "https://..." --image "https://..." [--excerpt "..."]')
    process.exit(1)
  }

  const caption = [title, excerpt, `Стаття на сайті: ${url}`].filter(Boolean).join("\n\n")

  const container = await graphPost(`${igUserId}/media`, {
    image_url: image,
    caption,
    access_token: token,
  })

  const published = await graphPost(`${igUserId}/media_publish`, {
    creation_id: container.id,
    access_token: token,
  })

  console.log(`Posted to Instagram: media_id=${published.id}`)
}

main().catch((err) => {
  console.error(err.message)
  process.exit(1)
})
