// Every gate a generated article must pass BEFORE it is ever written to
// content/blog/uk/. Each check is a pure function returning {ok, code,
// detail}. validateArticle() runs all of them and collects failures —
// nothing is written if the result is not ok.

import fs from "fs"
import path from "path"
import matter from "gray-matter"
import { LATIN_ALLOWLIST, TAG_VOCABULARY, VALIDATION } from "./config.mjs"
import { slugExists, topicKeyUsed } from "./corpus.mjs"

const FORBIDDEN_SOURCES = /gartner|forrester|mckinsey|statista|\bidc\b|hubspot/i
const FORBIDDEN_HTML_TAGS = /<\/?(script|style|iframe|img|form)\b/i
const ON_ATTR = /\son\w+\s*=/i
const JS_URL = /javascript:/i

function stripForTextChecks(body) {
  return body
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\]\([^)]*\)/g, "] ")
    .replace(/https?:\/\/\S+/g, " ")
}

// --- individual checks -----------------------------------------------

export function checkRequiredFields(article) {
  const required = ["title", "excerpt", "tag", "tags", "slug", "topicKey", "body_markdown"]
  const missing = required.filter((k) => !article[k] || (Array.isArray(article[k]) && article[k].length === 0))
  return missing.length
    ? { ok: false, code: "MISSING_FIELDS", detail: missing.join(", ") }
    : { ok: true }
}

// Tool-call JSON schemas aren't always enforced strictly by every provider
// — a model can return `tags` as a plain string instead of an array and
// checkRequiredFields' truthy check won't catch it (a non-empty string is
// truthy). This caught exactly that on the first real run: tags came back
// as the literal string 'Про впровадження CRM", "Бізнес-процеси", "Аналітика'
// instead of a 3-element array, which would have broken the site's tag
// pills at render time.
export function checkTagsType(article) {
  if (!Array.isArray(article.tags)) {
    return { ok: false, code: "TAGS_NOT_ARRAY", detail: typeof article.tags }
  }
  if (article.tags.length < 2 || article.tags.length > 5) {
    return { ok: false, code: "TAGS_COUNT", detail: `${article.tags.length} tags` }
  }
  if (article.tags.some((t) => typeof t !== "string" || !t.trim())) {
    return { ok: false, code: "TAGS_INVALID_ITEM", detail: JSON.stringify(article.tags) }
  }
  return { ok: true }
}

export function checkLengths(article) {
  const { title, excerpt } = article
  if (title.length < VALIDATION.titleMin || title.length > VALIDATION.titleMax) {
    return { ok: false, code: "TITLE_LENGTH", detail: `${title.length} chars: "${title}"` }
  }
  if (excerpt.length < VALIDATION.excerptMin || excerpt.length > VALIDATION.excerptMax) {
    return { ok: false, code: "EXCERPT_LENGTH", detail: `${excerpt.length} chars: "${excerpt}"` }
  }
  return { ok: true }
}

export function checkTagVocabulary(article) {
  return TAG_VOCABULARY.includes(article.tag)
    ? { ok: true }
    : { ok: false, code: "TAG_NOT_IN_VOCABULARY", detail: article.tag }
}

export function wordCount(body) {
  const stripped = stripForTextChecks(body)
  return stripped.split(/\s+/).filter(Boolean).length
}

export function checkBodyWordCount(body) {
  const n = wordCount(body)
  return n >= VALIDATION.bodyWordsMin && n <= VALIDATION.bodyWordsMax
    ? { ok: true, words: n }
    : { ok: false, code: "BODY_WORD_COUNT", detail: `${n} words`, words: n }
}

// Cyrillic-vs-Latin ratio, ignoring product-name allowlist and numbers.
// Also throws on mixed-script single words (e.g. "Reробота").
export function cyrillicCheck(body) {
  const stripped = stripForTextChecks(body)
  const words = stripped.split(/[^\p{L}\p{N}]+/u).filter(Boolean)
  let cyr = 0
  let lat = 0
  let latRun = 0
  let maxLatRun = 0

  for (const w of words) {
    const lw = w.toLowerCase()
    if (/^\d+$/.test(lw)) continue
    const hasCyr = /\p{Script=Cyrillic}/u.test(w)
    const hasLat = /\p{Script=Latin}/u.test(w)

    if (hasCyr && hasLat) {
      return { ok: false, code: "MIXED_SCRIPT_WORD", detail: w }
    }
    if (LATIN_ALLOWLIST.has(lw)) {
      latRun = 0
      continue
    }
    if (hasCyr) {
      cyr++
      latRun = 0
    } else if (hasLat) {
      lat++
      latRun++
      maxLatRun = Math.max(maxLatRun, latRun)
    }
  }

  const ratio = cyr / (cyr + lat || 1)
  if (ratio < VALIDATION.cyrillicRatioMin) {
    return { ok: false, code: "LOW_CYRILLIC_RATIO", detail: ratio.toFixed(3), ratio }
  }
  if (maxLatRun > VALIDATION.latinRunMax) {
    return { ok: false, code: "LATIN_RUN", detail: `${maxLatRun} consecutive Latin words` }
  }
  return { ok: true, ratio }
}

export function checkRussianChars(body) {
  const stripped = stripForTextChecks(body)
  const hits = stripped.match(VALIDATION.russianCharPattern) || []
  return hits.length > VALIDATION.russianCharMaxHits
    ? { ok: false, code: "RUSSIAN_CHARS", detail: `${hits.length} occurrences` }
    : { ok: true }
}

// Every %-figure and "у N разів" phrase in the body must appear verbatim
// in brand.md's APPROVED CLAIMS section. Any forbidden-source keyword
// fails outright.
export function checkFabricatedStats(body, brandMdText) {
  if (FORBIDDEN_SOURCES.test(body)) {
    return { ok: false, code: "FORBIDDEN_SOURCE", detail: body.match(FORBIDDEN_SOURCES)[0] }
  }

  const percentPattern = /\d+(?:[.,]\d+)?\s*%/g
  const timesPattern = /у\s+\d+(?:[.,]\d+)?\s*раз[иів]*/gi

  const approved = new Set([
    ...(brandMdText.match(percentPattern) || []),
    ...(brandMdText.match(timesPattern) || []).map((s) => s.toLowerCase()),
  ])

  const bodyPercents = body.match(percentPattern) || []
  const bodyTimes = (body.match(timesPattern) || []).map((s) => s.toLowerCase())

  for (const p of bodyPercents) {
    if (!approved.has(p)) return { ok: false, code: "UNAPPROVED_STAT", detail: p }
  }
  for (const t of bodyTimes) {
    if (!approved.has(t)) return { ok: false, code: "UNAPPROVED_STAT", detail: t }
  }
  return { ok: true }
}

export function checkHtmlAllowlist(body) {
  if (FORBIDDEN_HTML_TAGS.test(body)) {
    return { ok: false, code: "FORBIDDEN_HTML_TAG", detail: body.match(FORBIDDEN_HTML_TAGS)[0] }
  }
  if (ON_ATTR.test(body)) return { ok: false, code: "HTML_EVENT_HANDLER", detail: body.match(ON_ATTR)[0] }
  if (JS_URL.test(body)) return { ok: false, code: "JS_URL", detail: "javascript: URL found" }

  const tagPattern = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>/g
  let match
  let openCount = 0
  while ((match = tagPattern.exec(body))) {
    const [full, tagName, attrs] = match
    if (!VALIDATION.allowedHtmlTags.has(tagName.toLowerCase())) {
      return { ok: false, code: "DISALLOWED_HTML_TAG", detail: tagName }
    }
    const classMatch = attrs.match(/class="([^"]*)"/)
    if (classMatch) {
      const classes = classMatch[1].split(/\s+/).filter(Boolean)
      for (const c of classes) {
        if (!VALIDATION.allowedHtmlClasses.has(c)) {
          return { ok: false, code: "DISALLOWED_HTML_CLASS", detail: c }
        }
      }
    }
    if (tagName.toLowerCase() === "div") {
      if (!full.startsWith("</")) openCount++
      else openCount--
    }
  }
  if (openCount !== 0) return { ok: false, code: "UNBALANCED_DIV", detail: `openCount=${openCount}` }
  return { ok: true }
}

export function checkNoH1(body) {
  return /^#\s/m.test(body)
    ? { ok: false, code: "H1_IN_BODY", detail: "body contains a top-level # heading" }
    : { ok: true }
}

function normalizeTitle(t) {
  return t.toLowerCase().replace(/[«»"'?!.,:;—–-]/g, "").split(/\s+/).filter(Boolean)
}

function jaccard(a, b) {
  const sa = new Set(a)
  const sb = new Set(b)
  const intersection = [...sa].filter((x) => sb.has(x)).length
  const union = new Set([...sa, ...sb]).size
  return union === 0 ? 0 : intersection / union
}

export function checkTitleCollision(article, corpus) {
  const tokens = normalizeTitle(article.title)
  for (const post of corpus) {
    if (!post.title) continue
    const sim = jaccard(tokens, normalizeTitle(post.title))
    if (sim > VALIDATION.titleJaccardMax) {
      return { ok: false, code: "TITLE_COLLISION", detail: `${(sim * 100).toFixed(0)}% vs "${post.title}"` }
    }
  }
  return { ok: true }
}

export function checkSlugCollision(article, corpus) {
  if (slugExists(corpus, article.slug)) {
    return { ok: false, code: "SLUG_EXISTS", detail: article.slug }
  }
  return { ok: true }
}

export function checkTopicKeyCollision(article, corpus) {
  if (topicKeyUsed(corpus, article.topicKey)) {
    return { ok: false, code: "TOPIC_KEY_USED", detail: article.topicKey }
  }
  return { ok: true }
}

// --- orchestration -----------------------------------------------------

export function loadBrandApprovedText(cwd, brandPath) {
  return fs.readFileSync(path.join(cwd, brandPath), "utf-8")
}

// Runs every check. Returns { ok, errors: [{code, detail}], words, cyrRatio }.
export function validateArticle(article, { corpus, brandMdText }) {
  const errors = []
  const push = (r) => {
    if (!r.ok) errors.push({ code: r.code, detail: r.detail })
    return r
  }

  push(checkRequiredFields(article))
  if (errors.length) return { ok: false, errors }

  push(checkTagsType(article))
  if (errors.length) return { ok: false, errors }

  push(checkLengths(article))
  push(checkTagVocabulary(article))

  const wc = push(checkBodyWordCount(article.body_markdown))
  const cyr = push(cyrillicCheck(article.body_markdown))
  push(checkRussianChars(article.body_markdown))
  push(checkFabricatedStats(article.body_markdown, brandMdText))
  push(checkHtmlAllowlist(article.body_markdown))
  push(checkNoH1(article.body_markdown))
  push(checkTitleCollision(article, corpus))
  push(checkSlugCollision(article, corpus))
  push(checkTopicKeyCollision(article, corpus))

  return {
    ok: errors.length === 0,
    errors,
    words: wc.words,
    cyrRatio: cyr.ratio,
  }
}

// Round-trip check: write, re-read via gray-matter, compare. Run by
// frontmatter.mjs right after writing, kept here since it's a validator.
export function roundTripCheck(filePath, expected) {
  const raw = fs.readFileSync(filePath, "utf-8")
  const { data } = matter(raw)
  const mismatches = []
  for (const key of ["title", "excerpt", "tag", "slug"]) {
    if (data[key] !== expected[key]) mismatches.push(key)
  }
  return mismatches.length
    ? { ok: false, code: "ROUND_TRIP_MISMATCH", detail: mismatches.join(", ") }
    : { ok: true }
}
