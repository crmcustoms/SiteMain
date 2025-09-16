import { redirect } from 'next/navigation';

// Редирект с корневой страницы блога на локализованную версию
export default function BlogDetailPage({ params }: { params: { slug: string } }) {
  // По умолчанию перенаправляем на украинскую версию
  redirect(`/uk/blog/${params.slug}`);
}

// Включаем SSG с редким обновлением
export const revalidate = 86400; // 24 часа 