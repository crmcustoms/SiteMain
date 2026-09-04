#!/usr/bin/env node
// Publishes a single-image, carousel (2-10 images), or Reels (video) post to
// Instagram (@crmcustomsua) via the Content Publishing API. Single-image and
// video are a two-step flow (create container, publish); a carousel is
// three-step (create one child container per image with is_carousel_item,
// create a CAROUSEL container from those children's ids, then publish).
// Video/carousel containers process asynchronously, so this polls each
// container's status_code until FINISHED before publishing/collecting it.
//
// Usage:
//   node scripts/social/post-instagram.mjs \
//     --title "..." --excerpt "..." --url "https://crmcustoms.com/uk/blog/slug" \
//     --image "https://crmcustoms.com/images/blog/slug-illustration-1.jpg"
//   node scripts/social/post-instagram.mjs \
//     --title "..." --url "https://crmcustoms.com/uk/blog/slug" \
//     --video "https://crmcustoms.com/videos/blog/slug.mp4"
//   node scripts/social/post-instagram.mjs \
//     --title "..." --url "https://crmcustoms.com/uk/blog/slug" \
//     --images "https://.../1.jpg,https://.../2.jpg,https://.../3.jpg"
//
// Reads FACEBOOK_PAGE_TOKEN and INSTAGRAM_BUSINESS_ACCOUNT_ID from
// .env.local or env. If either is missing, exits 0 (soft-skip) — same
// pattern as post-facebook.mjs.
//
// Notes:
// - Instagram's servers fetch --image/--video themselves, so it must
//   already be publicly reachable (i.e. the post is already live, not a
//   local file).
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

async function graphGet(path, params) {
  const qs = new URLSearchParams(params).toString()
  const res = await fetch(`https://graph.facebook.com/v21.0/${path}?${qs}`)
  const data = await res.json()
  if (data.error) throw new Error(`Graph API error (${path}): ${data.error.message}`)
  return data
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Video containers process asynchronously — poll until FINISHED (or ERROR)
// before calling media_publish, per Meta's Reels publishing docs.
async function waitUntilFinished(containerId, token) {
  for (let attempt = 0; attempt < 30; attempt++) {
    const status = await graphGet(containerId, { fields: "status_code", access_token: token })
    if (status.status_code === "FINISHED") return
    if (status.status_code === "ERROR") throw new Error(`Instagram container ${containerId} failed processing`)
    await sleep(10_000)
  }
  throw new Error(`Instagram container ${containerId} did not finish processing in time`)
}

async function main() {
  const env = { ...loadEnvLocal(), ...process.env }
  const token = env.FACEBOOK_PAGE_TOKEN
  const igUserId = env.INSTAGRAM_BUSINESS_ACCOUNT_ID

  if (!token || !igUserId) {
    console.error("FACEBOOK_PAGE_TOKEN or INSTAGRAM_BUSINESS_ACCOUNT_ID not set — skipping Instagram post (not a failure, not yet configured)")
    process.exit(0)
  }

  const { title, excerpt, url, image, video, images } = parseArgs(process.argv.slice(2))
  const carousel = images ? images.split(",").map((s) => s.trim()).filter(Boolean) : null
  if (!title || !url || (!image && !video && !carousel)) {
    console.error('Usage: post-instagram.mjs --title "..." --url "https://..." (--image "https://..." | --video "https://..." | --images "url1,url2,...") [--excerpt "..."]')
    process.exit(1)
  }
  if (carousel && (carousel.length < 2 || carousel.length > 10)) {
    console.error(`--images needs 2-10 URLs for a carousel, got ${carousel.length}`)
    process.exit(1)
  }

  const caption = [title, excerpt, `Стаття на сайті: ${url}`].filter(Boolean).join("\n\n")

  let creationId
  if (carousel) {
    const children = []
    for (const imageUrl of carousel) {
      const child = await graphPost(`${igUserId}/media`, {
        image_url: imageUrl,
        is_carousel_item: true,
        access_token: token,
      })
      children.push(child.id)
    }
    const container = await graphPost(`${igUserId}/media`, {
      media_type: "CAROUSEL",
      children: children.join(","),
      caption,
      access_token: token,
    })
    await waitUntilFinished(container.id, token)
    creationId = container.id
  } else if (video) {
    const container = await graphPost(`${igUserId}/media`, {
      media_type: "REELS",
      video_url: video,
      caption,
      access_token: token,
    })
    await waitUntilFinished(container.id, token)
    creationId = container.id
  } else {
    const container = await graphPost(`${igUserId}/media`, {
      image_url: image,
      caption,
      access_token: token,
    })
    creationId = container.id
  }

  const published = await graphPost(`${igUserId}/media_publish`, {
    creation_id: creationId,
    access_token: token,
  })

  console.log(`Posted to Instagram: media_id=${published.id}`)
}

main().catch((err) => {
  console.error(err.message)
  process.exit(1)
})
