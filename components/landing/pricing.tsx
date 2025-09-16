"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"
import { ContactFormDialog } from "@/components/contact-form-dialog"

export default function Pricing({ dict, commonDict }: { dict: any; commonDict: any }) {
  const plans = [
    {
      name: dict.plans[0].name,
      price: dict.plans[0].price,
      description: dict.plans[0].description,
      features: dict.plans[0].features,
    },
    {
      name: dict.plans[1].name,
      price: dict.plans[1].price,
      description: dict.plans[1].description,
      features: dict.plans[1].features,
      popular: true,
    },
    {
      name: dict.plans[2].name,
      price: dict.plans[2].price,
      description: dict.plans[2].description,
      features: dict.plans[2].features,
    },
  ]

  return (
    <section id="pricing" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">{dict.title}</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              {dict.subtitle}
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8 mt-8">
          {plans.map((plan, index) => (
            <Card key={index} className={`flex flex-col ${plan.popular ? "border-amber shadow-lg" : ""}`}>
              {plan.popular && (
                <div className="bg-amber text-black text-center py-1 text-sm font-medium">{dict.popularLabel}</div>
              )}
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <div className="mt-4 text-4xl font-bold">{plan.price}</div>
                <CardDescription className="mt-2">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-2">
                  {plan.features.map((feature: string, i: number) => (
                    <li key={i} className="flex items-center">
                      <Check className="mr-2 h-4 w-4 text-amber" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <ContactFormDialog
                  trigger={
                    <Button className={`w-full ${plan.popular ? "bg-amber hover:bg-amber-hover text-black" : ""}`}>
                      {dict.ctaButton}
                    </Button>
                  }
                  title={commonDict.form.pricingFormTitle}
                  description={commonDict.form.pricingFormDescription}
                  formType={`pricing_${plan.name.toLowerCase()}`}
                  buttonText={commonDict.form.submitButton}
                  dict={commonDict}
                />
              </CardFooter>
            </Card>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Button variant="link" className="text-amber hover:text-amber-hover">
            {dict.compareLink}
          </Button>
        </div>
      </div>
    </section>
  )
}
