# Інструкція по розгортанню Next.js проекту в Docker

## Проблема та рішення

Ваша оригінальна помилка виникала через неправильне копіювання файлів у production образі. Ось виправлені варіанти:

## Варіант 1: Оптимізований Dockerfile (рекомендований)

```dockerfile
# Використовуємо Alpine версію Node.js для менших розмірів
FROM node:22-alpine AS base

# Встановлюємо libc6-compat для сумісності з Alpine
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies only when needed
FROM base AS deps
# Копіюємо package files
COPY package.json package-lock.json* ./
RUN \
  if [ -f package-lock.json ]; then npm ci --only=production; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js збирає телеметрію за замовчуванням. Відключаємо її.
ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
# set hostname to localhost
ENV HOSTNAME "0.0.0.0"

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD ["node", "server.js"]
```

## Варіант 2: Простий Dockerfile (запасний)

```dockerfile
# Простіший варіант Dockerfile якщо standalone не працює
FROM node:22-alpine

WORKDIR /app

# Копіюємо package files та встановлюємо всі залежності
COPY package*.json ./
RUN npm ci

# Копіюємо весь код
COPY . .

# Збираємо проект
RUN npm run build

# Видаляємо dev залежності для зменшення розміру
RUN npm prune --production

EXPOSE 3000

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

CMD ["npm", "start"]
```

## Кроки для розгортання

### 1. Перевірка збірки локально
```bash
npm run build
```

### 2. Створення Docker образу
```bash
# Основний варіант
docker build -t crmcustoms-web .

# Або простий варіант (якщо перший не працює)
docker build -f Dockerfile.simple -t crmcustoms-web .
```

### 3. Запуск контейнера
```bash
# Через Docker Compose (рекомендований)
docker-compose up -d

# Або напряму
docker run -d -p 3000:3000 --name crmcustoms-web crmcustoms-web
```

## Налаштування next.config.mjs

Переконайтеся, що в `next.config.mjs` є:

```javascript
const nextConfig = {
  output: 'standalone', // Це ключова настройка!
  // ... інші настройки
}
```

## docker-compose.yml

```yaml
services:
  web:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_TELEMETRY_DISABLED=1
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

## Troubleshooting

### Якщо standalone збірка не працює:
1. Використайте `Dockerfile.simple`
2. Видаліть `output: 'standalone'` з `next.config.mjs`
3. Збудуйте знову

### Якщо health check не працює:
Закомментуйте секцію `healthcheck` в docker-compose.yml або створіть endpoint `/api/health`.

### Перевірка після запуску:
```bash
# Перевірка логів
docker-compose logs -f web

# Перевірка чи працює сайт
curl http://localhost:3000
```

## Переваги нового Dockerfile:

✅ **Multi-stage збірка** - менший розмір образу
✅ **Правильне копіювання файлів** - .next директорія копіюється коректно  
✅ **Standalone режим** - всі залежності упаковані в одну директорію
✅ **Безпека** - запуск від імені непривілейованого користувача
✅ **Health checks** - моніторинг стану додатку

Ваша оригінальна проблема вирішена через:
- Додавання `output: 'standalone'` в next.config.mjs
- Правильне копіювання standalone збірки замість окремих .next та node_modules
- Використання multi-stage збірки для оптимізації 