import { redirect } from "next/navigation";

// Редирект с корневой страницы кейса на локализованную версию
export default function CaseDetailPage({ params }: { params: { slug: string } }) {
  // По умолчанию перенаправляем на украинскую версию
  redirect(`/uk/cases/${params.slug}`);
}

// Включаем SSG с редким обновлением
export const revalidate = 86400; // 24 часа 