"use client"

import { useState, useEffect } from "react"
import { submitForm } from "@/lib/actions"
import { useToast } from "@/hooks/use-toast"

// Типы данных
interface QuizOption {
  value: string
  label: string
  hint?: string
  hasInput?: boolean
  inputPlaceholder?: string
}

interface QuizQuestion {
  id: string
  number: number
  title: string
  subtitle?: string
  type: 'radio' | 'checkbox'
  maxSelect?: number
  options: QuizOption[]
}

interface QuizAnswers {
  businessType: string
  teamSize: string
  systems: Record<string, boolean | string>
  pains: string[]
  decisionMaker: string
  contact: {
    name: string
    phone: string
    email: string
    callTime: string
    otherTime: string
  }
}

// Данные квиза
const quizData: { questions: QuizQuestion[] } = {
  questions: [
    {
      id: 'businessType',
      number: 1,
      title: 'Як ви працюєте з клієнтами?',
      type: 'radio',
      options: [
        {
          value: 'b2b',
          label: 'B2B (продаємо бізнесу)',
          hint: 'Цикл угоди довгий, потрібен контроль етапів'
        },
        {
          value: 'b2c',
          label: 'B2C (продаємо кінцевим споживачам)',
          hint: 'Цикл короткий, важлива швидкість обробки'
        },
        {
          value: 'both',
          label: 'B2B + B2C (обидва напрямки)',
          hint: 'Потрібні різні воронки для різних клієнтів'
        }
      ]
    },
    {
      id: 'teamSize',
      number: 2,
      title: 'Скільки людей у вашій команді?',
      type: 'radio',
      options: [
        {
          value: '1-3',
          label: '1-3 особи',
          hint: 'Тільки починаємо'
        },
        {
          value: '3-15',
          label: '3-15 осіб',
          hint: 'Малий бізнес, потрібна система'
        },
        {
          value: '15-35',
          label: '15-35 осіб',
          hint: 'Середній бізнес, вже є хаос'
        },
        {
          value: '35+',
          label: '35-100+ осіб',
          hint: 'Великий бізнес, складні процеси'
        }
      ]
    },
    {
      id: 'systems',
      number: 3,
      title: 'Які системи вже працюють у вас?',
      type: 'checkbox',
      options: [
        {
          value: 'nothing',
          label: 'Нічого (працюємо в Excel/блокнотах)',
          hint: ''
        },
        {
          value: 'crm',
          label: 'CRM система',
          hint: '',
          hasInput: true,
          inputPlaceholder: 'Яка саме?'
        },
        {
          value: 'accounting',
          label: 'Бухгалтерія/облік (Medoc, Finsmart, 1С)',
          hint: '',
          hasInput: true,
          inputPlaceholder: 'Яка саме?'
        },
        {
          value: 'tasks',
          label: 'Таск-менеджер (Asana, Trello, інше)',
          hint: ''
        },
        {
          value: 'portal',
          label: 'Корпоративний портал',
          hint: ''
        }
      ]
    },
    {
      id: 'pains',
      number: 4,
      title: 'Що найбільше болить зараз?',
      subtitle: 'Оберіть до 3 варіантів',
      type: 'checkbox',
      maxSelect: 3,
      options: [
        {
          value: 'lost_clients',
          label: 'Втрачаємо клієнтів між менеджерами'
        },
        {
          value: 'unknown_source',
          label: 'Не знаємо звідки прийшов клієнт'
        },
        {
          value: 'old_base',
          label: 'Менеджери працюють тільки зі старою базою'
        },
        {
          value: 'no_control',
          label: 'Немає контролю за угодами'
        },
        {
          value: 'hard_training',
          label: 'Складно навчити нових співробітників'
        },
        {
          value: 'task_chaos',
          label: 'Хаос у завданнях та дедлайнах'
        },
        {
          value: 'reporting_time',
          label: 'Витрачаємо багато часу на звітність'
        },
        {
          value: 'no_visibility',
          label: 'Керівник не бачить повну картину'
        }
      ]
    },
    {
      id: 'decisionMaker',
      number: 5,
      title: 'Хто буде приймати рішення про впровадження?',
      type: 'radio',
      options: [
        {
          value: 'owner',
          label: 'Я власник/співвласник',
          hint: 'Приймаю рішення сам'
        },
        {
          value: 'director',
          label: 'Я директор (найманий)',
          hint: 'Потрібно узгодження з власником'
        },
        {
          value: 'head',
          label: 'Я керівник відділу',
          hint: 'Потрібно узгодження з директором'
        },
        {
          value: 'responsible',
          label: 'Я відповідальний за проєкт',
          hint: 'Маю повноваження прийняти рішення'
        }
      ]
    }
  ]
}

type ClientType = 'startup' | 'small' | 'medium-risk' | 'ideal' | 'large' | 'has-crm'

export default function QuizSection() {
  const { toast } = useToast()
  const [currentScreen, setCurrentScreen] = useState<'intro' | 'quiz' | 'contact' | 'result'>('intro')
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Partial<QuizAnswers>>({
    systems: {},
    pains: [],
    contact: {
      name: '',
      phone: '',
      email: '',
      callTime: 'today_18',
      otherTime: ''
    }
  })
  const [clientType, setClientType] = useState<ClientType | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Начать квиз
  const startQuiz = () => {
    setCurrentScreen('quiz')
    setCurrentQuestion(0)
  }

  // Обработка ответа
  const handleAnswer = (questionId: string, value: string, type: 'radio' | 'checkbox', maxSelect?: number) => {
    if (type === 'radio') {
      setAnswers(prev => ({ ...prev, [questionId]: value }))
    } else if (type === 'checkbox') {
      // Специальная обработка для pains - это должен быть массив
      if (questionId === 'pains') {
        setAnswers(prev => {
          const current = (prev.pains || []) as string[]
          const isSelected = current.includes(value)
          
          if (isSelected) {
            // Удаляем из массива
            return { ...prev, pains: current.filter(p => p !== value) }
          } else {
            // Проверка лимита
            if (maxSelect && current.length >= maxSelect) {
              return prev
            }
            // Добавляем в массив
            return { ...prev, pains: [...current, value] }
          }
        })
        return
      }
      
      // Для остальных checkbox вопросов (systems) используем объект
      setAnswers(prev => {
        const current = prev[questionId] as Record<string, boolean | string> || {}
        const newValue = { ...current }

        if (value === 'nothing') {
          return { ...prev, [questionId]: { nothing: true } }
        }

        // Убрать "nothing" если выбираем что-то другое
        if (newValue.nothing) {
          delete newValue.nothing
        }

        // Проверка лимита
        if (maxSelect) {
          const selectedCount = Object.keys(newValue).filter(k => !k.endsWith('_name')).length
          if (selectedCount >= maxSelect && !newValue[value]) {
            return prev
          }
        }

        if (newValue[value]) {
          delete newValue[value]
          delete newValue[value + '_name']
        } else {
          newValue[value] = true
        }

        return { ...prev, [questionId]: newValue }
      })
    }
  }

  // Обработка текстового ввода
  const handleInputAnswer = (questionId: string, value: string, inputValue: string) => {
    setAnswers(prev => {
      const current = prev[questionId] as Record<string, boolean | string> || {}
      return {
        ...prev,
        [questionId]: { ...current, [value + '_name']: inputValue }
      }
    })
  }

  // Следующий вопрос
  const nextQuestion = () => {
    const question = quizData.questions[currentQuestion]
    
    // Проверка что ответ дан
    if (question.type === 'radio') {
      if (!answers[question.id]) return
    } else {
      // Специальная проверка для pains (массив)
      if (question.id === 'pains') {
        const painsArray = answers.pains || []
        if (!Array.isArray(painsArray) || painsArray.length === 0) return
      } else {
        // Для остальных checkbox (объект)
        const selected = answers[question.id] as Record<string, boolean | string> | undefined
        if (!selected || Object.keys(selected).filter(k => !k.endsWith('_name')).length === 0) return
      }
    }

    if (currentQuestion < quizData.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1)
    } else {
      setCurrentScreen('contact')
    }
  }

  // Предыдущий вопрос
  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1)
    }
  }

  // Вернуться к квизу
  const backToQuiz = () => {
    setCurrentScreen('quiz')
  }

  // Определение типа клиента
  const determineClientType = (): ClientType => {
    const teamSize = answers.teamSize as string
    const systems = answers.systems || {}
    const hasCRM = systems.crm === true
    const hasAccounting = systems.accounting === true
    const hasNothing = systems.nothing === true

    if (teamSize === '1-3' && (hasNothing || !hasAccounting)) {
      return 'startup'
    }

    if (hasAccounting && !hasCRM) {
      return 'ideal'
    }

    if (teamSize === '35+') {
      return 'large'
    }

    if (teamSize === '15-35' && (hasNothing || (!hasCRM && !hasAccounting))) {
      return 'medium-risk'
    }

    if (hasCRM) {
      return 'has-crm'
    }

    if (teamSize === '3-15' && !hasCRM) {
      return 'small'
    }

    return 'small'
  }

  // Отправка квиза
  const submitQuiz = async () => {
    const name = answers.contact?.name?.trim()
    const phone = answers.contact?.phone?.trim()
    const privacy = true // В реальности нужно проверить чекбокс

    if (!name || !phone) {
      toast({
        title: "Помилка",
        description: "Будь ласка, заповніть всі обов'язкові поля",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const type = determineClientType()
      setClientType(type)

      // Отправка данных
      const formData = new FormData()
      formData.append('formType', 'quiz')
      formData.append('name', name)
      formData.append('phone', phone)
      formData.append('email', answers.contact?.email || '')
      formData.append('callTime', answers.contact?.callTime || 'today_18')
      formData.append('otherTime', answers.contact?.otherTime || '')
      // Отправляем answers как JSON объект
      formData.append('answers', JSON.stringify(answers))
      // Отправляем результат (clientType)
      formData.append('clientType', type)
      formData.append('result', JSON.stringify({ clientType: type, profile: generateProfile() }))

      const result = await submitForm(formData)

      if (result.success) {
        setCurrentScreen('result')
        // Прокручиваем к результату, а не в самый верх
        setTimeout(() => {
          const resultElement = document.getElementById('quiz-result')
          if (resultElement) {
            resultElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        }, 100)
      } else {
        toast({
          title: "Помилка",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Помилка відправки квиза:', error)
      toast({
        title: "Помилка",
        description: "Сталася помилка при відправці. Спробуйте ще раз.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Генерация профиля
  const generateProfile = () => {
    const businessType = {
      'b2b': 'B2B бізнес',
      'b2c': 'B2C бізнес',
      'both': 'B2B + B2C'
    }[answers.businessType as string] || ''

    const teamSize = {
      '1-3': '1-3 особи',
      '3-15': '3-15 осіб',
      '15-35': '15-35 осіб',
      '35+': '35-100+ осіб'
    }[answers.teamSize as string] || ''

    let systems: string[] = []
    const systemsData = answers.systems || {}
    if (systemsData.nothing) systems.push('Немає систем')
    if (systemsData.crm) {
      const crmName = systemsData.crm_name ? ` (${systemsData.crm_name})` : ''
      systems.push('Є CRM' + crmName)
    }
    if (systemsData.accounting) {
      const accName = systemsData.accounting_name ? ` (${systemsData.accounting_name})` : ''
      systems.push('Є облікова система' + accName)
    }
    if (systemsData.tasks) systems.push('Є таск-менеджер')
    if (systemsData.portal) systems.push('Є портал')

    const pains = {
      'lost_clients': 'втрачаємо клієнтів',
      'unknown_source': 'не знаємо звідки клієнт',
      'old_base': 'менеджери зі старою базою',
      'no_control': 'немає контролю',
      'hard_training': 'складно навчити нових',
      'task_chaos': 'хаос у завданнях',
      'reporting_time': 'багато часу на звіти',
      'no_visibility': 'керівник не бачить картину'
    }

    const painsList = (answers.pains || []).map((p: string) => pains[p as keyof typeof pains]).filter(Boolean)

    const decisionMaker = {
      'owner': 'Власник',
      'director': 'Директор (найманий)',
      'head': 'Керівник відділу',
      'responsible': 'Відповідальний за проєкт'
    }[answers.decisionMaker as string] || ''

    return {
      businessType,
      teamSize,
      systems,
      painsList,
      decisionMaker
    }
  }

  // Получение контента результата
  const getResultContent = (type: ClientType) => {
    const profile = generateProfile()

    const results: Record<ClientType, JSX.Element> = {
      'startup': (
        <>
          <h4 className="text-2xl font-bold mb-4">ЧЕСНА РЕКОМЕНДАЦІЯ</h4>
          <p className="mb-6">На вашому етапі CRM може бути зайвою.</p>
          
          <p className="mb-4"><strong>Зараз вам важливіше:</strong></p>
          <ul className="space-y-2 mb-6">
            <li className="flex items-start gap-2">
              <span className="text-[#FFD700] mt-1">✓</span>
              <span>Налагодити потік клієнтів</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#FFD700] mt-1">✓</span>
              <span>Відпрацювати продажі</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#FFD700] mt-1">✓</span>
              <span>Зробити перші гроші</span>
            </li>
          </ul>

          <div className="bg-[#FFD700] p-6 border border-black mb-6">
            <h5 className="text-xs font-mono uppercase tracking-wider mb-3">Що ми можемо для вас</h5>
            <p className="mb-2"><strong>Мінімальний пакет за 5,000₴</strong></p>
            <div className="text-sm space-y-1 mb-4">
              <p>• Налаштування базових статусів та полів</p>
              <p>• 1-2 прості автоматизації</p>
              <p>• 3 дні підтримки в чаті</p>
              <p>• 30-хвилинний вебінар</p>
            </div>
            <p className="text-sm italic">Підходить якщо у вас вже є готова CRM і дуже прості процеси.</p>
          </div>

          <p className="mb-4"><strong>Або повернутися коли буде:</strong></p>
          <ul className="space-y-2 mb-8">
            <li className="flex items-start gap-2">
              <span className="text-[#FFD700] mt-1">✓</span>
              <span>5-10 постійних клієнтів</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#FFD700] mt-1">✓</span>
              <span>Стабільний потік заявок</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#FFD700] mt-1">✓</span>
              <span>3+ менеджери в команді</span>
            </li>
          </ul>

          <div className="text-center py-6 border-t border-black/10">
            <p className="mb-4"><strong>Ми цінуємо ваш час і свій</strong></p>
            <p className="text-sm text-black/60 mb-4">
              Краще відверто сказати що зараз не час, ніж взяти гроші за те що не принесе результату.
            </p>
            <p className="text-sm">Успіхів у розвитку бізнесу!</p>
          </div>
        </>
      ),
      'small': (
        <>
          <h4 className="text-2xl font-bold mb-4">НАША РЕКОМЕНДАЦІЯ: ПАКЕТ СТАРТ</h4>
          
          <p className="mb-4"><strong>Чому саме він:</strong></p>
          <ul className="space-y-2 mb-6">
            <li className="flex items-start gap-2">
              <span className="text-[#FFD700] mt-1">✓</span>
              <span>Швидкий результат (2-3 тижні)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#FFD700] mt-1">✓</span>
              <span>Почнете бачити всі угоди</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#FFD700] mt-1">✓</span>
              <span>Менеджери працюватимуть в одній системі</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#FFD700] mt-1">✓</span>
              <span>Перші автоматизації</span>
            </li>
          </ul>

          <div className="bg-[#FFD700] p-6 border border-black mb-6">
            <h5 className="text-xs font-mono uppercase tracking-wider mb-3">Що входить</h5>
            <ul className="space-y-2 mb-4">
              <li className="flex items-start gap-2">
                <span className="text-[#FFD700] mt-1">✓</span>
                <span>Обов'язковий аудит (2 години)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#FFD700] mt-1">✓</span>
                <span>Підбір CRM під ваш бізнес</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#FFD700] mt-1">✓</span>
                <span>Налаштування воронок та статусів</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#FFD700] mt-1">✓</span>
                <span>До 3 базових інтеграцій</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#FFD700] mt-1">✓</span>
                <span>Базові автоматизації</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#FFD700] mt-1">✓</span>
                <span>Вебінар для команди (1-2 години)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#FFD700] mt-1">✓</span>
                <span>Тиждень технічної підтримки</span>
              </li>
            </ul>
            <p className="mb-2"><strong>Орієнтовна вартість: від 25,000₴</strong></p>
            <p className="text-sm">⏱️ Типовий термін: 2-3 тижні</p>
          </div>

          <p className="mb-4"><strong>Що далі:</strong></p>
          <p className="mb-6">1. Проведемо аудит (2 години, безкоштовно)<br />
            2. Покажемо як буде працювати<br />
            3. Запустимо перші продажі за місяць</p>
        </>
      ),
      'medium-risk': (
        <>
          <div className="bg-[#FEF2F2] border border-[#DC2626] p-6 mb-6">
            <h5 className="text-[#DC2626] font-bold mb-3">⚠️ Важливе попередження</h5>
            <p className="mb-3">У компаніях вашого розміру БЕЗ систем зазвичай проблема не в технологіях, а в менеджменті.</p>
            <p className="mb-3"><strong>CRM не замінить управління!</strong></p>
            
            <p className="mb-2">Якщо у вас:</p>
            <ul className="list-disc list-inside mb-3 space-y-1">
              <li>Немає чіткого розподілу відповідальності</li>
              <li>Люди не виконують завдання в строк</li>
              <li>Відсутні базові процедури</li>
            </ul>
            
            <p>CRM тільки "підсвітить" ці проблеми, але не вирішить їх автоматично.</p>
          </div>

          <h4 className="text-2xl font-bold mb-4">Наша рекомендація: Поетапне впровадження</h4>
          
          <div className="bg-[#F8F9FA] p-6 border border-black/10 mb-6">
            <p className="mb-4"><strong>Етап 1: Корпоративний портал (1-1.5 міс)</strong></p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-start gap-2">
                <span className="text-[#FFD700] mt-1">✓</span>
                <span>Люди звикають до роботи в системі</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#FFD700] mt-1">✓</span>
                <span>Налагоджуються завдання та комунікація</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#FFD700] mt-1">✓</span>
                <span>З'являється дисципліна виконання</span>
              </li>
            </ul>
            
            <p className="mb-4"><strong>Етап 2: CRM (після звикання до системи)</strong></p>
            <ul className="space-y-2 mb-4">
              <li className="flex items-start gap-2">
                <span className="text-[#FFD700] mt-1">✓</span>
                <span>Впроваджуємо систему продажів</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#FFD700] mt-1">✓</span>
                <span>Інтеграції та автоматизація</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#FFD700] mt-1">✓</span>
                <span>Контроль угод</span>
              </li>
            </ul>
            
            <p className="mt-4"><strong>Орієнтовна вартість: від 70,000₴</strong><br />
            Термін: 2-3 місяці</p>
          </div>

          <p className="mb-4"><strong>Чому це важливо:</strong></p>
          <p>Якщо впровадити тільки CRM без підготовки — ризик провалу 70-80%. Люди просто не будуть користуватися системою.</p>
        </>
      ),
      'ideal': (
        <>
          <h4 className="text-2xl font-bold mb-4">Ви — ідеальний клієнт для впровадження!</h4>
          
          <p className="mb-4"><strong>Чому:</strong></p>
          <ul className="space-y-2 mb-6">
            <li className="flex items-start gap-2">
              <span className="text-[#FFD700] mt-1">✓</span>
              <span>Базові процеси вже налаштовані в обліку</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#FFD700] mt-1">✓</span>
              <span>Є розуміння систематизації</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#FFD700] mt-1">✓</span>
              <span>Команда готова до нових інструментів</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#FFD700] mt-1">✓</span>
              <span>Чітко видно проблему</span>
            </li>
          </ul>

          <p className="mb-4"><strong>Типова ситуація в таких компаніях:</strong></p>
          <p className="mb-6">Менеджери працюють зі старою базою клієнтів<br />
            Нові ліди обробляються погано<br />
            Власник не бачить воронку продажів<br />
            Немає зв'язку між лідами та продажами</p>

          <div className="bg-[#FFD700] p-6 border border-black mb-6">
            <h5 className="text-xs font-mono uppercase tracking-wider mb-3">Наша рекомендація: Пакет ПРОФЕСІЙНИЙ</h5>
            
            <p className="mb-4"><strong>Що зробимо:</strong></p>
            <ul className="space-y-2 mb-4">
              <li className="flex items-start gap-2">
                <span className="text-black mt-1">✓</span>
                <span>CRM з інтеграцією в облікову систему</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-black mt-1">✓</span>
                <span>Автоматична передача даних (угоди → накладні)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-black mt-1">✓</span>
                <span>Контроль роботи менеджерів</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-black mt-1">✓</span>
                <span>Воронка для нових лідів</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-black mt-1">✓</span>
                <span>Звітність для власника/РОПа</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-black mt-1">✓</span>
                <span>n8n автоматизація рутини</span>
              </li>
            </ul>
            
            <p className="mt-4">
              <strong>Орієнтовна вартість: від 70,000₴</strong><br />
              Термін впровадження: 1-2 місяці<br />
              Окупність: 3-4 місяці
            </p>
          </div>

          <div className="bg-[#F8F9FA] p-6 border border-black/10 mb-6">
            <p className="mb-4"><strong>Типовий результат після впровадження:</strong></p>
            <ul className="space-y-2 mb-4">
              <li className="flex items-start gap-2">
                <span className="text-[#FFD700] mt-1">✓</span>
                <span>Менеджери починають обробляти нових клієнтів</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#FFD700] mt-1">✓</span>
                <span>Власник бачить всю воронку продажів</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#FFD700] mt-1">✓</span>
                <span>Дані автоматично йдуть в облік</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#FFD700] mt-1">✓</span>
                <span>Ріст продажів на 20-30% за перші 3 місяці</span>
              </li>
            </ul>
            <p className="text-sm italic text-black/60 mt-4">
              "До впровадження менеджери працювали тільки зі старими клієнтами. Після — кожен веде 10-15 нових угод щомісяця"<br />
              — типовий відгук
            </p>
          </div>
        </>
      ),
      'large': (
        <>
          <h4 className="text-2xl font-bold mb-4">Ви — наш профільний клієнт</h4>
          
          <p className="mb-4"><strong>Чому ми підходимо для великих компаній:</strong></p>
          <ul className="space-y-2 mb-6">
            <li className="flex items-start gap-2">
              <span className="text-[#FFD700] mt-1">✓</span>
              <span>10+ років досвіду</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#FFD700] mt-1">✓</span>
              <span>Розуміємо складні організаційні структури</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#FFD700] mt-1">✓</span>
              <span>Працювали з компаніями 100+ осіб</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#FFD700] mt-1">✓</span>
              <span>Знаємо як впроваджувати без зупинки бізнесу</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#FFD700] mt-1">✓</span>
              <span>Поетапний підхід з мінімізацією ризиків</span>
            </li>
          </ul>

          <div className="bg-[#FFD700] p-6 border border-black mb-6">
            <h5 className="text-xs font-mono uppercase tracking-wider mb-3">Наша рекомендація: ІНДИВІДУАЛЬНИЙ підхід</h5>
            
            <p className="mb-4"><strong>Типовий план впровадження:</strong></p>
            
            <p className="mb-2"><strong>Фаза 1: Корпоративний портал (2-3 міс)</strong></p>
            <p className="text-sm mb-4">
              → Завдання, комунікація, документообіг<br />
              → Люди звикають до системи<br />
              → Налагоджується внутрішня взаємодія
            </p>
            
            <p className="mb-2"><strong>Фаза 2: CRM + інтеграція обліку (2-3 міс)</strong></p>
            <p className="text-sm mb-4">
              → Система продажів<br />
              → Автоматичний обмін даними<br />
              → Контроль угод
            </p>
            
            <p className="mb-2"><strong>Фаза 3: Автоматизація процесів (ongoing)</strong></p>
            <p className="text-sm mb-4">
              → Складні бізнес-процеси<br />
              → AI інтеграції<br />
              → Кастомні модулі
            </p>
            
            <p className="mt-4">
              <strong>Орієнтовна вартість: від 120,000₴</strong><br />
              Термін: від 4 місяців<br />
              Окупність: 2-3 місяці
            </p>
          </div>

          <div className="bg-[#F8F9FA] p-6 border border-black/10 mb-6">
            <p className="mb-4"><strong>Що важливо для великих проєктів:</strong></p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-[#FFD700] mt-1">→</span>
                <span>Виділений менеджер проєкту з нашого боку</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#FFD700] mt-1">→</span>
                <span>Поетапне впровадження (без "big bang")</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#FFD700] mt-1">→</span>
                <span>Мінімум ризиків через правильну послідовність</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#FFD700] mt-1">→</span>
                <span>Залучення ключових співробітників на кожному етапі</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#FFD700] mt-1">→</span>
                <span>3 місяці супроводу після запуску</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#FFD700] mt-1">→</span>
                <span>Документація та навчальні матеріали</span>
              </li>
            </ul>
          </div>
        </>
      ),
      'has-crm': (
        <>
          <h4 className="text-2xl font-bold mb-4">Наша рекомендація: Аудит + Оптимізація</h4>
          
          <p className="mb-4"><strong>Типові проблеми існуючих CRM:</strong></p>
          <div className="bg-[#F8F9FA] p-5 border border-black/10 mb-6">
            <p className="mb-2">☐ Налаштована не під ваші процеси<br />
              <span className="ml-5 text-black/60">Менеджери використовують на 30-40%</span></p>
            
            <p className="mb-2 mt-3">☐ Менеджери обходять систему<br />
              <span className="ml-5 text-black/60">→ Ведуть Excel паралельно</span></p>
            
            <p className="mb-2 mt-3">☐ Немає потрібних інтеграцій<br />
              <span className="ml-5 text-black/60">→ Ручне перенесення даних</span></p>
            
            <p className="mb-2 mt-3">☐ Складно використовувати<br />
              <span className="ml-5 text-black/60">→ Багато зайвих функцій</span></p>
            
            <p className="mt-3">☐ Немає навчання<br />
              <span className="ml-5 text-black/60">→ Кожен працює по-своєму</span></p>
          </div>

          <div className="bg-[#FFD700] p-6 border border-black mb-6">
            <h5 className="text-xs font-mono uppercase tracking-wider mb-3">Що ми можемо</h5>
            
            <p className="mb-4"><strong>1. Аудит поточної системи (2-4 години)</strong></p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-start gap-2">
                <span className="text-black mt-1">✓</span>
                <span>Проаналізуємо як налаштована CRM</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-black mt-1">✓</span>
                <span>Знайдемо де втрачаються клієнти</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-black mt-1">✓</span>
                <span>Виявимо що заважає роботі</span>
              </li>
            </ul>
            
            <p className="mb-4"><strong>2. Оптимізація (1-2 тижні)</strong></p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-start gap-2">
                <span className="text-black mt-1">✓</span>
                <span>Оптимізуємо процеси під ваші задачі</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-black mt-1">✓</span>
                <span>Прибираємо зайве, додаємо потрібне</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-black mt-1">✓</span>
                <span>Налаштуємо інтеграції</span>
              </li>
            </ul>
            
            <p className="mb-4"><strong>3. Навчання команди (1 день)</strong></p>
            <ul className="space-y-2 mb-4">
              <li className="flex items-start gap-2">
                <span className="text-black mt-1">✓</span>
                <span>Покажемо як правильно працювати</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-black mt-1">✓</span>
                <span>Створимо інструкції</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-black mt-1">✓</span>
                <span>Відповімо на питання</span>
              </li>
            </ul>
            
            <p className="mt-4"><strong>Орієнтовна вартість: від 25,000₴</strong></p>
            
            <p className="text-sm mt-4">
              Якщо потрібен переїзд на іншу CRM:<br />
              → Від 70,000₴ (залежно від обсягу даних)
            </p>
          </div>
        </>
      )
    }

    return results[type]
  }

  const currentQuestionData = quizData.questions[currentQuestion]
  const progress = ((currentQuestion + 1) / quizData.questions.length) * 100

  return (
    <div className="relative w-full bg-white pt-16 pb-0 overflow-hidden">
      {/* Background grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(0deg, transparent 24%, rgba(0, 0, 0, .05) 25%, rgba(0, 0, 0, .05) 26%, transparent 27%, transparent 74%, rgba(0, 0, 0, .05) 75%, rgba(0, 0, 0, .05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(0, 0, 0, .05) 25%, rgba(0, 0, 0, .05) 26%, transparent 27%, transparent 74%, rgba(0, 0, 0, .05) 75%, rgba(0, 0, 0, .05) 76%, transparent 77%, transparent)",
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      <div className="relative max-w-[1400px] mx-auto px-8">
        {/* Section Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 border-2 border-[#FFD700] flex items-center justify-center">
              <div className="text-xs font-mono font-bold text-black">06</div>
            </div>
            <div>
              <h2 className="text-5xl font-black text-black uppercase tracking-tighter">
                Діагностика
              </h2>
            </div>
          </div>
        </div>

        {/* Intro Screen */}
        {currentScreen === 'intro' && (
          <div className="border border-black p-12 md:p-16 relative animate-in fade-in duration-500">
            <div className="absolute -top-3 left-8 bg-white px-2">
              <span className="text-xs font-mono text-black/60 tracking-wider uppercase">// ДІАГНОСТИКА</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Не впевнені що вам підходить?</h1>
            <p className="text-lg text-black/60 mb-6 max-w-2xl">
              Відповісте на 5 питань — отримайте персональну рекомендацію <strong className="text-black">тут і зараз</strong>
            </p>

            {/* Акцентный блок с результатом */}
            <div className="bg-[#FFD700] border border-black p-6 mb-10 max-w-2xl relative">
              <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-black" />
              <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-black" />
              <div className="flex items-start gap-3">
                <span className="text-2xl font-bold">⚡</span>
                <div>
                  <p className="font-bold text-lg mb-1">Результат одразу після проходження</p>
                  <p className="text-sm text-black/80">
                    Після відповідей ви одразу побачите персональну рекомендацію, орієнтовну вартість та план дій — без очікування та дзвінків
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-8 mb-10">
              <div className="flex items-center gap-2 text-sm font-mono">
                <span className="text-[#FFD700] text-xl">✓</span>
                <span>Займе 60 секунд</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-mono">
                <span className="text-[#FFD700] text-xl">✓</span>
                <span>Результат одразу</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-mono">
                <span className="text-[#FFD700] text-xl">✓</span>
                <span>Орієнтовна вартість</span>
              </div>
            </div>

            <button
              onClick={startQuiz}
              className="px-8 py-4 bg-[#FFD700] border border-black text-black font-mono text-sm uppercase tracking-wider hover:bg-[#E6C200] transition-all duration-200 hover:scale-105 hover:shadow-lg"
            >
              Отримати результат зараз →
            </button>
          </div>
        )}

        {/* Quiz Screen */}
        {currentScreen === 'quiz' && (
          <div className="border border-black p-8 md:p-12 relative animate-in fade-in slide-in-from-right duration-300">
            <div className="absolute -top-3 left-8 bg-white px-2">
              <span className="text-xs font-mono text-black/60 tracking-wider uppercase">
                ПИТАННЯ {currentQuestion + 1} З {quizData.questions.length}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="h-1 bg-black/10 mb-10 relative overflow-hidden">
              <div
                className="h-full bg-[#FFD700] transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
              {/* Decorative corners */}
              <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-[#FFD700]" />
              <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-[#FFD700]" />
            </div>

            {/* Question */}
            <div className="mb-10">
              <div className="text-xs font-mono text-black/60 mb-4 uppercase tracking-wider">
                Питання {currentQuestionData.number} з {quizData.questions.length}
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">{currentQuestionData.title}</h2>
              {currentQuestionData.subtitle && (
                <p className="text-black/60 mb-6">{currentQuestionData.subtitle}</p>
              )}

              {/* Options */}
              <div className="space-y-4">
                {currentQuestionData.options.map((option) => {
                  let isSelected = false
                  if (currentQuestionData.type === 'radio') {
                    isSelected = answers[currentQuestionData.id] === option.value
                  } else if (currentQuestionData.id === 'pains') {
                    // Для pains проверяем массив
                    const painsArray = answers.pains || []
                    isSelected = Array.isArray(painsArray) && painsArray.includes(option.value)
                  } else {
                    // Для остальных checkbox (systems) проверяем объект
                    isSelected = (answers[currentQuestionData.id] as Record<string, boolean | string>)?.[option.value] === true
                  }

                  return (
                    <label
                      key={option.value}
                      className={`flex items-start gap-4 p-5 border cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? 'border-black bg-[#FFD700] scale-[1.02] shadow-sm'
                          : 'border-black/20 hover:border-black/40 hover:bg-[#F8F9FA]'
                      }`}
                    >
                      <input
                        type={currentQuestionData.type}
                        name={currentQuestionData.id}
                        value={option.value}
                        checked={isSelected}
                        onChange={(e) => {
                          if (currentQuestionData.type === 'checkbox' && option.value === 'nothing') {
                            // Обработка исключительного выбора "nothing"
                            if (e.target.checked) {
                              setAnswers(prev => ({ ...prev, [currentQuestionData.id]: { nothing: true } }))
                            } else {
                              setAnswers(prev => ({ ...prev, [currentQuestionData.id]: {} }))
                            }
                          } else {
                            handleAnswer(currentQuestionData.id, option.value, currentQuestionData.type, currentQuestionData.maxSelect)
                          }
                        }}
                        className="mt-1 w-5 h-5"
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-lg mb-1">{option.label}</div>
                        {option.hint && (
                          <div className="text-sm text-black/60">{option.hint}</div>
                        )}
                        {option.hasInput && isSelected && (
                          <input
                            type="text"
                            className="mt-3 w-full px-3 py-2 border border-black/20 focus:border-black outline-none"
                            placeholder={option.inputPlaceholder}
                            value={(answers[currentQuestionData.id] as Record<string, string>)?.[option.value + '_name'] || ''}
                            onChange={(e) => handleInputAnswer(currentQuestionData.id, option.value, e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        )}
                      </div>
                    </label>
                  )
                })}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between gap-4">
              <button
                onClick={previousQuestion}
                disabled={currentQuestion === 0}
                className="px-6 py-3 border border-black font-mono text-sm uppercase tracking-wider disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black hover:text-white transition-colors"
              >
                ← Назад
              </button>
              <button
                onClick={nextQuestion}
                disabled={
                  currentQuestionData.type === 'radio'
                    ? !answers[currentQuestionData.id]
                    : !(answers[currentQuestionData.id] as Record<string, boolean | string>) || 
                      Object.keys(answers[currentQuestionData.id] as Record<string, boolean | string>).filter(k => !k.endsWith('_name')).length === 0
                }
                className="px-6 py-3 bg-[#FFD700] border border-black text-black font-mono text-sm uppercase tracking-wider disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#E6C200] transition-colors"
              >
                {currentQuestion === quizData.questions.length - 1 ? 'Отримати результат →' : 'Далі →'}
              </button>
            </div>
          </div>
        )}

        {/* Contact Form Screen */}
        {currentScreen === 'contact' && (
          <div className="border border-black p-8 md:p-12 relative animate-in fade-in slide-in-from-right duration-300">
            <div className="absolute -top-3 left-8 bg-white px-2">
              <span className="text-xs font-mono text-black/60 tracking-wider uppercase">ОСТАННІЙ КРОК</span>
            </div>

            <div className="h-0.5 bg-[#FFD700] mb-10" />

            <h2 className="text-3xl md:text-4xl font-bold mb-8">
              Куди надіслати результат та коли зручно зателефонувати?
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold uppercase tracking-wider mb-2">
                  Ваше ім'я <span className="text-[#FFD700]">*</span>
                </label>
                <input
                  type="text"
                  value={answers.contact?.name || ''}
                  onChange={(e) => setAnswers(prev => ({
                    ...prev,
                    contact: { ...prev.contact!, name: e.target.value }
                  }))}
                  className="w-full px-4 py-3 border border-black/20 focus:border-black outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold uppercase tracking-wider mb-2">
                  Телефон <span className="text-[#FFD700]">*</span>
                </label>
                <input
                  type="tel"
                  value={answers.contact?.phone || ''}
                  onChange={(e) => setAnswers(prev => ({
                    ...prev,
                    contact: { ...prev.contact!, phone: e.target.value }
                  }))}
                  placeholder="+380"
                  className="w-full px-4 py-3 border border-black/20 focus:border-black outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold uppercase tracking-wider mb-2">
                  Email (необов'язково)
                </label>
                <input
                  type="email"
                  value={answers.contact?.email || ''}
                  onChange={(e) => setAnswers(prev => ({
                    ...prev,
                    contact: { ...prev.contact!, email: e.target.value }
                  }))}
                  placeholder="Залиште email, щоб отримати результат на пошту"
                  className="w-full px-4 py-3 border border-black/20 focus:border-black outline-none"
                />
                <p className="text-xs text-black/60 mt-1">
                  Якщо залишите email, ми надішлемо вам детальний аналіз та рекомендації на пошту
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold uppercase tracking-wider mb-2">
                  Коли зручно зателефонувати?
                </label>
                <div className="space-y-3">
                  {[
                    { value: 'today_18', label: 'Сьогодні до 18:00' },
                    { value: 'tomorrow_12', label: 'Завтра з 10:00 до 12:00' },
                    { value: 'tomorrow_18', label: 'Завтра з 14:00 до 18:00' },
                    { value: 'other', label: 'Інший час (напишу в коментарі)' }
                  ].map((option) => (
                    <label key={option.value} className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="call-time"
                        value={option.value}
                        checked={answers.contact?.callTime === option.value}
                        onChange={(e) => setAnswers(prev => ({
                          ...prev,
                          contact: { ...prev.contact!, callTime: e.target.value }
                        }))}
                        className="w-4 h-4"
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
                {answers.contact?.callTime === 'other' && (
                  <input
                    type="text"
                    value={answers.contact?.otherTime || ''}
                    onChange={(e) => setAnswers(prev => ({
                      ...prev,
                      contact: { ...prev.contact!, otherTime: e.target.value }
                    }))}
                    placeholder="Напишіть коли вам зручно"
                    className="mt-3 w-full px-4 py-3 border border-black/20 focus:border-black outline-none"
                  />
                )}
              </div>

              <div className="flex items-start gap-3 pt-4">
                <input
                  type="checkbox"
                  id="privacy"
                  required
                  className="mt-1 w-5 h-5"
                />
                <label htmlFor="privacy" className="text-sm">
                  Погоджуюсь з політикою конфіденційності
                </label>
              </div>
            </div>

            <div className="flex justify-between gap-4 mt-10">
              <button
                onClick={backToQuiz}
                className="px-6 py-3 border border-black font-mono text-sm uppercase tracking-wider hover:bg-black hover:text-white transition-colors"
              >
                ← Назад
              </button>
              <button
                onClick={submitQuiz}
                disabled={isSubmitting || !answers.contact?.name || !answers.contact?.phone}
                className="px-6 py-3 bg-[#FFD700] border border-black text-black font-mono text-sm uppercase tracking-wider disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#E6C200] transition-colors"
              >
                {isSubmitting ? 'Відправка...' : 'Отримати персональну рекомендацію'}
              </button>
            </div>
          </div>
        )}

        {/* Result Screen */}
        {currentScreen === 'result' && clientType && (
          <div id="quiz-result" className="border border-black p-8 md:p-12 relative animate-in fade-in zoom-in duration-500">
            <div className="absolute -top-3 left-8 bg-white px-2">
              <span className="text-xs font-mono text-black/60 tracking-wider uppercase">
                {clientType === 'startup' ? '[NOT_SUITABLE]' :
                 clientType === 'small' ? '[RECOMMENDED]' :
                 clientType === 'ideal' ? '[IDEAL]' :
                 clientType === 'large' ? '[PREMIUM]' :
                 '[OK]'}
              </span>
            </div>

            <div className="text-center mb-8">
          <div className="inline-block px-6 py-3 border-2 border-black bg-[#FFD700] mb-6 transform hover:scale-105 transition-transform duration-200">
              <span className="text-xs font-mono font-bold tracking-widest">
                {clientType === 'startup' ? 'NOT_SUITABLE' :
                 clientType === 'small' ? 'RECOMMENDED' :
                 clientType === 'ideal' ? 'IDEAL' :
                 clientType === 'large' ? 'PREMIUM' :
                 'OK'}
              </span>
            </div>
              <h2 className="text-4xl font-bold">РЕЗУЛЬТАТ ДІАГНОСТИКИ</h2>
            </div>

            {/* Profile */}
            <div className="bg-[#F8F9FA] p-6 border border-black/10 mb-8 relative">
              {/* Decorative corners */}
              <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-[#FFD700]" />
              <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-[#FFD700]" />
              <h3 className="text-xs font-mono uppercase tracking-wider mb-4">Ваш профіль</h3>
              <ul className="space-y-2">
                {generateProfile().businessType && (
                  <li className="pl-4 relative before:content-['•'] before:absolute before:left-0">
                    {generateProfile().businessType}
                  </li>
                )}
                {generateProfile().teamSize && (
                  <li className="pl-4 relative before:content-['•'] before:absolute before:left-0">
                    {generateProfile().teamSize} у команді
                  </li>
                )}
                {generateProfile().systems.map((s, i) => (
                  <li key={i} className="pl-4 relative before:content-['•'] before:absolute before:left-0">
                    {s}
                  </li>
                ))}
                {generateProfile().painsList.length > 0 && (
                  <li className="pl-4 relative before:content-['•'] before:absolute before:left-0">
                    Болить: {generateProfile().painsList.join(', ')}
                  </li>
                )}
                {generateProfile().decisionMaker && (
                  <li className="pl-4 relative before:content-['•'] before:absolute before:left-0">
                    ЛПР: {generateProfile().decisionMaker}
                  </li>
                )}
              </ul>
            </div>

            {/* Result Content */}
            <div className="result-content">
              {getResultContent(clientType)}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 mt-10">
              {clientType === 'startup' && (
                <>
                  <button
                    onClick={() => window.location.href = '#contact'}
                    className="px-6 py-3 bg-[#FFD700] border border-black text-black font-mono text-sm uppercase tracking-wider hover:bg-[#E6C200] transition-colors"
                  >
                    Все одно хочу обговорити
                  </button>
                  <button
                    onClick={() => window.location.href = '#contact'}
                    className="px-6 py-3 border border-black font-mono text-sm uppercase tracking-wider hover:bg-black hover:text-white transition-colors"
                  >
                    Зв'яжіться зі мною через місяць
                  </button>
                </>
              )}
              {clientType === 'small' && (
                <>
                  <button
                    onClick={() => window.location.href = '#contact'}
                    className="px-6 py-3 bg-[#FFD700] border border-black text-black font-mono text-sm uppercase tracking-wider hover:bg-[#E6C200] transition-colors"
                  >
                    Замовити безкоштовний аудит
                  </button>
                </>
              )}
              {clientType === 'medium-risk' && (
                <>
                  <button
                    onClick={() => window.location.href = '#contact'}
                    className="px-6 py-3 bg-[#FFD700] border border-black text-black font-mono text-sm uppercase tracking-wider hover:bg-[#E6C200] transition-colors"
                  >
                    Обговорити проєкт
                  </button>
                  <button
                    onClick={() => window.location.href = '#contact'}
                    className="px-6 py-3 border border-black font-mono text-sm uppercase tracking-wider hover:bg-black hover:text-white transition-colors"
                  >
                    Хочу тільки CRM (розумію ризики)
                  </button>
                </>
              )}
              {clientType === 'ideal' && (
                <>
                  <button
                    onClick={() => window.location.href = '#contact'}
                    className="px-6 py-3 bg-[#FFD700] border border-black text-black font-mono text-sm uppercase tracking-wider hover:bg-[#E6C200] transition-colors"
                  >
                    Замовити безкоштовний аудит
                  </button>
                </>
              )}
              {clientType === 'large' && (
                <>
                  <button
                    onClick={() => window.location.href = '#contact'}
                    className="px-6 py-3 bg-[#FFD700] border border-black text-black font-mono text-sm uppercase tracking-wider hover:bg-[#E6C200] transition-colors"
                  >
                    Обговорити проєкт
                  </button>
                </>
              )}
              {clientType === 'has-crm' && (
                <>
                  <button
                    onClick={() => window.location.href = '#contact'}
                    className="px-6 py-3 bg-[#FFD700] border border-black text-black font-mono text-sm uppercase tracking-wider hover:bg-[#E6C200] transition-colors"
                  >
                    Замовити аудит системи
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
