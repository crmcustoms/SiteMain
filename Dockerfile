# Використовуємо Alpine версію Node.js для менших розмірів
FROM node:22-alpine AS base

# Встановлюємо libc6-compat для сумісності з Alpine та curl для healthcheck
RUN apk add --no-cache libc6-compat curl
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
RUN npm cache clean --force && \
    next build && \
    echo "=== Builder stage - После next build ===" && \
    ls -la .next/standalone/ | head -20 && \
    [ -f .next/standalone/server.js ] && echo "✓ server.js найден в builder" || echo "✗ server.js НЕ найден в builder" && \
    mkdir -p .next/standalone/public .next/static && \
    cp -r public/* .next/standalone/public/ 2>/dev/null || true && \
    cp express-server.js .next/standalone/ 2>/dev/null || true && \
    cp api-routes.js .next/standalone/ 2>/dev/null || true && \
    echo "=== Builder stage - После копирования файлов ===" && \
    ls -la .next/standalone/ | head -20

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Добавляем группу и пользователя для безопасности
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Копируем .next директорий для статики и конфига
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone/.next /app/.next

# Копируем node_modules (необходимо для работы)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone/node_modules /app/node_modules

# Копируем публичные файлы
COPY --from=builder --chown=nextjs:nodejs /app/public /app/public

# Копируем package.json для информации о версии
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone/package.json /app/

# Создаем server.js если он не был скопирован
RUN if [ ! -f /app/server.js ]; then \
    echo "Creating server.js from Next.js standalone server" && \
    cp /app/.next/server.js /app/server.js 2>/dev/null || \
    cat > /app/server.js << 'SERVEREOF'\
const { createServer } = require('http')\
const { parse } = require('url')\
const next = require('next')\
\
const dev = process.env.NODE_ENV !== 'production'\
const hostname = process.env.HOSTNAME || 'localhost'\
const port = parseInt(process.env.PORT || '3000', 10)\
\
const app = next({ dev, hostname, port })\
const handle = app.getRequestHandler()\
\
app.prepare().then(() => {\
  createServer(async (req, res) => {\
    try {\
      const parsedUrl = parse(req.url, true)\
      await handle(req, res, parsedUrl)\
    } catch (err) {\
      console.error(err)\
      res.statusCode = 500\
      res.end('Internal server error')\
    }\
  }).listen(port, (err) => {\
    if (err) throw err\
    console.log(`Ready on http://${hostname}:${port}`)\
  })\
})\
SERVEREOF\
  fi && \
  ls -la /app/server.js && \
  [ -f /app/server.js ] && echo "✓ server.js готов" || echo "✗ ошибка server.js"

# Переключаемся на непривилегированного пользователя
USER nextjs

EXPOSE 3000

ENV PORT 3000
# Устанавливаем хост на 0.0.0.0 для доступа извне контейнера
ENV HOSTNAME "0.0.0.0"

# Устанавливаем максимальный размер старого поколения для оптимизации GC
ENV NODE_OPTIONS="--max-old-space-size=1024"

# server.js создается при сборке next из standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD ["node", "server.js"]