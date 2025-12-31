import Link from "next/link"
import { MobileMenu } from "@/components/mobile-menu"

export default function Header({ dict, lang = 'ua', hideOnHome = false, pathname = '' }: { dict: any; lang?: string; hideOnHome?: boolean; pathname?: string }) {
  const isHome = pathname === `/${lang}` || pathname === '/';

  if (hideOnHome && isHome) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="flex items-center">
          <Link href={`/${lang}`} className="flex items-center space-x-2">
            <div className="flex flex-col items-start">
              <div className="text-xl font-bold tracking-wide w-full">
                <span className="text-amber">CRM</span>
                <span>CUSTOMS</span>
              </div>
            </div>
          </Link>
        </div>
        <nav className="hidden md:flex flex-1 justify-center gap-6 items-center">
          <Link href={`/${lang}`} className="text-sm font-medium transition-colors hover:text-amber">
            {dict.navigation.home}
          </Link>
          <Link href={`/${lang}/cases`} className="text-sm font-medium transition-colors hover:text-amber">
            {dict.navigation.cases || 'Кейси'}
          </Link>
          <Link href={`/${lang}/blog`} className="text-sm font-medium transition-colors hover:text-amber">
            {dict.navigation.blog}
          </Link>
          <Link href={`/${lang}#features`} className="text-sm font-medium transition-colors hover:text-amber">
            {dict.navigation.features}
          </Link>
          <Link href={`/${lang}#services`} className="text-sm font-medium transition-colors hover:text-amber">
            {dict.navigation.pricing}
          </Link>
        </nav>
        <div className="flex items-center gap-2 ml-auto">
          <MobileMenu dict={dict} lang={lang} />
        </div>
      </div>
    </header>
  )
}
