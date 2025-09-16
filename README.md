# Исправление ошибки Git в Docker

## Проблема

При сборке проекта в Docker-контейнере возникала ошибка:
```
WARN[0000] current commit information was not captured by the build  error="git was not found in the system: exec: \"git\": executable file not found in $PATH"
failed to solve: process "/bin/sh -c npm run build" did not complete successfully: exit code: 1
```

## Решение

Для решения проблемы были внесены следующие изменения:

1. **Удалена зависимость от Git в Dockerfile**
   - Удалены строки установки Git из всех этапов сборки

2. **Изменены настройки Next.js**
   - В `next.config.mjs` оставлен только фиксированный генератор buildId:
   ```javascript
   generateBuildId: async () => {
     return 'build-id-no-git';
   }
   ```

3. **Изменена команда сборки**
   - В `package.json` команда сборки изменена на стандартную: `"build": "next build"`

4. **Удалена переменная окружения**
   - Из `docker-compose.yml` удалена переменная `NEXT_PUBLIC_SKIP_GIT_INFO=true`

## Применение изменений

1. Скопируйте обновленные файлы:
   - `Dockerfile`
   - `docker-compose.yml`
   - `next.config.mjs`
   - `package.json`

2. Пересоберите Docker-образ:
   ```bash
   docker-compose build
   # или
   docker compose build
   ```

3. Запустите контейнер:
   ```bash
   docker-compose up -d
   # или
   docker compose up -d
   ```

## Результат

Теперь процесс сборки полностью независим от Git и не требует его наличия в контейнере. Фиксированный buildId используется вместо информации из Git-коммита. 