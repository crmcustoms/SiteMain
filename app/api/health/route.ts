import { NextRequest, NextResponse } from 'next/server';

// Кеш для healthcheck ответа (обновляется раз в 30 секунд)
let cachedHealthData: { data: any; timestamp: number } | null = null;
const CACHE_TTL = 30000; // 30 секунд

export async function GET(request: NextRequest) {
  try {
    const now = Date.now();
    
    // Используем кеш, если он свежий
    if (cachedHealthData && (now - cachedHealthData.timestamp) < CACHE_TTL) {
      return NextResponse.json(cachedHealthData.data, {
        status: 200,
        headers: {
          'Cache-Control': 'public, max-age=30' // Кешируем на 30 секунд
        }
      });
    }

    // Оптимизация: вызываем memoryUsage() один раз
    const memUsage = process.memoryUsage();

    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      memory: {
        used: Math.round(memUsage.heapUsed / 1024 / 1024),
        total: Math.round(memUsage.heapTotal / 1024 / 1024)
      },
      hostname: process.env.HOSTNAME || 'localhost',
      port: process.env.PORT || '3000'
    };

    // Обновляем кеш
    cachedHealthData = {
      data: healthData,
      timestamp: now
    };

    return NextResponse.json(healthData, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=30' // Кешируем на 30 секунд
      }
    });
  } catch (error) {
    // Ошибки логируем только в случае реальной проблемы
    console.error('[HEALTH] Error in health check:', error);

    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Health check failed'
    }, { status: 500 });
  }
} 