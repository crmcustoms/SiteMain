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
    parts.push("", `УВАГА: попередня спроба відхилена — ${retryNote}. Візьми інший ракурс чи тему, той самий формат.`)
  }

  return parts.join("\n")
}

// Inserts the illustration markdown before the second `## ` section heading
// — roughly after the first section, which reads as "in the middle" for the
// 3-5 section articles this pipeline produces. Falls back to right after
// the first paragraph if the body has fewer than two headings.
function insertIllustrationMarkdown(body, imagePath, alt) {
  const imageLine = `\n![${alt}](${imagePath})\n`
  const headings = [...body.matchAll(/^## .+$/gm)]
  if (headings.length >= 2) {
    const at = headings[1].index
    return body.slice(0, at) + imageLine + "\n" + body.slice(at)
  }
  const firstBreak = body.indexOf("\n\n")
  if (firstBreak === -1) return body + imageLine
  return body.slice(0, firstBreak) + imageLine + body.slice(firstBreak)
}

// Best-effort: a failed illustration should never block publishing a
// validated, safe article. Returns the (possibly unchanged) body and
// whether an image was actually added.
async function tryAddIllustration(article, cwd) {
  if (!article.illustration_scene) {
    console.error("[autopost] no illustration_scene from the model — publishing without an illustration")
    return { body: article.body_markdown, added: false }
  }
  try {
    const bytes = await generateIllustration(article.illustration_scene, { cwd })
    const relPath = `/images/blog/${article.slug}-illustration-1.jpg`
    const absPath = path.join(cwd, "public", relPath)
    fs.mkdirSync(path.dirname(absPath), { recursive: true })
    fs.writeFileSync(absPath, bytes)
    const alt = article.illustration_alt || article.title
    console.error(`[autopost] illustration written to public${relPath}`)
    return { body: insertIllustrationMarkdown(article.body_markdown, relPath, alt), added: true }
  } catch (err) {
    if (err instanceof IllustrationError) {
      console.error(`[autopost] illustration generation failed (${err.message}) — publishing without an illustration`)
    } else {
      console.error("[autopost] unexpected illustration error — publishing without an illustration:", err)
    }
    return { body: article.body_markdown, added: false }
  }
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
    const collisionCodes = new Set(["TITLE_COLLISION", "SLUG_EXISTS", "TOPIC_KEY_USED"])
    const collision = attempt.result.errors.find((e) => collisionCodes.has(e.code))
    if (collision) {
      console.error(`[autopost] collision on first attempt (${collision.code}: ${collision.detail}) — retrying once`)
      attempt = await runOnce({
        slot, seed, topic, corpus, brandMdText,
        retryNote: `тема/заголовок дублює "${collision.detail}"`,
      })
    }
  }

  if (!attempt.result.ok) {
    console.error("[autopost] VALIDATION FAILED — nothing written")
    for (const e of attempt.result.errors) console.error(`  - ${e.code}: ${e.detail}`)
    process.exit(1)
  }

  const { article, usage, model, result } = attempt
  const frontmatter = buildFrontmatter(article, { slotType: slot, seed })

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
