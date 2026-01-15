import { headers } from "next/headers"
import { i18n } from "@/lib/i18n-config"
import LangHome from "./[lang]/page"

// Редирект с корневой страницы на локализованную версию
export default function Home() {
  const hdrs = headers()
  const host = hdrs.get("host") || ""
  const proto = hdrs.get("x-forwarded-proto") || ""
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/de426b11-629a-4d11-809b-e48b79b36174',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'redirect-pre',hypothesisId:'H2',location:'app/page.tsx:7',message:'root_redirect',data:{host,proto},timestamp:Date.now()})}).catch(()=>{});
  // #endregion
  // Рендерим украинскую версию без языкового префикса
  return LangHome({ params: Promise.resolve({ lang: i18n.defaultLocale }) })
}

// Включаем SSG с редким обновлением - страница будет обновляться раз в день
export const revalidate = 86400; // 24 часа 