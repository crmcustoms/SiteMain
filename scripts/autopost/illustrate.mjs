// Generates one in-article illustration via Replicate (flux-dev), following
// the same reliability pattern already proven in production for Kazkaua-app
// (D:\backup\Gedevan\Kazkaua-app\lib\replicate.ts): synchronous `Prefer:
// wait`, retry on 429 with Retry-After, a settle() poll for cold starts
// beyond that window, and an immediate download since Replicate's output
// URLs expire.
//
// Deliberately simpler than Kazkaua's version: text-to-image only (no
// reference/edit model, no LoRA) — a blog illustration has no recurring
// character to keep consistent across images, only a style, and the style
// lives in illustration-style.md as a fixed prompt prefix, not a trained
// adapter.

import fs from "fs"
import path from "path"

const MODEL = process.env.REPLICATE_MODEL || "black-forest-labs/flux-dev"
const SETTLE_MS = 360_000 // matches Kazkaua's measured worst-case cold start
const THROTTLE_RETRIES = 5

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export class IllustrationError extends Error {}

function loadStyleTemplate(cwd) {
  const md = fs.readFileSync(path.join(cwd, "scripts/autopost/illustration-style.md"), "utf-8")
  const match = md.match(/```\n([\s\S]+?)\n```/)
  if (!match) throw new IllustrationError("Could not find the fenced prompt template in illustration-style.md")
  return match[1]
}

async function settle(first, token, signal) {
  let current = first
  const until = Date.now() + SETTLE_MS
  while ((current.status === "starting" || current.status === "processing") && current.id) {
    if (Date.now() > until) return current
    await sleep(3000)
    const res = await fetch(`https://api.replicate.com/v1/predictions/${current.id}`, {
      signal,
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return current
    current = await res.json()
  }
  return current
}

// scene: short English scene description from the article's
// illustration_scene field. Returns the raw image bytes (jpg).
export async function generateIllustration(scene, { cwd = process.cwd(), signal } = {}) {
  const token = process.env.REPLICATE_API_TOKEN
  if (!token) throw new IllustrationError("REPLICATE_API_TOKEN is not set")

  const template = loadStyleTemplate(cwd)
  const prompt = template.replace("{SCENE}", scene)

  const input = {
    prompt,
    aspect_ratio: "3:2",
    output_format: "jpg",
    disable_safety_checker: true, // flux-dev only; the safety checker judges the finished image and is part coin toss
  }

  let res
  for (let attempt = 0; ; attempt++) {
    res = await fetch(`https://api.replicate.com/v1/models/${MODEL}/predictions`, {
      method: "POST",
      signal,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Prefer: "wait",
      },
      body: JSON.stringify({ input }),
    })
    if (res.status !== 429 || attempt >= THROTTLE_RETRIES) break
    const stated = Number(res.headers.get("retry-after"))
    const waitMs = Number.isFinite(stated) && stated > 0 ? stated * 1000 : 12_000 * (attempt + 1)
    await sleep(waitMs)
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => "")
    throw new IllustrationError(`Replicate responded ${res.status}: ${detail.slice(0, 200)}`)
  }

  let json = await res.json()
  if (json.error) throw new IllustrationError(`Replicate error: ${json.error}`)

  json = await settle(json, token, signal)
  if (json.error) throw new IllustrationError(`Replicate error: ${json.error}`)

  const url = Array.isArray(json.output) ? json.output[0] : json.output
  if (!url) throw new IllustrationError(`Replicate returned no image (status: ${json.status ?? "unknown"})`)

  // Downloaded immediately, not stored as a URL — Replicate's output links
  // expire, and the pipeline writes files into git anyway.
  const file = await fetch(url, { signal })
  if (!file.ok) throw new IllustrationError(`Could not download the generated image (${file.status})`)
  return new Uint8Array(await file.arrayBuffer())
}
