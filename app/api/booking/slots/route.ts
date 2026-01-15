import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit } from "@/lib/rate-limit"

export async function GET(request: NextRequest) {
  try {
    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown"
    const rate = await checkRateLimit(`booking:slots:${clientIp}`)
    if (!rate.ok) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/de426b11-629a-4d11-809b-e48b79b36174',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'probe-pre',hypothesisId:'H4',location:'app/api/booking/slots/route.ts:8',message:'booking_slots_rate_limited',data:{clientIp,remaining:rate.remaining},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      return NextResponse.json({ error: "Too many requests" }, { status: 429 })
    }

    const secret = request.headers.get("x-webhook-secret")
    if (!secret || secret !== process.env.WEBHOOK_SECRET) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/de426b11-629a-4d11-809b-e48b79b36174',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'probe-pre',hypothesisId:'H4',location:'app/api/booking/slots/route.ts:16',message:'booking_slots_unauthorized',data:{hasSecret:!!secret},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

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
    const n8nUrl = process.env.N8N_BOOKING_SLOTS_URL
    const calendarId = process.env.GOOGLE_CALENDAR_ID

    // Логируем только в development режиме или при ошибке конфигурации
    if (process.env.NODE_ENV === 'development') {
      console.log('[API] Environment check:', {
        n8nUrl: n8nUrl ? 'SET' : 'NOT SET',
        calendarId: calendarId ? 'SET' : 'NOT SET'
      });
    }

    if (!n8nUrl) {
      console.error('N8N_BOOKING_SLOTS_URL not configured')
      return NextResponse.json(
        { 
          error: 'Сервіс бронювання тимчасово недоступний',
          debug: {
            n8nUrlExists: !!n8nUrl,
            availableEnvVars: Object.keys(process.env).filter(k => k.includes('NEXT_PUBLIC'))
          }
        },
        { status: 503 }
      )
    }

    // Формуємо URL з query параметрами
    const url = new URL(n8nUrl)
    if (calendarId) {
      url.searchParams.set('calendarId', calendarId)
    }
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
