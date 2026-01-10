"use server"

import { z } from "zod"

// Схема валідації для контактної форми
const contactFormSchema = z.object({
  name: z.string().min(2, { message: "Ім'я повинно містити щонайменше 2 символи" }),
  email: z.string().email({ message: "Введіть коректну email адресу" }).optional(),
  phone: z.string().optional(),
  message: z.string().optional(),
  formType: z.string().optional(),
})

// Схема валідації для форми підписки
const subscribeFormSchema = z.object({
  email: z.string().email({ message: "Введіть коректну email адресу" }),
  formType: z.string().optional(),
})

// Тип для результату відправки форми
type FormResult = {
  success: boolean
  message: string
  data?: any
}

// Функція для відправки даних форми на email
export async function submitForm(formData: FormData): Promise<FormResult> {
  try {
    // Визначаємо тип форми
    const formType = (formData.get("formType") as string) || "contact"

    // Валідуємо дані в залежності від типу форми
    if (formType === "quiz") {
      // Валідація форми квиза
      const validatedFields = contactFormSchema.safeParse({
        name: (formData.get("name") as string)?.trim() || "",
        email: (formData.get("email") as string)?.trim() || undefined,
        phone: (formData.get("phone") as string)?.trim() || "",
        message: formData.get("answers") ? JSON.stringify({
          answers: formData.get("answers"),
          clientType: formData.get("clientType"),
          callTime: formData.get("callTime"),
          otherTime: formData.get("otherTime"),
        }) : "",
        formType,
      })

      if (!validatedFields.success) {
        const errors = validatedFields.error.flatten();
        const errorMessages = Object.entries(errors.fieldErrors)
          .map(([, msgs]) => msgs?.join(', '))
          .filter(Boolean)
          .join('\n');
        return {
          success: false,
          message: errorMessages || "Помилка валідації форми. Перевірте введені дані.",
        }
      }

      // Парсим answers из JSON строки
      let answersData = {}
      try {
        const answersStr = formData.get("answers") as string
        if (answersStr) {
          answersData = JSON.parse(answersStr)
        }
      } catch (e) {
        console.error("Помилка парсингу answers:", e)
      }

      // Парсим result из JSON строки
      let resultData = {}
      try {
        const resultStr = formData.get("result") as string
        if (resultStr) {
          resultData = JSON.parse(resultStr)
        }
      } catch (e) {
        console.error("Помилка парсингу result:", e)
      }

      const clientType = formData.get("clientType") as string
      const profile = resultData.profile || {}
      
      // Формируем HTML версию результата (как на сайте)
      const htmlAnalysis = generateQuizResultHTML(clientType, profile)
      
      // Формируем текстовую версию для вебхука
      const textAnalysis = formatQuizAnalysis(answersData, resultData, clientType)

      // Відправка даних квиза
      console.log("Дані квиза:", {
        name: validatedFields.data.name,
        phone: validatedFields.data.phone,
        email: validatedFields.data.email,
        answers: answersData,
        clientType: clientType,
        result: resultData,
      })

      // Отправка на вебхук для администратора с полным анализом
      const response = await sendEmailNotification({
        to: "your-email@example.com",
        subject: "Нова заявка з квиза діагностики",
        name: validatedFields.data.name,
        email: validatedFields.data.email || "Не вказано",
        phone: validatedFields.data.phone || "Не вказано",
        formType: "quiz",
        answers: answersData, // Отправляем как объект, а не строку
        clientType: clientType,
        result: resultData, // Отправляем результат
        profile: profile, // Профиль отдельно
        analysisText: textAnalysis, // Текстовая версия анализа
        analysisHTML: htmlAnalysis, // HTML версия анализа (как на сайте)
        recommendations: generateRecommendationsHTML(clientType), // Рекомендации отдельно
        callTime: formData.get("callTime") as string,
        otherTime: formData.get("otherTime") as string,
        date: new Date().toLocaleString(),
      })

      // Отправка email пользователю с HTML анализом (если email указан)
      if (validatedFields.data.email) {
        await sendQuizResultToUser({
          to: validatedFields.data.email,
          name: validatedFields.data.name,
          clientType: clientType,
          htmlContent: htmlAnalysis, // Отправляем HTML версию (как на сайте)
          profile: profile,
        })
      }

      if (!response) {
        console.error("Webhook failed for quiz form");
        return {
          success: false,
          message: "Помилка при відправці на сервер. Спробуйте ще раз.",
        }
      }

      return {
        success: true,
        message: "Дякуємо за проходження діагностики! Ми зв'яжемося з вами найближчим часом.",
        data: validatedFields.data,
      }
    } else if (formType === "subscribe") {
      // Валідація форми підписки
      const validatedFields = subscribeFormSchema.safeParse({
        email: (formData.get("email") as string)?.trim() || undefined,
        formType,
      })

      if (!validatedFields.success) {
        const errors = validatedFields.error.flatten();
        const errorMessages = Object.entries(errors.fieldErrors)
          .map(([, msgs]) => msgs?.join(', '))
          .filter(Boolean)
          .join('\n');
        return {
          success: false,
          message: errorMessages || "Помилка валідації форми. Перевірте введені дані.",
        }
      }

      // Тут буде код для відправки email з даними форми підписки
      console.log("Дані форми підписки:", validatedFields.data)

      // Імітуємо відправку запиту на сервер
      const response = await sendEmailNotification({
        to: "your-email@example.com", // Замініть на вашу адресу
        subject: "Нова підписка на новини",
        ...validatedFields.data,
      })

      if (!response) {
        console.error("Webhook failed for subscribe form");
        return {
          success: false,
          message: "Помилка при відправці на сервер. Спробуйте ще раз.",
        }
      }

      return {
        success: true,
        message: "Дякуємо за підписку! Ми надіслали вам лист для підтвердження.",
        data: validatedFields.data,
      }
    } else {
      // Валідація контактної форми
      const validatedFields = contactFormSchema.safeParse({
        name: (formData.get("name") as string)?.trim() || "",
        email: (formData.get("email") as string)?.trim() || undefined,
        phone: (formData.get("phone") as string)?.trim() || "",
        message: (formData.get("message") as string)?.trim() || "",
        formType,
      })

      if (!validatedFields.success) {
        const errors = validatedFields.error.flatten();
        const errorMessages = Object.entries(errors.fieldErrors)
          .map(([, msgs]) => msgs?.join(', '))
          .filter(Boolean)
          .join('\n');
        return {
          success: false,
          message: errorMessages || "Помилка валідації форми. Перевірте введені дані.",
        }
      }

      // Тут буде код для відправки email з даними контактної форми
      console.log("Дані контактної форми:", validatedFields.data)

      // Імітуємо відправку запиту на сервер
      const response = await sendEmailNotification({
        to: "your-email@example.com",
        subject: "Нова заявка з сайту",
        name: validatedFields.data.name,
        email: validatedFields.data.email || "Не вказано",
        phone: validatedFields.data.phone || "Не вказано",
        message: validatedFields.data.message || "Не вказано",
        formType: validatedFields.data.formType,
        date: new Date().toLocaleString(),
      })

      if (!response) {
        console.error("Webhook failed for contact form");
        return {
          success: false,
          message: "Помилка при відправці на сервер. Спробуйте ще раз.",
        }
      }

      return {
        success: true,
        message: "Дякуємо за ваше звернення! Ми зв'яжемося з вами найближчим часом.",
        data: validatedFields.data,
      }
    }
  } catch (error) {
    console.error("Помилка відправки форми:", error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    return {
      success: false,
      message: `Помилка: ${errorMessage}`,
    }
  }
}

// Функція для генерации HTML версии результата квиза (как на сайте)
function generateQuizResultHTML(clientType: string, profile: any): string {
  const clientTypeLabels: Record<string, string> = {
    'startup': 'NOT_SUITABLE',
    'small': 'RECOMMENDED',
    'medium-risk': 'MEDIUM_RISK',
    'ideal': 'IDEAL',
    'large': 'PREMIUM',
    'has-crm': 'HAS_CRM'
  }

  const clientTypeTitles: Record<string, string> = {
    'startup': 'Не підходить',
    'small': 'Рекомендовано',
    'medium-risk': 'Середній ризик',
    'ideal': 'Ідеально',
    'large': 'Преміум',
    'has-crm': 'Є CRM'
  }

  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Результат діагностики CRM</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #000; max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .badge { display: inline-block; padding: 10px 20px; background: #FFD700; border: 2px solid #000; font-weight: bold; margin-bottom: 20px; }
        h1 { font-size: 28px; margin: 20px 0; }
        h2 { font-size: 24px; margin: 20px 0 10px; }
        h3 { font-size: 20px; margin: 15px 0 10px; }
        h4 { font-size: 18px; margin: 15px 0 10px; font-weight: bold; }
        .profile { background: #F8F9FA; padding: 20px; border: 1px solid #ddd; margin: 20px 0; }
        .profile h3 { font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 15px; }
        .profile ul { list-style: none; padding: 0; }
        .profile li { padding: 5px 0 5px 20px; position: relative; }
        .profile li:before { content: '•'; position: absolute; left: 0; }
        .highlight { background: #FFD700; padding: 20px; border: 1px solid #000; margin: 20px 0; }
        .highlight h5 { font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 15px; }
        .warning { background: #FEF2F2; border: 1px solid #DC2626; padding: 20px; margin: 20px 0; }
        .warning h5 { color: #DC2626; font-weight: bold; margin-bottom: 10px; }
        .info { background: #F8F9FA; border: 1px solid #ddd; padding: 20px; margin: 20px 0; }
        ul { margin: 10px 0; }
        li { margin: 8px 0; }
        .check { color: #FFD700; font-weight: bold; }
        strong { font-weight: bold; }
        p { margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="badge">${clientTypeLabels[clientType] || clientType.toUpperCase()}</div>
        <h1>РЕЗУЛЬТАТ ДІАГНОСТИКИ</h1>
      </div>

      <div class="profile">
        <h3>Ваш профіль</h3>
        <ul>
  `

  if (profile.businessType) {
    html += `<li>${profile.businessType}</li>`
  }
  if (profile.teamSize) {
    html += `<li>${profile.teamSize} у команді</li>`
  }
  if (profile.systems && profile.systems.length > 0) {
    profile.systems.forEach((s: string) => {
      html += `<li>${s}</li>`
    })
  }
  if (profile.painsList && profile.painsList.length > 0) {
    profile.painsList.forEach((p: string) => {
      html += `<li>Проблема: ${p}</li>`
    })
  }
  if (profile.decisionMaker) {
    html += `<li>Приймає рішення: ${profile.decisionMaker}</li>`
  }

  html += `
        </ul>
      </div>
  `

  // Добавляем рекомендации в зависимости от типа клиента
  html += generateRecommendationsHTML(clientType)

  html += `
      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center;">
        <p><strong>З повагою, команда CRMCUSTOMS</strong></p>
        <p style="font-size: 14px; color: #666;">Якщо у вас виникли питання, зв'яжіться з нами</p>
      </div>
    </body>
    </html>
  `

  return html
}

// Функція для генерации рекомендаций в HTML
function generateRecommendationsHTML(clientType: string): string {
  const recommendations: Record<string, string> = {
    'startup': `
      <h2>ЧЕСНА РЕКОМЕНДАЦІЯ</h2>
      <p>На вашому етапі CRM може бути зайвою.</p>
      
      <p><strong>Зараз вам важливіше:</strong></p>
      <ul>
        <li><span class="check">✓</span> Налагодити потік клієнтів</li>
        <li><span class="check">✓</span> Відпрацювати продажі</li>
        <li><span class="check">✓</span> Зробити перші гроші</li>
      </ul>

      <div class="highlight">
        <h5>Що ми можемо для вас</h5>
        <p><strong>Мінімальний пакет за 5,000₴</strong></p>
        <ul>
          <li>• Налаштування базових статусів та полів</li>
          <li>• 1-2 прості автоматизації</li>
          <li>• 3 дні підтримки в чаті</li>
          <li>• 30-хвилинний вебінар</li>
        </ul>
        <p style="font-size: 14px; font-style: italic;">Підходить якщо у вас вже є готова CRM і дуже прості процеси.</p>
      </div>

      <p><strong>Або повернутися коли буде:</strong></p>
      <ul>
        <li><span class="check">✓</span> 5-10 постійних клієнтів</li>
        <li><span class="check">✓</span> Стабільний потік заявок</li>
        <li><span class="check">✓</span> 3+ менеджери в команді</li>
      </ul>
    `,
    'small': `
      <h2>НАША РЕКОМЕНДАЦІЯ: ПАКЕТ СТАРТ</h2>
      
      <p><strong>Чому саме він:</strong></p>
      <ul>
        <li><span class="check">✓</span> Швидкий результат (2-3 тижні)</li>
        <li><span class="check">✓</span> Почнете бачити всі угоди</li>
        <li><span class="check">✓</span> Менеджери працюватимуть в одній системі</li>
        <li><span class="check">✓</span> Перші автоматизації</li>
      </ul>

      <div class="highlight">
        <h5>Що входить</h5>
        <ul>
          <li><span class="check">✓</span> Обов'язковий аудит (2 години)</li>
          <li><span class="check">✓</span> Підбір CRM під ваш бізнес</li>
          <li><span class="check">✓</span> Налаштування воронок та статусів</li>
          <li><span class="check">✓</span> До 3 базових інтеграцій</li>
          <li><span class="check">✓</span> Базові автоматизації</li>
          <li><span class="check">✓</span> Вебінар для команди (1-2 години)</li>
          <li><span class="check">✓</span> Тиждень технічної підтримки</li>
        </ul>
        <p><strong>Орієнтовна вартість: від 25,000₴</strong></p>
        <p>⏱️ Типовий термін: 2-3 тижні</p>
      </div>

      <p><strong>Що далі:</strong></p>
      <p>1. Проведемо аудит (2 години, безкоштовно)<br />
        2. Покажемо як буде працювати<br />
        3. Запустимо перші продажі за місяць</p>
    `,
    'medium-risk': `
      <div class="warning">
        <h5>⚠️ Важливе попередження</h5>
        <p>У компаніях вашого розміру БЕЗ систем зазвичай проблема не в технологіях, а в менеджменті.</p>
        <p><strong>CRM не замінить управління!</strong></p>
        
        <p>Якщо у вас:</p>
        <ul>
          <li>Немає чіткого розподілу відповідальності</li>
          <li>Люди не виконують завдання в строк</li>
          <li>Відсутні базові процедури</li>
        </ul>
        
        <p>CRM тільки "підсвітить" ці проблеми, але не вирішить їх автоматично.</p>
      </div>

      <h2>Наша рекомендація: Поетапне впровадження</h2>
      
      <div class="info">
        <p><strong>Етап 1: Корпоративний портал (1-1.5 міс)</strong></p>
        <ul>
          <li><span class="check">✓</span> Люди звикають до роботи в системі</li>
          <li><span class="check">✓</span> Налагоджуються завдання та комунікація</li>
          <li><span class="check">✓</span> З'являється дисципліна виконання</li>
        </ul>
        
        <p><strong>Етап 2: CRM (після звикання до системи)</strong></p>
        <ul>
          <li><span class="check">✓</span> Впроваджуємо систему продажів</li>
          <li><span class="check">✓</span> Інтеграції та автоматизація</li>
          <li><span class="check">✓</span> Контроль угод</li>
        </ul>
        
        <p><strong>Орієнтовна вартість: від 70,000₴</strong><br />
        Термін: 2-3 місяці</p>
      </div>

      <p><strong>Чому це важливо:</strong></p>
      <p>Якщо впровадити тільки CRM без підготовки — ризик провалу 70-80%. Люди просто не будуть користуватися системою.</p>
    `,
    'ideal': `
      <h2>Ви — ідеальний клієнт для впровадження!</h2>
      
      <p><strong>Чому:</strong></p>
      <ul>
        <li><span class="check">✓</span> Базові процеси вже налаштовані в обліку</li>
        <li><span class="check">✓</span> Є розуміння систематизації</li>
        <li><span class="check">✓</span> Команда готова до нових інструментів</li>
        <li><span class="check">✓</span> Чітко видно проблему</li>
      </ul>

      <div class="highlight">
        <h5>Наша рекомендація: Пакет ПРОФЕСІЙНИЙ</h5>
        
        <p><strong>Що зробимо:</strong></p>
        <ul>
          <li><span class="check">✓</span> CRM з інтеграцією в облікову систему</li>
          <li><span class="check">✓</span> Автоматична передача даних (угоди → накладні)</li>
          <li><span class="check">✓</span> Контроль роботи менеджерів</li>
          <li><span class="check">✓</span> Воронка для нових лідів</li>
          <li><span class="check">✓</span> Звітність для власника/РОПа</li>
          <li><span class="check">✓</span> n8n автоматизація рутини</li>
        </ul>
        
        <p><strong>Орієнтовна вартість: від 70,000₴</strong><br />
        Термін впровадження: 1-2 місяці<br />
        Окупність: 3-4 місяці</p>
      </div>
    `,
    'large': `
      <h2>Ви — наш профільний клієнт</h2>
      
      <p><strong>Чому ми підходимо для великих компаній:</strong></p>
      <ul>
        <li><span class="check">✓</span> 10+ років досвіду</li>
        <li><span class="check">✓</span> Розуміємо складні організаційні структури</li>
        <li><span class="check">✓</span> Працювали з компаніями 100+ осіб</li>
        <li><span class="check">✓</span> Знаємо як впроваджувати без зупинки бізнесу</li>
        <li><span class="check">✓</span> Поетапний підхід з мінімізацією ризиків</li>
      </ul>

      <div class="highlight">
        <h5>Наша рекомендація: ІНДИВІДУАЛЬНИЙ підхід</h5>
        
        <p><strong>Типовий план впровадження:</strong></p>
        
        <p><strong>Фаза 1: Корпоративний портал (2-3 міс)</strong></p>
        <p>→ Завдання, комунікація, документообіг<br />
          → Люди звикають до системи<br />
          → Налагоджується внутрішня взаємодія</p>
        
        <p><strong>Фаза 2: CRM + інтеграція обліку (2-3 міс)</strong></p>
        <p>→ Система продажів<br />
          → Автоматичний обмін даними<br />
          → Контроль угод</p>
        
        <p><strong>Фаза 3: Автоматизація процесів (ongoing)</strong></p>
        <p>→ Складні бізнес-процеси<br />
          → AI інтеграції<br />
          → Кастомні модулі</p>
        
        <p><strong>Орієнтовна вартість: від 120,000₴</strong><br />
        Термін: від 4 місяців<br />
        Окупність: 2-3 місяці</p>
      </div>
    `,
    'has-crm': `
      <h2>Наша рекомендація: Аудит + Оптимізація</h2>
      
      <p><strong>Типові проблеми існуючих CRM:</strong></p>
      <div class="info">
        <p>☐ Налаштована не під ваші процеси<br />
          <span style="margin-left: 20px; color: #666;">Менеджери використовують на 30-40%</span></p>
        
        <p>☐ Менеджери обходять систему<br />
          <span style="margin-left: 20px; color: #666;">→ Ведуть Excel паралельно</span></p>
        
        <p>☐ Немає потрібних інтеграцій<br />
          <span style="margin-left: 20px; color: #666;">→ Ручне перенесення даних</span></p>
        
        <p>☐ Складно використовувати<br />
          <span style="margin-left: 20px; color: #666;">→ Багато зайвих функцій</span></p>
        
        <p>☐ Немає навчання<br />
          <span style="margin-left: 20px; color: #666;">→ Кожен працює по-своєму</span></p>
      </div>

      <div class="highlight">
        <h5>Що ми можемо</h5>
        
        <p><strong>1. Аудит поточної системи (2-4 години)</strong></p>
        <ul>
          <li><span class="check">✓</span> Проаналізуємо як налаштована CRM</li>
          <li><span class="check">✓</span> Знайдемо де втрачаються клієнти</li>
          <li><span class="check">✓</span> Виявимо що заважає роботі</li>
        </ul>
        
        <p><strong>2. Оптимізація (1-2 тижні)</strong></p>
        <ul>
          <li><span class="check">✓</span> Оптимізуємо процеси під ваші задачі</li>
          <li><span class="check">✓</span> Прибираємо зайве, додаємо потрібне</li>
          <li><span class="check">✓</span> Налаштуємо інтеграції</li>
        </ul>
        
        <p><strong>3. Навчання команди (1 день)</strong></p>
        <ul>
          <li><span class="check">✓</span> Покажемо як правильно працювати</li>
          <li><span class="check">✓</span> Навчимо всіх одночасно</li>
        </ul>
      </div>
    `
  }

  return recommendations[clientType] || ''
}

// Функція для форматирования текста анализа квиза (текстовая версия для вебхука)
function formatQuizAnalysis(answers: any, result: any, clientType: string): string {
  const profile = result?.profile || {}
  const clientTypeLabels: Record<string, string> = {
    'startup': 'Не підходить',
    'small': 'Рекомендовано',
    'medium-risk': 'Середній ризик',
    'ideal': 'Ідеально',
    'large': 'Преміум',
    'has-crm': 'Є CRM'
  }

  let text = `РЕЗУЛЬТАТ ДІАГНОСТИКИ\n`
  text += `========================\n\n`
  text += `Тип клієнта: ${clientTypeLabels[clientType] || clientType}\n\n`

  if (profile.businessType) {
    text += `Тип бізнесу: ${profile.businessType}\n`
  }
  if (profile.teamSize) {
    text += `Розмір команди: ${profile.teamSize}\n`
  }
  if (profile.systems && profile.systems.length > 0) {
    text += `Системи: ${profile.systems.join(', ')}\n`
  }
  if (profile.painsList && profile.painsList.length > 0) {
    text += `Проблеми: ${profile.painsList.join(', ')}\n`
  }
  if (profile.decisionMaker) {
    text += `Приймає рішення: ${profile.decisionMaker}\n`
  }

  text += `\n========================\n`
  text += `Детальні рекомендації та план дій дивіться на сайті.\n`

  return text
}

// Функція для відправки результата квиза на email пользователю
async function sendQuizResultToUser(params: {
  to: string
  name: string
  clientType: string
  htmlContent: string
  profile: any
}): Promise<boolean> {
  try {
    const webhookUrl = "https://n8n.crmcustoms.com/webhook/f14880e5-5d4a-4c6d-bc8c-69d82ef68acc"

    const payload = {
      emailType: "quiz_result",
      to: params.to,
      subject: "Результат діагностики CRM",
      name: params.name,
      clientType: params.clientType,
      htmlContent: params.htmlContent, // HTML версия результата (как на сайте)
      profile: params.profile,
      timestamp: new Date().toISOString(),
    }

    console.log("=== SENDING QUIZ RESULT EMAIL ===")
    console.log("To:", params.to)
    console.log("Payload:", JSON.stringify(payload, null, 2))
    console.log("==================================\n")

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error(`Помилка відправки email: ${response.status} ${response.statusText}`)
    }

    await response.json().catch(() => ({}))
    return true
  } catch (error) {
    console.error("Помилка відправки результата на email:", error)
    return false
  }
}

// Функція для відправки email повідомлення
// В реальному проекті тут буде інтеграція з сервісом відправки email
async function sendEmailNotification(params: Record<string, any>): Promise<boolean> {
  try {
    // Всі форми відправляються на один вебхук
    const webhookUrl = "https://n8n.crmcustoms.com/webhook/f14880e5-5d4a-4c6d-bc8c-69d82ef68acc"

    // Формируем payload только из отдельных полей
    const payload = {
      ...params,
      timestamp: new Date().toISOString(),
    }

    console.log("=== WEBHOOK REQUEST ===")
    console.log("URL:", webhookUrl)
    console.log("Payload:", JSON.stringify(payload, null, 2))
    console.log("=======================\n")

    // Відправка даних на вебхук
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error(`Помилка відправки даних: ${response.status} ${response.statusText}`)
    }

    await response.json().catch(() => ({}))
    return true
  } catch (error) {
    console.error("Помилка відправки даних на вебхук:", error)
    return false
  }
}
