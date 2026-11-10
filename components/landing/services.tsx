"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight } from "@/components/icons"
import { ContactFormDialog } from "@/components/contact-form-dialog"

export default function Services({ dict = {}, commonDict = {}, lang = 'ua' }: { dict?: any; commonDict?: any; lang?: string }) {
  if (!dict || typeof dict !== 'object') {
    console.error("Services received invalid dict:", dict)
    return null
  }
  
  // Проверяем есть ли необходимые данные для рендеринга
  if (!Array.isArray(dict.services) || dict.services.length === 0) {
    console.warn("Services array is empty or invalid:", dict.services)
    return null
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
          {dict.services.map((service: any, index: number) => (
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
                <ContactFormDialog
                  trigger={
                    <Button variant="outline" className="w-full group">
                      Залишити заявку
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  }
                  title={service.title}
                  description="Залиште контактні дані, і наш спеціаліст зв'яжеться з вами протягом робочого дня"
                  formType={`service_${index + 1}`}
                  buttonText="Відправити"
                  dict={commonDict}
                />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
} 