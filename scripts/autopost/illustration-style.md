# Джерело правди для стилю ілюстрацій блогу

Фіксований префікс промпту, який іде в КОЖЕН виклик Flux без змін. Це і є
механізм проти "пливе від статті до статті" — стиль ніколи не описується
заново, змінюється лише сцена (`illustration_scene` з відповіді моделі).

Не описувати текст/цифри/UI на екранах — дифузійні моделі малюють нечитабельну
кашу замість інтерфейсу, це одразу видає "згенеровано ІІ". Не близькі
обличчя — той самий провал.

```
Bold, striking editorial illustration for a Ukrainian B2B software/
automation brand. Flat modern illustration style, clean confident shapes,
strong graphic silhouettes, dramatic single-source lighting, sharp contrast
between light and shadow. No gradients, no photorealism, no 3D render, no
generic clip-art look, no soft/muted/pastel treatment.

Color palette (use consistently, nothing outside it, but push saturation
and contrast hard): dominant deep charcoal-black background #1a1a1a,
vibrant saturated mustard-gold #e8b84b as the hero color covering a large,
bold portion of the composition (not a small accent), warm cream #f5f2ec
used only as a sharp highlight or rim light. No other colors, no
desaturation — the gold must feel loud and premium against the dark
background, not muted.

Dynamic, slightly dramatic composition: strong diagonal or radial energy,
bold scale contrast (one large dominant shape against a stark background),
confident negative space rather than clutter. Should stop the scroll —
striking and a little unexpected, not calm or safe.

No readable text, no numbers, no letters, no UI mockups, no screens with
legible content, no logos. No human faces in close detail — small
simplified silhouette or geometric figures only, no facial features. Wide
landscape framing.

Scene: {SCENE}
```

`{SCENE}` — підставляється з поля `illustration_scene`, яке модель дає разом
зі статтею (короткий опис англійською, метафора/сцена, БЕЗ згадки стилю —
стиль вже зафіксований вище).
