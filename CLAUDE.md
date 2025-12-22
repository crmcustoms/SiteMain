# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

```bash
# Development
npm run dev              # Start Next.js dev server on port 3000
npm run dev:watch       # Dev with file watch (Nodemon for rapid iteration)

# Building & Production
npm run build           # Build Next.js project (generates .next directory)
npm run start           # Start production server after build
npm run prod            # Clean + build + start (full production cycle)

# Code Quality
npm lint                # Run ESLint to check code quality

# Cleaning
npm run clean           # Remove .next build dir and node_modules cache
npm run clean:build     # Clean and rebuild

# Docker (Express server mode)
npm run copy-files-linux     # Copy public files and express-server.js to .next/standalone
npm run start:express        # Run standalone server with Express wrapper
```

## Common Issues & Solutions

⚠️ **Missing CSS/JS/Fonts (404 errors)?** → See [DOCKER_BUILD_TROUBLESHOOTING.md](./DOCKER_BUILD_TROUBLESHOOTING.md)
- This is a known Next.js standalone build issue
- Happens when static files aren't copied to Docker container
- Solution already implemented in Dockerfile, but good to know for future reference

## Project Structure

This is a **Next.js 15 + TypeScript B2B SaaS marketing website** for CRM Customs, a business automation service provider.

### High-Level Architecture

```
App Router (Next.js 13+) Structure:
├── /app/[lang]/          # Localized routes (currently Ukrainian /uk)
├── /app/api/             # API endpoints
└── /app/layout.tsx       # Root layout with metadata

Component Structure:
├── /components/ui/       # shadcn/ui components (40+ Radix UI + Tailwind)
├── /components/landing/  # Landing page sections
├── /components/blog/     # Blog-specific components
└── /components/*.tsx     # Layout components (header, footer, etc.)

Utilities & Data Layer:
├── /lib/blog.ts          # Core data fetching logic (945 lines) - blog/case posts
├── /lib/actions.ts       # Server actions for form submissions
├── /lib/notion.ts        # Notion API client
└── /lib/dictionaries/    # i18n strings (Ukrainian)
```

### Data Integration Architecture

The app uses a **hybrid content strategy**:

1. **N8N Webhooks** (primary dynamic data):
   - Blog posts: `n8n.crmcustoms.com/webhook/...`
   - Case studies: `n8n.crmcustoms.com/webhook/...`
   - Form submissions: Email via N8N webhook

2. **Notion CMS** (secondary, fallback):
   - Client: `@notionhq/client`
   - Database ID: Stored in `.env.local`
   - Blocks converted to Markdown via `notion-to-md`

3. **Caching**:
   - In-memory cache with 5-minute TTL in `lib/blog.ts`
   - Per-article caching with 10-second fetch timeout
   - Control via `DISABLE_BLOG_CACHE` environment variable for development

### Key Files & Responsibilities

| File | Purpose |
|------|---------|
| `lib/blog.ts` | Data fetching from N8N webhooks/Notion, caching logic |
| `lib/actions.ts` | Server actions for contact/subscription form handling |
| `app/layout.tsx` | Root layout, metadata, theme/language providers |
| `app/[lang]/` | Language-localized page routes |
| `app/api/` | Backend endpoints (S3 proxy, analytics, RSS, health) |
| `next.config.mjs` | Build config, rewrites for S3 proxy, cache headers |
| `components/landing/` | Hero, case studies, testimonials sections |

## Environment Variables

Create `.env.local` (see `.env.example` for template):
```
NOTION_SECRET=<your_notion_secret_key_from_developer_portal>
NOTION_DATABASE_ID=<your_notion_database_id>
```

Optional:
- `DISABLE_BLOG_CACHE=true` - Disable caching during development
- `NEXT_TELEMETRY_DISABLED=1` - Disable Next.js telemetry

## Docker Deployment

- **Dockerfile**: Multi-stage Alpine build, Node.js 22, standalone output mode
- **Health check**: `/api/health` endpoint (30s interval)
- **Non-root user**: `nextjs:1001` for security
- **Memory optimization**: `NODE_OPTIONS="--max-old-space-size=4096"`

Build & run:
```bash
docker-compose build
docker-compose up -d
```

## Architectural Notes

1. **Server Components by Default**: Most components are server components for SSR/security
2. **Markdown + Notion**: Blog articles stored in Notion, converted to Markdown, cached in-memory
3. **Form Validation**: Zod schemas for runtime + TypeScript for compile-time safety
4. **Image Optimization**: S3 proxy at `/api/s3-proxy` with presigned URL handling
5. **Localization**: Dictionary-based i18n pattern, extensible to other languages
6. **Standalone Output**: Next.js runs in standalone mode for smaller Docker images
7. **Middleware Disabled**: Service worker disabled to prevent unexpected caching

## Development Workflow

1. Run `npm run dev:watch` for rapid iteration with file watching
2. Notion changes: Update entries in your Notion database
3. N8N webhook data updates automatically; cache resets every 5 minutes or on `DISABLE_BLOG_CACHE`
4. Form submissions routed through N8N webhooks (see `lib/actions.ts`)
5. Add new components in `/components` as server components by default
6. Use `"use client"` only for interactive features (forms, state, hooks)

## TypeScript & Tooling

- **Strict mode**: Enabled in `tsconfig.json`
- **ESLint**: `eslint@9.29.0` with Next.js config
- **Tailwind**: `tailwindcss@3.4.17` with custom config
- **Component Variants**: Use `class-variance-authority` for flexible UI components
