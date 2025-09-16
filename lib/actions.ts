"use server"

import { z } from "zod"

// Схема валідації для контактної форми
const contactFormSchema = z.object({
  name: z.string().min(2, { message: "Ім'я повинно містити щонайменше 2 символи" }),
  email: z.string().email({ message: "Введіть коректну email адресу" }),
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
    if (formType === "subscribe") {
      // Валідація форми підписки
      const validatedFields = subscribeFormSchema.safeParse({
        email: formData.get("email"),
        formType,
      })

      if (!validatedFields.success) {
        return {
          success: false,
          message: "Помилка валідації форми. Перевірте введені дані.",
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

      return {
        success: true,
        message: "Дякуємо за підписку! Ми надіслали вам лист для підтвердження.",
        data: validatedFields.data,
      }
    } else {
      // Валідація контактної форми
      const validatedFields = contactFormSchema.safeParse({
        name: formData.get("name"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        message: formData.get("message"),
        formType,
      })

      if (!validatedFields.success) {
        return {
          success: false,
          message: "Помилка валідації форми. Перевірте введені дані.",
        }
      }

      // Тут буде код для відправки email з даними контактної форми
      console.log("Дані контактної форми:", validatedFields.data)

      // Імітуємо відправку запиту на сервер
      await sendEmailNotification({
        to: "your-email@example.com",
        subject: "Нова заявка з сайту",
        name: validatedFields.data.name,
        email: validatedFields.data.email,
        phone: validatedFields.data.phone || "Не вказано",
        message: validatedFields.data.message || "Не вказано",
        formType: validatedFields.data.formType,
        date: new Date().toLocaleString(),
      })

      return {
        success: true,
        message: "Дякуємо за ваше звернення! Ми зв'яжемося з вами найближчим часом.",
        data: validatedFields.data,
      }
    }
  } catch (error) {
    console.error("Помилка відправки форми:", error)
    return {
      success: false,
      message: "Сталася помилка при відправці форми. Спробуйте пізніше.",
    }
  }
}

// Функція для відправки email повідомлення
// В реальному проекті тут буде інтеграція з сервісом відправки email
async function sendEmailNotification(params: Record<string, any>): Promise<boolean> {
  try {
    const webhookUrl = "https://n8n.crmcustoms.com/webhook/f14880e5-5d4a-4c6d-bc8c-69d82ef68acc"

    // Формируем payload только из отдельных полей
    const payload = {
      ...params,
      timestamp: new Date().toISOString(),
    }

    console.log("Відправка даних на вебхук:", webhookUrl)
    console.log("Дані для відправки:", payload)

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
