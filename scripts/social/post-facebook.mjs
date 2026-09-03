#!/usr/bin/env node
// Posts to the CRM Customs Facebook Page ("CRM на прокачку", page_id
// 614226188972824) — either a link post to the feed, or a video post.
//
// Usage:
//   node scripts/social/post-facebook.mjs \
//     --title "..." --excerpt "..." --url "https://crmcustoms.com/uk/blog/slug"
//   node scripts/social/post-facebook.mjs \
//     --title "..." --excerpt "..." --url "https://crmcustoms.com/uk/blog/slug" \
//     --video "https://crmcustoms.com/videos/blog/slug.mp4"
//
// Reads FACEBOOK_PAGE_TOKEN and FACEBOOK_PAGE_ID from .env.local or env.
// If either is missing, exits 0 (soft-skip) rather than failing — Facebook
// posting is optional until the token is generated (see setup notes).
//
// FACEBOOK_PAGE_TOKEN may hold either a genuine Page access token or a
// long-lived User access token (with pages_show_list + pages_manage_posts
// scopes) — the Graph API rejects a User token on {pageId}/feed directly,
// so this resolves a real Page token from it first via
// GET /{pageId}?fields=access_token. A token that's already a Page token
// simply won't have that field on itself, and the original value is used
// unchanged.

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

  const { title, excerpt, url, video } = parseArgs(process.argv.slice(2))
  if (!title || !url) {
    console.error('Usage: post-facebook.mjs --title "..." --url "https://..." [--excerpt "..."] [--video "https://..."]')
    process.exit(1)
  }

  const message = [title, excerpt].filter(Boolean).join("\n\n")

  let pageToken = token
  const resolve = await fetch(
    `https://graph.facebook.com/v21.0/${pageId}?fields=access_token&access_token=${encodeURIComponent(token)}`,
  )
  const resolved = await resolve.json()
  if (resolved.access_token) pageToken = resolved.access_token

  const res = video
    ? await fetch(`https://graph.facebook.com/v21.0/${pageId}/videos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          file_url: video,
          description: [message, `Стаття на сайті: ${url}`].filter(Boolean).join("\n\n"),
          access_token: pageToken,
        }),
      })
    : await fetch(`https://graph.facebook.com/v21.0/${pageId}/feed`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, link: url, access_token: pageToken }),
      })

  const data = await res.json()
  if (data.error) {
    console.error("Facebook API error:", data.error.message)
    process.exit(1)
  }

  console.log(`Posted to Facebook: ${video ? "video_id" : "post_id"}=${data.id}`)
}

main()
