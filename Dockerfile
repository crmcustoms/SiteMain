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
  if [ -f package-lock.json ]; then npm ci; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js збирає телеметрію за замовчуванням. Відключаємо її.
ENV NEXT_TELEMETRY_DISABLED 1

# Модифицируем скрипт сборки для Linux-окружения
RUN npm cache clean --force; \
    next build; \
    mkdir -p .next/standalone/public .next/static; \
    [ -d .next/static ] && echo "Static dir created" || echo "Static dir missing"; \
    cp -r public/* .next/standalone/public/ 2>/dev/null || true; \
    cp express-server.js .next/standalone/ 2>/dev/null || true; \
    cp api-routes.js .next/standalone/ 2>/dev/null || true

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Добавляем группу и пользователя для безопасности
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Копируем публичные файлы
COPY --from=builder /app/public ./public

# Копируем standalone output Next.js
# При использовании output: 'standalone' все необходимые файлы включены
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# Убеждаемся что .next директория существует и имеет правильные разрешения
RUN mkdir -p .next && chown -R nextjs:nodejs .next

# Переключаемся на непривилегированного пользователя
USER nextjs

EXPOSE 3000

ENV PORT 3000
# Устанавливаем хост на 0.0.0.0 для доступа извне контейнера
ENV HOSTNAME "0.0.0.0"

# Устанавливаем максимальный размер старого поколения для оптимизации GC
ENV NODE_OPTIONS="--max-old-space-size=4096"

# server.js создается при сборке next из standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD ["node", "server.js"]