import Link from "next/link"
import { MobileMenu } from "@/components/mobile-menu"
import { CallbackFormDialog } from "@/components/callback-form-dialog"

export default function Header({ dict, lang = 'ua', hideOnHome = false, pathname = '' }: { dict: any; lang?: string; hideOnHome?: boolean; pathname?: string }) {
  const isHome = pathname === `/${lang}` || pathname === '/';

  if (hideOnHome && isHome) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/5 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="flex items-center justify-between px-8 py-4">
        <Link href={`/${lang}`} className="font-bold text-xl tracking-tight">
          <span className="text-[#FFD700]">CRM</span>
          <span className="text-black">CUSTOMS</span>
        </Link>
        <nav className="hidden md:flex items-center gap-12 text-base text-black/70 font-medium absolute left-1/2 transform -translate-x-1/2">
          <Link href={`/${lang}/cases`} className="hover:text-[#FFD700] transition-colors">
            Кейси
          </Link>
          <Link href={`/${lang}/blog`} className="hover:text-[#FFD700] transition-colors">
            Блог
          </Link>
          <Link href={`/${lang}#about`} className="hover:text-[#FFD700] transition-colors">
            Про нас
          </Link>
        </nav>
        <div className="hidden md:flex items-center gap-4">
          <div className="flex flex-col items-end leading-tight">
            <a href="tel:+380671706703" className="text-lg font-semibold hover:text-[#FFD700] transition-colors">
              +380 67 170 67 03
            </a>
            <span className="text-xs text-black/60">Телефон для швидкого зв'язку</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs text-black/60 leading-tight max-w-[220px]">
              Напишіть нам у Telegram — відповімо одразу, без підключень і перемикань.
            </div>
            <a
              href="https://t.me/crmcustomsua"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 bg-blue-500 hover:bg-blue-600 rounded flex items-center justify-center transition-all"
              title="Telegram"
            >
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9.036 16.956l-.398 3.77c.57 0 .816-.246 1.113-.54l2.67-2.53 5.537 4.04c1.014.56 1.74.266 1.99-.94l3.61-16.84c.33-1.54-.56-2.14-1.56-1.77l-21.1 8.13c-1.44.56-1.42 1.36-.25 1.72l5.39 1.68 12.52-7.9c.59-.38 1.13-.17.69.24z"/>
              </svg>
            </a>
          </div>
          <div className="mx-2 h-4 w-[1px] bg-black/10" />
          <CallbackFormDialog
            title="Зателефонуйте мені"
            description="Залиште ім'я та телефон — ми передзвонимо найближчим часом."
            buttonText="Зателефонуйте мені"
            trigger={
              <button className="px-6 py-2 bg-black text-white text-sm font-medium hover:bg-[#FFD700] hover:text-black transition-colors">
                Зателефонуйте мені
              </button>
            }
          />
        </div>
        <MobileMenu dict={dict} lang={lang} />
      </div>
    </header>
  )
}
