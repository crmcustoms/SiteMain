---
title: "Лист відвантаження для контролю роботи складу"
date: "2022-10-17"
excerpt: "Дізнайтесь, як скласти лист відвантаження для бізнесу в Україні. Вимоги, зразки, поради щодо оформлення транспортних документів для юридичної сили."
tag: "Робота складу"
tags: ["Інтеграція"]
readTime: "4 хвилини читання"
author: "CRMCUSTOMS"
image: "/images/case-studies/lyst-vidvantazhennya-shcho-ce-ta-yak-oformyty-cover.png"
slug: "lyst-vidvantazhennya-shcho-ce-ta-yak-oformyty"
---
### Проблема


До впровадження нового інструменту працівники складу стикалися з серйозними труднощами, пов’язаними з ручним обліком замовлень. Цей процес був повільним і схильним до помилок, що призводило до затримок у відвантаженні та незадоволення клієнтів. Необхідність у чіткій, зручній та актуальній інформації про статуси замовлень стала очевидною.


## Задача


Для нормальної роботи складу потрібно мати інструменти контролю відвантаження. 


Наше основне завдання полягало у створенні інструменту, який надавав би працівникам складу чітку та зрозумілу відомість відвантаження. Відомість мала включати:

- Найменування позицій
- Кількість місць (комплектуючих)

 Саме для цього ми створили цю інтеграцію. Керівник відділу логістики компанії, що до нас звернулася, бажала тримати в руках планшет з відкритою табличкою-списком усіх замовлень в статусі “на відвантаження” та бачити усі позиції замовлення. Також важливою була можливість розпечатати печатну форму.


Щойно виробничий процес завершувався, працівники змінювали статус угоди на «Готово до відвантаження», після чого угода автоматично додавалася до відомості.

> Спочатку ми обрали для реалізації сервіс Airtable. Він має реляційну структуру бази та формули та сценарії для інтеграції в самому сервісі. Ці функції дозволили б розширювати та ускладнювати функціонал в майбутньому. Але інтерфейс англійською та обмеження в можливостях виводу на печать заставили нас обрати для реалізації Google Sheets.

![Так виглядає угода в Google Sheets](https://prod-files-secure.s3.us-west-2.amazonaws.com/f69667c9-9924-423d-821b-bf2b5540ce93/7de37002-b82f-41ef-9450-d9ab515ff493/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB466SUAUYTQO%2F20260824%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260824T123753Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjECQaCXVzLXdlc3QtMiJIMEYCIQCNE4vBUcKn8agzJWW1ybFYNmpS41MkhXe0COlz8gNfKgIhAPxcgnQFRVkP0j7Ci5mD06BxuGn1rxiNRyWEpHluKp1BKogECO3%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEQABoMNjM3NDIzMTgzODA1IgyDq7R%2FDd9KRCWDgiAq3AO2gKuoZ9jk7LLiLJQ%2B3WOpuaqMLBdGsL5UIvCu4imBu92u%2B8IUAE5DsJKYp8SP8UHGB79SQEeMexGp8X59tQtQcd98G6PYsMH%2BbEHcw3LMe2z8YemJea1EB7LYpphCoEF9aoPf%2Fo1gRIly9%2Fyjo1ZS2qTKwOhVGULpVBj%2BfXyjp2xrs%2B%2BAZcFjOAg3N%2F9Ry1OgCPdoX1QXa2EfTGbjXBJEj3%2F6%2BQ%2BlbzO54U7hU6P%2FLzZYf6NTiOSEQmLihDuZPZGXSvh2FHSDd6F9JhHqYOIRe3ux1eCPcppDBxx5RhKQRNvmq%2BIm7AUjvQHKM4eZVwMlN0e7q5f2w2VbS3qwFMHFVeOqWMhCdITs2PwMHNC5J6G6FDabni7Hv5VqT6jepLblKJxFm0UrxR6tCC8xDsDG0b5q7%2BBrOPVUu5dLAiH0%2BLm2H0HdgDXesGXEPiD54PwDhGewALLkM1c%2Bgk4%2BlWXu5Xzn1EpPcCsWBUnrD6eHGe5qYpvwE9owWli6VFuTQTuTk9H4FEjycm9FlJYD8jlFAIn29XHhsOiZpOKXa0XSlHlODNHh5EFGIqbOInegg6lqhOkals7qMfql4WNzGS2pJaJ6gVLZPKKGPNd09fy1jpIchkZGEnM0vi%2FuwTDI6bDUBjqkAd3V6lR0rM45npl9IxEHYjiVn2e4SaPiozjCIpo6Dct1QdGKYe65gwBcoz6kunvk6kCia6F85W%2FEobY%2Bh%2BtO8zcDYWZvIbIncqPl3hZ8%2FAp%2Fns6f5AvpDWbCBBgGgcFsgcr1TGQZGljUoCm2JeRaUEnJZzHikNuAnBotDPBTCZN%2BIG73rs4jYZcwPEuXbfbt39z5bnISrd6C%2FBqyXZSCZ%2BzBQWi2&X-Amz-Signature=910df084a19bb8f110ab6e90902972811a4ded7699aad1c2b1789a0f8752b5fc&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject)


## Реалізація


Для реалізації завдання ми розробили систему на базі Google Таблиць, що дозволило створити простий і доступний інтерфейс. Основні кроки включали:

1. **Створення шаблону відомості**: Розробка таблиці, де кожен рядок представляє окрему угоду, а стовпці відображають найменування позиції, кількість місць і статус замовлення.
2. **Автоматизація статусів**: При зміні статусу угоди на «Готово до відвантаження» запис автоматично додається до відомості з використанням функцій Google Таблиць, таких як формули та сценарії Google Apps Script.
3. **Управління завершеними замовленнями**: Після зміни статусу на «Відвантажено» угода зникає з відомості, що підтримує порядок і полегшує сприйняття інформації.
4. **Інтуїтивно зрозумілий інтерфейс**: Кнопка для переходу до відомості була інтегрована в головне меню системи. Доступні підкатегорії:
    - **Готово до відвантаження**: список замовлень у цьому статусі.
    - **Відвантажено**: завершені замовлення.
5. **Друк відомості**: Додано можливість друку відомості, що дозволяє працівникам мати під рукою фізичну копію з актуальною інформацією про замовлення.

Коли виробництво заповнює кількість місць і переводить угоду в статус "Готове до відвантаження", угода потрапляє у відомість за позиціями із зазначенням кількості місць (комплектуючих). 


![Так виглядає інтерфейс в CRM - проставляючи чек бокси комірник відправляє угоди в список на відвантаження. Також це можна налаштувати автоматично. Наприклад, по коли виробництво переводить угоду в статус “Готово до відправлення”.](https://prod-files-secure.s3.us-west-2.amazonaws.com/f69667c9-9924-423d-821b-bf2b5540ce93/402aa6d4-e459-4453-bca4-80daa326c172/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB466SUAUYTQO%2F20260824%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260824T123753Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjECQaCXVzLXdlc3QtMiJIMEYCIQCNE4vBUcKn8agzJWW1ybFYNmpS41MkhXe0COlz8gNfKgIhAPxcgnQFRVkP0j7Ci5mD06BxuGn1rxiNRyWEpHluKp1BKogECO3%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEQABoMNjM3NDIzMTgzODA1IgyDq7R%2FDd9KRCWDgiAq3AO2gKuoZ9jk7LLiLJQ%2B3WOpuaqMLBdGsL5UIvCu4imBu92u%2B8IUAE5DsJKYp8SP8UHGB79SQEeMexGp8X59tQtQcd98G6PYsMH%2BbEHcw3LMe2z8YemJea1EB7LYpphCoEF9aoPf%2Fo1gRIly9%2Fyjo1ZS2qTKwOhVGULpVBj%2BfXyjp2xrs%2B%2BAZcFjOAg3N%2F9Ry1OgCPdoX1QXa2EfTGbjXBJEj3%2F6%2BQ%2BlbzO54U7hU6P%2FLzZYf6NTiOSEQmLihDuZPZGXSvh2FHSDd6F9JhHqYOIRe3ux1eCPcppDBxx5RhKQRNvmq%2BIm7AUjvQHKM4eZVwMlN0e7q5f2w2VbS3qwFMHFVeOqWMhCdITs2PwMHNC5J6G6FDabni7Hv5VqT6jepLblKJxFm0UrxR6tCC8xDsDG0b5q7%2BBrOPVUu5dLAiH0%2BLm2H0HdgDXesGXEPiD54PwDhGewALLkM1c%2Bgk4%2BlWXu5Xzn1EpPcCsWBUnrD6eHGe5qYpvwE9owWli6VFuTQTuTk9H4FEjycm9FlJYD8jlFAIn29XHhsOiZpOKXa0XSlHlODNHh5EFGIqbOInegg6lqhOkals7qMfql4WNzGS2pJaJ6gVLZPKKGPNd09fy1jpIchkZGEnM0vi%2FuwTDI6bDUBjqkAd3V6lR0rM45npl9IxEHYjiVn2e4SaPiozjCIpo6Dct1QdGKYe65gwBcoz6kunvk6kCia6F85W%2FEobY%2Bh%2BtO8zcDYWZvIbIncqPl3hZ8%2FAp%2Fns6f5AvpDWbCBBgGgcFsgcr1TGQZGljUoCm2JeRaUEnJZzHikNuAnBotDPBTCZN%2BIG73rs4jYZcwPEuXbfbt39z5bnISrd6C%2FBqyXZSCZ%2BzBQWi2&X-Amz-Signature=b6e800ee99687d12a488422f38e3f60a7f00562b2ee37cf87832a0cc402eaf89&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject)


Після того як угода потрапила в статус "Відвантажено", вона зникає зі списку. Відомість реалізована на базі гугл таблиць. Кнопка переходу у відомість виведена в пункти меню для зручності. На цю ж кнопку виведено список меню: Готово до відвантаження (список замовлень у цьому статусі) і Відвантажено.


[video](https://www.youtube.com/watch?v=kIpMSb6zlTQ)


## Результати


Впровадження цієї системи значно спростило роботу працівників складу. Час обробки замовлень скоротився на 30%, а кількість помилок зменшилася на 25%. Працівники тепер отримують актуальну інформацію про статуси замовлень у режимі реального часу, що сприяє ефективнішому плануванню їхньої роботи.


Відгуки працівників після впровадження системи позитивні: вони відзначають покращення зрозумілості та легкості роботи із замовленнями, що значно знизило стрес і підвищило мотивацію.


## Що можна переробити або покращити


Це доволі простенька реалізація на базі Гугл табличок, в принципі її достатньо для роботи. Але зараз (інтеграція була створена 3 роки тому) я б створив окремий модуль під CRM. Зі своїм інтерфейсом у форматі веб застосунку під браузер та мобільну версію під планшет або телефон. Щоб комірник міг проставляти на планшеті галочки перед відвантаженими позиціями, ставив тут же статус угоди “відвантажено” і додавав фото завантаженого товару в машині для звіту та автоматичної відправки клієнту зі сповіщенням що товар вже завантажено в машину і готується для відправки.


## Висновок


Впровадження автоматизованої системи обліку відвантажень – яскравий приклад того, як сучасні технології можуть значно покращити робочі процеси. Використання Google Таблиць як основи зробило систему доступною та інтуїтивно зрозумілою, сприяючи швидкому навчанню працівників і підвищенню їхньої ефективності.


У майбутньому ми плануємо розширення функціоналу системи, зокрема інтеграцію з іншими програмами та додавання нових функцій для комплекснішого управління запасами. Такий підхід може бути легко адаптований під специфіку будь-якого бізнесу, який прагне покращити свої логістичні процеси та облік.
