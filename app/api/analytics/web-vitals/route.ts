import { NextRequest, NextResponse } from 'next/server'

interface WebVitalMetric {
  name: string
  value: number
  id: string
  url: string
  timestamp: number
}

export async function POST(request: NextRequest) {
  try {
    const contentLength = Number(request.headers.get('content-length') || '0')
    if (contentLength && contentLength > 10_000) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/de426b11-629a-4d11-809b-e48b79b36174',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'probe-pre',hypothesisId:'H4',location:'app/api/analytics/web-vitals/route.ts:12',message:'webvitals_payload_too_large',data:{contentLength},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      return NextResponse.json({ error: 'Payload too large' }, { status: 413 })
    }

    const metric: WebVitalMetric = await request.json()
    const allowedNames = new Set(['CLS', 'FID', 'LCP', 'FCP', 'TTFB', 'INP'])
    
    // Валидация данных
    if (!metric.name || !allowedNames.has(metric.name) || typeof metric.value !== 'number' || !metric.id) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/de426b11-629a-4d11-809b-e48b79b36174',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'probe-pre',hypothesisId:'H4',location:'app/api/analytics/web-vitals/route.ts:23',message:'webvitals_invalid_payload',data:{name:metric?.name,valueType:typeof metric?.value,hasId:!!metric?.id},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      return NextResponse.json(
        { error: 'Некорректные данные метрики' },
        { status: 400 }
      )
    }

    // Логируем метрики (в продакшне можно отправлять в сервис аналитики)
    console.log('Web Vitals метрика:', {
      name: metric.name,
      value: metric.value,
      id: metric.id,
      url: metric.url,
      timestamp: new Date(metric.timestamp).toISOString(),
      rating: getMetricRating(metric.name, metric.value)
    })

    // Здесь можно добавить отправку данных в внешние сервисы:
    // - Google Analytics
    // - DataDog
    // - New Relic
    // - Собственную базу данных
    
    // Пример отправки в базу данных (закомментировано)
    /*
    if (process.env.DATABASE_URL) {
      await saveMetricToDatabase(metric)
    }
    */

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Ошибка при обработке Web Vitals метрики:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

// Определяем рейтинг метрики согласно рекомендациям Google
function getMetricRating(name: string, value: number): string {
  switch (name) {
    case 'CLS':
      if (value <= 0.1) return 'good'
      if (value <= 0.25) return 'needs-improvement'
      return 'poor'
    
    case 'FID':
      if (value <= 100) return 'good'
      if (value <= 300) return 'needs-improvement'
      return 'poor'
    
    case 'LCP':
      if (value <= 2500) return 'good'
      if (value <= 4000) return 'needs-improvement'
      return 'poor'
    
    case 'FCP':
      if (value <= 1800) return 'good'
      if (value <= 3000) return 'needs-improvement'
      return 'poor'
    
    case 'TTFB':
      if (value <= 800) return 'good'
      if (value <= 1800) return 'needs-improvement'
      return 'poor'
    
    default:
      return 'unknown'
  }
}

// Пример функции для сохранения в базу данных
/*
async function saveMetricToDatabase(metric: WebVitalMetric) {
  // Пример с Prisma
  // await prisma.webVitalsMetric.create({
  //   data: {
  //     name: metric.name,
  //     value: metric.value,
  //     metricId: metric.id,
  //     url: metric.url,
  //     timestamp: new Date(metric.timestamp),
  //     rating: getMetricRating(metric.name, metric.value)
  //   }
  // })
}
*/ 