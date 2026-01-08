"use client"

import { useEffect, useState } from "react"

interface Particle {
  id: number
  left: number
  top: number
  delay: number
  duration: number
  isYellow: boolean
}

export function FloatingParticles() {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    const newParticles: Particle[] = []
    for (let i = 0; i < 30; i++) {
      newParticles.push({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        delay: Math.random() * 15,
        duration: 10 + Math.random() * 10,
        isYellow: Math.random() > 0.5,
      })
    }
    setParticles(newParticles)
  }, [])

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-[3px] h-[3px] rounded-full animate-float"
          style={{
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            backgroundColor: particle.isYellow ? "#FFD700" : "#000000",
            opacity: 0.3,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
          }}
        />
      ))}

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translate(0, 0);
            opacity: 0.3;
          }
          25% {
            transform: translate(10px, -10px);
            opacity: 0.8;
          }
          50% {
            transform: translate(-5px, -20px);
            opacity: 0.5;
          }
          75% {
            transform: translate(-15px, -10px);
            opacity: 0.8;
          }
        }
        
        .animate-float {
          animation: float linear infinite;
        }
      `}</style>
    </div>
  )
}
