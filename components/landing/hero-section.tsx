"use client"

import Link from "next/link"
import { Facebook, Youtube, Send } from "@/components/icons"
import { AnimatedElement } from "@/components/ui/animated-element"
import { ContactFormDialog } from "@/components/contact-form-dialog"
import { MessengerWidget } from "@/components/landing/messenger-widget"
import { useState, useEffect } from "react"

export default function HeroSection({ dict, commonDict, lang = 'uk' }: { dict: any; commonDict: any; lang?: string }) {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > window.innerHeight - 100
      setIsScrolled(scrolled)
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const logos = [
    { id: 1, name: "Logo 1", src: "/images/logo_servises/2.png" },
    { id: 2, name: "Logo 2", src: "/images/logo_servises/5.png" },
    { id: 3, name: "Logo 3", src: "/images/logo_servises/6.png" },
    { id: 4, name: "Logo 4", src: "/images/logo_servises/7.png" },
    { id: 5, name: "Logo 5", src: "/images/logo_servises/9.png" },
    { id: 6, name: "Logo 6", src: "/images/logo_servises/10.png" },
    { id: 7, name: "Logo 7", src: "/images/logo_servises/11.png" },
    { id: 8, name: "Logo 8", src: "/images/logo_servises/13.png" },
    { id: 9, name: "Logo 9", src: "/images/logo_servises/14.png" },
    { id: 10, name: "Logo 10", src: "/images/logo_servises/21.png" },
    { id: 11, name: "Logo 11", src: "/images/logo_servises/24.png" },
    { id: 12, name: "Logo 12", src: "/images/logo_servises/images.png" },
  ]

  return (
    <section className="w-full h-screen relative overflow-hidden font-montserrat flex flex-col bg-white">
      {/* Header with Logo and Menu */}
      <style>{`
        .menu-item {
          position: relative;
          padding: 0.5rem 0;
          transition: all 0.3s ease;
        }
        .menu-item::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 2px;
          background: linear-gradient(90deg, #ffb800, #ffb800);
          transition: width 0.3s ease;
        }
        .menu-item:hover::after {
          width: 100%;
        }
        .menu-item:hover {
          color: #ffb800;
        }
      `}</style>

      <div className="relative z-30 flex items-center justify-between px-4 md:px-8 lg:px-12 pt-6 md:pt-8 pl-24 md:pl-32 lg:pl-40">
        {/* Logo */}
        <Link href={`/${lang}`} className="flex items-center space-x-2 flex-shrink-0">
          <div className="text-2xl md:text-3xl font-bold tracking-wide">
            <span className="text-amber">CRM</span>
            <span className="text-black">CUSTOMS</span>
          </div>
        </Link>

        {/* Menu */}
        <nav className="hidden md:flex flex-1 justify-center gap-12 items-center">
          <Link href={`/${lang}`} className="menu-item text-base font-medium text-black transition-colors">
            {dict.navigation?.home || 'Головна'}
          </Link>
          <Link href={`/${lang}/cases`} className="menu-item text-base font-medium text-black transition-colors">
            {dict.navigation?.cases || 'Кейси'}
          </Link>
          <Link href={`/${lang}/blog`} className="menu-item text-base font-medium text-black transition-colors">
            {dict.navigation?.blog || 'Блог'}
          </Link>
          <Link href={`/${lang}#services`} className="menu-item text-base font-medium text-black transition-colors">
            {dict.navigation?.pricing || 'Послуги'}
          </Link>
        </nav>
      </div>

      {/* Left vertical yellow stripe for social sidebar */}
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-yellow-400 z-0 hidden md:block"></div>

      {/* Center background image */}
      <div className="absolute left-16 right-0 lg:right-1/6 top-0 bottom-0 z-0 hidden md:block">
        <img
          src="/images/background.webp"
          alt="Background"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Right vertical yellow stripe for professor image */}
      <div className="absolute right-0 top-0 bottom-0 w-1/6 bg-yellow-400 z-2 hidden lg:block">
        {/* Phone number in right stripe */}
        <div className="absolute top-6 right-2 left-2 text-black font-bold text-xs text-center hidden lg:block px-1">
          <a href="tel:+380671706703" className="hover:opacity-80 transition block whitespace-nowrap overflow-hidden text-ellipsis">
            +380 67 170-67-03
          </a>
        </div>
      </div>

      {/* Professor Image - Desktop Only, Right Side */}
      <div className="absolute right-0 bottom-0 z-5 hidden lg:block h-[90%] w-auto pointer-events-none">
        <img
          src="/images/professor.png"
          alt="Professor"
          className="h-full w-auto object-contain"
        />
      </div>

      {/* Social Sidebar */}
      <div className={`fixed left-4 top-1/2 -translate-y-1/2 flex flex-col z-20 pr-4 border-r ${isScrolled ? 'border-gray-300' : 'border-white'} hidden md:flex`}>
        <a
          href="https://www.youtube.com/@crmcustomsua"
          target="_blank"
          rel="noopener noreferrer"
          className={`${isScrolled ? 'text-gray-800' : 'text-white'} mb-6 transition-all hover:text-amber hover:scale-110`}
          title="YouTube"
        >
          <Youtube className="h-6 w-6 stroke-[1.5]" />
        </a>
        <a
          href="https://www.facebook.com/crmcustom"
          target="_blank"
          rel="noopener noreferrer"
          className={`${isScrolled ? 'text-gray-800' : 'text-white'} mb-6 transition-all hover:text-amber hover:scale-110`}
          title="Facebook"
        >
          <Facebook className="h-6 w-6 stroke-[1.5]" />
        </a>
        <a
          href="https://t.me/prodayslonakume"
          target="_blank"
          rel="noopener noreferrer"
          className={`${isScrolled ? 'text-gray-800' : 'text-white'} mb-6 transition-all hover:text-amber hover:scale-110`}
          title="Telegram"
        >
          <Send className="h-6 w-6 stroke-[1.5]" />
        </a>
      </div>

      {/* Logo Carousel - Bottom */}
      <div className="absolute bottom-0 left-0 w-full bg-white/80 backdrop-blur-md border-t border-gray-200 py-6 z-20">
        <style>{`
          @keyframes carouselScroll {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }
          .logo-track {
            display: flex;
            gap: 5rem;
            width: max-content;
            animation: carouselScroll 40s linear infinite;
          }
          .logo-track img {
            height: 32px;
            opacity: 0.4;
            transition: all 0.3s ease;
            filter: grayscale(100%);
          }
          .logo-track img:hover {
            opacity: 1;
            filter: grayscale(0%);
            transform: scale(1.1);
          }
        `}</style>

        <div className="overflow-hidden w-full">
          <div className="logo-track">
            {/* First set of logos */}
            {logos.map((logo) => (
              <img
                key={`carousel-${logo.id}`}
                src={logo.src}
                alt={logo.name}
                className="flex-shrink-0"
              />
            ))}

            {/* Duplicate for infinite loop */}
            {logos.map((logo) => (
              <img
                key={`carousel-dup-${logo.id}`}
                src={logo.src}
                alt={logo.name}
                aria-hidden="true"
                className="flex-shrink-0"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main Content - Center */}
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .btn-hero {
          animation: slideUp 0.6s ease-out;
          transition: all 0.3s ease;
        }
        .btn-hero:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(255, 184, 0, 0.25);
        }
        .btn-hero:active {
          transform: translateY(-2px);
        }
      `}</style>

      <div className="relative z-10 flex-grow flex items-center justify-center container mx-auto px-4 md:px-6 max-w-2xl md:max-w-3xl lg:max-w-4xl">
        {/* Dark overlay behind text */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-transparent rounded-2xl pointer-events-none"></div>
        <div className="w-full text-center relative z-10">
          <div className="relative mb-8">
            <AnimatedElement delay={100}>
              <div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                  <span className="text-black">CRM</span>, яка починає заробляти вже через місяць
                </h1>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-amber mb-8 leading-tight">
                  Наведемо <span className="text-black">порядок</span> у продажах і підвищимо <span className="text-black">ефективність</span> команди
                  <sup className="text-black text-lg md:text-2xl ml-2 inline-block transform -rotate-12" style={{fontFamily: "'Comic Sans MS', 'Segoe Print', cursive, sans-serif", fontWeight: 'bold'}}>40%</sup>
                </h2>
              </div>
            </AnimatedElement>
          </div>

          <AnimatedElement delay={500}>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <ContactFormDialog
                trigger={
                  <button className="btn-hero bg-amber text-black font-bold px-6 py-3 text-sm md:text-base hover:bg-yellow-500 rounded-lg">
                    {dict.ctaButton || "Замовити консультацію"}
                  </button>
                }
                title={commonDict.form.auditFormTitle}
                description={commonDict.form.auditFormDescription}
                formType="hero_audit"
                buttonText={commonDict.form.submitButton}
                dict={commonDict}
              />

              <ContactFormDialog
                trigger={
                  <button className="btn-hero bg-black text-amber font-bold px-6 py-3 text-sm md:text-base hover:bg-gray-900 rounded-lg border border-amber">
                    Залишити номер
                  </button>
                }
                title="Зв'язок за номером"
                description="Введіть ваш номер телефону і ми вам передзвонимо"
                formType="hero_callback"
                buttonText={commonDict.form.submitButton}
                dict={commonDict}
              />
            </div>
          </AnimatedElement>
        </div>
      </div>

      <MessengerWidget />
    </section>
  )
}
