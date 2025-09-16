import { NextRequest, NextResponse } from 'next/server';

/**
 * Генерирует SVG-изображение заглушку
 */
function generatePlaceholderSVG(width = 800, height = 600, text = 'Изображение недоступно'): string {
  // Вычисляем размер шрифта в зависимости от размера изображения
  const fontSize = Math.max(16, Math.min(24, Math.floor(Math.min(width, height) / 20)));
  
  // Создаем SVG с градиентом для фона
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#f0f0f0;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#e0e0e0;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)"/>
      <rect x="10" y="10" width="${width - 20}" height="${height - 20}" fill="none" stroke="#ccc" stroke-width="2" stroke-dasharray="5,5" />
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${fontSize}" text-anchor="middle" dominant-baseline="middle" fill="#666666">
        ${text}
      </text>
      <text x="50%" y="${height - 30}" font-family="Arial, sans-serif" font-size="${fontSize * 0.6}" text-anchor="middle" fill="#999999">
        ${width} × ${height}
      </text>
    </svg>
  `;
}

/**
 * API-маршрут для генерации заглушек
 */
export async function GET(request: NextRequest) {
  try {
    // Получаем параметры из URL
    const { searchParams } = new URL(request.url);
    const width = parseInt(searchParams.get('width') || '800', 10);
    const height = parseInt(searchParams.get('height') || '600', 10);
    const text = searchParams.get('text') || 'Изображение недоступно';
    
    // Ограничиваем размеры для предотвращения злоупотреблений
    const safeWidth = Math.min(2000, Math.max(50, width));
    const safeHeight = Math.min(2000, Math.max(50, height));
    
    // Генерируем SVG
    const svg = generatePlaceholderSVG(safeWidth, safeHeight, text);
    
    // Возвращаем SVG с правильными заголовками
    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  } catch (error) {
    console.error('Ошибка при генерации заглушки:', error);
    
    // В случае ошибки возвращаем простую заглушку
    const fallbackSvg = generatePlaceholderSVG(400, 300, 'Ошибка');
    
    return new NextResponse(fallbackSvg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'no-cache',
      },
    });
  }
} 