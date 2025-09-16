"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"

export default function Industries({ dict }: { dict: any }) {
  const industries = [
    {
      image: "/images/logistics.jpg",
      title: dict.industries[0].title,
      description: dict.industries[0].description,
    },
    {
      image: "/images/retail.jpg",
      title: dict.industries[1].title,
      description: dict.industries[1].description,
    },
    {
      image: "/images/manufacturing.jpg",
      title: dict.industries[2].title,
      description: dict.industries[2].description,
    },
    {
      image: "/images/services.jpg",
      title: dict.industries[3].title,
      description: dict.industries[3].description,
    },
    {
      image: "/images/realestate.jpg",
      title: dict.industries[4].title,
      description: dict.industries[4].description,
    },
    {
      image: "/images/windows.jpg",
      title: dict.industries[5]?.title || "Віконна промисловість",
      description: dict.industries[5]?.description || "Віконна промисловість, виготовлення ролет, дверей усе шо пов'язано вікнами та супутніми товарами.",
    },
  ]

  // Состояние для отслеживания ошибок загрузки изображений
  const [imageErrors, setImageErrors] = useState<{[key: string]: boolean}>({})

  // Обработчик ошибки загрузки изображения
  const handleImageError = (index: number) => {
    setImageErrors(prev => ({...prev, [index]: true}))
  }

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">{dict.title}</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              {dict.subtitle}
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8 mt-8">
          {industries.map((industry, index) => (
            <Card key={index} className="overflow-hidden">
              {imageErrors[index] ? (
                <div className="w-full h-40 bg-gray-200 flex items-center justify-center text-gray-500">
                  {industry.title}
                </div>
              ) : (
                <img
                src={industry.image || "/placeholder.svg"}
                alt={industry.title}
                className="w-full object-cover h-40"
                  onError={() => handleImageError(index)}
              />
              )}
              <CardHeader className="p-4">
                <CardTitle className="text-lg">{industry.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <CardDescription>{industry.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
