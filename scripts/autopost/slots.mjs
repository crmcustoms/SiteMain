// Slot (rubric) selection + topic/seed selection for a single generation run.

import fs from "fs"
import path from "path"
import { SLOT_CYCLE, GENERATOR_ID, SEED_GENERATOR_ID, PATHS } from "./config.mjs"
import { topicKeyUsed } from "./corpus.mjs"

function loadJson(file, cwd) {
  const p = path.join(cwd, file)
  if (!fs.existsSync(p)) return []
  return JSON.parse(fs.readFileSync(p, "utf-8"))
}

// Determine which slot runs next. `override` (from --slot) always wins.
export function pickSlot(corpus, override, cwd = process.cwd()) {
  if (override) {
    if (!SLOT_CYCLE.includes(override)) {
      throw new Error(`Unknown slot "${override}", expected one of: ${SLOT_CYCLE.join(", ")}`)
    }
    return override
  }
  // Count BOTH regular and seed-expanded autoposts here — every published
  // run is one tick of the weekly cadence and must advance the cycle,
  // whether that "angle" slot ended up expanding a seed or generating
  // fresh. If only GENERATOR_ID counted, an available seed would freeze
  // the index in place (a seed doesn't increment it) and the cycle would
  // re-resolve to "angle" on every run until all 7 seeds were drained —
  // seven angle posts back to back instead of one per week interspersed
  // with the other rubrics.
  const generated = corpus.filter((p) => p.generator === GENERATOR_ID || p.generator === SEED_GENERATOR_ID)
  return SLOT_CYCLE[generated.length % SLOT_CYCLE.length]
}

// For an "angle" slot: is there an unused seed angle to expand instead of
// generating a fresh one? Returns the seed object or null.
export function pickSeedAngle(corpus, slot, overrideId, cwd = process.cwd()) {
  if (slot !== "angle") return null
  const seeds = loadJson(PATHS.seedAnglesFile, cwd)

  if (overrideId) {
    const forced = seeds.find((s) => String(s.id) === String(overrideId))
    if (!forced) throw new Error(`Seed angle id ${overrideId} not found in seed-angles.json`)
    return forced
  }

  return seeds.find((s) => !topicKeyUsed(corpus, s.key)) || null
}

// Pick the next topic-bank entry matching this slot that hasn't been used
// yet. Returns null if the bank is exhausted for this slot (caller falls
// back to letting the model propose a topic within the covered-list
// constraint).
export function pickTopic(corpus, slot, overrideKey, cwd = process.cwd()) {
  const topics = loadJson(PATHS.topicsFile, cwd)

  if (overrideKey) {
    const forced = topics.find((t) => t.key === overrideKey)
    if (!forced) throw new Error(`Topic key "${overrideKey}" not found in topics.uk.json`)
    return forced
  }

  return topics.find((t) => t.slots.includes(slot) && !topicKeyUsed(corpus, t.key)) || null
}
