# Autopost — стаття на crmcustoms.com і крос-постинг

Автоматична генерація й публікація статей у `content/blog/uk/`, з ілюстрацією
та автоматичним анонсом у Telegram/Facebook після мерджу. Без n8n, без
окремого сервера — усе на GitHub Actions.

## Як це працює наскрізь

```
cron (Пн/Ср/Пт) або workflow_dispatch
  → generate.mjs вибирає рубрику (slot) і тему
  → OpenRouter (Claude Sonnet 5) генерує статтю структурованим tool-call
  → validate.mjs: 14 перевірок (мова, вигадані цифри, дозволений HTML, дублі)
  → якщо OK: illustrate.mjs генерує ілюстрацію через Replicate (flux-dev)
  → пишеться content/blog/uk/<slug>.md (+ public/images/blog/<slug>-illustration-1.jpg)
  → відкривається Pull Request (autopost.yml)
  → людина переглядає й мержить → deploy.yml деплоїть як завжди
  → push у main з новим файлом → social-crosspost.yml
      → post-telegram.mjs → @prodayslonakume
      → post-facebook.mjs → сторінка "CRM на прокачку" (якщо є токен)
```

## Файли

| Файл | Що робить |
|---|---|
| `generate.mjs` | Точка входу. Оркеструє все нижче |
| `config.mjs` | **Єдина точка налаштувань**: модель, розклад рубрик, словник тегів, пороги валідації |
| `corpus.mjs` | Читає `content/blog/uk` + `content/cases/uk` → що вже опубліковано |
| `slots.mjs` | Вибір рубрики (angle/howto/myth/question) + вибір теми/кута |
| `llm.mjs` | Виклик OpenRouter (forced tool call) |
| `validate.mjs` | Усі 14 перевірок якості/безпеки |
| `frontmatter.mjs` | Безпечний запис `.md`-файлу |
| `illustrate.mjs` | Виклик Replicate flux-dev, той самий патерн, що в Kazkaua-app |
| `illustration-style.md` | Фіксований промт-стиль ілюстрацій (джерело правди, не змінювати за статтю) |
| `seed-angles.json` | 7 готових "контент-кутів" з попереднього (видаленого) Notion-проєкту |
| `topics.uk.json` | Банк тем на howto/myth/question (~18, можна доповнювати) |
| `brand.md` | Голос бренду + `APPROVED CLAIMS` — єдине джерело дозволених цифр/фактів |
| `prompts/*.md` | Системний промт + промт під кожен формат рубрики |

Соціальні скрипти лежать окремо в `scripts/social/` (спільні з ручним
процесом `add-article` skill): `post-telegram.mjs`, `post-facebook.mjs`,
`get-new-posts.mjs`.

## Потрібні секрети (GitHub → Settings → Secrets and variables → Actions)

| Секрет | Для чого | Статус |
|---|---|---|
| `OPENROUTER_API_KEY` | генерація тексту (Claude Sonnet 5 через OpenRouter) | **додати** — зробити окремий ключ на openrouter.ai/keys |
| `REPLICATE_API_TOKEN` | генерація ілюстрацій (flux-dev) | **додати** — вже є в `Kazkaua-app/.env.local`, можна скопіювати |
| `TELEGRAM_BOT_TOKEN` | анонс у @prodayslonakume | **додати** — вже є в `SiteMain/.env.local`, бот `@crmcontent_bot` уже адмін каналу |
| `TELEGRAM_CHANNEL_CHAT_ID` | те саме | **додати** — значення `@prodayslonakume` |
| `FACEBOOK_PAGE_ID` | анонс на сторінці "CRM на прокачку" | **додати** — `614226188972824` |
| `FACEBOOK_PAGE_TOKEN` | те саме | **згенерувати** — Graph API Explorer, дозволи `pages_show_list`+`pages_read_engagement`+`pages_manage_posts`; без нього крок Facebook просто мовчки пропускається |

Instagram: не підключено. Через рекламний кабінет жодного зв'язаного
акаунту не знайдено. Коли з'явиться `FACEBOOK_PAGE_TOKEN`, можна перевірити
`graph.facebook.com/{page_id}?fields=instagram_business_account` і, якщо
є акаунт, додати `post-instagram.mjs` за тим самим принципом.

## Локальний запуск / тест

```bash
# сухий прогін — генерує й валідує, нічого не пише, ілюстрацію НЕ генерує (гроші)
node scripts/autopost/generate.mjs --dry-run

# конкретна рубрика/тема
node scripts/autopost/generate.mjs --slot howto --topic yak-obraty-crm-dlya-malogo-biznesu

# примусово розгорнути конкретний готовий кут (1-7)
node scripts/autopost/generate.mjs --seed-angle 3
```

Читає `OPENROUTER_API_KEY`/`REPLICATE_API_TOKEN` з `.env.local` локально,
з GitHub Secrets у CI.

## Ротація рубрик і захист від повторів

Індекс рубрики — це кількість уже згенерованих постів (`generator:
autopost-v1` у фронтматтері) за модулем 12-слотового циклу в `config.mjs`.
Жодного окремого файлу стану — сам корпус статей і є станом. Дедуплікація:
модель отримує список 40 останніх заголовків і не повторює їх; після
генерації — перевірка схожості заголовків і колізії slug/topicKey (з
автоматичною повторною спробою один раз).

7 готових кутів з `seed-angles.json` виходять органічно через слот `angle`,
по одному, поки не скінчаться (~7 тижнів при 3 постах/тиждень) — потім
`angle` переходить на генерацію нових кутів без втручання.

## Безпека контенту (урок з провалу лютого 2026)

Попередня спроба (окремий бот, видалений) використовувала слабку модель, яка
спотворила українську кирилицю в трансліт-кашу — див.
`wiki/content-manager-system.md` в Obsidian-вейлті. `validate.mjs` тепер
рахує співвідношення кирилиці/латиниці (поріг 0.92) і ловить саме цей тип
пошкодження, плюс окремо блокує будь-яку цифру/статистику, якої нема в
`brand.md` → `APPROVED CLAIMS`. Публікація йде через Pull Request, не прямим
push — див. `.github/workflows/autopost.yml` для причин цього рішення.

## Стиль ілюстрацій

`illustration-style.md` — фіксований промт-префікс, який іде в кожен виклик
Replicate без змін; модель дає лише коротку сцену (`illustration_scene`),
стиль (кремово-золота палітра сайту, flat-ілюстрація, без тексту/UI/облич
зблизька) — константа. Якщо колись знадобиться змінити художній напрямок —
редагувати тільки цей файл, він і є джерело правди (той самий принцип, що
`illustration-style.md` у Kazkaua-app для дитячих книжок).

## Що НЕ входить сюди (окремий етап)

Аудіо-перекази бізнес-книг, YouTube, SoundCloud — не заплановано в цьому
пайплайні, будується окремо пізніше.
