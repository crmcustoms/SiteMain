// Turns a validated article object into a content/blog/uk/<slug>.md file.
// Uses gray-matter's own stringify (not hand-built YAML strings) so
// quoting/escaping matches exactly what lib/content.ts expects to parse.

import fs from "fs"
import path from "path"
import matter from "gray-matter"
import { VALIDATION, DEFAULT_CTA, GENERATOR_ID, SEED_GENERATOR_ID, PATHS } from "./config.mjs"
import { wordCount } from "./validate.mjs"

export function computeReadTime(body) {
  const minutes = Math.max(1, Math.round(wordCount(body) / VALIDATION.wordsPerMinute))
  const word = minutes === 1 ? "хвилина" : minutes < 5 ? "хвилини" : "хвилин"
  return `${minutes} ${word} читання`
}

// Builds the frontmatter object. `seed` is the seed-angles.json entry when
// this article expanded a seed angle (sets a different generator marker so
// it doesn't shift the recurring rotation index).
export function buildFrontmatter(article, { slotType, seed }) {
  return {
    title: article.title,
    date: new Date().toISOString().slice(0, 10),
    // Written explicitly (not left to the file-name fallback in
    // lib/content.ts) so the post-write round-trip check in validate.mjs
    // has something real to compare against.
    slug: article.slug,
    excerpt: article.excerpt,
    tag: article.tag,
    tags: article.tags,
    readTime: computeReadTime(article.body_markdown),
    author: "CRMCUSTOMS",
    ctaTitle: article.ctaTitle || DEFAULT_CTA.ctaTitle,
    ctaText: article.ctaText || DEFAULT_CTA.ctaText,
    ctaLabel: DEFAULT_CTA.ctaLabel,
    ctaHref: DEFAULT_CTA.ctaHref,
    // Autopost-specific fields — lib/content.ts ignores unknown keys, so
    // these are invisible to the site but drive rotation/dedup/audit.
    generator: seed ? SEED_GENERATOR_ID : GENERATOR_ID,
    slotType,
    topicKey: article.topicKey,
  }
}

export function writeArticleFile({ article, frontmatter, cwd = process.cwd(), outDir }) {
  const dir = outDir || path.join(cwd, PATHS.contentBlogDir)
  fs.mkdirSync(dir, { recursive: true })
  const filePath = path.join(dir, `${article.slug}.md`)

  if (fs.existsSync(filePath)) {
    throw new Error(`Refusing to overwrite existing file: ${filePath}`)
  }

  const file = matter.stringify(article.body_markdown.trim() + "\n", frontmatter)

  // Atomic-ish write: write to a temp file, then rename, so a crash mid-write
  // never leaves a half-written .md file in content/.
  const tmpPath = `${filePath}.tmp`
  fs.writeFileSync(tmpPath, file, "utf-8")
  fs.renameSync(tmpPath, filePath)

  return filePath
}
