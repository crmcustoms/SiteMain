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
    const metric: WebVitalMetric = await request.json()
    
    // Валидация данных
    if (!metric.name || typeof metric.value !== 'number' || !metric.id) {
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