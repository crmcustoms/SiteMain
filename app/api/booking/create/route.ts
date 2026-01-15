import { NextRequest, NextResponse } from 'next/server'
import { z } from "zod"
import { parsePhoneNumberFromString } from "libphonenumber-js"
import { checkRateLimit } from "@/lib/rate-limit"

export async function POST(request: NextRequest) {
  try {
    const contentLength = Number(request.headers.get('content-length') || '0')
    if (contentLength && contentLength > 20_000) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/de426b11-629a-4d11-809b-e48b79b36174',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'probe-pre',hypothesisId:'H4',location:'app/api/booking/create/route.ts:5',message:'booking_create_payload_too_large',data:{contentLength},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      return NextResponse.json({ success: false, error: 'Payload too large' }, { status: 413 })
    }

    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown"
    const rate = await checkRateLimit(`booking:create:${clientIp}`)
    if (!rate.ok) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/de426b11-629a-4d11-809b-e48b79b36174',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'probe-pre',hypothesisId:'H4',location:'app/api/booking/create/route.ts:18',message:'booking_create_rate_limited',data:{clientIp,remaining:rate.remaining},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      return NextResponse.json({ success: false, error: "Too many requests" }, { status: 429 })
    }

    const secret = request.headers.get("x-webhook-secret")
    if (!secret || secret !== process.env.WEBHOOK_SECRET) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/de426b11-629a-4d11-809b-e48b79b36174',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'probe-pre',hypothesisId:'H4',location:'app/api/booking/create/route.ts:26',message:'booking_create_unauthorized',data:{hasSecret:!!secret},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const bookingSchema = z.object({
      date: z.string().optional(),
      time: z.string().optional(),
      startDateTime: z.string().min(1),
      endDateTime: z.string().min(1),
      clientName: z.string().min(1),
      clientEmail: z.string().email(),
      clientPhone: z.string().min(1),
      notes: z.string().optional(),
    })
    const parsedBody = bookingSchema.safeParse(body)
    if (!parsedBody.success) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/de426b11-629a-4d11-809b-e48b79b36174',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'probe-pre',hypothesisId:'H4',location:'app/api/booking/create/route.ts:43',message:'booking_create_validation_failed',data:{issues:parsedBody.error.issues.map(i=>i.path.join("."))},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      return NextResponse.json(
        { success: false, error: "Некоректні дані" },
        { status: 400 }
      )
    }
    const parsedData = parsedBody.data
    const {
      date,
      time,
      startDateTime,
      endDateTime,
      clientName,
      clientEmail,
      clientPhone,
      notes
    } = parsedData

    // Валідація вхідних даних
    if (!startDateTime || !endDateTime || !clientName || !clientEmail || !clientPhone) {
      return NextResponse.json(
        { error: 'Відсутні обов\'язкові поля' },
        { status: 400 }
      )
    }

    // Валідація телефону через бібліотеку
    const phoneParsed = parsePhoneNumberFromString(clientPhone, "UA")
    if (!phoneParsed || !phoneParsed.isValid()) {
      return NextResponse.json(
        { error: 'Некоректний номер телефону' },
        { status: 400 }
      )
    }

    // URL n8n webhook та інші параметри з переменних окружения
    const n8nUrl = process.env.N8N_BOOKING_CREATE_URL
    const calendarId = process.env.GOOGLE_CALENDAR_ID
    const planfixAccount = process.env.PLANFIX_ACCOUNT
    const planfixToken = process.env.PLANFIX_TOKEN
    const planfixProjectId = process.env.PLANFIX_PROJECT_ID

    if (!n8nUrl) {
      console.error('N8N_BOOKING_CREATE_URL not configured')
      return NextResponse.json(
        { error: 'Сервіс бронювання тимчасово недоступний' },
        { status: 503 }
      )
    }

    // Форматування телефону
    const formattedPhone = phoneParsed.number

    // Запрос к n8n webhook
    const response = await fetch(n8nUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...(calendarId ? { calendarId } : {}),
        startDateTime,
        endDateTime,
        clientName,
        clientEmail,
        clientPhone: formattedPhone,
        notes: notes || '',
        planfixAccount,
        planfixToken,
        planfixProjectId
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('n8n webhook error:', errorText)
      throw new Error(`n8n webhook returned ${response.status}`)
    }

    const responseData = await response.json()

    // Логування успішного бронювання
    console.log('Booking created successfully:', {
      date,
      time,
      clientName,
      clientEmail,
      eventId: responseData.eventId
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Бронювання успішно створено',
        ...responseData
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
