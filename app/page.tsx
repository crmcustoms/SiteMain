import { redirect } from 'next/navigation';

// Редирект с корневой страницы на локализованную версию
export default function Home() {
  // По умолчанию перенаправляем на украинскую версию
  redirect('/uk');
}

// Включаем SSG с редким обновлением - страница будет обновляться раз в день
export const revalidate = 86400; // 24 часа 