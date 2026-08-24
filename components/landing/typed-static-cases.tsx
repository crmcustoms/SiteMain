"use client"

import Link from "next/link"
import Image from "next/image"
import { ReactNode, useState, useEffect } from "react"

// Интерфейс для типизации поста
export interface CasePost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  date: string;
  image: string;
  tags: string[];
  services: string[];
  categories: string[];
  likes: number;
  comments: number;
}

interface StaticCasesProps {
  casesData: CasePost[];
  lang: string;
  pageType?: 'cases' | 'blog'; // Новый параметр для определения типа страницы
}

export default function TypedStaticCases({ casesData = [], lang = 'ua', pageType = 'cases' }: StaticCasesProps): ReactNode {
  // Проверяем, что casesData является массивом
  const validCasesData = Array.isArray(casesData) ? casesData : [];
  
  // Состояния для фильтрации
  const [filteredPosts, setFilteredPosts] = useState<CasePost[]>(validCasesData);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  // Состояние для отслеживания ошибок загрузки изображений
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  
  // Безопасное извлечение первых 3-х элементов
  const popularPosts = validCasesData.slice(0, 3);
  
  // Безопасное извлечение тегов, сервисов и категорий
  const tags = Array.from(
    new Set(
      validCasesData.flatMap((post) => {
        if (!post || !post.tags) return [];
        return Array.isArray(post.tags) ? post.tags : [];
      })
    )
  );
  
  const services = Array.from(
    new Set(
      validCasesData.flatMap((post) => {
        if (!post || !post.services) return [];
        return Array.isArray(post.services) ? post.services : [];
      })
    )
  );

  // Извлекаем уникальные категории
  const categories = Array.from(
    new Set(
      validCasesData.flatMap((post) => {
        if (!post || !post.categories) return [];
        return Array.isArray(post.categories) ? post.categories : [];
      })
    )
  );

  // Обработчик поиска и фильтрации
  useEffect(() => {
    // Применяем фильтры
    let filtered = validCasesData;
    
    // Поиск по заголовку и описанию
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(query) || 
        post.excerpt.toLowerCase().includes(query)
      );
    }
    
    // Фильтр по тегу
    if (selectedTag) {
      filtered = filtered.filter(post => 
        post.tags.includes(selectedTag)
      );
    }
    
    // Фильтр по сервису (только для кейсов)
    if (selectedService && pageType === 'cases') {
      filtered = filtered.filter(post => 
        post.services.includes(selectedService)
      );
    }

    // Фильтр по категории
    if (selectedCategory) {
      filtered = filtered.filter(post => 
        post.categories.includes(selectedCategory)
      );
    }
    
    setFilteredPosts(filtered);
  }, [validCasesData, searchQuery, selectedTag, selectedService, selectedCategory, pageType]);

  // Функция для безопасного преобразования URL изображений
  const getImageUrl = (url: string) => {
    if (!url || url === '' || url === 'null' || url === 'undefined') {
      console.log('Cases: Пустой URL изображения, использую заглушку');
      return '/placeholder.jpg';
    }
    
    try {
      // Проверяем, является ли URL абсолютным
      const isAbsoluteUrl = url.startsWith('http://') || url.startsWith('https://');
      
      // Если URL относительный, добавляем базовый URL
      if (!isAbsoluteUrl && !url.startsWith('/')) {
        return `/${url}`;
    }
    
      // Просто возвращаем исходный URL, не пытаясь его преобразовать
      // Это позволит Next.js Image компоненту самостоятельно обработать URL
    return url;
    } catch (error) {
      console.error('Cases: Ошибка при обработке URL изображения:', error);
      return '/placeholder.jpg';
    }
  };

  // Обработчик сброса фильтров
  const resetFilters = () => {
    setSearchQuery("");
    setSelectedTag(null);
    setSelectedService(null);
    setSelectedCategory(null);
  };

  // Определяем заголовки и тексты в зависимости от типа страницы
  const getPageTexts = () => {
    if (pageType === 'blog') {
      return {
        title: "Блог про автоматизацію бізнесу",
        description: "Корисні статті, поради та приклади автоматизації бізнес-процесів.",
        searchPlaceholder: "Пошук статей...",
        linkPrefix: "blog"
      };
    }
    return {
      title: "Кейси про автоматизацію бізнесу",
      description: "Корисні кейси, поради та приклади автоматизації бізнес-процесів.",
      searchPlaceholder: "Пошук кейсів...",
      linkPrefix: "cases"
    };
  };

  const pageTexts = getPageTexts();

  return (
    <section id={pageType} className="bg-gray-50 w-full py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-2">{pageTexts.title}</h1>
        <p className="text-lg mb-8 text-gray-600">{pageTexts.description}</p>

        <div className="mb-8 max-w-xl">
          <form className="flex items-center gap-2" onSubmit={(e) => e.preventDefault()}>
            <input 
              type="text" 
              placeholder={pageTexts.searchPlaceholder} 
              className="flex-1 border rounded px-4 py-2 focus:outline-none focus:ring"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button 
              type="button" 
              className="bg-amber text-white px-4 py-2 rounded hover:bg-amber-dark"
              onClick={() => setSearchQuery("")}
            >
              {searchQuery ? "✖" : "🔍"}
            </button>
          </form>
        </div>
        
        {/* Фильтры */}
        <div className="mb-6 flex flex-wrap gap-4 items-center">
          <div>
            <span className="text-sm font-medium mr-2">Теги:</span>
            <div className="inline-flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag}
                  className={`px-3 py-1 text-xs rounded-full ${
                    selectedTag === tag 
                      ? 'bg-amber text-white' 
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
          
          {/* Сервисы отображаются только для кейсов */}
          {pageType === 'cases' && services.length > 0 && (
            <div>
              <span className="text-sm font-medium mr-2">Сервіси:</span>
              <div className="inline-flex flex-wrap gap-2">
                {services.map((service) => (
                  <button
                    key={service}
                    className={`px-3 py-1 text-xs rounded-full ${
                      selectedService === service 
                        ? 'bg-amber text-white' 
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                    onClick={() => setSelectedService(selectedService === service ? null : service)}
                  >
                    {service}
                  </button>
                ))}
              </div>
            </div>
          )}

          {categories.length > 0 && (
            <div>
              <span className="text-sm font-medium mr-2">Категорії:</span>
              <div className="inline-flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    className={`px-3 py-1 text-xs rounded-full ${
                      selectedCategory === category 
                        ? 'bg-amber text-white' 
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                    onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          )}

          {(selectedTag || selectedService || selectedCategory) && (
            <button
              className="text-sm text-amber hover:text-amber-dark underline"
              onClick={resetFilters}
            >
              Скинути фільтри
            </button>
          )}
        </div>

        {/* Макет с сайдбаром */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Основной контент (2/3 ширины) */}
          <div className="w-full lg:w-2/3">
            {filteredPosts.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold mb-4">
                  {pageType === 'blog' ? 'Статті не знайдені' : 'Кейси не знайдені'}
                </h3>
                <p className="text-gray-600 mb-6">
                  Спробуйте змінити параметри пошуку або скинути фільтри.
                </p>
                <button
                  className="bg-amber text-white px-6 py-2 rounded hover:bg-amber-dark"
                  onClick={resetFilters}
                >
                  Скинути фільтри
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {filteredPosts.map((post) => (
                  <article key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow flex flex-col md:flex-row">
                    <div className="md:w-1/3 relative aspect-video md:aspect-auto">
                      {imageErrors[post.id] ? (
                        // Показываем заглушку, если изображение не загрузилось
                        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400 text-xs">Зображення недоступне</span>
                        </div>
                      ) : (
                      <Image
                        src={getImageUrl(post.image)}
                        alt={post.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                        loading="lazy"
                          unoptimized={post.image?.startsWith("/api/") ? false : true}
                          onError={(e) => {
                            // Если изображение не загрузилось, заменяем на заглушку
                            console.error("Ошибка загрузки изображения:", post.image);
                            setImageErrors(prev => ({...prev, [post.id]: true}));
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder.jpg';
                            target.onerror = null; // Предотвращаем бесконечный цикл
                          }}
                      />
                      )}
                    </div>
                    <div className="md:w-2/3 p-6 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          {post.categories.map((category) => (
                            <span key={category} className="text-xs bg-amber/10 text-amber px-2 py-1 rounded">
                              {category}
                            </span>
                          ))}
                          {post.date && (
                            <span className="text-xs text-gray-500">
                              {post.date}
                            </span>
                          )}
                        </div>
                        {/* Title is baked into the generated cover image above; kept here for SEO/screen readers only */}
                        <h2 className="sr-only">{post.title}</h2>
                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {post.excerpt}
                        </p>
                        
                        {/* Теги */}
                        {post.tags.length > 0 && (
                          <div className="mb-3 flex flex-wrap gap-2">
                            {post.tags.slice(0, 3).map((tag) => (
                              <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                {tag}
                              </span>
                            ))}
                            {post.tags.length > 3 && (
                              <span className="text-xs text-gray-500">
                                +{post.tags.length - 3} еще
                              </span>
                            )}
                          </div>
                        )}

                        {/* Сервисы (только для кейсов) */}
                        {pageType === 'cases' && post.services.length > 0 && (
                          <div className="mb-3 flex flex-wrap gap-2">
                            {post.services.slice(0, 2).map((service) => (
                              <span key={service} className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                                {service}
                              </span>
                            ))}
                            {post.services.length > 2 && (
                              <span className="text-xs text-gray-500">
                                +{post.services.length - 2} еще
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Link
                          href={`/${lang}/${pageTexts.linkPrefix}/${post.slug}`}
                          className="bg-amber hover:bg-amber-dark text-white px-4 py-2 rounded transition-colors"
                        >
                          Читати далі
                        </Link>
                        {pageType === 'cases' && (post.likes > 0 || post.comments > 0) && (
                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            {post.likes > 0 && (
                              <span className="flex items-center gap-1">
                                <span>❤️</span>
                                {post.likes}
                              </span>
                            )}
                            {post.comments > 0 && (
                              <span className="flex items-center gap-1">
                                <span>💬</span>
                                {post.comments}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
          
          {/* Сайдбар (1/3 ширины) */}
          <div className="w-full lg:w-1/3">
            <div className="space-y-6">
              {/* Популярные посты */}
              {popularPosts.length > 0 && (
                <div className="bg-white rounded-lg p-6 shadow-md">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <span className="text-amber">⚡</span>
                    {pageType === 'blog' ? 'Популярні статті' : 'Популярні кейси'}
                  </h3>
                  <ul className="space-y-3">
                    {popularPosts.map((post) => (
                      <li key={post.id} className="border-b border-gray-100 pb-3 last:border-b-0">
                        <Link 
                          href={`/${lang}/${pageTexts.linkPrefix}/${post.slug}`} 
                          className="hover:text-amber font-medium block line-clamp-2 text-sm"
                        >
                          {post.title}
                        </Link>
                        <div className="text-xs text-gray-400 mt-1">{post.date}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Категории */}
              {categories.length > 0 && (
                <div className="bg-white rounded-lg p-6 shadow-md">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <span className="text-amber">🏷️</span>
                    Категорії
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <button 
                        key={category}
                        className={`px-3 py-1 rounded text-xs transition-colors ${
                          selectedCategory === category 
                            ? 'bg-amber text-white' 
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                        onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Теги */}
              {tags.length > 0 && (
                <div className="bg-white rounded-lg p-6 shadow-md">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <span className="text-amber">🏷️</span>
                    Теги
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <button 
                        key={tag}
                        className={`px-3 py-1 rounded text-xs transition-colors ${
                          selectedTag === tag 
                            ? 'bg-amber text-white' 
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                        onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Сервисы (только для кейсов) */}
              {pageType === 'cases' && services.length > 0 && (
                <div className="bg-white rounded-lg p-6 shadow-md">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <span className="text-amber">🔧</span>
                    Сервіси
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {services.map((service) => (
                      <button 
                        key={service}
                        className={`px-3 py-1 rounded text-xs transition-colors ${
                          selectedService === service 
                            ? 'bg-amber text-white' 
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                        onClick={() => setSelectedService(selectedService === service ? null : service)}
                      >
                        {service}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Подписка на новости */}
              <div className="bg-white rounded-lg p-6 shadow-md">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <span className="text-amber">📩</span>
                  Підписатися на новини
                </h3>
                <p className="text-sm text-gray-500 mb-3">
                  Отримуйте найкращі {pageType === 'blog' ? 'статті' : 'кейси'} та поради з автоматизації бізнесу.
                </p>
                <form className="flex flex-col gap-2">
                  <input 
                    type="email" 
                    placeholder="Ваш email" 
                    className="border rounded px-3 py-2 focus:outline-none focus:ring text-sm" 
                  />
                  <button 
                    type="submit" 
                    className="bg-amber text-white py-2 rounded hover:bg-amber-dark text-sm"
                  >
                    Підписатися
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 