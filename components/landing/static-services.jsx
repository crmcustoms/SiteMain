"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight } from "@/components/icons/arrow-icons"
import { ContactFormDialog } from "@/components/contact-form-dialog"

export default function StaticServices({ dict, commonDict }) {
  // Защита от передачи неопределенных данных
  if (!dict || !dict.services) {
    return (
      <section id="services" className="w-full py-12 md:py-24 lg:py-32 bg-background">
        <div className="container px-4 md:px-6 text-center">
          Загрузка услуг...
        </div>
      </section>
    )
  }

  const services = dict.services || []
  
  // Определяем URL для каждого сервиса
  const getServiceUrl = (index) => {
    const serviceMap = {
      0: 'audit-crm',
      1: 'implementation-crm',
      2: 'support-crm',
      3: 'custom-development',
      4: 'project-management',
      5: 'industry-solutions'
    }
    
    const slug = serviceMap[index] || `service-${index + 1}`
    return `/landing/${slug}`
  }

  return (
    <section id="services" className="w-full py-12 md:py-24 lg:py-32 bg-background">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">{dict.title || "Наши услуги"}</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              {dict.subtitle || "Мы предлагаем комплексные решения для автоматизации вашего бизнеса"}
            </p>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
          {services.map((service, index) => (
            <Card key={index} className="flex flex-col h-full relative overflow-hidden">
              <div className="absolute right-0 bottom-0 opacity-15 text-[200px] font-bold leading-none text-amber -mr-8 -mb-8">
                {index + 1}
              </div>
              <CardHeader>
                <CardTitle className="text-xl">{service.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground mb-6">{service.description}</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-auto">
                  {service.price && (
                    <div>
                      <p className="text-xs text-muted-foreground">{dict.priceLabel || "Стоимость"}</p>
                      <p className="font-semibold">{service.price}</p>
                    </div>
                  )}
                  {service.term && (
                    <div>
                      <p className="text-xs text-muted-foreground">{dict.termLabel || "Срок"}</p>
                      <p className="font-semibold">{service.term}</p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Link href={getServiceUrl(index)} passHref className="w-full">
                  <Button variant="outline" className="w-full group">
                    {dict.detailsButtonText || "Подробнее"}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
} 