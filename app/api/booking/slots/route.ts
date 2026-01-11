import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { startDate, endDate } = body

    // Валідація вхідних даних
    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Відсутні обов\'язкові параметри: startDate, endDate' },
        { status: 400 }
      )
    }

    // URL n8n webhook з переменной окружения
    const n8nUrl = process.env.NEXT_PUBLIC_N8N_BOOKING_SLOTS_URL
    const calendarId = process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_ID

    if (!n8nUrl) {
      console.error('NEXT_PUBLIC_N8N_BOOKING_SLOTS_URL not configured')
      return NextResponse.json(
        { error: 'Сервіс бронювання тимчасово недоступний' },
        { status: 503 }
      )
    }

    // Запрос к n8n webhook
    const response = await fetch(n8nUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        calendarId: calendarId,
        startDate,
        endDate
      })
    })

    if (!response.ok) {
      throw new Error(`n8n webhook returned ${response.status}`)
    }

    const data = await response.json()

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('Error fetching available slots:', error)
    return NextResponse.json(
      {
        error: 'Помилка отримання доступних слотів',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Метод GET для тестування
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')

  if (!startDate || !endDate) {
    return NextResponse.json(
      { error: 'Missing required parameters: startDate, endDate' },
      { status: 400 }
    )
  }

  // Перенаправляємо на POST
  return POST(request)
}
