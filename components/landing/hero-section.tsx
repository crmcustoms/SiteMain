"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Facebook, Youtube, Send, MessageSquare, CheckCircle } from "@/components/icons"
import { AnimatedElement } from "@/components/ui/animated-element"
import { ContactFormDialog } from "@/components/contact-form-dialog"
import { useState, useEffect } from "react"

export default function HeroSection({ dict, commonDict }: { dict: any; commonDict: any }) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [imageError, setImageError] = useState(false)

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

  useEffect(() => {
    const handleScroll = () => {
      // Проверяем, прокручена ли страница ниже высоты экрана (главной секции)
      const scrolled = window.scrollY > window.innerHeight - 100
      setIsScrolled(scrolled)
    }

    // Добавляем обработчик события скролла
    window.addEventListener('scroll', handleScroll)
    
    // Вызываем обработчик при монтировании для инициализации состояния
    handleScroll()

    // Удаляем обработчик при размонтировании компонента
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <section className="w-full h-screen relative overflow-hidden font-montserrat">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        {imageError ? (
          <div className="w-full h-full bg-gray-800"></div>
        ) : (
          <>
            <img
              src="/images/hero.png"
              alt="Футуристичний робот ШІ"
              className="object-cover object-center brightness-75 w-full h-full"
              onError={() => setImageError(true)}
            />
            <div className="absolute inset-0 bg-black/10 bg-gradient-to-r from-black/20 to-transparent"></div>
          </>
        )}
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

      {/* Logo Carousel - Full width layer */}
      <div className="absolute inset-0 z-5 flex items-start justify-center pt-20 pointer-events-none w-screen">
        <style>{`
          @keyframes scroll {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }
          .carousel-scroll {
            animation: scroll 40s linear infinite;
          }
          .carousel-scroll:hover {
            animation-play-state: paused;
          }
        `}</style>

        <div className="w-screen pointer-events-auto">
          <AnimatedElement delay={0}>
            <div className="overflow-hidden bg-transparent py-4">
              <div className="carousel-scroll flex gap-6 justify-center">
                {/* First set of logos */}
                {logos.map((logo) => (
                  <div key={`carousel-${logo.id}`} className="flex-shrink-0 w-32 h-16 flex items-center justify-center">
                    <div className="flex h-16 w-32 items-center justify-center rounded-lg border-2 border-gray-300 bg-white p-2 hover:border-amber hover:shadow-md transition-all">
                      <img
                        src={logo.src}
                        alt={logo.name}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  </div>
                ))}

                {/* Duplicate set for continuous scroll */}
                {logos.map((logo) => (
                  <div key={`carousel-dup-${logo.id}`} className="flex-shrink-0 w-32 h-16 flex items-center justify-center">
                    <div className="flex h-16 w-32 items-center justify-center rounded-lg border-2 border-gray-300 bg-white p-2 hover:border-amber hover:shadow-md transition-all">
                      <img
                        src={logo.src}
                        alt={logo.name}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedElement>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 md:px-6 h-full flex items-center">
        <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row gap-8 pt-16">
          <div className="w-full md:w-1/2">
            <AnimatedElement delay={100}>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                Розробка та впровадження <span className="text-amber">CRM</span> під задачі вашого бізнесу
              </h1>
            </AnimatedElement>

            <AnimatedElement delay={300}>
              <p className="text-white text-lg mb-8 max-w-2xl">
                Автоматизуємо ваш бізнес за допомогою сучасних CRM-рішень, розроблених спеціально під ваші потреби
              </p>
            </AnimatedElement>

            <AnimatedElement delay={500}>
              <div className="flex flex-col sm:flex-row gap-4">
                <ContactFormDialog
                  trigger={
                    <Button className="bg-amber hover:bg-amber-hover text-black px-8 py-6 text-lg">
                      {dict.ctaButton}
                    </Button>
                  }
                  title={commonDict.form.auditFormTitle}
                  description={commonDict.form.auditFormDescription}
                  formType="hero_audit"
                  buttonText={commonDict.form.submitButton}
                  dict={commonDict}
                />
              </div>
            </AnimatedElement>
          </div>

          <div className="w-full md:w-1/2 mt-8 md:mt-0">
            <ul className="space-y-4">
              {[0, 1, 2, 3, 4].map((index) => (
                <AnimatedElement key={index} delay={700 + index * 100}>
                  <li className="flex items-center text-white">
                    <CheckCircle className="h-6 w-6 mr-3 text-amber flex-shrink-0" />
                    <span className="text-lg">
                      {index === 0 && "Підберем CRM та навчим персонал"}
                      {index === 1 && "Впровадимо штучний інтелект в процесси"}
                      {index === 2 && "Налагодим аналітику"}
                      {index === 3 && "Розробимо додаток для бізнесу"}
                      {index === 4 && "Зробимо усі потрібні інтеграції"}
                    </span>
                  </li>
                </AnimatedElement>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
