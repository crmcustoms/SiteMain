// Single tuning surface for the autoposting system. Change values here,
// not in generate.mjs/validate.mjs/slots.mjs.

// Model: env override > this default. Keep this the ONLY place a model id
// is hardcoded, per the plan — a budget decision later is a one-line change.
// Calls go through OpenRouter (see llm.mjs), so this is an OpenRouter model
// slug ("<provider>/<model>"), not a raw Anthropic model id. Confirmed live
// on openrouter.ai/anthropic/claude-sonnet-5 — $2/$10 per 1M input/output
// tokens, same as Anthropic's direct-API price for this model.
export const DEFAULT_MODEL = "anthropic/claude-sonnet-5"

export const CONFIG = {
  model: process.env.AUTOPOST_MODEL || DEFAULT_MODEL,
  maxTokens: 8000,
  // Higher temperature for the more "voice"-driven slots, lower for
  // procedural how-to content where consistency matters more than flair.
  temperature: { angle: 0.9, myth: 0.8, question: 0.7, howto: 0.5 },
  retries: 3,
  retryDelaysMs: [2000, 8000, 30000],
}

// 12-slot rotation cycle. Index = count of already-generated posts (mod
// length) — see slots.mjs. No two "angle" slots are adjacent; opens on
// "howto" so the very first automated post (after any seed angles queued
// ahead of it) is low-risk and procedural.
export const SLOT_CYCLE = [
  "howto",
  "angle",
  "howto",
  "myth",
  "angle",
  "question",
  "howto",
  "angle",
  "myth",
  "howto",
  "angle",
  "question",
]

// Marker written to frontmatter.generator for posts produced by this
// system. Bump the suffix (v2, v3, ...) if the pipeline changes shape in a
// way that should reset how rotation/dedup reasons about history.
export const GENERATOR_ID = "autopost-v1"
export const SEED_GENERATOR_ID = "autopost-seed-v1"

// Closed tag vocabulary — the 16 values actually in use across
// content/blog/uk and content/cases/uk as of 2026-09. A generated post
// with a tag outside this list fails validation (keeps the site's tag
// filter from silently growing one-off chips). Extend by editing this
// array, not by loosening the validator.
export const TAG_VOCABULARY = [
  "Про впровадження CRM",
  "Бізнес-процеси",
  "Аналітика",
  "Тендери",
  "Робота складу",
  "Робота з підрядниками",
  "Маркетплейси",
  "Маркетинг",
  "Лідогенерація",
  "Контроль за витратами по проекту",
  "Кейс",
  "Електронна комерція",
  "Інтернет магазин",
  "Документообіг",
  "HR",
  "AI",
]

// Product/tool names allowed in Latin script inside otherwise-Ukrainian
// body text (see validate.mjs cyrillicRatio). Lowercase, matched
// case-insensitively.
export const LATIN_ALLOWLIST = new Set([
  "planfix", "n8n", "crm", "telegram", "google", "sheets", "slides", "drive",
  "excel", "power", "bi", "api", "ai", "saas", "kpi", "erp", "salesforce",
  "bitrix24", "amocrm", "notion", "zapier", "make", "prozorro", "meetlognet",
  "docker", "python", "sql", "crmcustoms", "http", "https", "www", "com",
  "ua", "seo", "cta", "url", "pdf", "csv", "json", "url", "ok",
])

export const VALIDATION = {
  titleMin: 25,
  titleMax: 90,
  excerptMin: 80,
  excerptMax: 200,
  bodyWordsMin: 700,
  bodyWordsMax: 1400,
  cyrillicRatioMin: 0.92,
  latinRunMax: 2, // >2 consecutive non-allowlisted Latin words fails
  russianCharPattern: /[ыъёэ]/gi,
  russianCharMaxHits: 2,
  titleJaccardMax: 0.55,
  coveredListSize: 40,
  wordsPerMinute: 220, // for computed readTime, not model-guessed
  allowedHtmlTags: new Set(["div", "p", "strong", "em", "br", "span", "ul", "ol", "li", "a", "h2", "h3"]),
  allowedHtmlClasses: new Set([
    "pullquote", "highlight-box", "warning", "warning-icon",
    "scale-grid", "scale-card", "scale-label",
  ]),
}

// Default CTA for auto-generated posts — points at the audit landing page
// (confirmed live at /uk/landing/audit-crm) rather than the bare homepage.
export const DEFAULT_CTA = {
  ctaTitle: "Є питання по вашому випадку?",
  ctaText: "30 хвилин — і зрозумієте, що реально зробити у вашій компанії.",
  ctaLabel: "Записатись на аудит",
  ctaHref: "https://crmcustoms.com/uk/landing/audit-crm",
}

export const PATHS = {
  contentBlogDir: "content/blog/uk",
  contentCasesDir: "content/cases/uk",
  seedAnglesFile: "scripts/autopost/seed-angles.json",
  topicsFile: "scripts/autopost/topics.uk.json",
  brandFile: "scripts/autopost/brand.md",
  promptsDir: "scripts/autopost/prompts",
}
