import { NextRequest, NextResponse } from 'next/server';

/**
 * API-маршрут для прямого доступа к изображениям Notion
 */
let notionImageRequestCount = 0;
const notionImageRequestTimestamps: number[] = [];
const ALLOWED_IMAGE_HOSTS = ['prod-files-secure.s3.us-west-2.amazonaws.com', 's3.us-west-2.amazonaws.com', 'notion-static.com'];

function isAllowedHost(hostname: string) {
  return ALLOWED_IMAGE_HOSTS.some((allowed) => hostname === allowed || hostname.endsWith(`.${allowed}`));
}

export async function GET(request: NextRequest) {
  try {
    const now = Date.now();
    notionImageRequestCount += 1;
    notionImageRequestTimestamps.push(now);
    const oneMinuteAgo = now - 60_000;
    while (notionImageRequestTimestamps.length > 0 && notionImageRequestTimestamps[0] < oneMinuteAgo) {
      notionImageRequestTimestamps.shift();
    }
    const requestsLastMinute = notionImageRequestTimestamps.length;

    // Получаем URL изображения из параметров запроса
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');
    
    if (!imageUrl) {
      return new NextResponse('URL изображения не указан', { status: 400 });
    }
    
    // Проверяем, является ли URL пресайнутым
    const isPresigned = imageUrl.includes('X-Amz-Algorithm') || 
                       imageUrl.includes('X-Amz-Credential') || 
                       imageUrl.includes('X-Amz-Date');
    let hostname = '';
    try {
      hostname = new URL(imageUrl).hostname;
    } catch {}
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/de426b11-629a-4d11-809b-e48b79b36174',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'probe-pre',hypothesisId:'H2',location:'app/api/notion-image/route.ts:20',message:'notion_image_request',data:{hasUrl:!!imageUrl,isPresigned,hostname,requestsLastMinute,requestCount:notionImageRequestCount},timestamp:Date.now()})}).catch(()=>{});
    // #endregion

    if (!hostname || !isAllowedHost(hostname)) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/de426b11-629a-4d11-809b-e48b79b36174',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'probe-pre',hypothesisId:'H3',location:'app/api/notion-image/route.ts:30',message:'notion_image_blocked_host',data:{hostname,allowed:false,requestsLastMinute,requestCount:notionImageRequestCount},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      return new NextResponse('Forbidden', { status: 403 });
    }
    
    // Для пресайнутых URL выполняем прямой запрос без изменений
    if (isPresigned) {
      // Логируем только в development режиме для отладки
      if (process.env.NODE_ENV === 'development') {
        console.log(`Прямой доступ к пресайнутому изображению: ${imageUrl.substring(0, 100)}...`);
      }
      
      // Выполняем запрос к оригинальному URL
      const response = await fetch(imageUrl);
      
      if (!response.ok) {
        throw new Error(`Ошибка при загрузке изображения: ${response.status}`);
      }
      
      // Получаем тип контента
      const contentType = response.headers.get('content-type') || 'image/jpeg';
      
      // Получаем данные изображения
      const imageData = await response.arrayBuffer();
      
      // Возвращаем изображение с правильными заголовками
      return new NextResponse(imageData, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=86400',
        },
      });
    }
    
    // Для обычных URL выполняем редирект на S3-прокси
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/de426b11-629a-4d11-809b-e48b79b36174',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'probe-pre',hypothesisId:'H2',location:'app/api/notion-image/route.ts:52',message:'notion_image_redirect_s3',data:{hostname,isPresigned,requestsLastMinute,requestCount:notionImageRequestCount},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    return NextResponse.redirect(`/api/s3-proxy/${imageUrl}`);
  } catch (error) {
    console.error('Ошибка при доступе к изображению Notion:', error);
    
    // В случае ошибки перенаправляем на заглушку
    return NextResponse.redirect('/api/placeholder?text=Ошибка+загрузки+изображения');
  }
} 