import Link from "next/link"
import { Send } from "lucide-react"
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
            <a href="tel:+380671706703" className="text-sm font-semibold hover:text-[#FFD700] transition-colors">
              +380 67 170 67 03
            </a>
            <span className="text-xs text-black/60">Телефон для швидкого зв'язку</span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://t.me/crmcustomsua"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 border border-black/20 rounded flex items-center justify-center hover:border-black/40 hover:bg-black/5 transition-all"
              title="Telegram"
            >
              <Send className="w-4 h-4 text-black" />
            </a>
            <div className="text-xs text-black/60 leading-tight max-w-[220px]">
              Напишіть нам у Telegram — відповімо одразу, без підключень і перемикань.
            </div>
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
