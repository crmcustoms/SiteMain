// Thin wrapper around OpenRouter's chat-completions API (OpenAI-compatible
// shape, proxying to Claude Sonnet 5 by default — see config.mjs). Forces
// structured output via a forced tool call (not "please reply with JSON")
// so parsing is deterministic.

import { CONFIG, TAG_VOCABULARY, VALIDATION } from "./config.mjs"

const ARTICLE_TOOL = {
  type: "function",
  function: {
    name: "emit_article",
    description: "Публікує згенеровану статтю для блогу crmcustoms.com",
    parameters: {
      type: "object",
      required: ["title", "excerpt", "tag", "tags", "slug", "topicKey", "body_markdown", "illustration_scene", "illustration_alt"],
      properties: {
        title: { type: "string", description: `${VALIDATION.titleMin}-${VALIDATION.titleMax} символів` },
        excerpt: { type: "string", description: `${VALIDATION.excerptMin}-${VALIDATION.excerptMax} символів` },
        tag: { type: "string", enum: TAG_VOCABULARY },
        tags: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 5 },
        slug: { type: "string", pattern: "^[a-z0-9]+(-[a-z0-9]+)*$", description: "латиницею, kebab-case" },
        topicKey: { type: "string", description: "короткий унікальний ключ теми, kebab-case" },
        ctaTitle: { type: "string" },
        ctaText: { type: "string" },
        body_markdown: { type: "string", description: "тіло статті, markdown + дозволений HTML" },
        illustration_scene: {
          type: "string",
          description: "1-2 речення англійською: сцена/метафора для ілюстрації статті. Тільки сцена — БЕЗ опису стилю/кольорів/техніки, стиль фіксований окремо. Ніяких текстів/цифр/UI на зображенні.",
        },
        illustration_alt: {
          type: "string",
          description: "Той самий опис українською, 1 речення — піде в alt-текст зображення на сайті (доступність і SEO).",
        },
      },
    },
  },
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export class OpenRouterError extends Error {}

export async function generateArticle({ system, user, slot }) {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) throw new OpenRouterError("Missing OPENROUTER_API_KEY")

  const body = {
    model: CONFIG.model, // OpenRouter slug, e.g. "anthropic/claude-sonnet-5"
    max_tokens: CONFIG.maxTokens,
    temperature: CONFIG.temperature[slot] ?? 0.7,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    tools: [ARTICLE_TOOL],
    tool_choice: { type: "function", function: { name: "emit_article" } },
  }

  let lastErr
  for (let attempt = 0; attempt < CONFIG.retries; attempt++) {
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${apiKey}`,
          // OpenRouter attribution headers — optional but recommended.
          "http-referer": "https://crmcustoms.com",
          "x-title": "CRMCUSTOMS autopost",
        },
        body: JSON.stringify(body),
      })

      if (res.status === 429 || res.status >= 500) {
        lastErr = new OpenRouterError(`OpenRouter API ${res.status}`)
        await sleep(CONFIG.retryDelaysMs[attempt] ?? 30000)
        continue
      }

      if (!res.ok) {
        const text = await res.text()
        throw new OpenRouterError(`OpenRouter API ${res.status}: ${text}`)
      }

      const data = await res.json()

      if (data.error) {
        throw new OpenRouterError(`OpenRouter error: ${data.error.message || JSON.stringify(data.error)}`)
      }

      const choice = data.choices?.[0]
      if (choice?.finish_reason === "length") {
        throw new OpenRouterError("Response truncated at max_tokens — body likely incomplete")
      }

      const toolCall = choice?.message?.tool_calls?.find((c) => c.function?.name === "emit_article")
      if (!toolCall) throw new OpenRouterError("No emit_article tool call in response")

      let article
      try {
        article = JSON.parse(toolCall.function.arguments)
      } catch {
        throw new OpenRouterError("emit_article arguments were not valid JSON")
      }

      return {
        article,
        // OpenAI-compatible usage field names, normalized to the
        // input_tokens/output_tokens shape the rest of the pipeline logs.
        usage: {
          input_tokens: data.usage?.prompt_tokens,
          output_tokens: data.usage?.completion_tokens,
        },
        model: data.model || CONFIG.model,
      }
    } catch (err) {
      lastErr = err
      if (err instanceof OpenRouterError && err.message.startsWith("OpenRouter API 4") && !err.message.startsWith("OpenRouter API 429")) {
        throw err // 4xx other than 429 won't fix itself on retry
      }
      if (attempt < CONFIG.retries - 1) await sleep(CONFIG.retryDelaysMs[attempt] ?? 30000)
    }
  }
  throw lastErr
}
