import { NextRequest, NextResponse } from 'next/server';
import https from 'https';
import http from 'http';
import { URL } from 'url';

// Константы
const PLACEHOLDER_PATH = '/api/placeholder';
const NOTION_DOMAINS = ['prod-files-secure.s3.us-west-2.amazonaws.com', 's3.us-west-2.amazonaws.com', 'notion-static.com'];
const ALLOWED_IMAGE_HOSTS = NOTION_DOMAINS;
let s3ProxyRequestCount = 0;
const s3ProxyRequestTimestamps: number[] = [];

function isPrivateIPv4(hostname: string) {
  if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) return false;
  const parts = hostname.split('.').map((p) => Number(p));
  if (parts.some((p) => Number.isNaN(p) || p < 0 || p > 255)) return false;
  const [a, b] = parts;
  return a === 10 || a === 127 || a === 0 || (a === 192 && b === 168) || (a === 172 && b >= 16 && b <= 31);
}

function isAllowedHost(hostname: string) {
  return ALLOWED_IMAGE_HOSTS.some((allowed) => hostname === allowed || hostname.endsWith(`.${allowed}`));
}

/**
 * Прозрачный прокси для S3 изображений
 */
export async function GET(request: NextRequest) {
  try {
    const now = Date.now();
    s3ProxyRequestCount += 1;
    s3ProxyRequestTimestamps.push(now);
    const oneMinuteAgo = now - 60_000;
    while (s3ProxyRequestTimestamps.length > 0 && s3ProxyRequestTimestamps[0] < oneMinuteAgo) {
      s3ProxyRequestTimestamps.shift();
    }
    const requestsLastMinute = s3ProxyRequestTimestamps.length;

    // Получаем URL из пути запроса
    const pathname = request.nextUrl.pathname;
    const encodedUrl = pathname.replace('/api/s3-proxy/', '');
    
    if (!encodedUrl) {
      console.error('S3 Proxy: URL не предоставлен');
      return NextResponse.redirect(new URL(PLACEHOLDER_PATH, request.nextUrl.origin));
    }
    
    // Декодируем URL
    let imageUrl = '';
    try {
      imageUrl = decodeURIComponent(encodedUrl);
    } catch (error) {
      console.error('S3 Proxy: Ошибка декодирования URL', error);
      return NextResponse.redirect(new URL(PLACEHOLDER_PATH, request.nextUrl.origin));
    }
    
    // Проверяем, является ли URL пресайнутым
    const isPresigned = 
      imageUrl.includes('X-Amz-Algorithm') || 
      imageUrl.includes('X-Amz-Credential') || 
      imageUrl.includes('X-Amz-Date');
    
    // Проверяем, является ли URL из Notion
    const isNotion = NOTION_DOMAINS.some(domain => imageUrl.includes(domain));
    
    // Если URL начинается с http:// или https://, используем его напрямую
    if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
      console.error('S3 Proxy: Неверный формат URL', imageUrl.substring(0, 100));
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/de426b11-629a-4d11-809b-e48b79b36174',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'probe-pre',hypothesisId:'H1',location:'app/api/s3-proxy/route.ts:53',message:'s3_proxy_invalid_url',data:{requestsLastMinute,requestCount:s3ProxyRequestCount},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      return NextResponse.redirect(new URL(PLACEHOLDER_PATH, request.nextUrl.origin));
    }

    // Получаем все параметры запроса и добавляем их к URL
    const searchParams = request.nextUrl.searchParams;
    const url = new URL(imageUrl);
    const hostname = url.hostname;
    const isIp = /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname);
    const isPrivateIp = isIp ? isPrivateIPv4(hostname) : false;
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/de426b11-629a-4d11-809b-e48b79b36174',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'probe-pre',hypothesisId:'H1',location:'app/api/s3-proxy/route.ts:61',message:'s3_proxy_request',data:{hostname,isIp,isPrivateIp,isPresigned,isNotion,requestsLastMinute,requestCount:s3ProxyRequestCount},timestamp:Date.now()})}).catch(()=>{});
    // #endregion

    if (isPrivateIp || !isAllowedHost(hostname)) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/de426b11-629a-4d11-809b-e48b79b36174',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'probe-pre',hypothesisId:'H3',location:'app/api/s3-proxy/route.ts:66',message:'s3_proxy_blocked_host',data:{hostname,isIp,isPrivateIp,allowed:false,requestsLastMinute,requestCount:s3ProxyRequestCount},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // Для пресайнутых URL не добавляем дополнительные параметры, чтобы не нарушить подпись
    if (!isPresigned) {
      searchParams.forEach((value, key) => {
        url.searchParams.append(key, value);
      });
    }
    
    // Логируем только в development режиме для отладки
    if (process.env.NODE_ENV === 'development') {
      console.log(`S3 Proxy: Запрос к ${isPresigned ? 'пресайнутому' : 'обычному'} URL: ${url.toString().substring(0, 100)}...`);
    }
    
    // Выполняем запрос к оригинальному URL
    const response = await fetchWithTimeout(url.toString(), {
      headers: {
        // Добавляем специальные заголовки для Notion
        ...(isNotion ? {
          'Referer': 'https://www.notion.so/',
          'Origin': 'https://www.notion.so'
        } : {}),
        // Копируем заголовки из оригинального запроса
        'User-Agent': request.headers.get('User-Agent') || 'NextJS S3 Proxy',
        'Accept': request.headers.get('Accept') || '*/*',
        'Accept-Language': request.headers.get('Accept-Language') || 'en-US,en;q=0.9'
      },
      // Таймаут 10 секунд
      timeout: 10000
    });
    
    if (!response.ok) {
      console.error(`S3 Proxy: Ошибка получения изображения: ${response.status} ${response.statusText}`);
      return NextResponse.redirect(new URL(PLACEHOLDER_PATH, request.nextUrl.origin));
    }
    
    const buffer = await response.arrayBuffer();
    const headers = new Headers();
    
    // Копируем заголовки из ответа
    response.headers.forEach((value, key) => {
      headers.set(key, value);
    });
    
    // Устанавливаем заголовки кеширования
    headers.set('Cache-Control', isPresigned ? 'public, max-age=3600' : 'public, max-age=86400'); // 1 час для пресайнутых, 1 день для обычных
    
    // Устанавливаем CORS заголовки
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type');
    
    return new NextResponse(buffer, {
      status: 200,
      headers
    });
  } catch (error) {
    console.error('S3 Proxy: Необработанная ошибка', error);
    return NextResponse.redirect(new URL(PLACEHOLDER_PATH, request.nextUrl.origin));
  }
}

/**
 * Функция для выполнения запроса с таймаутом
 */
async function fetchWithTimeout(url: string, options: any = {}) {
  const { timeout = 8000, ...fetchOptions } = options;
  
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

// Обработчик OPTIONS запросов для CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
} 