import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      date,
      time,
      startDateTime,
      endDateTime,
      clientName,
      clientEmail,
      clientPhone,
      notes
    } = body

    // Валідація вхідних даних
    if (!startDateTime || !endDateTime || !clientName || !clientEmail || !clientPhone) {
      return NextResponse.json(
        { error: 'Відсутні обов\'язкові поля' },
        { status: 400 }
      )
    }

    // Валідація email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(clientEmail)) {
      return NextResponse.json(
        { error: 'Некоректна email адреса' },
        { status: 400 }
      )
    }

    // Валідація телефону (український формат)
    const phoneRegex = /^(\+?380|0)\d{9}$/
    const cleanPhone = clientPhone.replace(/[\s\-\(\)]/g, '')
    if (!phoneRegex.test(cleanPhone)) {
      return NextResponse.json(
        { error: 'Некоректний номер телефону' },
        { status: 400 }
      )
    }

    // URL n8n webhook та інші параметри з переменних окружения
    const n8nUrl = process.env.NEXT_PUBLIC_N8N_BOOKING_CREATE_URL
    const calendarId = process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_ID
    const planfixAccount = process.env.NEXT_PUBLIC_PLANFIX_ACCOUNT
    const planfixToken = process.env.NEXT_PUBLIC_PLANFIX_TOKEN
    const planfixProjectId = process.env.NEXT_PUBLIC_PLANFIX_PROJECT_ID
    const fromEmail = process.env.NEXT_PUBLIC_FROM_EMAIL

    if (!n8nUrl) {
      console.error('NEXT_PUBLIC_N8N_BOOKING_CREATE_URL not configured')
      return NextResponse.json(
        { error: 'Сервіс бронювання тимчасово недоступний' },
        { status: 503 }
      )
    }

    // Форматування телефону
    let formattedPhone = cleanPhone
    if (cleanPhone.startsWith('0')) {
      formattedPhone = '+38' + cleanPhone
    } else if (cleanPhone.startsWith('380')) {
      formattedPhone = '+' + cleanPhone
    }

    // Запрос к n8n webhook
    const response = await fetch(n8nUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        calendarId,
        startDateTime,
        endDateTime,
        clientName,
        clientEmail,
        clientPhone: formattedPhone,
        notes: notes || '',
        planfixAccount,
        planfixToken,
        planfixProjectId,
        fromEmail
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('n8n webhook error:', errorText)
      throw new Error(`n8n webhook returned ${response.status}`)
    }

    const data = await response.json()

    // Логування успішного бронювання
    console.log('Booking created successfully:', {
      date,
      time,
      clientName,
      clientEmail,
      eventId: data.eventId
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Бронювання успішно створено',
        ...data
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Помилка створення бронювання',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
