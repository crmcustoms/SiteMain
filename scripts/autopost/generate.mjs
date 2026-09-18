#!/usr/bin/env node
// Generates one article for content/blog/uk/ and writes it, or prints it
// with --dry-run. Orchestrates: slot selection -> prompt composition ->
// OpenRouter call (Claude Sonnet 5 by default) -> validation (retry once on
// collision) -> file write.
//
// Usage:
//   node scripts/autopost/generate.mjs
//   node scripts/autopost/generate.mjs --slot howto --topic yak-obraty-crm-dlya-malogo-biznesu
//   node scripts/autopost/generate.mjs --seed-angle 3
//   node scripts/autopost/generate.mjs --dry-run
//
// Reads OPENROUTER_API_KEY/REPLICATE_API_TOKEN from .env.local (local
// runs) or process.env (CI).

import fs from "fs"
import path from "path"

import { CONFIG, PATHS, VALIDATION } from "./config.mjs"
import { loadCorpus, coveredList } from "./corpus.mjs"
import { pickSlot, pickSeedAngle, pickTopic } from "./slots.mjs"
import { generateArticle, OpenRouterError } from "./llm.mjs"
import { validateArticle, loadBrandApprovedText, roundTripCheck } from "./validate.mjs"
import { buildFrontmatter, writeArticleFile } from "./frontmatter.mjs"
import { generateIllustration, IllustrationError } from "./illustrate.mjs"

const CWD = process.cwd()

function loadEnvLocal() {
  const envPath = path.join(CWD, ".env.local")
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
  const args = { dryRun: false }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === "--dry-run") { args.dryRun = true; continue }
    if (a.startsWith("--")) { args[a.slice(2)] = argv[i + 1]; i++ }
  }
  return args
}

function readPrompt(name) {
  return fs.readFileSync(path.join(CWD, PATHS.promptsDir, name), "utf-8")
}

function composeSystemPrompt(brandText) {
  return `${readPrompt("system.uk.md")}\n\n---\n\nBRAND.md:\n\n${brandText}`
}

function composeUserPrompt({ slot, seed, topic, covered, retryNote }) {
  const parts = []

  if (seed) {
    parts.push(readPrompt("slot-angle-seed.md"))
    parts.push(
      [
        "",
        "ГОТОВИЙ КУТ (розгорни цей, не вигадуй новий):",
        `topicKey для відповіді: ${seed.key}`,
        `hooks: ${JSON.stringify(seed.hooks)}`,
        `claim: ${seed.claim}`,
        `insight_hint: ${seed.insight_hint}`,
        `raw_source_unverified (контекст, НЕ джерело фактів): ${seed.raw_source_unverified}`,
        `fact_status: ${seed.fact_status}`,
      ].join("\n"),
    )
  } else {
    parts.push(readPrompt(`slot-${slot}.md`))
    if (topic) {
      parts.push(
        [
          "",
          "ТЕМА ЦІЄЇ СТАТТІ:",
          `topicKey для відповіді: ${topic.key}`,
          `Підказка: ${topic.hint}`,
          `Ключові слова: ${(topic.keywords || []).join(", ")}`,
        ].join("\n"),
      )
    } else {
      parts.push(
        [
          "",
          "Тему для цієї статті придумай сам — у межах свого мандату, унікальну",
          "відносно списку вже опублікованого нижче. Сформулюй короткий",
          "topicKey (kebab-case, латиницею, без діакритики).",
        ].join("\n"),
      )
    }
  }

  parts.push("", "ВЖЕ ОПУБЛІКОВАНО — не повторювати ні тему, ні кут, ні перефразування:", covered || "(поки що нічого не опубліковано)")

  if (retryNote) {
    parts.push("", `УВАГА: попередня спроба відхилена — ${retryNote}`)
  }

  return parts.join("\n")
}

// Inserts N illustrations at roughly evenly-spaced `## ` section headings
// (never the very first — that reads as "in the middle" for the 3-5 section
// articles this pipeline produces). Falls back to a single insertion after
// the first paragraph if the body has fewer than 2 headings. Insertions run
// from the LAST heading backward so earlier offsets stay valid as the body
// grows.
function insertIllustrationsMarkdown(body, images) {
  const headings = [...body.matchAll(/^## .+$/gm)]
  if (headings.length < 2) {
    const imageLine = images.map((img) => `\n![${img.alt}](${img.path})\n`).join("\n")
    const firstBreak = body.indexOf("\n\n")
    if (firstBreak === -1) return body + imageLine
    return body.slice(0, firstBreak) + imageLine + body.slice(firstBreak)
  }

  // Evenly spaced heading indices in [1, headings.length - 1] — skip heading
  // 0 (the intro) the same way the single-image version always did.
  const n = images.length
  const slots = images.map((_, i) => {
    const idx = Math.round(((i + 1) * headings.length) / (n + 1))
    return Math.min(Math.max(idx, 1), headings.length - 1)
  })

  let result = body
  for (let i = n - 1; i >= 0; i--) {
    const at = headings[slots[i]].index
    const imageLine = `\n![${images[i].alt}](${images[i].path})\n\n`
    result = result.slice(0, at) + imageLine + result.slice(at)
  }
  return result
}

// Best-effort: a failed illustration should never block publishing a
// validated, safe article. Returns the (possibly unchanged) body and how
// many images actually got added (fewer than requested is fine — a partial
// set beats none).
async function tryAddIllustration(article, cwd) {
  const scenes = article.illustrations
  if (!Array.isArray(scenes) || scenes.length === 0) {
    console.error("[autopost] no illustrations from the model — publishing without images")
    return { body: article.body_markdown, added: 0 }
  }

  const placed = []
  for (let i = 0; i < scenes.length; i++) {
    const { scene, alt } = scenes[i]
    if (!scene) continue
    try {
      const bytes = await generateIllustration(scene, { cwd })
      const relPath = `/images/blog/${article.slug}-illustration-${i + 1}.jpg`
      const absPath = path.join(cwd, "public", relPath)
      fs.mkdirSync(path.dirname(absPath), { recursive: true })
      fs.writeFileSync(absPath, bytes)
      console.error(`[autopost] illustration ${i + 1}/${scenes.length} written to public${relPath}`)
      placed.push({ path: relPath, alt: alt || article.title })
    } catch (err) {
      if (err instanceof IllustrationError) {
        console.error(`[autopost] illustration ${i + 1} failed (${err.message}) — skipping just this one`)
      } else {
        console.error(`[autopost] unexpected error on illustration ${i + 1} — skipping just this one:`, err)
      }
    }
  }

  if (placed.length === 0) return { body: article.body_markdown, added: 0 }
  return { body: insertIllustrationsMarkdown(article.body_markdown, placed), added: placed.length }
}

// One corrective sentence per validation error code, fed back into the
// single retry attempt. Falls back to a generic "fix this" for any code
// added to validate.mjs without a specific message here — still strictly
// better than the old silent blind-retry for unlisted codes.
function describeErrorForRetry({ code, detail }) {
  const messages = {
    MISSING_FIELDS: `у відповіді бракувало обов'язкових полів (${detail}) — цього разу поверни emit_article з усіма полями заповненими.`,
    TAGS_NOT_ARRAY: `поле tags має бути масивом рядків, а не ${detail} — виправ формат.`,
    TAGS_COUNT: `tags має 2-4 елементи, було ${detail} — підбери правильну кількість.`,
    TAGS_INVALID_ITEM: `один з елементів tags некоректний (${detail}) — усі мають бути непорожніми рядками.`,
    TITLE_LENGTH: `заголовок не в межах 25-90 символів (${detail}) — переформулюй коротше/довше.`,
    EXCERPT_LENGTH: `excerpt не в межах 80-200 символів (${detail}) — підправ довжину.`,
    TAG_NOT_IN_VOCABULARY: `tag "${detail}" не входить у затверджений список категорій сайту — візьми один з дозволених.`,
    BODY_WORD_COUNT: `текст статті ${detail}, потрібно 700-1400 слів — допиши або скороти.`,
    MIXED_SCRIPT_WORD: `слово "${detail}" змішує кирилицю й латиницю в одному слові — виправ на суцільну кирилицю або суцільну латиницю.`,
    LOW_CYRILLIC_RATIO: `забагато латинських символів у тексті (кирилиця лише ${detail}) — перепиши українською, залишивши лише дозволені терміни (Planfix, CRM, n8n тощо) латиницею.`,
    LATIN_RUN: `${detail} підряд — не більше 2 латинських слів підряд поза дозволеним списком термінів, розбий речення.`,
    RUSSIAN_CHARS: `у тексті трапляються російські літери (${detail}) — це має бути чиста українська, без ы/ъ/ё/э.`,
    FORBIDDEN_SOURCE: `у тексті згадано заборонене джерело/конкурента (${detail}) — прибери цю згадку повністю.`,
    UNAPPROVED_STAT: `цифра "${detail}" не підтверджена в BRAND.md APPROVED CLAIMS — прибери цю статистику або переформулюй без конкретного числа, не вигадуй нову.`,
    FORBIDDEN_HTML_TAG: `у тілі є заборонений HTML-тег (${detail}) — прибери його, лишились дозволені: div/p/strong/em/br/span/ul/ol/li/a/h2/h3.`,
    HTML_EVENT_HANDLER: `у тілі є обробник подій (${detail}) — прибери його, це заборонено.`,
    JS_URL: `у тілі є javascript: URL — прибери його.`,
    DISALLOWED_HTML_TAG: `тег <${detail}> не входить у дозволений список — прибери або заміни на дозволений.`,
    DISALLOWED_HTML_CLASS: `клас "${detail}" не входить у дозволений список (pullquote/highlight-box/warning/scale-grid/scale-card/scale-label) — прибери або заміни.`,
    UNBALANCED_DIV: `у тілі не збігається кількість відкритих і закритих <div> — перевір розмітку.`,
    H1_IN_BODY: `у тілі є заголовок першого рівня (# ...) — заголовки в тілі статті мають бути ## або ###, title йде окремо у frontmatter.`,
    TITLE_COLLISION: `заголовок надто схожий на вже опубліковане "${detail}" — візьми інший ракурс чи тему.`,
    SLUG_EXISTS: `slug "${detail}" вже зайнятий — згенеруй інший slug для тієї самої теми.`,
    TOPIC_KEY_USED: `topicKey "${detail}" вже використаний — якщо це та сама задана тема, зроби інший кут; якщо тему обираєш сам, візьми геть іншу.`,
    ILLUSTRATIONS_NOT_ARRAY: `поле illustrations було некоректне (${detail}) — цього разу віддай РІВНО 2-3 illustrations, кожна — окрема сцена, з непорожніми "scene" і "alt".`,
    ILLUSTRATIONS_COUNT: `було ${detail}, а треба рівно 2-3 — додай або прибери сцени.`,
    ILLUSTRATIONS_INVALID_ITEM: `один з елементів illustrations некоректний (${detail}) — кожен має мати непорожні "scene" і "alt".`,
  }
  return messages[code] || `виправ помилку ${code} (${detail}).`
}

function setOutput(name, value) {
  const outFile = process.env.GITHUB_OUTPUT
  if (!outFile) return
  const delimiter = `EOF_${Math.random().toString(36).slice(2)}`
  fs.appendFileSync(outFile, `${name}<<${delimiter}\n${value}\n${delimiter}\n`)
}

async function runOnce({ slot, seed, topic, corpus, brandMdText, retryNote }) {
  const systemPrompt = composeSystemPrompt(brandMdText)
  const userPrompt = composeUserPrompt({
    slot,
    seed,
    topic,
    covered: coveredList(corpus, VALIDATION.coveredListSize),
    retryNote,
  })

  const { article, usage, model } = await generateArticle({ system: systemPrompt, user: userPrompt, slot })
  const result = validateArticle(article, { corpus, brandMdText })
  return { article, usage, model, result }
}

async function main() {
  // Merge every .env.local value into process.env (without overriding a
  // real CI-provided value) — not just OPENROUTER_API_KEY. llm.mjs and
  // illustrate.mjs both read process.env directly, so a var loaded here
  // but left off process.env is invisible to them.
  const envLocal = loadEnvLocal()
  for (const [key, value] of Object.entries(envLocal)) {
    if (!process.env[key]) process.env[key] = value
  }

  const args = parseArgs(process.argv.slice(2))
  const corpus = loadCorpus(CWD)
  const brandMdText = loadBrandApprovedText(CWD, PATHS.brandFile)

  const slot = pickSlot(corpus, args.slot, CWD)
  const seed = pickSeedAngle(corpus, slot, args["seed-angle"], CWD)
  const topic = seed ? null : pickTopic(corpus, slot, args.topic, CWD)

  console.error(`[autopost] slot=${slot} seed=${seed ? seed.key : "-"} topic=${topic ? topic.key : "(model-proposed)"} model=${CONFIG.model}`)

  let attempt = await runOnce({ slot, seed, topic, corpus, brandMdText })

  if (!attempt.result.ok) {
    // Every validation failure gets one corrective retry — not just the
    // handful of codes this used to special-case. A blind identical retry
    // (the old behavior for anything outside that short allowlist) just
    // burns an attempt and fails differently each time, which is exactly
    // what left 2026-09-18 stuck needing a manual run: LATIN_RUN on try 1,
    // TAGS_NOT_ARRAY on try 2, neither retry actually told the model what
    // to fix. Building one note per error code and retrying always is
    // strictly more likely to converge than hoping the same prompt lands
    // differently by chance.
    const retryNote = attempt.result.errors.map((e) => describeErrorForRetry(e)).join(" ")
    console.error(`[autopost] validation failed on first attempt (${attempt.result.errors.map((e) => e.code).join(", ")}) — retrying once with corrections`)
    attempt = await runOnce({ slot, seed, topic, corpus, brandMdText, retryNote })
  }

  if (!attempt.result.ok) {
    console.error("[autopost] VALIDATION FAILED — nothing written")
    for (const e of attempt.result.errors) console.error(`  - ${e.code}: ${e.detail}`)
    process.exit(1)
  }

  const { article, usage, model, result } = attempt
  const frontmatter = buildFrontmatter(article, { slotType: slot, seed, date: args.date })

  console.error(`[autopost] OK — ${result.words} words, cyrillic ratio ${result.cyrRatio}`)
  console.error(`[autopost] tokens: input=${usage?.input_tokens} output=${usage?.output_tokens} model=${model}`)

  if (args.dryRun) {
    console.error("[autopost] --dry-run: skipping illustration generation (costs money, not needed to validate text)")
    console.log(JSON.stringify({ frontmatter, body: article.body_markdown }, null, 2))
    return
  }

  const illustrated = await tryAddIllustration(article, CWD)
  article.body_markdown = illustrated.body

  const outDir = args.out ? path.resolve(CWD, args.out) : undefined
  const filePath = writeArticleFile({ article, frontmatter, cwd: CWD, outDir })

  const roundTrip = roundTripCheck(filePath, { ...article, ...frontmatter })
  if (!roundTrip.ok) {
    fs.unlinkSync(filePath)
    console.error(`[autopost] ROUND_TRIP_MISMATCH: ${roundTrip.detail} — file removed, nothing published`)
    process.exit(1)
  }

  console.error(`[autopost] wrote ${filePath}`)

  setOutput("slug", article.slug)
  setOutput("title", article.title)
  setOutput("excerpt", article.excerpt)
  setOutput("slot_type", slot)
  setOutput("word_count", String(result.words))
  setOutput("cyr_ratio", String(result.cyrRatio.toFixed(3)))
  setOutput("model", model)
  setOutput("illustrated", String(illustrated.added))
}

main().catch((err) => {
  if (err instanceof OpenRouterError) {
    console.error(`[autopost] OpenRouter API error: ${err.message}`)
  } else if (err instanceof IllustrationError) {
    // Should be unreachable — tryAddIllustration catches this itself so a
    // bad illustration never blocks a valid article. Surfaced here only as
    // a safety net if that changes.
    console.error(`[autopost] illustration error escaped its handler: ${err.message}`)
  } else {
    console.error("[autopost] fatal error:", err)
  }
  process.exit(1)
})
