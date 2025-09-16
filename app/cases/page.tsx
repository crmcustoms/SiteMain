import { redirect } from "next/navigation";

// Редирект с корневой страницы кейсов на локализованную версию
export default function CasesPage() {
  // По умолчанию перенаправляем на украинскую версию
  redirect('/uk/cases');
}

// Включаем SSG с редким обновлением
export const revalidate = 86400; // 24 часа 