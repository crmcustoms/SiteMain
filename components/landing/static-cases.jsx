"use client"

import Link from "next/link"

export default function StaticCases({ casesData = [], lang = 'ua' }) {
  // Проверяем, что casesData является массивом
  const validCasesData = Array.isArray(casesData) ? casesData : [];
  
  // Безопасное извлечение первых 3-х элементов
  const popularPosts = validCasesData.slice(0, 3);
  
  // Безопасное извлечение категорий
  const categories = Array.from(
    new Set(
      validCasesData.flatMap((post) => {
        if (!post || !post.tags) return [];
        return Array.isArray(post.tags) ? post.tags : [];
      })
    )
  );

  // Функция для безопасного преобразования URL изображений
  const getImageUrl = (url) => {
    // Проверяем, что URL существует
    if (!url) return '/placeholder.svg';
    
    // Если URL начинается с https://crmcustoms.site.s3, заменяем на стандартный S3 URL
    if (url.includes('crmcustoms.site.s3')) {
      // Извлекаем только ключ файла из URL
      const parts = url.split('/');
      const key = parts[parts.length - 1];
      // Используем правильный формат URL для S3
      return `https://s3.us-east-1.amazonaws.com/crmcustoms.site/${key}`;
    }
    
    return url;
  };

  return (
    <section id="cases" className="bg-gray-50 w-full py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-2">Кейси про автоматизацію бізнесу</h1>
        <p className="text-lg mb-8 text-gray-600">Корисні кейси, поради та приклади автоматизації бізнес-процесів.</p>

        <div className="mb-8 max-w-xl">
          <form className="flex items-center gap-2">
            <input type="text" placeholder="Пошук статей..." className="flex-1 border rounded px-4 py-2 focus:outline-none focus:ring" />
            <button type="submit" className="bg-amber text-white px-4 py-2 rounded hover:bg-amber-dark">
              🔍
            </button>
          </form>
        </div>

        <div className="flex flex-col lg:flex-row gap-8" style={{ display: 'flex', flexDirection: 'row' }}>
          {/* Основные кейсы (2/3 ширины) */}
          <div className="w-full lg:w-2/3" style={{ width: '66.66%', float: 'left' }}>
            {validCasesData.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500">Статті завантажуються або тимчасово недоступні</p>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {validCasesData.map((post) => (
                  <div key={post?.id || Math.random()} className="bg-white border rounded-md flex flex-col md:flex-row overflow-hidden shadow-sm">
                    <div className="md:w-1/3 flex items-center justify-center bg-gray-100 min-h-[180px]">
                      <img src={getImageUrl(post?.image) || '/placeholder.svg'} alt={post?.title || 'Зображення'} className="object-cover w-full h-full max-h-48" />
                    </div>
                    <div className="md:w-2/3 p-6 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                          <span>{post?.author || 'Автор'}</span>
                          <span>•</span>
                          <span>{post?.date || 'Без дати'}</span>
                        </div>
                        <h2 className="text-xl font-semibold mb-2">
                          <Link href={`/${lang || 'ua'}/cases/${post?.slug || ''}`} className="hover:text-amber transition-colors">{post?.title || 'Без назви'}</Link>
                        </h2>
                        <p className="text-gray-600 mb-4 line-clamp-2">{post?.excerpt || 'Опис відсутній'}</p>
                      </div>
                      <div className="flex items-center gap-4 text-gray-400 text-sm mb-2">
                        <span className="flex items-center gap-1">❤️ {post?.likes || 0}</span>
                        <span className="flex items-center gap-1">💬 {post?.comments || 0}</span>
                      </div>
                      <Link href={`/${lang || 'ua'}/cases/${post?.slug || ''}`} className="text-amber hover:underline font-medium">Читати далі</Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Служебные блоки (1/3 ширины) */}
          <div className="w-full lg:w-1/3" style={{ width: '33.33%', float: 'right' }}>
            <div className="flex flex-col gap-6">
              <div className="bg-white border rounded-md p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2"><span className="text-amber">⚡</span>Популярні кейси</h3>
                <ul className="space-y-2">
                  {popularPosts.map((post) => (
                    <li key={post?.id || Math.random()}>
                      <Link href={`/${lang || 'ua'}/cases/${post?.slug || ''}`} className="hover:underline font-medium block">{post?.title || 'Без назви'}</Link>
                      <div className="text-xs text-gray-400">{post?.date || 'Без дати'}</div>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-white border rounded-md p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2"><span className="text-amber">🏷️</span>Категорії</h3>
                <div className="flex flex-wrap gap-2">
                  {categories.length > 0 ? (
                    categories.map((cat, idx) => (
                      <span key={idx} className="bg-gray-100 px-3 py-1 rounded text-xs">{cat}</span>
                    ))
                  ) : (
                    <span className="text-gray-400 text-sm">Немає категорій</span>
                  )}
                </div>
              </div>
              
              <div className="bg-white border rounded-md p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2"><span className="text-amber">📩</span>Підписатися на новини</h3>
                <p className="text-sm text-gray-500 mb-3">Отримуйте найкращі статті та поради з автоматизації бізнесу.</p>
                <form className="flex flex-col gap-2">
                  <input type="email" placeholder="Ваш email" className="border rounded px-3 py-2 focus:outline-none focus:ring" />
                  <button type="submit" className="bg-amber text-white py-2 rounded hover:bg-amber-dark">Підписатися</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 