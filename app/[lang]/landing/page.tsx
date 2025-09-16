import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Тестовая страница",
  description: "Статическая страница для проверки маршрутизации"
};

export default async function LandingPage({
  params,
}: {
  params: { lang: string }
}) {
  const lang = await Promise.resolve(params?.lang || 'default');
  
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '20px' }}>
        Тестовая страница
      </h1>
      
      <p style={{ marginBottom: '20px' }}>
        Текущий язык: {lang}
      </p>
      
      <div style={{ marginTop: '30px' }}>
        <a 
          href={`/${lang}`} 
          style={{ 
            display: 'inline-block', 
            marginRight: '15px',
            color: 'blue',
            textDecoration: 'underline'
          }}
        >
          На главную
        </a>
        
        <a 
          href={`/${lang}/blog`} 
          style={{ 
            display: 'inline-block',
            color: 'blue',
            textDecoration: 'underline'
          }}
        >
          Блог
        </a>
      </div>
    </div>
  );
} 