import { NextResponse } from "next/server"

// Типы данных
interface Testimonial {
  id: number;
  name: string;
  position: string;
  company: string;
  photo: string | null;
  text: string;
  rating: number;
  documentLink: string | null;
  documentName: string | null;
  isReal?: boolean;
}

// Добавляем параметр для предотвращения кеширования изображений
const cacheParam = `?v=${Date.now()}`;

// Тестові дані для відгуків
const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Олександр Петренко",
    position: "Генеральний директор",
    company: "ТОВ 'Смак'",
    photo: `/images/testimonials/businessman2.jpg${cacheParam}`,
    text: "Завдяки автоматизації ми змогли значно покращити контроль над запасами та збільшити продажі. Система проста у використанні, а підтримка завжди оперативна.",
    rating: 5,
    documentLink: null,
    documentName: null,
  },
  {
    id: 2,
    name: "Ірина Коваленко",
    position: "Фінансовий директор",
    company: "ТОВ 'ТехноПром'",
    photo: `/images/testimonials/businesswoman1.jpg${cacheParam}`,
    text: "Впровадження системи автоматизації дозволило нам скоротити витрати на 20% та підвищити ефективність роботи персоналу. Рекомендую цю компанію як надійного партнера.",
    rating: 5,
    documentLink: null,
    documentName: null,
  },
  {
    id: 3,
    name: "Микола Шевченко",
    position: "Власник",
    company: "Сервісний центр 'Майстер'",
    photo: `/images/testimonials/business-owner2.jpg${cacheParam}`,
    text: "Ми довго шукали рішення для автоматизації нашого сервісного центру. Ця система перевершила всі наші очікування. Клієнти задоволені, а наш бізнес зростає.",
    rating: 4,
    documentLink: null,
    documentName: null,
  },
  {
    id: 4,
    name: "Тетяна Мельник",
    position: "Директор з маркетингу",
    company: "Мережа 'Затишок'",
    photo: `/images/testimonials/Marketolog.jpg${cacheParam}`,
    text: "Автоматизація маркетингових процесів дозволила нам збільшити конверсію на 35%. Тепер ми можемо ефективніше аналізувати дані та приймати кращі рішення.",
    rating: 5,
    documentLink: null,
    documentName: null,
  },
  {
    id: 5,
    name: "Віктор Ковальчук",
    position: "Керівник відділу продажів",
    company: "ТОВ 'Будівельник'",
    photo: `/images/testimonials/Prorab.jpg${cacheParam}`,
    text: "Після впровадження CRM-системи наші продажі зросли на 45%. Тепер ми маємо повний контроль над воронкою продажів та можемо ефективно планувати роботу відділу.",
    rating: 5,
    documentLink: null,
    documentName: null,
  },
  {
    id: 6,
    name: "Наталія Іванова",
    position: "HR-директор",
    company: "Компанія 'ІТ-Сервіс'",
    photo: `/images/testimonials/hr-director.jpg${cacheParam}`,
    text: "Автоматизація HR-процесів значно спростила нашу роботу. Тепер ми витрачаємо менше часу на рутинні завдання і більше уваги приділяємо розвитку персоналу.",
    rating: 4,
    documentLink: null,
    documentName: null,
  },
  {
    id: 7,
    name: "Андрій Ковтун",
    position: "Директор",
    company: "Меблева фабрика 'ВМКК'",
    photo: `/images/testimonials/businessman2.jpg${cacheParam}`,
    text: "Завдяки автоматизації процесів на нашому виробництві ми змогли збільшити ефективність на 30%. Рекомендую цю компанію як професіоналів своєї справи.",
    rating: 5,
    documentLink: null,
    documentName: null,
  },
  {
    id: 8,
    name: "Марина Литвин",
    position: "Власниця",
    company: "Мережа кав'ярень 'Аромат'",
    photo: `/images/testimonials/businesswoman2.jpg${cacheParam}`,
    text: "Впровадження CRM-системи дозволило нам краще розуміти наших клієнтів і збільшити повторні продажі. Дякуємо за професійний підхід та якісну підтримку.",
    rating: 5,
    documentLink: null,
    documentName: null,
  },
  {
    id: 9,
    name: "Сергій Мороз",
    position: "Фінансовий аналітик",
    company: "Інвестиційна компанія 'Капітал'",
    photo: `/images/testimonials/businessman2.jpg${cacheParam}`,
    text: "Автоматизація фінансової звітності значно спростила нашу роботу. Тепер ми отримуємо точні дані в режимі реального часу і можемо приймати більш обґрунтовані рішення.",
    rating: 4,
    documentLink: null,
    documentName: null,
  }
]

// Реальные отзывы (будут добавляться сюда)
const realTestimonials: Testimonial[] = [
  // Реальный отзыв от Александра Лихтмана
  {
    id: 101,
    name: "Александр Лихтман",
    position: "PR агентство для IT-компаний и стартапов",
    company: "itcomms.io",
    photo: `/images/testimonials/alexander-lihtman.jpg${cacheParam}`,
    text: "Команда itcomms.io отримала зручне рішення для контролю витрат! Система на базі CRM та Google Таблиць зробила процес прозорим: кожна витрата — це задача, а звіти формуються автоматично. Результат — економія часу менеджерів, зменшення перевищень бюджету на 70% за два місяці та повний контроль над фінансами. Рекомендую CRMCUSTOMS для ефективної автоматизації!",
    rating: 5,
    documentLink: "https://s3.us-east-1.amazonaws.com/crmcustoms.site/%D0%91%D0%BB%D0%B0%D0%B3%D0%BE%D0%B4%D0%B0%D1%80%D1%81%D1%82%D0%B2%D0%B5%D0%BD%D0%BD%D0%BE%D0%B5+%D0%BF%D0%B8%D1%81%D1%8C%D0%BC%D0%BE_CRMCUSTOMS.pdf",
    documentName: "Лист подяки",
    isReal: true
  }
]

export async function GET() {
  // Обновляем параметр кеширования при каждом запросе
  const newCacheParam = `?v=${Date.now()}`;
  
  // Обновляем пути к фотографиям с новым параметром кеширования
  const updatedTestimonials = [...realTestimonials, ...testimonials].map(testimonial => {
    if (testimonial.photo) {
      // Удаляем старый параметр кеширования, если он есть
      const photoPath = testimonial.photo.split('?')[0];
      
      // Проверка и исправление отсутствующих изображений
      if (photoPath === '/images/testimonials/business-owner1.jpg') {
        return {
          ...testimonial,
          photo: `/images/testimonials/business-owner2.jpg${newCacheParam}`
        };
      }
      
      return {
        ...testimonial,
        photo: `${photoPath}${newCacheParam}`
      };
    }
    return testimonial;
  });
  
  return NextResponse.json(updatedTestimonials);
}

// Функция для добавления нового отзыва (для будущего использования)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Здесь можно добавить валидацию данных
    
    // Генерируем новый ID
    const newId = realTestimonials.length > 0 
      ? Math.max(...realTestimonials.map(t => t.id)) + 1 
      : 101;
    
    const newTestimonial = {
      id: newId,
      name: body.name || "",
      position: body.position || "",
      company: body.company || "",
      photo: body.photo || null,
      text: body.text || "",
      rating: body.rating || 5,
      documentLink: body.documentLink || null,
      documentName: body.documentName || null,
      isReal: true
    }
    
    // В реальном приложении здесь был бы код для сохранения в базу данных
    realTestimonials.push(newTestimonial)
    
    return NextResponse.json({ success: true, testimonial: newTestimonial })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to add testimonial" }, { status: 400 })
  }
}
