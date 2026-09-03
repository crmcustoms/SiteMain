#!/usr/bin/env node
// Given a list of file paths (from a git diff of newly added files), prints
// a JSON array of {title, excerpt, slug, url, image, illustrationUrl} for
// every new content/blog/uk/*.md file among them. Used by the
// social-crosspost workflow to build its matrix — one entry per newly
// published post.
//
// `image` is the branded OG cover (used for Telegram/Facebook, matches the
// site's own og:image). `illustrationUrl` is the AI-generated in-article
// illustration if one was written for this post (used for Instagram, which
// needs an actual photo/illustration, not a text-card cover) — empty
// string if the post has none (autopost's illustration step is best-effort
// and can skip it).
//
// Usage: node scripts/social/get-new-posts.mjs content/blog/uk/foo.md ...

import fs from "fs"
import path from "path"
import matter from "gray-matter"

const SITE_URL = "https://crmcustoms.com"

function toAbsoluteUrl(url) {
  if (!url) return ""
  return url.startsWith("http") ? url : `${SITE_URL}${url}`
}

const files = process.argv
  .slice(2)
  .filter((f) => f.startsWith("content/blog/uk/") && f.endsWith(".md"))

const posts = files
  .filter((f) => fs.existsSync(f))
  .map((f) => {
    const raw = fs.readFileSync(f, "utf-8")
    const { data } = matter(raw)
    const slug = data.slug || path.basename(f, ".md")
    const title = data.title || ""
    const image = data.image || `/api/og/${encodeURIComponent(title)}/${encodeURIComponent(data.tag || "")}`

    const illustrationRelPath = `public/images/blog/${slug}-illustration-1.jpg`
    const illustrationUrl = fs.existsSync(illustrationRelPath)
      ? toAbsoluteUrl(`/images/blog/${slug}-illustration-1.jpg`)
      : ""

    return {
      slug,
      title,
      excerpt: data.excerpt || "",
      url: `${SITE_URL}/uk/blog/${slug}`,
      image: toAbsoluteUrl(image),
      illustrationUrl,
    }
  })

console.log(JSON.stringify(posts))
