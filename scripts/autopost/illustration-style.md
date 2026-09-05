# Джерело правди для стилю ілюстрацій блогу

Фіксований префікс промпту, який іде в КОЖЕН виклик Flux без змін. Це і є
механізм проти "пливе від статті до статті" — стиль ніколи не описується
заново, змінюється лише сцена (`illustration_scene` з відповіді моделі).

Не описувати текст/цифри/UI на екранах — дифузійні моделі малюють нечитабельну
кашу замість інтерфейсу, це одразу видає "згенеровано ІІ". Не близькі
обличчя — той самий провал.

Стиль — адаптація власного блогового стилю власника ("мід-сенчурі з
контуром", Kazkoland-палітра ілюстрацій), очищена від дитячості/мультяшності
під B2B-аудиторію. Затверджено 2026-09-04 після тестових генерацій.

## Основний варіант — кольоровий (за замовчуванням)

```
Bold mid-20th century editorial illustration for a Ukrainian B2B software/
automation brand — vintage business advertising aesthetic, like a 1950s-60s
corporate annual report or travel poster. Sophisticated and adult, never a
children's book or cartoon.

Confident hand-drawn black linework with clean, precise graphic shapes —
architectural and controlled, not soft or bouncy. Flat gouache fills within
the lines, natural scanned paper texture and grain visible on warm cream
paper.

Color palette (use consistently, nothing outside it): earthy warm browns,
muted mustard-gold, deep forest green, soft brick red, dusty muted blue, all
against a warm cream paper base #f5f2ec. Rich and varied like a vintage
travel poster — warm and slightly muted, no neon, no pastel, no gradients.

Mood: dry, confident, quietly witty. Diffused even lighting, minimal shadow,
flat graphic composition, rule of thirds, moderate detail, generous negative
space.

Human figures (only when the scene calls for one): simplified, realistic
adult proportions — no cartoon big eyes, no cute rounded cartoon features, no
exaggerated expressions. No close-up faces, no detailed facial features.

Square 1:1. No text, no lettering, no numbers, no watermark, no speech
bubbles, no logos, no UI screens/mockups with legible content, no
photorealism, no 3D render, no anime, no cute mascot style.

Scene: {SCENE}
```

## Альтернативний варіант — монохромний charcoal/gold (на підхваті)

Той самий контур, папір і настрій, але вузька фірмова палітра CRMCUSTOMS
(`#1a1a1a` / `#e8b84b` / `#f5f2ec`) замість повної. Використовувати не за
замовчуванням, а коли конче потрібно потрапити саме в фірмовий стиль —
наприклад окрема рекламна серія чи формат, де кольоровий шум небажаний.
Підставляти замість основного блоку вище за explicit запитом.

```
Mid-20th century editorial illustration, vintage business advertising
aesthetic — like a 1950s-60s corporate annual report or airline poster,
sophisticated and adult, absolutely not a children's book. Confident
hand-drawn black linework with clean, precise graphic shapes — architectural
and controlled, not soft or bouncy. Flat ink and gouache fills within the
lines, subtle scanned paper texture and grain visible.

Color palette: dominant deep charcoal-black #1a1a1a as background and shadow
fills, bold warm mustard-gold #e8b84b as the hero accent color covering a
large confident portion of the composition, warm cream #f5f2ec as the paper
base tone and sharp highlights. No other colors, no gradients, no neon, no
pastel.

Mood: dry, confident, quietly witty. Diffused even lighting, minimal shadow,
flat graphic composition, rule of thirds, moderate detail, generous negative
space.

Human figures (only when the scene calls for one): simplified, realistic
adult proportions — no cartoon big eyes, no cute rounded cartoon features, no
exaggerated expressions. No close-up faces, no detailed facial features.

Square 1:1. No text, no lettering, no numbers, no watermark, no speech
bubbles, no logos, no UI screens/mockups with legible content, no
photorealism, no 3D render, no anime, no cute mascot style.

Scene: {SCENE}
```

`{SCENE}` — підставляється з поля `illustration_scene`, яке модель дає разом
зі статтею (короткий опис англійською, метафора/сцена, БЕЗ згадки стилю —
стиль вже зафіксований вище). `illustrate.mjs` бере перший ``` -блок з цього
файлу (основний варіант) — для монохромного варіанту підміняти вручну.
