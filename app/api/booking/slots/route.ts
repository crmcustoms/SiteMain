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
    if (secret && secret !== process.env.WEBHOOK_SECRET) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/de426b11-629a-4d11-809b-e48b79b36174',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'probe-pre',hypothesisId:'H4',location:'app/api/booking/slots/route.ts:16',message:'booking_slots_unauthorized',data:{hasSecret:true},timestamp:Date.now()})}).catch(()=>{});
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
    const webhookSecret = process.env.WEBHOOK_SECRET

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
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/de426b11-629a-4d11-809b-e48b79b36174',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'services-pre',hypothesisId:'H2',location:'app/api/booking/slots/route.ts:72',message:'booking_slots_webhook_request',data:{url:url.origin + url.pathname,hasWebhookSecret:!!webhookSecret},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        ...(webhookSecret ? { "x-webhook-secret": webhookSecret, "WEBHOOK_SECRET": webhookSecret } : {}),
      }
    })

    if (!response.ok) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/de426b11-629a-4d11-809b-e48b79b36174',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'services-pre',hypothesisId:'H2',location:'app/api/booking/slots/route.ts:80',message:'booking_slots_webhook_not_ok',data:{status:response.status},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      throw new Error(`n8n webhook returned ${response.status}`)
    }

    const contentType = response.headers.get('content-type') || ''
    const responseText = await response.text()
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/de426b11-629a-4d11-809b-e48b79b36174',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'services-pre',hypothesisId:'H2',location:'app/api/booking/slots/route.ts:82',message:'booking_slots_webhook_response_meta',data:{status:response.status,contentType,responseTextLength:responseText.length},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    if (!responseText.trim()) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/de426b11-629a-4d11-809b-e48b79b36174',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'services-pre',hypothesisId:'H2',location:'app/api/booking/slots/route.ts:84',message:'booking_slots_empty_body',data:{status:response.status},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      return NextResponse.json(
        { success: true, slots: [], slotsByDate: {}, totalSlots: 0 },
        { status: 200 }
      )
    }
    let data: unknown
    try {
      data = JSON.parse(responseText)
    } catch (error) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/de426b11-629a-4d11-809b-e48b79b36174',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'services-pre',hypothesisId:'H2',location:'app/api/booking/slots/route.ts:90',message:'booking_slots_json_parse_failed',data:{status:response.status},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      throw error
    }

    const payload = data as Record<string, any>
    const isArray = Array.isArray(payload)
    const slotsArray = isArray ? payload : payload?.slots
    const hasSlotsByDate = !!payload?.slotsByDate
    const hasSlotsArray = Array.isArray(slotsArray)
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/de426b11-629a-4d11-809b-e48b79b36174',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'services-pre',hypothesisId:'H2',location:'app/api/booking/slots/route.ts:101',message:'booking_slots_payload_shape',data:{isArray,hasSlotsByDate,hasSlotsArray,keys:payload && !isArray ? Object.keys(payload).slice(0,8) : []},timestamp:Date.now()})}).catch(()=>{});
    // #endregion

    if (hasSlotsByDate && hasSlotsArray) {
      return NextResponse.json(
        {
          success: true,
          slots: slotsArray,
          slotsByDate: payload.slotsByDate,
          totalSlots: slotsArray.length
        },
        { status: 200 }
      )
    }

    if (hasSlotsArray) {
      const slotsByDate: Record<string, unknown[]> = {}
      for (const slot of slotsArray) {
        const dateValue = slot?.date || (typeof slot?.datetime === 'string' ? slot.datetime.split('T')[0] : null)
        if (!dateValue) continue
        if (!slotsByDate[dateValue]) slotsByDate[dateValue] = []
        slotsByDate[dateValue].push(slot)
      }
      return NextResponse.json(
        {
          success: true,
          slots: slotsArray,
          slotsByDate,
          totalSlots: slotsArray.length
        },
        { status: 200 }
      )
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/de426b11-629a-4d11-809b-e48b79b36174',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'services-pre',hypothesisId:'H2',location:'app/api/booking/slots/route.ts:88',message:'booking_slots_error',data:{errorMessage:error instanceof Error ? error.message : 'Unknown'},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
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
