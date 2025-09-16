import type React from "react"
import type { Metadata } from "next"
import { Inter, Montserrat } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { LanguageProvider } from "@/components/language-provider"
import { Toaster } from "@/components/toaster"
import "@/app/globals.css"
import { getDictionary } from "@/lib/dictionaries"
import Script from "next/script"

// Keep Inter for backward compatibility
const inter = Inter({ subsets: ["latin", "cyrillic"] })

// Add Montserrat font
const montserrat = Montserrat({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-montserrat",
})

export const metadata: Metadata = {
  metadataBase: new URL('https://crmcustoms.com'), // Укажите ваш домен
  title: {
    default: "Автоматизація бізнесу | CRM Customs - Підвищення ефективності бізнесу",
    template: "%s | CRM Customs",
  },
  description: "Автоматизація бізнесу та впровадження CRM систем. Розробка індивідуальних рішень для підвищення ефективності вашого бізнесу.",
  keywords: ["автоматизація бізнесу", "crm системи", "впровадження crm", "розробка crm", "бізнес автоматизація"],
  authors: [{ name: "CRM Customs" }],
  creator: "CRM Customs",
  publisher: "CRM Customs",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'uk_UA',
    url: 'https://crmcustoms.com',
    siteName: 'CRM Customs',
    title: 'Автоматизація бізнесу | CRM Customs',
    description: 'Професійна автоматизація бізнес-процесів. Налаштування CRM, інтеграція систем, покращення продажів та клієнтського сервісу.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'CRM Customs - Автоматизація бізнесу',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Автоматизація бізнесу | CRM Customs',
    description: 'Професійна автоматизація бізнес-процесів. Налаштування CRM, інтеграція систем.',
    images: ['/og-image.jpg'],
    creator: '@crmcustoms',
  },
  verification: {
    google: 'your-google-site-verification', // Добавьте код верификации Google
    yandex: 'your-yandex-verification', // Добавьте код верификации Yandex
  },
  alternates: {
    canonical: 'https://crmcustoms.com',
    languages: {
      'uk-UA': 'https://crmcustoms.com',
      'en-US': 'https://crmcustoms.com/en',
    },
  },
  icons: {
    icon: [
      { url: "/favicons/favicon.ico" },
      { url: "/favicons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-icon.png",
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Используем только украинский язык по умолчанию
  const locale = 'uk';
  
  // Получаем словарь для украинского языка
  const dict = await getDictionary(locale);

  return (
    <html lang="uk" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicons/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicons/favicon-16x16.png" type="image/png" sizes="16x16" />
        <link rel="icon" href="/favicons/favicon-32x32.png" type="image/png" sizes="32x32" />
        <link rel="manifest" href="/favicons/site.webmanifest" />
        
        {/* Скрипт для отключения сервис-воркера */}
        <Script id="unregister-sw" strategy="beforeInteractive">
          {`
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(function(registrations) {
              for (let registration of registrations) {
                console.log('Отключаем сервис-воркер:', registration.scope);
                registration.unregister();
              }
            });
            
            if ('caches' in window) {
              caches.keys().then(function(cacheNames) {
                cacheNames.forEach(function(cacheName) {
                  console.log('Удаляем кеш:', cacheName);
                  caches.delete(cacheName);
                });
              });
            }
            
            localStorage.setItem('disable-service-worker', 'true');
          }
          `}
        </Script>
        
        {/* Schema.org structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "CRM Customs",
              "url": "https://crmcustoms.com",
              "logo": "https://crmcustoms.com/logo.png",
              "description": "Професійна автоматизація бізнес-процесів. Налаштування CRM, інтеграція систем, покращення продажів та клієнтського сервісу.",
              "foundingDate": "2023",
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "customer service",
                "availableLanguage": ["Ukrainian", "English"]
              },
              "areaServed": {
                "@type": "Country",
                "name": "Ukraine"
              },
              "serviceType": [
                "CRM Implementation",
                "Business Process Automation", 
                "System Integration",
                "Sales Optimization",
                "Customer Service Improvement"
              ]
            })
          }}
        />
        
        {/* Website Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "CRM Customs",
              "url": "https://crmcustoms.com",
              "description": "Професійна автоматизація бізнес-процесів",
              "inLanguage": "uk",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://crmcustoms.com/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
      </head>
      <body className={`${inter.className} ${montserrat.variable} min-h-screen flex flex-col`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <LanguageProvider lang={locale} initialDict={dict}>
            {children}
            <Toaster />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
