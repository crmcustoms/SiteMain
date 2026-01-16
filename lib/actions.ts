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

      // Генерируем рекомендации для менеджера
      const managerRecs = generateManagerRecommendationsHTML(clientType, answersData, profile)
      console.log("=== MANAGER RECOMMENDATIONS ===")
      console.log("Client Type:", clientType)
      console.log("Recommendations length:", managerRecs.length)
      console.log("First 200 chars:", managerRecs.substring(0, 200))
      console.log("================================\n")

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
        analysisHTML: htmlAnalysis, // HTML версия анализа (как на сайте) - только для клиента
        // HTML с рекомендациями для менеджера (клиентский результат + разделитель + рекомендации)
        htmlContent: htmlAnalysis + managerRecs,
        recommendations: generateRecommendationsHTML(clientType), // Рекомендации отдельно (старая версия, для совместимости)
        managerRecommendations: managerRecs, // Новые рекомендации для менеджера
        callTime: formData.get("callTime") as string,
        otherTime: formData.get("otherTime") as string,
        date: new Date().toLocaleString(),
      })

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
        message: "Дякуємо за підписку!",
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

// Функція для генерации рекомендаций для менеджера
function generateManagerRecommendations(clientType: string, answers: any, profile: any): string {
  const decisionMakerLabels: Record<string, string> = {
    'owner': 'Власник',
    'director': 'Директор (найманий)',
    'head': 'Керівник відділу',
    'responsible': 'Відповідальний за проєкт'
  }

  // Извлекаем данные из profile или answers
  const decisionMaker = profile?.decisionMaker 
    ? decisionMakerLabels[profile.decisionMaker as string] || profile.decisionMaker
    : (answers?.decisionMaker ? decisionMakerLabels[answers.decisionMaker as string] : 'Не вказано')
  
  const businessType = profile?.businessType || answers?.businessType || 'Не вказано'
  const teamSize = profile?.teamSize || answers?.teamSize || 'Не вказано'
  
  // systems может быть массивом строк или объектом
  let systems: string[] = []
  if (profile?.systems) {
    if (Array.isArray(profile.systems)) {
      systems = profile.systems
    } else if (typeof profile.systems === 'object') {
      // Если это объект, извлекаем ключи где значение true
      systems = Object.keys(profile.systems).filter(key => profile.systems[key])
    }
  }
  
  const painsList = profile?.painsList || (answers?.pains ? (Array.isArray(answers.pains) ? answers.pains : []) : [])

  let html = `
    <div style="margin-top: 60px; padding-top: 40px; border-top: 4px solid #FFD700;">
      <div style="background: #FFD700; border: 2px solid #000; padding: 20px; margin-bottom: 30px;">
        <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 3px; color: #000; margin-bottom: 10px; font-family: monospace;">
          // INTERNAL USE ONLY
        </div>
        <h2 style="font-size: 28px; font-weight: bold; color: #000; margin: 10px 0;">
          РЕКОМЕНДАЦІЇ ДЛЯ МЕНЕДЖЕРА
        </h2>
        <p style="font-size: 14px; color: #000; font-weight: bold;">
          ⚠️ Ця інформація НЕ видима клієнту
        </p>
      </div>
  `

  // Генерируем рекомендации в зависимости от типа клиента
  const recommendations = getRecommendationsByType(clientType, decisionMaker, businessType, teamSize, systems, painsList)
  html += recommendations

  html += `
    </div>
  `

  return html
}

// Функція для получения рекомендаций по типу клиента
function getRecommendationsByType(
  clientType: string,
  decisionMaker: string,
  businessType: string,
  teamSize: string,
  systems: string[],
  painsList: string[]
): string {
  const recommendations: Record<string, string> = {
    'startup': `
      <div style="margin-bottom: 30px;">
        <h3 style="font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #000;">
          1. ТИП КЛІЄНТА
        </h3>
        <p style="font-size: 16px; margin-bottom: 20px;">Стартап (не підходить для повного впровадження)</p>

        <h3 style="font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #000;">
          2. ХАРАКТЕРИСТИКА
        </h3>
        <ul style="margin-bottom: 20px; padding-left: 20px;">
          <li>Команда: ${teamSize}</li>
          <li>Немає CRM, немає обліку</li>
          <li>Не розуміють що хочуть від автоматизації</li>
          <li>Шукають "рожевого єдинорога"</li>
          <li>Немає грошей на повноцінне впровадження</li>
          <li>Власник в операційці 24/7</li>
        </ul>

        <h3 style="font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #000;">
          3. ЧОГО ХОЧЕ КЛІЄНТ
        </h3>
        <ul style="margin-bottom: 20px; padding-left: 20px;">
          <li>Швидко і недорого</li>
          <li>"Магічну кнопку" яка вирішить всі проблеми</li>
          <li>Не розуміє що йому потрібна система продажів, а не CRM</li>
          <li>Думає що CRM дасть йому клієнтів</li>
        </ul>

        <h3 style="font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #000;">
          4. ХТО ЛПР
        </h3>
        <p style="margin-bottom: 20px;">${decisionMaker}</p>

        <div style="background: #FEF2F2; border: 2px solid #DC2626; padding: 20px; margin-bottom: 20px;">
          <h3 style="font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #DC2626;">
            5. РЕКОМЕНДАЦІЯ ДЛЯ МЕНЕДЖЕРА
          </h3>
          <p style="font-weight: bold; margin-bottom: 10px;">⚠️ НЕ ВІДМОВЛЯЙ КЛІЄНТУ ВІДРАЗУ!</p>
          <p style="margin-bottom: 10px;">Завжди пропонуй альтернативи:</p>
          <ul style="padding-left: 20px; margin-bottom: 10px;">
            <li>Мінімальний пакет 5,000₴ - якщо є готова CRM</li>
            <li>Консультація по процесах - допоможи визначити що реально потрібно</li>
            <li>"Повернутися пізніше" - коли буде 5-10 клієнтів, 3+ менеджери</li>
            <li>Інші послуги компанії</li>
          </ul>
          <p><strong>Наша мета:</strong> залишити позитивне враження. Вони можуть повернутися або порекомендувати нас!</p>
        </div>

        <h3 style="font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #000;">
          6. ЩО ПРОПОНУВАТИ
        </h3>
        <div style="background: #F8F9FA; border: 1px solid #ddd; padding: 15px; margin-bottom: 20px;">
          <p style="font-weight: bold; margin-bottom: 10px;">Зараз НЕ підходить:</p>
          <ul style="padding-left: 20px; margin-bottom: 15px;">
            <li>Повне впровадження CRM - передчасно</li>
            <li>Складна автоматизація - не потягнуть</li>
          </ul>
          <p style="font-weight: bold; margin-bottom: 10px;">Можна запропонувати:</p>
          <ul style="padding-left: 20px;">
            <li>Мінімальний пакет (5К) - якщо є розуміння та готова CRM</li>
            <li>Консультація по процесах (5-10К) - розібратися що потрібно</li>
            <li>Excel шаблони для обліку - безкоштовно/символічно</li>
            <li>Повернутися через 3-6 місяців</li>
          </ul>
        </div>

        <h3 style="font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #000;">
          7. ЯК ПРАЦЮВАТИ
        </h3>
        <ol style="padding-left: 20px; margin-bottom: 20px;">
          <li style="margin-bottom: 10px;"><strong>Зателефонуй протягом години</strong> (як обіцяли)</li>
          <li style="margin-bottom: 10px;"><strong>З'ясуй справжню потребу:</strong> Що болить зараз найбільше? Скільки клієнтів на місяць? Який оборот? Які плани на зростання?</li>
          <li style="margin-bottom: 10px;"><strong>Поясни чесно:</strong> "На вашому етапі CRM не вирішить проблему. Зараз важливіше налагодити потік клієнтів та продажі. Коли буде 5-10 постійних клієнтів - повертайтеся."</li>
          <li style="margin-bottom: 10px;"><strong>Запропонуй альтернативу:</strong> Консультацію, мінімальний пакет, інші послуги, перенесення на 3-6 місяців</li>
          <li style="margin-bottom: 10px;"><strong>Залиш позитивне враження:</strong> Дай корисну пораду, порекомендуй безкоштовні інструменти, додай в список "розігріву", нагадай через 3 місяці</li>
        </ol>

        <h3 style="font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #000;">
          8. НА ЩО ЗВЕРНУТИ УВАГУ
        </h3>
        <div style="background: #FFF7ED; border: 1px solid #F59E0B; padding: 15px; margin-bottom: 20px;">
          <p style="font-weight: bold; margin-bottom: 10px;">Ризики якщо все ж взятися:</p>
          <ul style="padding-left: 20px; margin-bottom: 15px;">
            <li>Не буде результату - не готові до систем</li>
            <li>Негативний відгук - очікування не виправдаються</li>
            <li>Втрата часу - постійні зміни вимог</li>
            <li>Невиплата - немає грошей</li>
          </ul>
          <p style="font-weight: bold; margin-bottom: 10px;">Можна братися якщо:</p>
          <ul style="padding-left: 20px;">
            <li>Є досвід роботи з стартапами</li>
            <li>Готовий до консалтингу та навчання</li>
            <li>Домовилися про етапну оплату</li>
            <li>Власник адекватний та готовий вчитися</li>
          </ul>
        </div>

        <h3 style="font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #000;">
          9. ДОДАТКОВІ МОЖЛИВОСТІ
        </h3>
        <p style="margin-bottom: 10px;"><strong>Що можна продати зараз:</strong></p>
        <ul style="padding-left: 20px; margin-bottom: 15px;">
          <li>Консультація "Як підготуватися до впровадження" - 5-10К</li>
          <li>Аудит бізнес-процесів - 10-15К</li>
          <li>Готові шаблони для самостійного налаштування</li>
        </ul>
        <p style="margin-bottom: 10px;"><strong>Що продати потім (через 3-6 міс):</strong></p>
        <ul style="padding-left: 20px; margin-bottom: 15px;">
          <li>Повноцінне впровадження СТАРТ - 25К</li>
          <li>Підтримка після самостійного налаштування</li>
        </ul>
        <p><strong>LTV клієнта:</strong> 10,000-50,000₴ (якщо повернеться і виросте)</p>
      </div>
    `,
    'small': `
      <div style="margin-bottom: 30px;">
        <h3 style="font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #000;">
          1. ТИП КЛІЄНТА
        </h3>
        <p style="font-size: 16px; margin-bottom: 20px;">Малий бізнес - СТАРТ (25,000₴)</p>

        <h3 style="font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #000;">
          2. ХАРАКТЕРИСТИКА
        </h3>
        <ul style="margin-bottom: 20px; padding-left: 20px;">
          <li>Команда: ${teamSize}</li>
          <li>Немає CRM або вона не використовується</li>
          <li>Можливо є система обліку (${systems.join(', ') || 'немає'})</li>
          <li>Типовий клієнт - найбільша категорія</li>
          <li>Є базове розуміння що потрібно</li>
          <li>Готові інвестувати в розвиток</li>
        </ul>

        <h3 style="font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #000;">
          3. ЧОГО ХОЧЕ КЛІЄНТ
        </h3>
        <ul style="margin-bottom: 20px; padding-left: 20px;">
          <li>"Хочу швидко і відразу"</li>
          <li>Не сильно розуміє в IT, почув від знайомих</li>
          <li>Потрібен робочий інструмент для перших показників продажів</li>
          <li>Важливий швидкий результат</li>
          <li>Хоче контролювати менеджерів</li>
          <li>Розуміти звідки йдуть клієнти</li>
        </ul>

        <h3 style="font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #000;">
          4. ХТО ЛПР
        </h3>
        <p style="margin-bottom: 20px;">${decisionMaker}</p>

        <div style="background: #D1FAE5; border: 2px solid #10B981; padding: 20px; margin-bottom: 20px;">
          <h3 style="font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #065F46;">
            5. РЕКОМЕНДАЦІЯ ДЛЯ МЕНЕДЖЕРА
          </h3>
          <p style="font-weight: bold; margin-bottom: 10px; font-size: 18px;">✓ ЦЕ ІДЕАЛЬНИЙ КЛІЄНТ ДЛЯ БАЗОВОГО ВПРОВАДЖЕННЯ!</p>
          <p style="margin-bottom: 10px;">Продавай СТАРТ впевнено:</p>
          <ul style="padding-left: 20px; margin-bottom: 10px;">
            <li>Це саме їхній пакет</li>
            <li>Акцентуй на швидкому результаті (2-3 тижні)</li>
            <li>Обіцяй перші продажі через CRM за місяць</li>
            <li>Обов'язково проводь аудит перед стартом</li>
          </ul>
          <p style="margin-bottom: 10px;"><strong>Чому вони купують:</strong></p>
          <ul style="padding-left: 20px;">
            <li>Бачать що бізнес росте, а контролю немає</li>
            <li>Менеджери працюють як хочуть</li>
            <li>Власник не розуміє що відбувається</li>
            <li>Конкуренти вже впровадили CRM</li>
          </ul>
        </div>

        <h3 style="font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #000;">
          6. ЩО ПРОПОНУВАТИ
        </h3>
        <div style="background: #F8F9FA; border: 1px solid #ddd; padding: 15px; margin-bottom: 20px;">
          <p style="font-weight: bold; margin-bottom: 10px;">Основне: Пакет СТАРТ (25,000₴)</p>
          <p style="margin-bottom: 10px;"><strong>Що входить:</strong></p>
          <ul style="padding-left: 20px; margin-bottom: 10px;">
            <li>Аудит (2 години, безкоштовно)</li>
            <li>Підбір CRM під бізнес</li>
            <li>Налаштування воронок та статусів</li>
            <li>До 3 базових інтеграцій</li>
            <li>Базові автоматизації</li>
            <li>Вебінар для команди (1-2 години)</li>
            <li>Тиждень технічної підтримки</li>
          </ul>
          <p><strong>Термін:</strong> 2-3 тижні | <strong>Окупність:</strong> 2-3 місяці</p>
        </div>

        <h3 style="font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #000;">
          7. ЯК ПРАЦЮВАТИ
        </h3>
        <div style="background: #EFF6FF; border: 1px solid #3B82F6; padding: 15px; margin-bottom: 20px;">
          <p style="font-weight: bold; margin-bottom: 10px;">Скрипт першого дзвінка:</p>
          <p style="font-style: italic; margin-bottom: 15px;">
            "Вітаю [Ім'я]! Бачу у вас ${businessType}, команда ${teamSize}. Типова ситуація - менеджери працюють як хочуть, власник не бачить що відбувається, непрозоро звідки клієнти. У вас так само?"
          </p>
          <p style="margin-bottom: 10px;"><strong>Пропоную безкоштовний аудит</strong> - 2 години, розберемося в процесах, покажу як CRM вирішить ваші болі. Коли вам зручно?"</p>
        </div>
        <p style="margin-bottom: 10px;"><strong>Етапи роботи:</strong></p>
        <ol style="padding-left: 20px;">
          <li style="margin-bottom: 10px;"><strong>Перший дзвінок (день 1):</strong> Підтверди що зрозумів їхні болі, запропонуй аудит, відправ підтвердження</li>
          <li style="margin-bottom: 10px;"><strong>Аудит (день 2-3):</strong> 2 години zoom/офіс, розберися в процесах, покажи демо, з'ясуй справжні болі</li>
          <li style="margin-bottom: 10px;"><strong>ТЗ та КП (день 4-5):</strong> Детальне ТЗ, комерційна пропозиція, договір + 50% передоплата</li>
          <li style="margin-bottom: 10px;"><strong>Впровадження (2-3 тижні):</strong> Налаштування → Тестування → Навчання → Запуск</li>
          <li style="margin-bottom: 10px;"><strong>Підтримка (тиждень):</strong> Відповіді на питання, дрібні правки, контроль використання</li>
        </ol>

        <h3 style="font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #000;">
          8. НА ЩО ЗВЕРНУТИ УВАГУ
        </h3>
        <div style="background: #FFF7ED; border: 1px solid #F59E0B; padding: 15px; margin-bottom: 20px;">
          <p style="font-weight: bold; margin-bottom: 10px;">Ризики:</p>
          <ul style="padding-left: 20px; margin-bottom: 15px;">
            <li>Можуть хотіти "все і відразу" → чітко обмеж межі СТАРТ пакету</li>
            <li>Власник може змінювати думку → фіксуй ТЗ письмово</li>
            <li>Команда може опиратися → залучай їх в процес з початку</li>
            <li>Очікують миттєвий результат → поясни що треба місяць роботи</li>
          </ul>
          <p style="font-weight: bold; margin-bottom: 10px;">Показники успіху:</p>
          <ul style="padding-left: 20px;">
            <li>80%+ угод ведуться в CRM через місяць</li>
            <li>Власник бачить звіти без запитів</li>
            <li>Менеджери самі ставлять завдання</li>
            <li>Зрозуміло хто скільки продав</li>
          </ul>
        </div>

        <h3 style="font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #000;">
          9. ДОДАТКОВІ МОЖЛИВОСТІ
        </h3>
        <p style="margin-bottom: 10px;"><strong>Що можна допродати зараз:</strong></p>
        <ul style="padding-left: 20px; margin-bottom: 15px;">
          <li>Інтеграція з обліком (якщо є) - 20-30К</li>
          <li>Додаткові інтеграції - 5-10К кожна</li>
          <li>n8n автоматизація - 15-30К</li>
        </ul>
        <p style="margin-bottom: 10px;"><strong>Що продати через 3-6 місяців:</strong></p>
        <ul style="padding-left: 20px; margin-bottom: 15px;">
          <li>Супровід - 12,500₴/міс (дуже легко продається!)</li>
          <li>Маркетингова автоматизація - 20-30К</li>
          <li>Апгрейд до ПРОФЕСІЙНИЙ - 45К</li>
        </ul>
        <p><strong>LTV клієнта:</strong> 80,000-150,000₴</p>
      </div>
    `,
    'medium-risk': `
      <div style="margin-bottom: 30px;">
        <h3 style="font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #000;">
          1. ТИП КЛІЄНТА
        </h3>
        <p style="font-size: 16px; margin-bottom: 20px;">Середній бізнес без систем - РИЗИК</p>

        <h3 style="font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #000;">
          2. ХАРАКТЕРИСТИКА
        </h3>
        <ul style="margin-bottom: 20px; padding-left: 20px;">
          <li>Команда: ${teamSize}</li>
          <li>Немає CRM, немає обліку, або все погано ведеться</li>
          <li>Хаос в управлінні</li>
          <li>Відсутня культура менеджменту</li>
          <li>Все тримається на енергії власника</li>
        </ul>

        <div style="background: #FEF2F2; border: 2px solid #DC2626; padding: 20px; margin-bottom: 20px;">
          <h3 style="font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #DC2626;">
            5. РЕКОМЕНДАЦІЯ ДЛЯ МЕНЕДЖЕРА
          </h3>
          <p style="font-weight: bold; margin-bottom: 10px; font-size: 18px;">⚠️ СКЛАДНИЙ КЛІЄНТ! ВИСОКИЙ РИЗИК ПРОВАЛУ!</p>
          <p style="margin-bottom: 10px;"><strong>Чому складно:</strong></p>
          <ul style="padding-left: 20px; margin-bottom: 15px;">
            <li>CRM не замінить управління</li>
            <li>Немає культури виконання</li>
            <li>Опір буде дуже сильний</li>
            <li>Власник очікує чуда</li>
          </ul>
          <p style="font-weight: bold; margin-bottom: 10px;">Коли можна братися:</p>
          <ul style="padding-left: 20px;">
            <li>Великий досвід впровадження (5+ проєктів)</li>
            <li>Готовий до консалтингу та менторингу</li>
            <li>Власник розуміє що треба міняти процеси</li>
            <li>Бюджет на поетапне впровадження (70К+)</li>
          </ul>
        </div>

        <h3 style="font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #000;">
          6. ЩО ПРОПОНУВАТИ
        </h3>
        <div style="background: #F8F9FA; border: 1px solid #ddd; padding: 15px; margin-bottom: 20px;">
          <p style="font-weight: bold; margin-bottom: 10px;">НЕ продавай тільки CRM! Ризик провалу 70-80%!</p>
          <p style="margin-bottom: 10px;"><strong>Правильний підхід: ПОЕТАПНЕ ВПРОВАДЖЕННЯ</strong></p>
          <p style="margin-bottom: 10px;"><strong>Етап 1: Корпоративний портал (1-1.5 міс) - 25-35К</strong></p>
          <ul style="padding-left: 20px; margin-bottom: 15px;">
            <li>Люди звикають до роботи в системі</li>
            <li>Налагоджуються завдання та комунікація</li>
            <li>З'являється дисципліна виконання</li>
          </ul>
          <p style="margin-bottom: 10px;"><strong>Етап 2: CRM (після звикання) - 40-50К</strong></p>
          <ul style="padding-left: 20px;">
            <li>Впроваджуємо систему продажів</li>
            <li>Інтеграції та автоматизація</li>
            <li>Контроль угод</li>
          </ul>
          <p style="margin-top: 15px;"><strong>Загальна вартість: від 70,000₴ | Термін: 2-3 місяці</strong></p>
        </div>

        <h3 style="font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #000;">
          7. ЯК ПРАЦЮВАТИ
        </h3>
        <div style="background: #EFF6FF; border: 1px solid #3B82F6; padding: 15px; margin-bottom: 20px;">
          <p style="font-weight: bold; margin-bottom: 10px;">Скрипт першого дзвінка:</p>
          <p style="font-style: italic; margin-bottom: 15px;">
            "Вітаю [Ім'я]! Бачу у вас команда ${teamSize}, це перехідний розмір - найскладніший для автоматизації. Маю досвід з такими компаніями. Головна проблема зазвичай не в відсутності CRM, а в тому що немає культури виконання. CRM не замінить менеджмент, вона тільки підсвітить проблеми. Розповісти як правильно впроваджувати в такій ситуації?"
          </p>
        </div>
        <p style="margin-bottom: 10px;"><strong>Етапи роботи:</strong></p>
        <ol style="padding-left: 20px;">
          <li style="margin-bottom: 10px;"><strong>Діагностичний аудит (4-6 годин!):</strong> НЕ тільки процеси, але й культура. Поговори з 3-5 співробітниками</li>
          <li style="margin-bottom: 10px;"><strong>Чесна розмова з власником:</strong> "CRM сама не вирішить проблему. Є план як зробити правильно, але це довше і дорожче."</li>
          <li style="margin-bottom: 10px;"><strong>Етап 1 - Портал (1-1.5 міс):</strong> Зібрання з командою, навчання, щоденний моніторинг, активна підтримка</li>
          <li style="margin-bottom: 10px;"><strong>Етап 2 - CRM (тільки якщо етап 1 успішний):</strong> Впровадження CRM, інтеграції, навчання</li>
        </ol>

        <h3 style="font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #000;">
          8. НА ЩО ЗВЕРНУТИ УВАГУ
        </h3>
        <div style="background: #FEF2F2; border: 1px solid #DC2626; padding: 15px; margin-bottom: 20px;">
          <p style="font-weight: bold; margin-bottom: 10px; color: #DC2626;">КРИТИЧНІ РИЗИКИ:</p>
          <ul style="padding-left: 20px; margin-bottom: 15px;">
            <li><strong>Немає менеджменту:</strong> Люди не виконують завдання в строк → Рішення: Спочатку портал, потім CRM</li>
            <li><strong>Опір співробітників:</strong> "Нам і так норм" → Рішення: Залучай команду, показуй вигоду</li>
            <li><strong>Власник хоче чуда:</strong> "CRM вирішить все проблеми" → Рішення: Чесна розмова про обмеження</li>
          </ul>
          <p style="font-weight: bold; margin-bottom: 10px; color: #DC2626;">ПОКАЗНИКИ ПРОВАЛУ (стоп-сигнали):</p>
          <ul style="padding-left: 20px;">
            <li>Через тиждень використання &lt;30% команди</li>
            <li>Власник сам не користується</li>
            <li>Постійні зміни вимог</li>
            <li>Співробітники відкрито саботують</li>
          </ul>
          <p style="margin-top: 10px; font-style: italic;">→ В такому випадку: зупини проєкт, поверни частину грошей, залиш хороше враження. Краще зупинити ніж провалити.</p>
        </div>

        <h3 style="font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #000;">
          9. ДОДАТКОВІ МОЖЛИВОСТІ
        </h3>
        <p><strong>LTV клієнта:</strong> 200,000-300,000₴ (якщо успішно) або втрата часу та репутації (якщо провал)</p>
      </div>
    `,
    'ideal': `
      <div style="margin-bottom: 30px;">
        <h3 style="font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #000;">
          1. ТИП КЛІЄНТА
        </h3>
        <p style="font-size: 16px; margin-bottom: 20px;">Ідеальний клієнт 🎯 - ПРОФЕСІЙНИЙ (70,000₴)</p>

        <h3 style="font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #000;">
          2. ХАРАКТЕРИСТИКА
        </h3>
        <ul style="margin-bottom: 20px; padding-left: 20px;">
          <li>Команда: ${teamSize}</li>
          <li>Є система обліку (${systems.join(', ') || 'не вказано'})</li>
          <li>Немає CRM або вона не використовується</li>
          <li>Базові процеси вже налаштовані</li>
          <li>Є розуміння цінності систем</li>
          <li>Готові платити за якість</li>
        </ul>
        <p style="font-weight: bold; color: #10B981; font-size: 18px;">💰 ЦЕ НАЙКРАЩИЙ ТИП КЛІЄНТА!</p>

        <h3 style="font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #000;">
          3. ЧОГО ХОЧЕ КЛІЄНТ
        </h3>
        <p style="margin-bottom: 10px;"><strong>Типова ситуація (90% випадків):</strong></p>
        <ul style="margin-bottom: 20px; padding-left: 20px;">
          <li>Менеджери працюють тільки зі старою базою постійних клієнтів</li>
          <li>Нових клієнтів не розвивають</li>
          <li>Власник не бачить воронку продажів</li>
          <li>Немає зв'язку між лідами та продажами</li>
          <li>Дані в обліку, але без аналітики</li>
        </ul>

        <h3 style="font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #000;">
          4. ХТО ЛПР
        </h3>
        <p style="margin-bottom: 20px;">${decisionMaker}</p>

        <div style="background: #D1FAE5; border: 2px solid #10B981; padding: 20px; margin-bottom: 20px;">
          <h3 style="font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #065F46;">
            5. РЕКОМЕНДАЦІЯ ДЛЯ МЕНЕДЖЕРА
          </h3>
          <p style="font-weight: bold; margin-bottom: 10px; font-size: 18px;">🎯 СУПЕРЦІЛЕВИЙ КЛІЄНТ! ЗАКРИВАЙ НА МАКСИМУМ!</p>
          <p style="margin-bottom: 10px;"><strong>Чому вони ідеальні:</strong></p>
          <ul style="padding-left: 20px; margin-bottom: 15px;">
            <li>✓ Розуміють цінність автоматизації (працюють з обліком)</li>
            <li>✓ Є гроші на якісне впровадження</li>
            <li>✓ Чітко розуміють свою проблему</li>
            <li>✓ Команда вже звикла до роботи в системах</li>
            <li>✓ Швидка окупність (3-4 місяці)</li>
            <li>✓ Найвищий % успішних впроваджень</li>
          </ul>
          <p style="margin-bottom: 10px;"><strong>Твоя задача:</strong></p>
          <ul style="padding-left: 20px;">
            <li>Продавай ПРОФЕСІЙНИЙ пакет впевнено</li>
            <li>Акцентуй на інтеграції CRM + облік</li>
            <li>Покажи як менеджери почнуть працювати з новими</li>
            <li>Обіцяй що власник побачить всю воронку</li>
            <li>Гарантуй результат через 2-3 місяці</li>
          </ul>
        </div>

        <h3 style="font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #000;">
          6. ЩО ПРОПОНУВАТИ
        </h3>
        <div style="background: #F8F9FA; border: 1px solid #ddd; padding: 15px; margin-bottom: 20px;">
          <p style="font-weight: bold; margin-bottom: 10px;">Основне: Пакет ПРОФЕСІЙНИЙ (70,000₴)</p>
          <p style="margin-bottom: 10px;"><strong>Що входить:</strong></p>
          <ul style="padding-left: 20px; margin-bottom: 10px;">
            <li>Глибокий аудит (2-3 дні)</li>
            <li>CRM впровадження під ключ</li>
            <li>Інтеграція з обліковою системою ⭐ (основна цінність!)</li>
            <li>До 7 інтеграцій</li>
            <li>n8n автоматизація</li>
            <li>Налаштування аналітики</li>
            <li>Навчання команди (4-8 годин)</li>
            <li>Місяць підтримки</li>
            <li>Документація</li>
          </ul>
          <p><strong>Термін:</strong> 1-2 місяці | <strong>Окупність:</strong> 3-4 місяці</p>
        </div>

        <h3 style="font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #000;">
          7. ЯК ПРАЦЮВАТИ
        </h3>
        <div style="background: #EFF6FF; border: 1px solid #3B82F6; padding: 15px; margin-bottom: 20px;">
          <p style="font-weight: bold; margin-bottom: 10px;">Скрипт першого дзвінка:</p>
          <p style="font-style: italic; margin-bottom: 15px;">
            "Вітаю [Ім'я]! Бачу у вас є ${systems[0] || 'облікова система'} - це чудово, базові процеси вже налаштовані. Типова ситуація у компаній з обліком але без CRM - менеджери працюють тільки зі старою базою, а нові ліди обробляються погано. У вас так само?"
          </p>
          <p style="margin-bottom: 10px;">Пропоную зробити аудит - 2-3 години, покажу як ми інтегруємо CRM з вашим обліком, щоб власник бачив всю воронку від ліда до оплати, менеджери почали обробляти нових клієнтів, дані автоматично летіли в облік. Коли вам зручно?"</p>
        </div>
        <p style="margin-bottom: 10px;"><strong>Етапи роботи (1-2 місяці):</strong></p>
        <ol style="padding-left: 20px;">
          <li style="margin-bottom: 10px;"><strong>Глибокий аудит (2-3 дні):</strong> Процеси продажів, облікова система, інтеграція</li>
          <li style="margin-bottom: 10px;"><strong>ТЗ (тиждень):</strong> Детальне ТЗ з схемою інтеграції CRM ↔ Облік</li>
          <li style="margin-bottom: 10px;"><strong>Впровадження (3-6 тижнів):</strong> Налаштування CRM → Інтеграція з обліком ⭐ → Інші інтеграції</li>
          <li style="margin-bottom: 10px;"><strong>Запуск (тиждень):</strong> Навчання всіх рівнів, запуск на реальних даних</li>
          <li style="margin-bottom: 10px;"><strong>Підтримка (місяць):</strong> Щоденний моніторинг, оптимізація, контроль використання</li>
        </ol>

        <h3 style="font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #000;">
          8. НА ЩО ЗВЕРНУТИ УВАГУ
        </h3>
        <div style="background: #FFF7ED; border: 1px solid #F59E0B; padding: 15px; margin-bottom: 20px;">
          <p style="font-weight: bold; margin-bottom: 10px; color: #DC2626;">КРИТИЧНІ МОМЕНТИ:</p>
          <p style="font-weight: bold; margin-bottom: 10px;">1. Бухгалтер - ключова фігура:</p>
          <p style="margin-bottom: 10px;">⚠️ Якщо бухгалтер проти - проєкт провалиться!</p>
          <ul style="padding-left: 20px; margin-bottom: 15px;">
            <li>Залучити бухгалтера з самого початку</li>
            <li>Показати що йому буде ЛЕГШЕ</li>
            <li>Пояснити що не треба вводити дані вручну</li>
            <li>Навчити окремо</li>
          </ul>
          <p style="font-weight: bold; margin-bottom: 10px;">2. Інтеграція - це основна цінність:</p>
          <ul style="padding-left: 20px; margin-bottom: 15px;">
            <li>Приділи МАКСИМУМ уваги інтеграції</li>
            <li>Тестуй на реальних даних</li>
            <li>Синхронізація має бути двостороння</li>
          </ul>
          <p style="font-weight: bold; margin-bottom: 10px;">ПОКАЗНИКИ УСПІХУ:</p>
          <ul style="padding-left: 20px;">
            <li>Через місяць: 80%+ угод в CRM, дані автоматично летять в облік</li>
            <li>Через 2 місяці: Менеджери обробляють 10-15 нових лідів/міс кожен</li>
            <li>Через 3 місяці: Ріст продажів на 20-30%</li>
          </ul>
        </div>

        <h3 style="font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #000;">
          9. ДОДАТКОВІ МОЖЛИВОСТІ
        </h3>
        <p style="font-weight: bold; margin-bottom: 10px; color: #10B981; font-size: 18px;">АПСЕЙЛ ДУЖЕ ВИСОКИЙ! ЦЕ ДОВГОСТРОКОВІ КЛІЄНТИ!</p>
        <p style="margin-bottom: 10px;"><strong>Що продати через 3-6 місяців:</strong></p>
        <ul style="padding-left: 20px; margin-bottom: 15px;">
          <li>Маркетингова автоматизація - 30-50К</li>
          <li>Супровід - 12,500-25,000₴/міс ⭐ (90% залишаються!)</li>
          <li>Складні бізнес-процеси - 40-60К</li>
          <li>Аналітичні дашборди - 20-30К</li>
        </ul>
        <p><strong>LTV клієнта: 200,000-500,000₴</strong> (базове 70К + супровід рік + допрацювання)</p>
      </div>
    `,
    'large': `
      <div style="margin-bottom: 30px;">
        <h3 style="font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #000;">
          1. ТИП КЛІЄНТА
        </h3>
        <p style="font-size: 16px; margin-bottom: 20px;">Великий бізнес - ІНДИВІДУАЛЬНИЙ (120,000₴+)</p>

        <h3 style="font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #000;">
          2. ХАРАКТЕРИСТИКА
        </h3>
        <ul style="margin-bottom: 20px; padding-left: 20px;">
          <li>Команда: ${teamSize}</li>
          <li>Зазвичай є система обліку</li>
          <li>Складна організаційна структура</li>
          <li>Кілька відділів/департаментів</li>
          <li>Довгі цикли прийняття рішень</li>
          <li>Високі вимоги до якості</li>
        </ul>

        <h3 style="font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #000;">
          4. ХТО ЛПР
        </h3>
        <p style="margin-bottom: 20px;">${decisionMaker}</p>

        <div style="background: #D1FAE5; border: 2px solid #10B981; padding: 20px; margin-bottom: 20px;">
          <h3 style="font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #065F46;">
            5. РЕКОМЕНДАЦІЯ ДЛЯ МЕНЕДЖЕРА
          </h3>
          <p style="font-weight: bold; margin-bottom: 10px; font-size: 18px;">🏆 НАЙПРИБУТКОВІШИЙ КЛІЄНТ! АЛЕ ПОТРІБНА ЕКСПЕРТИЗА!</p>
          <p style="margin-bottom: 10px;"><strong>Чому вони цінні:</strong></p>
          <ul style="padding-left: 20px; margin-bottom: 15px;">
            <li>Великі бюджети (120К - 500К+)</li>
            <li>Довгі проєкти (6-18 місяців)</li>
            <li>Довгострокова співпраця</li>
            <li>Постійний супровід (25-50К/міс)</li>
          </ul>
          <p style="font-weight: bold; margin-bottom: 10px;">Коли можна братися:</p>
          <ul style="padding-left: 20px;">
            <li>Досвід 10+ успішних впроваджень</li>
            <li>Портфоліо з великими клієнтами</li>
            <li>Команда мінімум 2-3 особи</li>
            <li>Готовий до довгих переговорів (3-7 місяців)</li>
          </ul>
        </div>

        <h3 style="font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #000;">
          6. ЩО ПРОПОНУВАТИ
        </h3>
        <div style="background: #F8F9FA; border: 1px solid #ddd; padding: 15px; margin-bottom: 20px;">
          <p style="font-weight: bold; margin-bottom: 10px;">ІНДИВІДУАЛЬНИЙ ПІДХІД - немає фіксованого пакету!</p>
          <p style="margin-bottom: 10px;"><strong>Типовий план впровадження:</strong></p>
          <p style="margin-bottom: 10px;"><strong>Фаза 1: Корпоративний портал (2-3 міс) - 40-60К</strong></p>
          <p style="margin-bottom: 10px;"><strong>Фаза 2: CRM + інтеграція обліку (2-3 міс) - 60-100К</strong></p>
          <p style="margin-bottom: 10px;"><strong>Фаза 3: Бізнес-процеси (ongoing) - 40-80К</strong></p>
          <p style="margin-top: 15px;"><strong>Загальна вартість: від 120,000₴ до 500,000₴+</strong></p>
        </div>

        <h3 style="font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #000;">
          7. ЯК ПРАЦЮВАТИ
        </h3>
        <div style="background: #FFF7ED; border: 1px solid #F59E0B; padding: 15px; margin-bottom: 20px;">
          <p style="font-weight: bold; margin-bottom: 10px; color: #DC2626;">УВАГА! Цикл продажу 3-7 місяців!</p>
          <p style="margin-bottom: 10px;"><strong>Етапи продажу:</strong></p>
          <ol style="padding-left: 20px;">
            <li>Перша зустріч (тиждень 1)</li>
            <li>Аудит (2-4 тижні)</li>
            <li>Презентація рішення (тиждень 6-7)</li>
            <li>Комерційна пропозиція (тиждень 8-10)</li>
            <li>Переговори (тиждень 11-14)</li>
            <li>Підписання (тиждень 15-18)</li>
          </ol>
        </div>

        <h3 style="font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #000;">
          8. НА ЩО ЗВЕРНУТИ УВАГУ
        </h3>
        <div style="background: #FFF7ED; border: 1px solid #F59E0B; padding: 15px; margin-bottom: 20px;">
          <p style="font-weight: bold; margin-bottom: 10px;">КРИТИЧНІ МОМЕНТИ:</p>
          <ul style="padding-left: 20px; margin-bottom: 15px;">
            <li>Довгий цикл продажу (3-7 місяців)</li>
            <li>Багато стейкхолдерів (кожен має своє бачення)</li>
            <li>Високі вимоги до якості</li>
            <li>Опір змінам</li>
            <li>Політика та ієрархія</li>
          </ul>
        </div>

        <h3 style="font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #000;">
          9. ДОДАТКОВІ МОЖЛИВОСТІ
        </h3>
        <p style="font-weight: bold; margin-bottom: 10px; color: #10B981; font-size: 18px;">АПСЕЙЛ ВЕЛИЧЕЗНИЙ! LTV 500К - 2М+!</p>
        <p style="margin-bottom: 10px;"><strong>Супровід:</strong> 25,000-50,000₴/міс (90%+ залишаються!)</p>
        <p style="margin-bottom: 10px;"><strong>Розвиток системи:</strong> 200-400К за перший рік</p>
        <p><strong>LTV клієнта: 500,000₴ - 2,000,000₴+</strong></p>
      </div>
    `,
    'has-crm': `
      <div style="margin-bottom: 30px;">
        <h3 style="font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #000;">
          1. ТИП КЛІЄНТА
        </h3>
        <p style="font-size: 16px; margin-bottom: 20px;">Є CRM - Оптимізація та супровід (від 25,000₴)</p>

        <h3 style="font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #000;">
          2. ХАРАКТЕРИСТИКА
        </h3>
        <ul style="margin-bottom: 20px; padding-left: 20px;">
          <li>Команда: ${teamSize}</li>
          <li>Вже є впроваджена CRM</li>
          <li>Використовується частково або повністю</li>
          <li>Потрібні доопрацювання</li>
          <li>Або розуміють що налаштовано неправильно</li>
        </ul>

        <h3 style="font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #000;">
          3. ЧОГО ХОЧЕ КЛІЄНТ
        </h3>
        <p style="margin-bottom: 10px;"><strong>Типові проблеми:</strong></p>
        <ul style="margin-bottom: 20px; padding-left: 20px;">
          <li>CRM налаштована не під їхні процеси (менеджери використовують на 30-40%)</li>
          <li>Менеджери обходять систему (ведуть Excel паралельно)</li>
          <li>Немає потрібних інтеграцій (ручне перенесення даних)</li>
          <li>Немає навчання (кожен працює як хоче)</li>
        </ul>

        <div style="background: #D1FAE5; border: 2px solid #10B981; padding: 20px; margin-bottom: 20px;">
          <h3 style="font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #065F46;">
            5. РЕКОМЕНДАЦІЯ ДЛЯ МЕНЕДЖЕРА
          </h3>
          <p style="font-weight: bold; margin-bottom: 10px; font-size: 18px;">✓ ЛЕГКІ КЛІЄНТИ З ШВИДКОЮ ОПЛАТОЮ!</p>
          <p style="margin-bottom: 10px;"><strong>Чому вони хороші:</strong></p>
          <ul style="padding-left: 20px; margin-bottom: 15px;">
            <li>Вже розуміють цінність CRM</li>
            <li>Є бюджет</li>
            <li>Знають що хочуть</li>
            <li>Швидке прийняття рішень</li>
            <li>Легко конвертуються в супровід</li>
          </ul>
          <p style="margin-bottom: 10px;"><strong>Як працювати:</strong></p>
          <ul style="padding-left: 20px;">
            <li>Продавай аудит (5-10К)</li>
            <li>Потім оптимізацію (25-50К)</li>
            <li>Або одразу супровід (12,500₴/міс)</li>
            <li>Або переїзд на іншу CRM (70К+)</li>
          </ul>
        </div>

        <h3 style="font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #000;">
          6. ЩО ПРОПОНУВАТИ
        </h3>
        <div style="background: #F8F9FA; border: 1px solid #ddd; padding: 15px; margin-bottom: 20px;">
          <p style="font-weight: bold; margin-bottom: 10px;">Варіант 1: Аудит + Оптимізація (25,000₴+)</p>
          <ul style="padding-left: 20px; margin-bottom: 15px;">
            <li>Аудит поточної системи (2-4 години)</li>
            <li>Оптимізація (1-2 тижні)</li>
            <li>Навчання (1 день)</li>
          </ul>
          <p style="font-weight: bold; margin-bottom: 10px;">Варіант 2: Супровід (12,500₴/міс)</p>
          <p style="font-weight: bold; margin-bottom: 10px;">Варіант 3: Переїзд на іншу CRM (70,000₴+)</p>
        </div>

        <h3 style="font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #000;">
          7. ЯК ПРАЦЮВАТИ
        </h3>
        <div style="background: #EFF6FF; border: 1px solid #3B82F6; padding: 15px; margin-bottom: 20px;">
          <p style="font-weight: bold; margin-bottom: 10px;">Скрипт першого дзвінка:</p>
          <p style="font-style: italic; margin-bottom: 15px;">
            "Вітаю [Ім'я]! Бачу у вас вже є CRM - чудово, що вже почали автоматизацію. Типова ситуація - CRM впровадили, але менеджери користуються на 30-40%, багато зайвого, не вистачає потрібного, немає інтеграцій. У вас схожа ситуація?"
          </p>
          <p>Пропоную аудит - 2-3 години, подивлюся як налаштовано, знайду що не так, скажу що треба виправити. Після аудиту - план оптимізації та вартість. Коли вам зручно?"</p>
        </div>

        <h3 style="font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #000;">
          9. ДОДАТКОВІ МОЖЛИВОСТІ
        </h3>
        <p style="margin-bottom: 10px;"><strong>Супровід - ОСНОВНА МЕТА!</strong></p>
        <p style="margin-bottom: 10px;">Після успішної оптимізації: 60-70% йдуть на супровід (12,500₴/міс)</p>
        <p><strong>LTV клієнта: 100-300К</strong></p>
      </div>
    `
  }

  return recommendations[clientType] || ''
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
      <h2>НАША РЕКОМЕНДАЦІЯ</h2>
      <div style="background: #D4EDDA; border: 2px solid #28A745; padding: 20px; margin: 20px 0;">
        <p style="font-weight: bold; font-size: 18px; margin-bottom: 10px;">Велике впровадження CRM вам поки не потрібно — давайте почнемо з бюджетного варіанту.</p>
        <p style="margin-bottom: 10px;">У вас поки немає розуміння як вистроїти процеси в CRM, тому спочатку потрібна <strong>безкоштовна консультація</strong>.</p>
        <p style="font-weight: bold;">Ми обов'язково вам допоможемо!</p>
      </div>
      
      <p><strong>Що ми запропонуємо:</strong></p>
      <ul>
        <li><span class="check">✓</span> <strong>Безкоштовна консультація</strong> — обов'язково призначимо</li>
        <li><span class="check">✓</span> <strong>Бюджетний варіант</strong> (від 5,000₴) — якщо є готова CRM</li>
        <li><span class="check">✓</span> <strong>Excel шаблони</strong> для обліку — безкоштовно</li>
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

// Функція для генерации рекомендаций для менеджера (на основе ТЗ)
function generateManagerRecommendationsHTML(clientType: string, answers: any, profile: any): string {
  const decisionMaker = profile.decisionMaker || ''
  const businessType = profile.businessType || ''
  const teamSize = profile.teamSize || ''
  const systems = profile.systems || []
  const painsList = profile.painsList || []

  // Разделитель
  const separator = `
    <div style="margin: 60px 0; padding: 20px 0; border-top: 3px solid #000; border-bottom: 3px solid #000; text-align: center;">
      <div style="font-size: 12px; font-family: monospace; letter-spacing: 3px; color: #666;">════════════════════════════════════════</div>
    </div>
  `

  // Заголовок секции рекомендаций
  const header = `
    <div style="background: #FFD700; border: 2px solid #000; padding: 20px; margin: 40px 0; text-align: center;">
      <div style="font-size: 10px; font-family: monospace; text-transform: uppercase; letter-spacing: 2px; color: #666; margin-bottom: 10px;">
        // INTERNAL USE ONLY
      </div>
      <h2 style="font-size: 28px; font-weight: bold; margin: 10px 0; color: #000;">
        РЕКОМЕНДАЦІЇ ДЛЯ МЕНЕДЖЕРА
      </h2>
      <p style="font-size: 14px; color: #000; margin-top: 10px;">
        Ця інформація НЕ видима клієнту
      </p>
    </div>
  `

  // Генерируем рекомендации по типу клиента
  let recommendations = ''

  if (clientType === 'startup') {
    recommendations = `
      <div style="margin: 30px 0;">
        <h3 style="font-size: 20px; font-weight: bold; margin: 20px 0 10px; color: #000;">1. ТИП КЛІЄНТА</h3>
        <p style="font-size: 16px; margin-bottom: 20px;">Стартап - початок шляху (потрібен бюджетний підхід)</p>

        <h3 style="font-size: 20px; font-weight: bold; margin: 20px 0 10px; color: #000;">2. ХАРАКТЕРИСТИКА</h3>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>Команда: ${teamSize}</li>
          <li>Немає CRM, немає обліку</li>
          <li>Тільки починають розуміти що потрібно від автоматизації</li>
          <li>Шукають просте рішення</li>
          <li>Обмежений бюджет</li>
          <li>Власник в операційці 24/7</li>
        </ul>

        <h3 style="font-size: 20px; font-weight: bold; margin: 20px 0 10px; color: #000;">3. ЧОГО ХОЧЕ КЛІЄНТ</h3>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>Швидко і недорого</li>
          <li>Просте рішення для початку</li>
          <li>Розуміння як вистроїти процеси в CRM</li>
          <li>Допомога з першими кроками</li>
        </ul>

        <h3 style="font-size: 20px; font-weight: bold; margin: 20px 0 10px; color: #000;">4. ХТО ЛПР</h3>
        <p style="margin-bottom: 20px;">${decisionMaker || 'Власник (єдиний)'}</p>

        <div style="background: #D4EDDA; border: 2px solid #28A745; padding: 20px; margin: 20px 0;">
          <h3 style="font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #155724;">5. РЕКОМЕНДАЦІЯ ДЛЯ МЕНЕДЖЕРА</h3>
          <p style="font-weight: bold; margin-bottom: 10px; font-size: 18px;">✓ ОБОВ'ЯЗКОВО ДОПОМОЖЕМ! ЗАВЖДИ ПРОПОНУЙ РІШЕННЯ!</p>
          <p style="margin-bottom: 10px;"><strong>Ключова фраза:</strong> "Велике впровадження вам поки не потрібно - давайте почнемо з бюджетного варіанту. У вас поки немає розуміння як вистроїти процеси в CRM, тому спочатку потрібна безкоштовна консультація."</p>
          <p style="margin-bottom: 10px;"><strong>Обов'язково запропонуй:</strong></p>
          <ul style="margin: 10px 0; padding-left: 20px;">
            <li>✓ <strong>Безкоштовну консультацію</strong> - обов'язково призначити!</li>
            <li>✓ Бюджетний варіант (мінімальний пакет 5,000₴) - якщо є готова CRM</li>
            <li>✓ Консультація по процесах - допомогти визначити що реально потрібно</li>
            <li>✓ Excel шаблони для обліку - безкоштовно</li>
          </ul>
          <p style="margin-top: 15px; font-weight: bold; color: #155724;">Завжди завіряй: "Ми обов'язково вам допоможемо! Почнемо з безкоштовної консультації."</p>
        </div>

        <h3 style="font-size: 20px; font-weight: bold; margin: 20px 0 10px; color: #000;">6. ЩО ПРОПОНУВАТИ</h3>
        <p style="margin-bottom: 10px;"><strong>Почнемо з малого:</strong></p>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>Безкоштовна консультація (обов'язково!) - розберемося що потрібно, як вистроїти процеси</li>
          <li>Бюджетний варіант (мінімальний пакет 5К) - якщо є розуміння та готова CRM</li>
          <li>Excel шаблони для обліку - безкоштовно/символічно</li>
          <li>Консультація "Як підготуватися до впровадження" - 5-10К</li>
        </ul>
        <p style="margin-top: 15px; margin-bottom: 10px;"><strong>Коли виросте (через 3-6 міс):</strong></p>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>Повноцінне впровадження СТАРТ - 25К</li>
          <li>Підтримка після самостійного налаштування</li>
        </ul>

        <h3 style="font-size: 20px; font-weight: bold; margin: 20px 0 10px; color: #000;">7. ЯК ПРАЦЮВАТИ</h3>
        <ol style="margin: 10px 0; padding-left: 25px;">
          <li style="margin-bottom: 10px;"><strong>Зателефонуй протягом години</strong> (як обіцяли)</li>
          <li style="margin-bottom: 10px;"><strong>З'ясуй справжню потребу:</strong>
            <ul style="margin-top: 5px; padding-left: 20px;">
              <li>Що болить зараз найбільше?</li>
              <li>Скільки клієнтів на місяць?</li>
              <li>Який оборот?</li>
              <li>Які плани на зростання?</li>
            </ul>
          </li>
          <li style="margin-bottom: 10px;"><strong>Поясни позитивно:</strong> "Велике впровадження CRM вам поки не потрібно - давайте почнемо з бюджетного варіанту. У вас поки немає розуміння як вистроїти процеси в CRM, тому спочатку потрібна безкоштовна консультація. Ми обов'язково вам допоможемо!"</li>
          <li style="margin-bottom: 10px;"><strong>Обов'язково призначи безкоштовну консультацію:</strong> "Давайте зустрінемося на безкоштовній консультації, розберемося що вам потрібно, як вистроїти процеси. Після консультації запропоную оптимальний варіант."</li>
          <li style="margin-bottom: 10px;"><strong>Запропонуй бюджетний варіант:</strong> мінімальний пакет, Excel шаблони, консультацію по процесах</li>
          <li style="margin-bottom: 10px;"><strong>Залиш позитивне враження:</strong> завіряй що обов'язково допоможемо, дай корисну пораду, порекомендуй безкоштовні інструменти, додай в список "розігріву"</li>
        </ol>

        <h3 style="font-size: 20px; font-weight: bold; margin: 20px 0 10px; color: #000;">8. НА ЩО ЗВЕРНУТИ УВАГУ</h3>
        <div style="background: #E7F3FF; border: 1px solid #0066CC; padding: 15px; margin: 15px 0;">
          <p style="margin-bottom: 10px;"><strong>Важливо:</strong></p>
          <ul style="margin: 5px 0; padding-left: 20px;">
            <li>✓ Ніколи не кажи що не можемо допомогти</li>
            <li>✓ Завжди пропонуй безкоштовну консультацію</li>
            <li>✓ Завжди завіряй що обов'язково допоможемо</li>
            <li>✓ Почни з малого - бюджетний варіант або консультація</li>
            <li>✓ Після консультації вони можуть вирости і повернутися</li>
          </ul>
        </div>
        <p style="margin-top: 15px;"><strong>Можна братися якщо:</strong> є досвід роботи з стартапами, готовий до консалтингу та навчання, домовилися про етапну оплату, власник адекватний та готовий вчитися</p>

        <h3 style="font-size: 20px; font-weight: bold; margin: 20px 0 10px; color: #000;">9. ДОДАТКОВІ МОЖЛИВОСТІ</h3>
        <p style="margin-bottom: 10px;"><strong>Що можна продати зараз:</strong></p>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>Безкоштовна консультація (обов'язково!)</li>
          <li>Бюджетний пакет (5К) - якщо є розуміння та готова CRM</li>
          <li>Консультація "Як підготуватися до впровадження" - 5-10К</li>
          <li>Excel шаблони для обліку - безкоштовно</li>
          <li>Готові шаблони для самостійного налаштування</li>
        </ul>
        <p style="margin-top: 15px; margin-bottom: 10px;"><strong>Що продати потім (через 3-6 міс):</strong></p>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>Повноцінне впровадження СТАРТ - 25К</li>
          <li>Підтримка після самостійного налаштування</li>
        </ul>
        <p style="margin-top: 15px;"><strong>LTV клієнта:</strong> 10,000-50,000₴ (якщо повернеться і виросте)</p>
      </div>
    `
  } else if (clientType === 'small') {
    recommendations = `
      <div style="margin: 30px 0;">
        <h3 style="font-size: 20px; font-weight: bold; margin: 20px 0 10px; color: #000;">1. ТИП КЛІЄНТА</h3>
        <p style="font-size: 16px; margin-bottom: 20px;">Малий бізнес - СТАРТ (25,000₴)</p>

        <h3 style="font-size: 20px; font-weight: bold; margin: 20px 0 10px; color: #000;">2. ХАРАКТЕРИСТИКА</h3>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>Команда: ${teamSize}</li>
          <li>Немає CRM або вона не використовується</li>
          <li>Можливо є система обліку (1С, Medoc, Finsmart)</li>
          <li>Типовий клієнт - найбільша категорія</li>
          <li>Є базове розуміння що потрібно</li>
          <li>Готові інвестувати в розвиток</li>
        </ul>

        <h3 style="font-size: 20px; font-weight: bold; margin: 20px 0 10px; color: #000;">3. ЧОГО ХОЧЕ КЛІЄНТ</h3>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>"Хочу швидко і відразу"</li>
          <li>Не сильно розуміє в IT, почув від знайомих</li>
          <li>Потрібен робочий інструмент для перших показників продажів</li>
          <li>Важливий швидкий результат</li>
          <li>Хоче контролювати менеджерів</li>
          <li>Розуміти звідки йдуть клієнти</li>
        </ul>

        <h3 style="font-size: 20px; font-weight: bold; margin: 20px 0 10px; color: #000;">4. ХТО ЛПР</h3>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>Власник в операційці (70%)</li>
          <li>РОП - керівник відділу продажів (20%)</li>
          <li>Наймовий директор (10% - рідко)</li>
        </ul>

        <div style="background: #D4EDDA; border: 2px solid #28A745; padding: 20px; margin: 20px 0;">
          <h3 style="font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #155724;">5. РЕКОМЕНДАЦІЯ ДЛЯ МЕНЕДЖЕРА</h3>
          <p style="font-weight: bold; margin-bottom: 10px; font-size: 18px;">✓ ЦЕ ІДЕАЛЬНИЙ КЛІЄНТ ДЛЯ БАЗОВОГО ВПРОВАДЖЕННЯ!</p>
          <p style="margin-bottom: 10px;">Продавай СТАРТ впевнено:</p>
          <ul style="margin: 10px 0; padding-left: 20px;">
            <li>Це саме їхній пакет</li>
            <li>Акцентуй на швидкому результаті (2-3 тижні)</li>
            <li>Обіцяй перші продажі через CRM за місяць</li>
            <li>Обов'язково проводь аудит перед стартом</li>
          </ul>
        </div>

        <h3 style="font-size: 20px; font-weight: bold; margin: 20px 0 10px; color: #000;">6. ЩО ПРОПОНУВАТИ</h3>
        <p style="margin-bottom: 10px;"><strong>Основне: Пакет СТАРТ (25,000₴)</strong></p>
        <p style="margin-bottom: 10px;"><strong>Що входить:</strong></p>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>Аудит (2 години, безкоштовно)</li>
          <li>Підбір CRM під бізнес</li>
          <li>Налаштування воронок та статусів</li>
          <li>До 3 базових інтеграцій (сайт, телефонія, месенджери)</li>
          <li>Базова автоматизація (сповіщення, завдання)</li>
          <li>Навчання команди (1-2 години)</li>
          <li>Тиждень технічної підтримки</li>
        </ul>
        <p style="margin-top: 15px;"><strong>Термін:</strong> 2-3 тижні | <strong>Окупність:</strong> 2-3 місяці</p>

        <h3 style="font-size: 20px; font-weight: bold; margin: 20px 0 10px; color: #000;">7. ЯК ПРАЦЮВАТИ</h3>
        <p style="margin-bottom: 10px;"><strong>Скрипт першого дзвінка:</strong></p>
        <div style="background: #F8F9FA; padding: 15px; margin: 10px 0; border-left: 4px solid #FFD700;">
          <p>"Вітаю [Ім'я]! Бачу у вас [тип бізнесу], команда [кількість] осіб. Типова ситуація - менеджери працюють як хочуть, власник не бачить що відбувається, непрозоро звідки клієнти. У вас так само? [дочекатися відповіді]</p>
          <p style="margin-top: 10px;">Пропоную безкоштовний аудит - 2 години, розберемося в процесах, покажу як CRM вирішить ваші болі. Коли вам зручно?"</p>
        </div>
        <p style="margin-top: 20px; margin-bottom: 10px;"><strong>Етапи роботи:</strong></p>
        <ol style="margin: 10px 0; padding-left: 25px;">
          <li style="margin-bottom: 10px;"><strong>Перший дзвінок (день 1):</strong> Підтверди що зрозумів їхні болі, запропонуй аудит на зручний час, відправ на email підтвердження</li>
          <li style="margin-bottom: 10px;"><strong>Аудит (день 2-3):</strong> 2 години zoom або в офісі, розберися в процесах детально, покажи демо як працює CRM</li>
          <li style="margin-bottom: 10px;"><strong>ТЗ та КП (день 4-5):</strong> Детальне ТЗ що буде в системі, комерційна пропозиція, договір + 50% передоплата</li>
          <li style="margin-bottom: 10px;"><strong>Впровадження (2-3 тижні):</strong> Тиждень 1 - налаштування, Тиждень 2 - тестування, Тиждень 3 - навчання + запуск</li>
          <li style="margin-bottom: 10px;"><strong>Підтримка (тиждень):</strong> Відповіді на питання, дрібні правки, контроль що всі користуються</li>
        </ol>

        <h3 style="font-size: 20px; font-weight: bold; margin: 20px 0 10px; color: #000;">8. НА ЩО ЗВЕРНУТИ УВАГУ</h3>
        <p style="margin-bottom: 10px;"><strong>Ризики:</strong></p>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>Можуть хотіти "все і відразу" → чітко обмеж межі СТАРТ пакету</li>
          <li>Власник може змінювати думку → фіксуй ТЗ письмово</li>
          <li>Команда може опиратися → залучай їх в процес з початку</li>
          <li>Очікують миттєвий результат → поясни що треба місяць роботи</li>
        </ul>
        <p style="margin-top: 15px; margin-bottom: 10px;"><strong>Що гарантує успіх:</strong></p>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>Чітке ТЗ після аудиту</li>
          <li>Призначення відповідального з боку клієнта</li>
          <li>Навчання ВСІХ користувачів (не тільки керівника)</li>
          <li>Власник підтримує впровадження</li>
          <li>Контроль використання перший місяць</li>
        </ul>

        <h3 style="font-size: 20px; font-weight: bold; margin: 20px 0 10px; color: #000;">9. ДОДАТКОВІ МОЖЛИВОСТІ</h3>
        <p style="margin-bottom: 10px;"><strong>Що можна допродати зараз:</strong></p>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>Інтеграція з обліком (якщо є) - 20-30К</li>
          <li>Додаткові інтеграції (сайт, реклама) - 5-10К кожна</li>
          <li>Розширене навчання команди - 10К</li>
          <li>n8n автоматизація складних процесів - 15-30К</li>
        </ul>
        <p style="margin-top: 15px; margin-bottom: 10px;"><strong>Що продати через 3-6 місяців:</strong></p>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>Супровід - 12,500₴/міс (дуже легко продається!)</li>
          <li>Маркетингова автоматизація - 20-30К</li>
          <li>Додаткові бізнес-процеси - 15-25К</li>
          <li>Аналітичні дашборди - 15-20К</li>
        </ul>
        <p style="margin-top: 15px;"><strong>LTV клієнта:</strong> 80,000-150,000₴ (базове впровадження + супровід рік + допрацювання)</p>
      </div>
    `
  } else if (clientType === 'medium-risk') {
    recommendations = `
      <div style="margin: 30px 0;">
        <h3 style="font-size: 20px; font-weight: bold; margin: 20px 0 10px; color: #000;">1. ТИП КЛІЄНТА</h3>
        <p style="font-size: 16px; margin-bottom: 20px;">Середній бізнес без систем - РИЗИК</p>

        <h3 style="font-size: 20px; font-weight: bold; margin: 20px 0 10px; color: #000;">2. ХАРАКТЕРИСТИКА</h3>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>Команда: ${teamSize}</li>
          <li>Немає CRM, немає обліку, або все погано ведеться</li>
          <li>Хаос в управлінні</li>
          <li>Відсутня культура менеджменту</li>
          <li>Органічно доросли до цього розміру</li>
          <li>Все тримається на енергії власника</li>
          <li>Немає систематизації процесів</li>
        </ul>

        <h3 style="font-size: 20px; font-weight: bold; margin: 20px 0 10px; color: #000;">3. ЧОГО ХОЧЕ КЛІЄНТ</h3>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>Вирішити проблему менеджменту через автоматизацію</li>
          <li>"Зажати гайки" через CRM</li>
          <li>Отримати контроль над людьми</li>
          <li>Думають що CRM вирішить проблему дисципліни</li>
        </ul>
        <div style="background: #FFF3CD; border: 1px solid #FFC107; padding: 15px; margin: 15px 0;">
          <p style="font-weight: bold;">❗ Проблема: Намагаються замінити менеджмент на технології!</p>
        </div>

        <div style="background: #FEF2F2; border: 2px solid #DC2626; padding: 20px; margin: 20px 0;">
          <h3 style="font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #DC2626;">5. РЕКОМЕНДАЦІЯ ДЛЯ МЕНЕДЖЕРА</h3>
          <p style="font-weight: bold; margin-bottom: 10px; font-size: 18px;">⚠️ СКЛАДНИЙ КЛІЄНТ! ВИСОКИЙ РИЗИК ПРОВАЛУ!</p>
          <p style="margin-bottom: 10px;"><strong>Чому складно:</strong></p>
          <ul style="margin: 10px 0; padding-left: 20px;">
            <li>CRM не замінить управління</li>
            <li>Немає культури виконання</li>
            <li>Опір буде дуже сильний</li>
            <li>Власник очікує чуда</li>
            <li>Результату можна не побачити</li>
          </ul>
          <p style="margin-top: 15px; margin-bottom: 10px;"><strong>Коли можна братися:</strong></p>
          <ul style="margin: 10px 0; padding-left: 20px;">
            <li>Великий досвід впровадження (5+ проєктів)</li>
            <li>Готовий до консалтингу та менторингу</li>
            <li>Власник розуміє що треба міняти процеси</li>
            <li>Бюджет на поетапне впровадження (70К+)</li>
            <li>Є РОП який адекватний</li>
          </ul>
        </div>

        <h3 style="font-size: 20px; font-weight: bold; margin: 20px 0 10px; color: #000;">6. ЩО ПРОПОНУВАТИ</h3>
        <p style="font-weight: bold; margin-bottom: 10px; color: #DC2626;">НЕ продавай тільки CRM! Ризик провалу 70-80%!</p>
        <p style="margin-bottom: 10px;"><strong>Правильний підхід: ПОЕТАПНЕ ВПРОВАДЖЕННЯ</strong></p>
        <div style="background: #E7F3FF; border: 1px solid #0066CC; padding: 15px; margin: 15px 0;">
          <p style="margin-bottom: 10px;"><strong>Етап 1: Корпоративний портал (1-1.5 міс) - 25-35К</strong></p>
          <ul style="margin: 5px 0; padding-left: 20px;">
            <li>✓ Люди звикають до роботи в системі</li>
            <li>✓ Налагоджуються завдання та комунікація</li>
            <li>✓ З'являється дисципліна виконання</li>
          </ul>
          <p style="margin-top: 15px; margin-bottom: 10px;"><strong>Етап 2: CRM (після звикання) - 40-50К</strong></p>
          <ul style="margin: 5px 0; padding-left: 20px;">
            <li>✓ Впроваджуємо систему продажів</li>
            <li>✓ Інтеграції та автоматизація</li>
            <li>✓ Контроль угод</li>
          </ul>
          <p style="margin-top: 15px;"><strong>Загальна вартість:</strong> від 70,000₴ | <strong>Термін:</strong> 2-3 місяці | <strong>Ризик провалу:</strong> 30% (замість 70%)</p>
        </div>

        <h3 style="font-size: 20px; font-weight: bold; margin: 20px 0 10px; color: #000;">7. ЯК ПРАЦЮВАТИ</h3>
        <p style="margin-bottom: 10px;"><strong>Скрипт першого дзвінка:</strong></p>
        <div style="background: #F8F9FA; padding: 15px; margin: 10px 0; border-left: 4px solid #FFD700;">
          <p>"Вітаю [Ім'я]! Бачу у вас команда [кількість] осіб, це перехідний розмір - найскладніший для автоматизації. Маю досвід з такими компаніями. Головна проблема зазвичай не в відсутності CRM, а в тому що немає культури виконання. CRM не замінить менеджмент, вона тільки підсвітить проблеми. Розповісти як правильно впроваджувати в такій ситуації?"</p>
        </div>
        <p style="margin-top: 20px; margin-bottom: 10px;"><strong>Етапи роботи:</strong></p>
        <ol style="margin: 10px 0; padding-left: 25px;">
          <li style="margin-bottom: 10px;"><strong>Діагностичний аудит (4-6 годин!):</strong> НЕ тільки процеси, але й культура, поговори з 3-5 співробітниками, з'ясуй як насправді працюють</li>
          <li style="margin-bottom: 10px;"><strong>Чесна розмова з власником:</strong> "Маю дві новини. Погана: CRM сама не вирішить проблему. Хороша: є план як зробити правильно, але це довше і дорожче."</li>
          <li style="margin-bottom: 10px;"><strong>Етап 1 - Портал (1-1.5 міс):</strong> Зібрання з командою, навчання по групах, щоденний моніторинг, КПІ: 70% користуються через місяць</li>
          <li style="margin-bottom: 10px;"><strong>Етап 2 - CRM (тільки якщо етап 1 успішний):</strong> Впровадження CRM, інтеграції, навчання, контроль використання</li>
        </ol>

        <h3 style="font-size: 20px; font-weight: bold; margin: 20px 0 10px; color: #000;">8. НА ЩО ЗВЕРНУТИ УВАГУ</h3>
        <div style="background: #FEF2F2; border: 1px solid #DC2626; padding: 15px; margin: 15px 0;">
          <p style="font-weight: bold; margin-bottom: 10px; color: #DC2626;">КРИТИЧНІ РИЗИКИ:</p>
          <p style="margin-bottom: 10px;"><strong>1. Немає менеджменту:</strong> Люди не виконують завдання в строк, немає відповідальності → Рішення: Спочатку портал, потім CRM</p>
          <p style="margin-bottom: 10px;"><strong>2. Опір співробітників:</strong> "Нам і так норм" → Рішення: Залучай команду, показуй вигоду</p>
          <p style="margin-bottom: 10px;"><strong>3. Власник хоче чуда:</strong> "CRM вирішить все проблеми" → Рішення: Чесна розмова про обмеження</p>
          <p style="margin-bottom: 10px;"><strong>4. Змінюють процеси під час впровадження:</strong> → Рішення: Жорстко фіксуй ТЗ, зміни за доплату</p>
        </div>
        <p style="margin-top: 15px; margin-bottom: 10px;"><strong>ПОКАЗНИКИ ПРОВАЛУ (стоп-сигнали):</strong></p>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>Через тиждень використання &lt;30% команди</li>
          <li>Власник сам не користується</li>
          <li>РОПа немає або він проти</li>
          <li>Постійні зміни вимог</li>
          <li>Співробітники відкрито саботують</li>
        </ul>
        <p style="margin-top: 15px; color: #DC2626; font-weight: bold;">→ В такому випадку: зупини проєкт, поверни частину грошей, залиш хороше враження. Краще зупинити ніж провалити.</p>

        <h3 style="font-size: 20px; font-weight: bold; margin: 20px 0 10px; color: #000;">9. ДОДАТКОВІ МОЖЛИВОСТІ</h3>
        <p style="margin-bottom: 10px;"><strong>Що продати зараз:</strong> Поетапне впровадження (портал + CRM) - 70К, Консалтинг по процесах - 30-50К</p>
        <p style="margin-top: 15px; margin-bottom: 10px;"><strong>Що продати після успішного впровадження:</strong> Супровід - 15,000-25,000₴/міс (обов'язковий!), Розвиток процесів - 20-40К</p>
        <p style="margin-top: 15px;"><strong>LTV клієнта:</strong> 200,000-300,000₴ (якщо успішно) або втрата часу та репутації (якщо провал)</p>
      </div>
    `
  } else if (clientType === 'ideal') {
    recommendations = `
      <div style="margin: 30px 0;">
        <h3 style="font-size: 20px; font-weight: bold; margin: 20px 0 10px; color: #000;">1. ТИП КЛІЄНТА</h3>
        <p style="font-size: 16px; margin-bottom: 20px;">Ідеальний клієнт 🎯 - ПРОФЕСІЙНИЙ (70,000₴)</p>

        <h3 style="font-size: 20px; font-weight: bold; margin: 20px 0 10px; color: #000;">2. ХАРАКТЕРИСТИКА</h3>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>Команда: ${teamSize}</li>
          <li>Є система обліку (1С, Medoc, Finsmart, інше)</li>
          <li>Немає CRM або вона не використовується</li>
          <li>Базові процеси вже налаштовані</li>
          <li>Є розуміння цінності систем</li>
          <li>Готові платити за якість</li>
          <li>Команда вже працює в системах</li>
        </ul>
        <div style="background: #D4EDDA; border: 2px solid #28A745; padding: 15px; margin: 15px 0;">
          <p style="font-weight: bold; font-size: 18px; color: #155724;">💰 ЦЕ НАЙКРАЩИЙ ТИП КЛІЄНТА!</p>
        </div>

        <h3 style="font-size: 20px; font-weight: bold; margin: 20px 0 10px; color: #000;">3. ЧОГО ХОЧЕ КЛІЄНТ</h3>
        <p style="margin-bottom: 10px;"><strong>Типова ситуація (90% випадків):</strong></p>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>Менеджери працюють тільки зі старою базою постійних клієнтів</li>
          <li>Нових клієнтів не розвивають</li>
          <li>Власник не бачить воронку продажів</li>
          <li>Немає зв'язку між лідами та продажами</li>
          <li>Дані в обліку, але без аналітики</li>
        </ul>

        <h3 style="font-size: 20px; font-weight: bold; margin: 20px 0 10px; color: #000;">4. ХТО ЛПР</h3>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>Власник в операційці (50%)</li>
          <li>РОП - керівник відділу продажів (30%)</li>
          <li>РОМ - керівник маркетингу (15%)</li>
          <li>Помічник директора (5%)</li>
        </ul>

        <div style="background: #D4EDDA; border: 2px solid #28A745; padding: 20px; margin: 20px 0;">
          <h3 style="font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #155724;">5. РЕКОМЕНДАЦІЯ ДЛЯ МЕНЕДЖЕРА</h3>
          <p style="font-weight: bold; margin-bottom: 10px; font-size: 18px;">🎯 СУПЕРЦІЛЕВИЙ КЛІЄНТ! ЗАКРИВАЙ НА МАКСИМУМ!</p>
          <p style="margin-bottom: 10px;"><strong>Чому вони ідеальні:</strong></p>
          <ul style="margin: 10px 0; padding-left: 20px;">
            <li>✓ Розуміють цінність автоматизації (працюють з обліком)</li>
            <li>✓ Є гроші на якісне впровадження</li>
            <li>✓ Чітко розуміють свою проблему</li>
            <li>✓ Команда вже звикла до роботи в системах</li>
            <li>✓ Базові процеси налаштовані</li>
            <li>✓ Швидка окупність (3-4 місяці)</li>
            <li>✓ Найвищий % успішних впроваджень</li>
          </ul>
          <p style="margin-top: 15px; margin-bottom: 10px;"><strong>Твоя задача:</strong></p>
          <ul style="margin: 10px 0; padding-left: 20px;">
            <li>Продавай ПРОФЕСІЙНИЙ пакет впевнено</li>
            <li>Акцентуй на інтеграції CRM + облік</li>
            <li>Покажи як менеджери почнуть працювати з новими</li>
            <li>Обіцяй що власник побачить всю воронку</li>
            <li>Гарантуй результат через 2-3 місяці</li>
          </ul>
        </div>

        <h3 style="font-size: 20px; font-weight: bold; margin: 20px 0 10px; color: #000;">6. ЩО ПРОПОНУВАТИ</h3>
        <p style="margin-bottom: 10px;"><strong>Основне: Пакет ПРОФЕСІЙНИЙ (70,000₴)</strong></p>
        <p style="margin-bottom: 10px;"><strong>Що входить:</strong></p>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>Глибокий аудит (2-3 дні) - розбір процесів, вивчення облікової системи, інтерв'ю</li>
          <li>CRM впровадження під ключ - підбір, налаштування, воронки</li>
          <li>Інтеграція з обліковою системою ⭐ - автоматична передача даних, синхронізація</li>
          <li>До 7 інтеграцій - сайт, телефонія, месенджери, email, реклама</li>
          <li>n8n автоматизація - складні бізнес-процеси, сповіщення, розподіл лідів</li>
          <li>Налаштування аналітики - дашборди, звіти, ROI, прогнози</li>
          <li>Навчання команди (4-8 годин) - менеджери, РОП, бухгалтер, власник</li>
          <li>Місяць підтримки - моніторинг, правки, оптимізація</li>
          <li>Документація - інструкції, опис процесів, схеми інтеграцій</li>
        </ul>
        <p style="margin-top: 15px;"><strong>Термін:</strong> 1-2 місяці | <strong>Окупність:</strong> 3-4 місяці</p>

        <h3 style="font-size: 20px; font-weight: bold; margin: 20px 0 10px; color: #000;">7. ЯК ПРАЦЮВАТИ</h3>
        <p style="margin-bottom: 10px;"><strong>Скрипт першого дзвінка:</strong></p>
        <div style="background: #F8F9FA; padding: 15px; margin: 10px 0; border-left: 4px solid #FFD700;">
          <p>"Вітаю [Ім'я]! Бачу у вас є [назва обліку] - це чудово, базові процеси вже налаштовані. Типова ситуація у компаній з обліком але без CRM - менеджери працюють тільки зі старою базою, а нові ліди обробляються погано. У вас так само? [дочекатися відповіді]</p>
          <p style="margin-top: 10px;">Пропоную зробити аудит - 2-3 години, покажу як ми інтегруємо CRM з вашим [назва обліку], щоб власник бачив всю воронку від ліда до оплати, менеджери почали обробляти нових клієнтів, дані автоматично летіли в облік. Коли вам зручно?"</p>
        </div>
        <p style="margin-top: 20px; margin-bottom: 10px;"><strong>Етапи роботи (1-2 місяці):</strong></p>
        <ol style="margin: 10px 0; padding-left: 25px;">
          <li style="margin-bottom: 10px;"><strong>Глибокий аудит (2-3 дні):</strong> Процеси продажів, облікова система, демо інтеграції</li>
          <li style="margin-bottom: 10px;"><strong>ТЗ (тиждень):</strong> Детальне ТЗ, схема інтеграції, список інтеграцій, узгодження</li>
          <li style="margin-bottom: 10px;"><strong>Впровадження (3-6 тижнів):</strong> Налаштування CRM, інтеграція з обліком ⭐, інші інтеграції, тестування</li>
          <li style="margin-bottom: 10px;"><strong>Запуск (тиждень):</strong> Навчання всіх рівнів, запуск на реальних даних, контроль</li>
          <li style="margin-bottom: 10px;"><strong>Підтримка (місяць):</strong> Щоденний моніторинг, відповіді, правки, оптимізація</li>
        </ol>

        <h3 style="font-size: 20px; font-weight: bold; margin: 20px 0 10px; color: #000;">8. НА ЩО ЗВЕРНУТИ УВАГУ</h3>
        <div style="background: #FFF3CD; border: 1px solid #FFC107; padding: 15px; margin: 15px 0;">
          <p style="font-weight: bold; margin-bottom: 10px;">КРИТИЧНІ МОМЕНТИ:</p>
          <p style="margin-bottom: 10px;"><strong>1. Бухгалтер - ключова фігура:</strong> ⚠️ Якщо бухгалтер проти - проєкт провалиться! Залучити з самого початку, показати що йому буде ЛЕГШЕ, навчити окремо.</p>
          <p style="margin-bottom: 10px;"><strong>2. Інтеграція - це основна цінність:</strong> Приділи МАКСИМУМ уваги інтеграції, тестуй на реальних даних, переконайся що дані летять правильно.</p>
          <p style="margin-bottom: 10px;"><strong>3. Менеджери "жирні коти":</strong> Будуть опиратися, саботувати → Працюй через власника/РОПа, покажи що система допомагає, контролюй використання.</p>
        </div>
        <p style="margin-top: 15px; margin-bottom: 10px;"><strong>ПОКАЗНИКИ УСПІХУ:</strong></p>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>Через місяць: 80%+ угод в CRM, дані автоматично летять в облік, власник дивиться дашборди</li>
          <li>Через 2 місяці: Менеджери обробляють 10-15 нових лідів/міс, воронка видима, аналітика працює</li>
          <li>Через 3 місяці: Ріст продажів на 20-30%, власник приймає рішення на основі даних</li>
        </ul>

        <h3 style="font-size: 20px; font-weight: bold; margin: 20px 0 10px; color: #000;">9. ДОДАТКОВІ МОЖЛИВОСТІ</h3>
        <div style="background: #D4EDDA; border: 1px solid #28A745; padding: 15px; margin: 15px 0;">
          <p style="font-weight: bold; margin-bottom: 10px; font-size: 18px;">АПСЕЙЛ ДУЖЕ ВИСОКИЙ! ЦЕ ДОВГОСТРОКОВІ КЛІЄНТИ!</p>
          <p style="margin-bottom: 10px;"><strong>Що продати через 3-6 місяців:</strong></p>
          <ul style="margin: 10px 0; padding-left: 20px;">
            <li>Маркетингова автоматизація - 30-50К</li>
            <li>Супровід - 12,500-25,000₴/міс ⭐ (90% залишаються!)</li>
            <li>Складні бізнес-процеси - 40-60К</li>
            <li>Аналітичні дашборди - 20-30К</li>
            <li>Розширення на інші відділи - від 50К</li>
          </ul>
          <p style="margin-top: 15px;"><strong>LTV клієнта: 200,000-500,000₴</strong> (базове 70К + супровід рік 150-300К + допрацювання 50-150К)</p>
          <p style="margin-top: 10px; font-weight: bold;">Рекорд: 1,200,000₴ за 3 роки</p>
        </div>
      </div>
    `
  } else if (clientType === 'large') {
    recommendations = `
      <div style="margin: 30px 0;">
        <h3 style="font-size: 20px; font-weight: bold; margin: 20px 0 10px; color: #000;">1. ТИП КЛІЄНТА</h3>
        <p style="font-size: 16px; margin-bottom: 20px;">Великий бізнес - ІНДИВІДУАЛЬНИЙ (120,000₴+)</p>

        <h3 style="font-size: 20px; font-weight: bold; margin: 20px 0 10px; color: #000;">2. ХАРАКТЕРИСТИКА</h3>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>Команда: ${teamSize}</li>
          <li>Зазвичай є система обліку</li>
          <li>Може бути CRM (але погана) або її немає</li>
          <li>Складна організаційна структура</li>
          <li>Кілька відділів/департаментів</li>
          <li>Довгі цикли прийняття рішень</li>
          <li>Високі вимоги до якості</li>
          <li>Готові платити за професіоналізм</li>
        </ul>

        <h3 style="font-size: 20px; font-weight: bold; margin: 20px 0 10px; color: #000;">3. ЧОГО ХОЧЕ КЛІЄНТ</h3>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>Робочий інструмент від професіоналів</li>
          <li>Поетапне впровадження без зупинки бізнесу</li>
          <li>Мінімізація ризиків</li>
          <li>Довгострокова співпраця</li>
          <li>Виділений менеджер проєкту</li>
          <li>Документація та навчання</li>
          <li>Супровід після запуску</li>
        </ul>
        <p style="margin-top: 10px; font-weight: bold;">Не шукають дешево - шукають якісно!</p>

        <h3 style="font-size: 20px; font-weight: bold; margin: 20px 0 10px; color: #000;">4. ХТО ЛПР</h3>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>Наймові директори (60%) - Комерційний, Виконавчий, IT директор</li>
          <li>Помічник власника з повноваженнями (25%)</li>
          <li>РОП/РОМ для великих відділів (10%)</li>
          <li>Власник (5% - рідко)</li>
        </ul>
        <p style="margin-top: 10px; font-weight: bold; color: #DC2626;">❗ Майже НІКОЛИ не власник напряму!</p>

        <div style="background: #E7F3FF; border: 2px solid #0066CC; padding: 20px; margin: 20px 0;">
          <h3 style="font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #0066CC;">5. РЕКОМЕНДАЦІЯ ДЛЯ МЕНЕДЖЕРА</h3>
          <p style="font-weight: bold; margin-bottom: 10px; font-size: 18px;">🏆 НАЙПРИБУТКОВІШИЙ КЛІЄНТ! АЛЕ ПОТРІБНА ЕКСПЕРТИЗА!</p>
          <p style="margin-bottom: 10px;"><strong>Чому вони цінні:</strong></p>
          <ul style="margin: 10px 0; padding-left: 20px;">
            <li>✓ Великі бюджети (120К - 500К+)</li>
            <li>✓ Довгі проєкти (6-18 місяців)</li>
            <li>✓ Довгострокова співпраця</li>
            <li>✓ Постійний супровід (25-50К/міс)</li>
            <li>✓ Розширення системи</li>
            <li>✓ Приводять інших великих клієнтів</li>
          </ul>
          <p style="margin-top: 15px; margin-bottom: 10px;"><strong>Коли можна братися:</strong></p>
          <ul style="margin: 10px 0; padding-left: 20px;">
            <li>Досвід 10+ успішних впроваджень</li>
            <li>Портфоліо з великими клієнтами</li>
            <li>Команда мінімум 2-3 особи</li>
            <li>Розумієш складні бізнес-процеси</li>
            <li>Готовий до довгих переговорів (3-7 місяців)</li>
          </ul>
        </div>

        <h3 style="font-size: 20px; font-weight: bold; margin: 20px 0 10px; color: #000;">6. ЩО ПРОПОНУВАТИ</h3>
        <p style="margin-bottom: 10px;"><strong>ІНДИВІДУАЛЬНИЙ ПІДХІД - немає фіксованого пакету!</strong></p>
        <p style="margin-bottom: 10px;"><strong>Типовий план впровадження:</strong></p>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li><strong>Фаза 1: Корпоративний портал (2-3 міс) - 40-60К</strong> - Завдання, комунікація, документообіг, люди звикають</li>
          <li><strong>Фаза 2: CRM + інтеграція обліку (2-3 міс) - 60-100К</strong> - Система продажів, автоматичний обмін даними, контроль угод</li>
          <li><strong>Фаза 3: Бізнес-процеси (ongoing) - 40-80К</strong> - Складні процеси, узгодження, закупівлі, AI інтеграції</li>
        </ul>
        <p style="margin-top: 15px;"><strong>Загальна вартість:</strong> від 120,000₴ до 500,000₴+ | <strong>Термін:</strong> від 4 місяців | <strong>Окупність:</strong> 2-3 місяці</p>

        <h3 style="font-size: 20px; font-weight: bold; margin: 20px 0 10px; color: #000;">7. ЯК ПРАЦЮВАТИ</h3>
        <div style="background: #FFF3CD; border: 1px solid #FFC107; padding: 15px; margin: 15px 0;">
          <p style="font-weight: bold; margin-bottom: 10px;">УВАГА! Цикл продажу 3-7 місяців!</p>
        </div>
        <p style="margin-bottom: 10px;"><strong>Етапи продажу:</strong></p>
        <ol style="margin: 10px 0; padding-left: 25px;">
          <li style="margin-bottom: 10px;"><strong>Перша зустріч (тиждень 1):</strong> В офісі обов'язково, презентація портфоліо, розповідь про підхід</li>
          <li style="margin-bottom: 10px;"><strong>Аудит (2-4 тижні):</strong> 3-5 днів в офісі, інтерв'ю з ключовими людьми, вивчення процесів</li>
          <li style="margin-bottom: 10px;"><strong>Презентація рішення (тиждень 6-7):</strong> Детальна презентація 2-3 год, показ кейсів, демо</li>
          <li style="margin-bottom: 10px;"><strong>КП (тиждень 8-10):</strong> Детальне ТЗ 50-100 стор, поетапний план, вартість, ризики</li>
          <li style="margin-bottom: 10px;"><strong>Переговори (тиждень 11-14):</strong> Зустрічі з відділами, правки ТЗ, узгодження бюджету</li>
          <li style="margin-bottom: 10px;"><strong>Підписання (тиждень 15-18):</strong> Договір, фінансові умови, план-графік, старт!</li>
        </ol>

        <h3 style="font-size: 20px; font-weight: bold; margin: 20px 0 10px; color: #000;">8. НА ЩО ЗВЕРНУТИ УВАГУ</h3>
        <p style="margin-bottom: 10px;"><strong>КРИТИЧНІ МОМЕНТИ:</strong></p>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li><strong>Довгий цикл продажу:</strong> 3-7 місяців - терпіння та наполегливість, регулярна комунікація</li>
          <li><strong>Багато стейкхолдерів:</strong> Визнач головного, працюй через нього, але враховуй думку інших</li>
          <li><strong>Високі вимоги:</strong> Детальна документація, регулярна звітність, дотримання термінів</li>
          <li><strong>Опір змінам:</strong> Поетапне впровадження, залучай лідерів думок, показуй вигоду</li>
        </ul>

        <h3 style="font-size: 20px; font-weight: bold; margin: 20px 0 10px; color: #000;">9. ДОДАТКОВІ МОЖЛИВОСТІ</h3>
        <div style="background: #D4EDDA; border: 1px solid #28A745; padding: 15px; margin: 15px 0;">
          <p style="font-weight: bold; margin-bottom: 10px; font-size: 18px;">АПСЕЙЛ ВЕЛИЧЕЗНИЙ! LTV 500К - 2М+!</p>
          <p style="margin-bottom: 10px;"><strong>Супровід:</strong> 25,000-50,000₴/міс (90%+ залишаються!) - за рік: 300-600К</p>
          <p style="margin-top: 15px; margin-bottom: 10px;"><strong>Розвиток системи (перший рік):</strong> 200-400К</p>
          <p style="margin-top: 15px; margin-bottom: 10px;"><strong>Масштабування (роки 2-3):</strong> 500К - 1М+</p>
          <p style="margin-top: 15px; font-weight: bold; font-size: 16px;">ЗАГАЛОМ ЗА 3 РОКИ: 1.8М - 3.7М</p>
          <p style="margin-top: 10px; font-weight: bold;">Рекордний клієнт: 5.2М за 4 роки</p>
        </div>
      </div>
    `
  } else if (clientType === 'has-crm') {
    recommendations = `
      <div style="margin: 30px 0;">
        <h3 style="font-size: 20px; font-weight: bold; margin: 20px 0 10px; color: #000;">1. ТИП КЛІЄНТА</h3>
        <p style="font-size: 16px; margin-bottom: 20px;">Є CRM - Оптимізація та супровід (від 25,000₴)</p>

        <h3 style="font-size: 20px; font-weight: bold; margin: 20px 0 10px; color: #000;">2. ХАРАКТЕРИСТИКА</h3>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>Команда: ${teamSize}</li>
          <li>Вже є впроваджена CRM</li>
          <li>Використовується частково або повністю</li>
          <li>Потрібні доопрацювання</li>
          <li>Або розуміють що налаштовано неправильно</li>
          <li>Шукають експертний супровід</li>
        </ul>

        <h3 style="font-size: 20px; font-weight: bold; margin: 20px 0 10px; color: #000;">3. ЧОГО ХОЧЕ КЛІЄНТ</h3>
        <p style="margin-bottom: 10px;"><strong>Типові проблеми:</strong></p>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>CRM налаштована не під їхні процеси (менеджери використовують на 30-40%)</li>
          <li>Менеджери обходять систему (ведуть паралельно Excel)</li>
          <li>Немає потрібних інтеграцій (ручне перенесення даних)</li>
          <li>Немає навчання (кожен працює як хоче)</li>
          <li>Попереднє впровадження провалилось</li>
        </ul>

        <div style="background: #D4EDDA; border: 2px solid #28A745; padding: 20px; margin: 20px 0;">
          <h3 style="font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #155724;">5. РЕКОМЕНДАЦІЯ ДЛЯ МЕНЕДЖЕРА</h3>
          <p style="font-weight: bold; margin-bottom: 10px; font-size: 18px;">✓ ЛЕГКІ КЛІЄНТИ З ШВИДКОЮ ОПЛАТОЮ!</p>
          <p style="margin-bottom: 10px;"><strong>Чому вони хороші:</strong></p>
          <ul style="margin: 10px 0; padding-left: 20px;">
            <li>✓ Вже розуміють цінність CRM</li>
            <li>✓ Є бюджет</li>
            <li>✓ Знають що хочуть</li>
            <li>✓ Швидке прийняття рішень</li>
            <li>✓ Легко конвертуються в супровід</li>
          </ul>
          <p style="margin-top: 15px; margin-bottom: 10px;"><strong>Як працювати:</strong></p>
          <ul style="margin: 10px 0; padding-left: 20px;">
            <li>Продавай аудит (5-10К)</li>
            <li>Потім оптимізацію (25-50К)</li>
            <li>Або одразу супровід (12,500₴/міс)</li>
            <li>Або переїзд на іншу CRM (70К+)</li>
          </ul>
        </div>

        <h3 style="font-size: 20px; font-weight: bold; margin: 20px 0 10px; color: #000;">6. ЩО ПРОПОНУВАТИ</h3>
        <p style="margin-bottom: 10px;"><strong>Варіант 1: Аудит + Оптимізація (25,000₴+)</strong></p>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>Аудит поточної системи (2-4 години) - як налаштована, що використовується, чому не користуються</li>
          <li>Оптимізація (1-2 тижні) - перенастройка під процеси, видалення зайвого, додавання потрібного, інтеграції</li>
          <li>Навчання (1 день) - як правильно працювати, стандарти, інструкції</li>
        </ul>
        <p style="margin-top: 15px; margin-bottom: 10px;"><strong>Варіант 2: Супровід (12,500₴/міс)</strong></p>
        <p style="margin-top: 15px; margin-bottom: 10px;"><strong>Варіант 3: Переїзд на іншу CRM (70,000₴+)</strong> - якщо поточна зовсім не підходить</p>

        <h3 style="font-size: 20px; font-weight: bold; margin: 20px 0 10px; color: #000;">7. ЯК ПРАЦЮВАТИ</h3>
        <p style="margin-bottom: 10px;"><strong>Скрипт першого дзвінка:</strong></p>
        <div style="background: #F8F9FA; padding: 15px; margin: 10px 0; border-left: 4px solid #FFD700;">
          <p>"Вітаю [Ім'я]! Бачу у вас вже є [назва CRM] - чудово, що вже почали автоматизацію. Типова ситуація - CRM впровадили, але менеджери користуються на 30-40%, багато зайвого, немає інтеграцій. У вас схожа ситуація? [дочекатися відповіді]</p>
          <p style="margin-top: 10px;">Пропоную аудит - 2-3 години, подивлюся як налаштовано, знайду що не так, скажу що треба виправити. Після аудиту - план оптимізації та вартість. Коли вам зручно?"</p>
        </div>
        <p style="margin-top: 20px; margin-bottom: 10px;"><strong>Етапи роботи:</strong></p>
        <ol style="margin: 10px 0; padding-left: 25px;">
          <li style="margin-bottom: 10px;"><strong>Аудит (1 день):</strong> Zoom 2-3 год, доступ до CRM, подивитися як налаштовано, поговорити з користувачами</li>
          <li style="margin-bottom: 10px;"><strong>План оптимізації (1-2 дні):</strong> Що треба виправити, вартість, термін</li>
          <li style="margin-bottom: 10px;"><strong>Оптимізація (1-2 тижні):</strong> Перенастройка, інтеграції, автоматизація, тестування</li>
          <li style="margin-bottom: 10px;"><strong>Навчання (1 день):</strong> Що змінилось, як користуватися, інструкції</li>
          <li style="margin-bottom: 10px;"><strong>Пропозиція супроводу:</strong> Після успішної оптимізації, 60-70% погоджуються</li>
        </ol>

        <h3 style="font-size: 20px; font-weight: bold; margin: 20px 0 10px; color: #000;">8. НА ЩО ЗВЕРНУТИ УВАГУ</h3>
        <p style="margin-bottom: 10px;"><strong>ОСОБЛИВОСТІ:</strong></p>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li><strong>Вже "обпеклися":</strong> Попереднє впровадження провалилось, не довіряють, перевіряють ретельно → Покажи експертизу одразу, знайди проблеми в аудиті</li>
          <li><strong>Опір змінам:</strong> "Нам вже впроваджували" → Покажи що буде легше, мінімальні зміни, швидкий результат</li>
          <li><strong>Обмежений бюджет:</strong> Вже витратили на впровадження → Аудит платний (5-10К), чітко обгрунтуй вартість</li>
        </ul>
        <p style="margin-top: 15px; margin-bottom: 10px;"><strong>ПОКАЗНИКИ УСПІХУ:</strong> Після оптимізації - використання зросло до 70%+, менеджери перестали скаржитися, власник бачить потрібні дані</p>

        <h3 style="font-size: 20px; font-weight: bold; margin: 20px 0 10px; color: #000;">9. ДОДАТКОВІ МОЖЛИВОСТІ</h3>
        <div style="background: #D4EDDA; border: 1px solid #28A745; padding: 15px; margin: 15px 0;">
          <p style="font-weight: bold; margin-bottom: 10px; font-size: 18px;">Супровід - ОСНОВНА МЕТА!</p>
          <p style="margin-bottom: 10px;">Після успішної оптимізації: 60-70% йдуть на супровід, 12,500₴/міс, рік супроводу = 150К</p>
          <p style="margin-top: 15px; margin-bottom: 10px;"><strong>Що ще продати:</strong></p>
          <ul style="margin: 10px 0; padding-left: 20px;">
            <li>Зараз: Аудит 5-10К, Оптимізація 25-50К, Інтеграції 10-20К кожна</li>
            <li>Через 1-3 місяці: Супровід 12,500₴/міс, Розширення 20-40К</li>
            <li>Через 6-12 місяців: Інтеграція з обліком 30-50К, Складні процеси 40-60К</li>
          </ul>
          <p style="margin-top: 15px;"><strong>LTV: 100-300К</strong> | <strong>Конверсія: 70%+</strong> | <strong>Цикл: 1-2 тижні</strong></p>
        </div>
      </div>
    `
  }

  // Если рекомендации не сгенерированы (неизвестный тип), возвращаем базовую версию
  if (!recommendations || recommendations.trim().length === 0) {
    recommendations = `
      <div style="margin: 30px 0;">
        <h3 style="font-size: 20px; font-weight: bold; margin: 20px 0 10px; color: #000;">1. ТИП КЛІЄНТА</h3>
        <p style="font-size: 16px; margin-bottom: 20px;">Тип клієнта: ${clientType || 'Не визначено'}</p>
        <p style="margin-bottom: 20px;">Потрібна додаткова інформація для формування рекомендацій.</p>
      </div>
    `
  }

  return separator + header + recommendations
}

// Функція для відправки email повідомлення
// В реальному проекті тут буде інтеграція з сервісом відправки email
async function sendEmailNotification(params: Record<string, any>): Promise<boolean> {
  try {
    // Всі форми відправляються на один вебхук
    const webhookUrl = process.env.N8N_ORDERS_URL
    const webhookSecret = process.env.WEBHOOK_SECRET

    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/de426b11-629a-4d11-809b-e48b79b36174',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'orders-pre',hypothesisId:'H6',location:'lib/actions.ts:2047',message:'orders_webhook_env_check',data:{hasWebhookUrl:!!webhookUrl,hasWebhookSecret:!!webhookSecret,formType:params?.formType || 'unknown'},timestamp:Date.now()})}).catch(()=>{});
    // #endregion

    if (!webhookUrl) {
      console.error("N8N_ORDERS_URL not configured")
      return false
    }
    if (!webhookSecret) {
      console.error("WEBHOOK_SECRET not configured")
      return false
    }

    // Формируем payload только из отдельных полей
    const payload = {
      ...params,
      timestamp: new Date().toISOString(),
    }

    console.log("=== WEBHOOK REQUEST ===")
    console.log("Form Type:", params.formType)
    console.log("URL:", webhookUrl)
    console.log("Has answers:", !!params.answers)
    console.log("Has clientType:", !!params.clientType)
    console.log("Has htmlContent:", !!params.htmlContent)
    console.log("Has managerRecommendations:", !!params.managerRecommendations)
    console.log("Payload keys:", Object.keys(payload))
    console.log("=======================\n")

    // Відправка даних на вебхук
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/de426b11-629a-4d11-809b-e48b79b36174',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'orders-pre',hypothesisId:'H6',location:'lib/actions.ts:2066',message:'orders_webhook_request_start',data:{hasWebhookSecret:!!webhookSecret,hasAnswers:!!params?.answers,hasManagerRecommendations:!!params?.managerRecommendations},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-webhook-secret": webhookSecret,
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/de426b11-629a-4d11-809b-e48b79b36174',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'orders-pre',hypothesisId:'H6',location:'lib/actions.ts:2074',message:'orders_webhook_response_error',data:{status:response.status},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      throw new Error(`Помилка відправки даних: ${response.status} ${response.statusText}`)
    }

    const responseData = await response.json().catch(() => ({}))
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/de426b11-629a-4d11-809b-e48b79b36174',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'orders-pre',hypothesisId:'H6',location:'lib/actions.ts:2078',message:'orders_webhook_response_ok',data:{status:response.status},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    console.log("✓ Email запрос успешно отправлен на вебхук")
    console.log("Response status:", response.status)
    console.log("Response data:", responseData)
    return true
  } catch (error) {
    console.error("✗ Помилка відправки email на вебхук:", error)
    if (error instanceof Error) {
      console.error("Error message:", error.message)
      console.error("Error stack:", error.stack)
    }
    return false
  }
}
