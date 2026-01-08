"use client"

import Image from "next/image"

const logos = [
  { id: 1, src: "/images/logo_servises/2.png", alt: "Logo 1" },
  { id: 2, src: "/images/logo_servises/5.png", alt: "Logo 2" },
  { id: 3, src: "/images/logo_servises/6.png", alt: "Logo 3" },
  { id: 4, src: "/images/logo_servises/7.png", alt: "Logo 4" },
  { id: 5, src: "/images/logo_servises/9.png", alt: "Logo 5" },
  { id: 6, src: "/images/logo_servises/10.png", alt: "Logo 6" },
  { id: 7, src: "/images/logo_servises/11.png", alt: "Logo 7" },
  { id: 8, src: "/images/logo_servises/13.png", alt: "Logo 8" },
  { id: 9, src: "/images/logo_servises/14.png", alt: "Logo 9" },
  { id: 10, src: "/images/logo_servises/21.png", alt: "Logo 10" },
  { id: 11, src: "/images/logo_servises/24.png", alt: "Logo 11" },
]

export default function LogosCarousel() {

  // Дублируем логотипы для бесконечной карусели
  const duplicatedLogos = [...logos, ...logos, ...logos]

  return (
    <section className="w-full py-8 bg-white border-b border-black/5">
      <div className="w-full overflow-hidden">
        <style>{`
          @keyframes scroll {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-${logos.length * 140}px);
            }
          }

          .logos-track {
            display: flex;
            gap: 0;
            animation: scroll 30s linear infinite;
          }

          .logos-track:hover {
            animation-play-state: paused;
          }

          .logo-item {
            flex: 0 0 140px;
            height: 80px;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0;
          }

          .logo-item img {
            filter: grayscale(100%);
            opacity: 0.7;
            transition: filter 0.3s ease, opacity 0.3s ease;
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
          }

          .logo-item:hover img {
            filter: grayscale(0%);
            opacity: 1;
          }
        `}</style>

        <div className="logos-track">
          {duplicatedLogos.map((logo, index) => (
            <div key={`${logo.id}-${index}`} className="logo-item">
              <Image
                src={logo.src}
                alt={logo.alt}
                width={120}
                height={60}
                className="object-contain"
                draggable={false}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
