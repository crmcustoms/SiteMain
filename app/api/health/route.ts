import { NextRequest, NextResponse } from 'next/server';

// Кеш для healthcheck ответа (обновляется раз в 30 секунд)
let cachedHealthData: { data: any; timestamp: number } | null = null;
const CACHE_TTL = 30000; // 30 секунд
let healthRequestCount = 0;
const healthRequestTimestamps: number[] = [];

export async function GET(request: NextRequest) {
  try {
    const now = Date.now();
    const startTime = now;
    healthRequestCount += 1;
    healthRequestTimestamps.push(now);
    const oneMinuteAgo = now - 60_000;
    while (healthRequestTimestamps.length > 0 && healthRequestTimestamps[0] < oneMinuteAgo) {
      healthRequestTimestamps.shift();
    }
    const requestsLastMinute = healthRequestTimestamps.length;
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/de426b11-629a-4d11-809b-e48b79b36174',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'health-pre',hypothesisId:'H1',location:'app/api/health/route.ts:10',message:'health_request_start',data:{cachePresent:!!cachedHealthData,cacheAgeMs:cachedHealthData?now-cachedHealthData.timestamp:null,requestCount:healthRequestCount,requestsLastMinute},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    
    // Используем кеш, если он свежий
    if (cachedHealthData && (now - cachedHealthData.timestamp) < CACHE_TTL) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/de426b11-629a-4d11-809b-e48b79b36174',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'health-pre',hypothesisId:'H2',location:'app/api/health/route.ts:17',message:'health_cache_hit',data:{cacheAgeMs:now-cachedHealthData.timestamp,ttlMs:CACHE_TTL,elapsedMs:Date.now()-startTime},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
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
      requests: {
        total: healthRequestCount,
        lastMinute: requestsLastMinute
      },
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

    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/de426b11-629a-4d11-809b-e48b79b36174',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'health-pre',hypothesisId:'H3',location:'app/api/health/route.ts:45',message:'health_cache_miss_computed',data:{memUsedMb:healthData.memory.used,memTotalMb:healthData.memory.total,elapsedMs:Date.now()-startTime},timestamp:Date.now()})}).catch(()=>{});
    // #endregion

    return NextResponse.json(healthData, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=30' // Кешируем на 30 секунд
      }
    });
  } catch (error) {
    // Ошибки логируем только в случае реальной проблемы
    console.error('[HEALTH] Error in health check:', error);
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/de426b11-629a-4d11-809b-e48b79b36174',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'health-pre',hypothesisId:'H4',location:'app/api/health/route.ts:59',message:'health_error',data:{errorType:error instanceof Error ? error.name : 'unknown',errorMessage:error instanceof Error ? error.message : 'unknown'},timestamp:Date.now()})}).catch(()=>{});
    // #endregion

    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Health check failed'
    }, { status: 500 });
  }
} 