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

      // Формируем текст анализа для email
      const analysisText = formatQuizAnalysis(answersData, resultData, formData.get("clientType") as string)

      // Відправка даних квиза
      console.log("Дані квиза:", {
        name: validatedFields.data.name,
        phone: validatedFields.data.phone,
        email: validatedFields.data.email,
        answers: answersData,
        clientType: formData.get("clientType"),
        result: resultData,
      })

      // Отправка на вебхук для администратора
      const response = await sendEmailNotification({
        to: "your-email@example.com",
        subject: "Нова заявка з квиза діагностики",
        name: validatedFields.data.name,
        email: validatedFields.data.email || "Не вказано",
        phone: validatedFields.data.phone || "Не вказано",
        formType: "quiz",
        answers: answersData, // Отправляем как объект, а не строку
        clientType: formData.get("clientType") as string,
        result: resultData, // Отправляем результат
        analysis: analysisText, // Текст анализа для удобства
        callTime: formData.get("callTime") as string,
        otherTime: formData.get("otherTime") as string,
        date: new Date().toLocaleString(),
      })

      // Отправка email пользователю с анализом (если email указан)
      if (validatedFields.data.email) {
        await sendQuizResultToUser({
          to: validatedFields.data.email,
          name: validatedFields.data.name,
          clientType: formData.get("clientType") as string,
          analysis: analysisText,
          profile: resultData.profile || {},
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

// Функція для форматирования текста анализа квиза
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
  analysis: string
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
      analysis: params.analysis,
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
