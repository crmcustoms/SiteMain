---
name: add-article
description: Publish a new blog post or case study to crmcustoms.com in the site's house style. Use when the user asks to add/write/publish an article, blog post, or case study for this site, or wants existing Notion content turned into a site article.
---

# Add Article (CRM Customs blog/cases)

This site's blog and cases are plain markdown files read at build time — no CMS, no Notion, no n8n involved. Publishing an article means writing one `.md` file correctly.

## Where files go

- Blog: `content/blog/uk/<slug>.md`
- Cases: `content/cases/uk/<slug>.md`

`<slug>` is kebab-case, transliterated if the title is Ukrainian (e.g. `chy-vystachyt-groshey-na-crm`). It becomes the URL: `/uk/blog/<slug>` or `/uk/cases/<slug>`.

## Frontmatter schema

```yaml
---
title: "Full headline as shown on the page (H1)"
date: "YYYY-MM-DD"
excerpt: "One or two sentences — shown on the list card and as the page subtitle/meta description"
tag: "Single badge label shown top of article, e.g. 'Про впровадження CRM' or a Category name"
tags: ["keyword1", "keyword2"]     # small tags shown on the list card
readTime: "N хвилин(и) читання"    # see pluralization rule below
author: "CRMCUSTOMS"
image: "https://..."   # OPTIONAL — used for OG/Twitter card + list card thumbnail. Leave it out unless there's a real photo: when omitted, lib/content.ts auto-generates an on-brand cover via /api/og?title=...&tag=... (cream background, gold accent, Unbounded/Golos Text — matches the site design). This is the normal case; don't invent a placeholder image URL. Do NOT use `/placeholder.svg` — despite the name it's actually a corrupted JPEG in this repo, and next/image blocks SVG sources by default anyway (`dangerouslyAllowSVG` isn't set), so anything ending in `.svg` or served as `image/svg+xml` will render as a broken image through next/image.
# Optional — override the default bottom CTA block. Omit any/all to use site defaults.
ctaTitle: "..."
ctaText: "..."
ctaLabel: "..."
ctaHref: "https://crmcustoms.com"
---
```

**readTime pluralization** (Ukrainian numeral agreement) — compute `n = round(wordCount / 180)`, then:
- `n % 10 == 1 && n % 100 != 11` → `"N хвилина читання"`
- `n % 10 in 2..4 && n % 100 not in 12..14` → `"N хвилини читання"`
- otherwise → `"N хвилин читання"`

## Body

Plain markdown (headings `##`/`###`, paragraphs, **bold**, lists, links). Rendered through `react-markdown` + `remark-gfm` + `rehype-raw`, so raw HTML is also allowed inline — use it for the site's special editorial blocks when they fit the content. Don't force all of them into every article; use only what serves the actual point.

**Pull quote** — a standalone one-line callout:
```html
<div class="pullquote">Short, punchy sentence that stands alone.</div>
```

**Highlight box** — dark card for the single most important takeaway:
```html
<div class="highlight-box">
<p><strong>The key point in bold.</strong><br><br>
Supporting sentence in regular weight.</p>
</div>
```

**Scale grid** — 2-4 side-by-side option/tier cards:
```html
<div class="scale-grid">
<div class="scale-card">
<span class="scale-label">Short label</span>
<div>
<strong>Card title</strong>
<p>Description text.</p>
</div>
</div>
<!-- repeat .scale-card for each option -->
</div>
```

**Warning** — a caution/red-flag callout:
```html
<div class="warning">
<span class="warning-icon">⚠️</span>
<p>Warning text.</p>
</div>
```

The full CSS for these lives in `styles/article.css` (design: cream background, Unbounded/Golos Text fonts, `#e8b84b` gold accent) — don't invent new classes, reuse these five.

**In-body images** — plain markdown, no special class needed:
```markdown
![Descriptive Ukrainian alt text](/images/blog/<slug>-illustration-1.jpg)
```
`styles/article.css` styles any `.article-page .body img` automatically (rounded corners, border, 40px vertical margin — same treatment as the box components above, added 2026-09 for the autopost illustration pipeline). Real screenshots (like the MeetLogNet case) use the same syntax, pointing at `public/images/case-studies/`. If an article calls for an AI-generated illustration rather than a real screenshot, the fixed style prompt lives in `scripts/autopost/illustration-style.md` — reuse it rather than inventing new prompt language, so illustrations don't drift in look from one article to the next.

## Voice and content rules

- Match the existing tone: direct, second person, concrete numbers, short paragraphs, no filler. Read `content/blog/uk/chy-vystachyt-groshey-na-crm.md` or any file in `content/cases/uk/` as a reference before writing.
- **Never invent facts, statistics, client names, or results.** If writing a case study and the user hasn't given you real numbers/details, ask for them — don't fill gaps with plausible-sounding fiction. (A previous automated attempt at this filled placeholder articles with hallucinated, half-garbled text — that content had to be deleted entirely. Don't repeat it.)
- Ukrainian only for now (`uk` is the only locale configured in `lib/i18n-config.ts`).

## Process

1. Gather the actual content/topic from the user — if it's a case study, get real client details and results from them, don't guess.
2. Pick `blog`, `cases`, or `news` (own-service announcements — Planfix product news is Notion-sourced, not written here), derive the slug, write the `.md` file with the schema above into `content/<type>/uk/<slug>.md`.
3. Run `npm run build` in the project root to confirm it compiles (this is exactly where a previous automated attempt silently failed while claiming success — always verify for real, don't just report success).
4. Optionally preview with `npm run dev` and open `/uk/<type>/<slug>` to sanity-check rendering.
5. Report what was written and where.
6. **Do not `git commit`/`git push` without asking first** — this repo deploys to Netlify on push, so pushing puts the article live on crmcustoms.com immediately.
7. **Check first whether `.github/workflows/social-crosspost.yml` will already handle this** (added 2026-09, part of the autopost pipeline): it fires automatically on any push to `main` that adds a new `content/blog/uk/*.md` file, and cross-posts to Telegram (`@prodayslonakume`) and Facebook (Page "CRM на прокачку") once the corresponding repo secrets exist. If those secrets are set, pushing the article *is* the announcement — running `post-telegram.mjs` by hand afterward would double-post. Only run it manually if that workflow is disabled/not yet configured, or for a channel it doesn't cover:
   `node scripts/social/post-telegram.mjs --title "<title>" --excerpt "<excerpt>" --url "https://crmcustoms.com/uk/<type>/<slug>" --image "https://crmcustoms.com/api/og?title=<url-encoded title>&tag=<url-encoded tag>"`
   Needs `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHANNEL_CHAT_ID` in `.env.local` (already set up). Ask before running — same "don't publish without asking" rule as the push itself. Facebook has code (`scripts/social/post-facebook.mjs`) but no token on file yet as of 2026-09; Instagram/LinkedIn are not connected at all — don't claim to post there.
