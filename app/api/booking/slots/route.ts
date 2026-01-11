import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

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

    // Формуємо URL з query параметрами
    const url = new URL(n8nUrl)
    url.searchParams.set('calendarId', calendarId || '')
    url.searchParams.set('startDate', startDate)
    url.searchParams.set('endDate', endDate)

    // Запрос к n8n webhook через GET
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
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
