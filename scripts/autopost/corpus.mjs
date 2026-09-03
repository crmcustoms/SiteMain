// Reads existing published content so the generator knows what's already
// been said. No database, no separate state file — the corpus IS the state.

import fs from "fs"
import path from "path"
import matter from "gray-matter"
import { PATHS } from "./config.mjs"

function readDir(dir) {
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((file) => {
      const raw = fs.readFileSync(path.join(dir, file), "utf-8")
      const { data } = matter(raw)
      return {
        file,
        slug: data.slug || file.replace(/\.md$/, ""),
        title: data.title || "",
        tag: data.tag || null,
        tags: data.tags || [],
        date: data.date || null,
        generator: data.generator || null,
        slotType: data.slotType || null,
        topicKey: data.topicKey || null,
      }
    })
}

// Full corpus: blog + cases, newest first. Used for slug/topic collision
// checks and the "already covered" prompt block.
export function loadCorpus(cwd = process.cwd()) {
  const blog = readDir(path.join(cwd, PATHS.contentBlogDir))
  const cases = readDir(path.join(cwd, PATHS.contentCasesDir))
  return [...blog, ...cases].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
}

export function coveredList(corpus, limit) {
  return corpus
    .filter((p) => p.title)
    .slice(0, limit)
    .map((p) => `- «${p.title}»${p.tag ? ` [${p.tag}]` : ""}`)
    .join("\n")
}

export function slugExists(corpus, slug) {
  return corpus.some((p) => p.slug === slug)
}

export function topicKeyUsed(corpus, topicKey) {
  return corpus.some((p) => p.topicKey === topicKey)
}
