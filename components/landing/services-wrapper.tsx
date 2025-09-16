"use client"

import dynamic from "next/dynamic"

// Используем ssr: false в клиентском компоненте - это разрешено
const ServicesComponent = dynamic(() => import("@/components/landing/services"), {
  ssr: false,
  loading: () => <div className="w-full py-24 text-center">Загрузка услуг...</div>
})

export default function ServicesWrapper({ dict, commonDict }: { dict: any; commonDict: any }) {
  // Просто передаем пропсы дальше
  return <ServicesComponent dict={dict} commonDict={commonDict} />
} 