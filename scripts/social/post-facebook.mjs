#!/usr/bin/env node
// Posts to the CRM Customs Facebook Page ("CRM на прокачку", page_id
// 614226188972824) — a link post to the feed, a video post, or a multi-photo
// (carousel-style) post.
//
// Usage:
//   node scripts/social/post-facebook.mjs \
//     --title "..." --excerpt "..." --url "https://crmcustoms.com/uk/blog/slug"
//   node scripts/social/post-facebook.mjs \
//     --title "..." --excerpt "..." --url "https://crmcustoms.com/uk/blog/slug" \
//     --video "https://crmcustoms.com/videos/blog/slug.mp4"
//   node scripts/social/post-facebook.mjs \
//     --title "..." --excerpt "..." --url "https://crmcustoms.com/uk/blog/slug" \
//     --images "https://.../1.jpg,https://.../2.jpg,https://.../3.jpg"
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

  const { title, excerpt, url, video, images } = parseArgs(process.argv.slice(2))
  const photos = images ? images.split(",").map((s) => s.trim()).filter(Boolean) : null
  if (!title || !url) {
    console.error('Usage: post-facebook.mjs --title "..." --url "https://..." [--excerpt "..."] [--video "https://..." | --images "url1,url2,..."]')
    process.exit(1)
  }

  const message = [title, excerpt].filter(Boolean).join("\n\n")

  let pageToken = token
  const resolve = await fetch(
    `https://graph.facebook.com/v21.0/${pageId}?fields=access_token&access_token=${encodeURIComponent(token)}`,
  )
  const resolved = await resolve.json()
  if (resolved.access_token) pageToken = resolved.access_token

  async function fbPost(path, body) {
    const res = await fetch(`https://graph.facebook.com/v21.0/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    return res.json()
  }

  let data
  if (photos) {
    // Multi-photo post: upload each photo unpublished to get its fbid, then
    // attach all of them to one feed post via attached_media.
    const mediaFbids = []
    for (const imageUrl of photos) {
      const uploaded = await fbPost(`${pageId}/photos`, { url: imageUrl, published: false, access_token: pageToken })
      if (uploaded.error) {
        console.error("Facebook API error (photo upload):", uploaded.error.message)
        process.exit(1)
      }
      mediaFbids.push(uploaded.id)
    }
    data = await fbPost(`${pageId}/feed`, {
      message,
      attached_media: mediaFbids.map((id) => ({ media_fbid: id })),
      access_token: pageToken,
    })
  } else if (video) {
    data = await fbPost(`${pageId}/videos`, {
      file_url: video,
      description: [message, `Стаття на сайті: ${url}`].filter(Boolean).join("\n\n"),
      access_token: pageToken,
    })
  } else {
    data = await fbPost(`${pageId}/feed`, { message, link: url, access_token: pageToken })
  }

  if (data.error) {
    console.error("Facebook API error:", data.error.message)
    process.exit(1)
  }

  console.log(`Posted to Facebook: ${video ? "video_id" : "post_id"}=${data.id}`)
}

main()
