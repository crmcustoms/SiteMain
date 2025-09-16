import { NextRequest, NextResponse } from 'next/server';

/**
 * API-маршрут для прямого доступа к изображениям Notion
 */
export async function GET(request: NextRequest) {
  try {
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
    
    // Для пресайнутых URL выполняем прямой запрос без изменений
    if (isPresigned) {
      console.log(`Прямой доступ к пресайнутому изображению: ${imageUrl.substring(0, 100)}...`);
      
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
    return NextResponse.redirect(`/api/s3-proxy/${imageUrl}`);
  } catch (error) {
    console.error('Ошибка при доступе к изображению Notion:', error);
    
    // В случае ошибки перенаправляем на заглушку
    return NextResponse.redirect('/api/placeholder?text=Ошибка+загрузки+изображения');
  }
} 