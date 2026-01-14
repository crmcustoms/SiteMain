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

# Build Next.js application
RUN npm cache clean --force && \
    npx next build || (echo "❌ Next.js build failed!" && exit 1) && \
    echo "✓ Next.js build completed" && \
    echo "=== Checking build output ===" && \
    ls -la .next/ || (echo "❌ .next directory not found!" && exit 1) && \
    if [ ! -d .next/standalone ]; then \
      echo "❌ ERROR: .next/standalone directory not found!" && \
      echo "Build output structure:" && \
      ls -la .next/ && \
      echo "Checking if standalone output exists:" && \
      find .next -name "standalone" -type d 2>/dev/null || echo "No standalone directory found anywhere" && \
      exit 1; \
    fi && \
    echo "✓ .next/standalone found" && \
    mkdir -p .next/standalone/public && \
    cp -r public/* .next/standalone/public/ 2>/dev/null || true && \
    cp express-server.js .next/standalone/ 2>/dev/null || true && \
    cp api-routes.js .next/standalone/ 2>/dev/null || true && \
    ls -la .next/static/ 2>/dev/null || echo "⚠ Warning: .next/static not found - will be handled in runner stage" && \
    echo "=== Build verification complete ==="

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Добавляем группу и пользователя для безопасности
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Копируем всё из standalone build - это содержит .next, node_modules и всё необходимое
# Используем RUN с проверкой существования для надежности
RUN --mount=type=bind,from=builder,source=/app/.next/standalone,target=/tmp/standalone \
    if [ ! -d /tmp/standalone ]; then \
      echo "❌ ERROR: .next/standalone not found in builder stage!" && \
      echo "This means the Next.js build failed or standalone output was not created." && \
      exit 1; \
    fi && \
    echo "✓ .next/standalone found, copying..." && \
    cp -r /tmp/standalone/* /app/ && \
    cp -r /tmp/standalone/.[!.]* /app/ 2>/dev/null || true && \
    chown -R nextjs:nodejs /app && \
    echo "✓ Standalone files copied successfully"

# ⚠️ CRITICAL: Копируем static файлы из .next/static
# Next.js создаёт статику в /app/.next/static/, но это НЕ входит в /app/.next/standalone/
# Без этой строки будут 404 на все CSS/JS/шрифты!
# Смотри DOCKER_BUILD_TROUBLESHOOTING.md для деталей
# Копируем через временную директорию с проверкой существования
RUN --mount=type=bind,from=builder,source=/app/.next,target=/tmp/next \
    mkdir -p /app/.next && \
    if [ -d /tmp/next/static ]; then \
      cp -r /tmp/next/static /app/.next/static && \
      chown -R nextjs:nodejs /app/.next/static && \
      echo "✓ Static files copied successfully"; \
    else \
      echo "⚠ Warning: .next/static not found in builder stage"; \
      mkdir -p /app/.next/static && \
      chown -R nextjs:nodejs /app/.next/static; \
    fi

# Копируем публичные файлы из исходного кода
COPY --from=builder --chown=nextjs:nodejs /app/public /app/public

# Копируем или создаем server.js для запуска приложения
# В standalone режиме Next.js создает server.js автоматически, но на всякий случай проверяем
RUN if [ -f /app/server.js ]; then \
      echo "✓ server.js уже существует"; \
    else \
      echo "⚠ server.js не найден, создаем fallback..."; \
      echo 'const { createServer } = require("http");' > /app/server.js && \
      echo 'const { parse } = require("url");' >> /app/server.js && \
      echo 'const next = require("next");' >> /app/server.js && \
      echo 'const dev = process.env.NODE_ENV !== "production";' >> /app/server.js && \
      echo 'const hostname = process.env.HOSTNAME || "localhost";' >> /app/server.js && \
      echo 'const port = parseInt(process.env.PORT || "3000", 10);' >> /app/server.js && \
      echo 'const app = next({ dev, hostname, port });' >> /app/server.js && \
      echo 'const handle = app.getRequestHandler();' >> /app/server.js && \
      echo 'app.prepare().then(() => {' >> /app/server.js && \
      echo '  createServer(async (req, res) => {' >> /app/server.js && \
      echo '    try {' >> /app/server.js && \
      echo '      const parsedUrl = parse(req.url, true);' >> /app/server.js && \
      echo '      await handle(req, res, parsedUrl);' >> /app/server.js && \
      echo '    } catch (err) {' >> /app/server.js && \
      echo '      console.error(err);' >> /app/server.js && \
      echo '      res.statusCode = 500;' >> /app/server.js && \
      echo '      res.end("Internal server error");' >> /app/server.js && \
      echo '    }' >> /app/server.js && \
      echo '  }).listen(port, (err) => {' >> /app/server.js && \
      echo '    if (err) throw err;' >> /app/server.js && \
      echo '    console.log(`Ready on http://${hostname}:${port}`);' >> /app/server.js && \
      echo '  });' >> /app/server.js && \
      echo '});' >> /app/server.js && \
      echo "✓ server.js создан"; \
    fi && \
    ls -la /app/server.js && \
    [ -f /app/server.js ] && echo "✓ Готово к запуску" || (echo "✗ Ошибка" && exit 1)

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