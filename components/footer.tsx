import Link from "next/link"
import { FooterFacebook, Instagram, Twitter, Mail, Phone, MapPin } from "@/components/icons"

export default function Footer({ dict, lang = 'ua' }: { dict: any; lang?: string }) {
  return (
    <footer className="border-t bg-background">
      <div className="container px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex flex-col items-start">
              <div className="text-xl font-bold tracking-wide w-full">
                <span className="text-amber">CRM</span>
                <span>CUSTOMS</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{dict.footer.description}</p>
            <div className="flex space-x-4">
              <Link href="https://www.facebook.com/crmcustom" className="text-muted-foreground hover:text-primary" target="_blank" rel="noopener noreferrer">
                <FooterFacebook size={20} />
              </Link>
              <Link href="https://t.me/prodayslonakume" className="text-muted-foreground hover:text-primary" target="_blank" rel="noopener noreferrer">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9.036 16.956l-.398 3.77c.57 0 .816-.246 1.113-.54l2.67-2.53 5.537 4.04c1.014.56 1.74.266 1.99-.94l3.61-16.84c.33-1.54-.56-2.14-1.56-1.77l-21.1 8.13c-1.44.56-1.42 1.36-.25 1.72l5.39 1.68 12.52-7.9c.59-.38 1.13-.17.69.24z"/>
                </svg>
              </Link>
              <Link href="https://www.youtube.com/@crmcustomsua" className="text-muted-foreground hover:text-primary" target="_blank" rel="noopener noreferrer">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                  <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
                </svg>
              </Link>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-bold">{dict.footer.navigation}</h3>
            <ul className="space-y-2">
              <li>
                <Link href={`/${lang}`} className="text-sm text-muted-foreground hover:text-primary">
                  {dict.navigation.home}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/blog`} className="text-sm text-muted-foreground hover:text-primary">
                  {dict.navigation.blog}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}#features`} className="text-sm text-muted-foreground hover:text-primary">
                  {dict.navigation.features}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}#pricing`} className="text-sm text-muted-foreground hover:text-primary">
                  {dict.navigation.pricing}
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-bold">{dict.footer.legal}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
                  {dict.footer.privacyPolicy}
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
                  {dict.footer.termsOfService}
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-bold">{dict.footer.contact}</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone size={16} />
                <span>+380671706703</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail size={16} />
                <span>info@crmcustoms.com</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin size={16} />
                <span>{dict.footer.address}</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} CRMCUSTOMS. {dict.footer.copyright}
          </p>
        </div>
        <div className="flex gap-2 mt-8 justify-center">
          <a
            href="https://t.me/crmcustomsua"
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-500 hover:bg-blue-600 transition"
            title="Telegram"
          >
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M9.036 16.956l-.398 3.77c.57 0 .816-.246 1.113-.54l2.67-2.53 5.537 4.04c1.014.56 1.74.266 1.99-.94l3.61-16.84c.33-1.54-.56-2.14-1.56-1.77l-21.1 8.13c-1.44.56-1.42 1.36-.25 1.72l5.39 1.68 12.52-7.9c.59-.38 1.13-.17.69.24z"/></svg>
          </a>
          <a
            href="viber://chat?number=%2B380671706703"
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 flex items-center justify-center rounded-full bg-purple-600 hover:bg-purple-700 transition"
            title="Viber"
          >
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.198.297-.767.967-.94 1.166-.173.198-.347.223-.644.074-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.372-.01-.571-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.099 3.2 5.077 4.363.71.306 1.263.489 1.694.626.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.288.173-1.413-.074-.124-.272-.198-.57-.347z"/></svg>
          </a>
          <a
            href="https://www.youtube.com/@crmcustomsua"
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 flex items-center justify-center rounded-full bg-red-600 hover:bg-red-700 transition"
            title="YouTube"
          >
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23 9.71a8.5 8.5 0 0 0-.91-4.13 2.92 2.92 0 0 0-1.72-1A78.36 78.36 0 0 0 12 4.27a78.45 78.45 0 0 0-8.34.3 2.87 2.87 0 0 0-1.46.74c-.9.83-1 2.25-1.1 3.45a48.29 48.29 0 0 0 0 6.48 9.55 9.55 0 0 0 .3 2 3.14 3.14 0 0 0 .71 1.36 2.86 2.86 0 0 0 1.49.78 45.18 45.18 0 0 0 6.5.33c3.5.05 6.57 0 10.2-.28a2.88 2.88 0 0 0 1.53-.78 2.49 2.49 0 0 0 .61-1 10.58 10.58 0 0 0 .52-3.4c.04-.56.04-3.94.04-4.54zM9.74 14.85V8.66l5.92 3.11c-1.66.92-3.85 1.96-5.92 3.08z"/>
            </svg>
          </a>
          <a
            href="https://www.facebook.com/crmcustom"
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-700 hover:bg-blue-800 transition"
            title="Facebook"
          >
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
            </svg>
          </a>
        </div>
      </div>
    </footer>
  )
}
