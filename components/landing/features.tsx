"use client"

import { Users, BarChart3, Workflow, Link2 } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { ContactFormDialog } from "@/components/contact-form-dialog"

export default function Features({ dict, commonDict }: { dict: any; commonDict: any }) {
  const features = [
    {
      icon: <Users className="h-12 w-12 text-amber" />,
      title: dict.features[0].title,
      description: dict.features[0].description,
    },
    {
      icon: <BarChart3 className="h-12 w-12 text-amber" />,
      title: dict.features[1].title,
      description: dict.features[1].description,
    },
    {
      icon: <Workflow className="h-12 w-12 text-amber" />,
      title: dict.features[2].title,
      description: dict.features[2].description,
    },
    {
      icon: <Link2 className="h-12 w-12 text-amber" />,
      title: dict.features[3].title,
      description: dict.features[3].description,
    },
  ]

  return (
    <section id="features" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">{dict.title}</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              {dict.subtitle}
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:gap-12 mt-8">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col items-center space-y-2 rounded-lg border p-4 text-center">
              <div className="p-2">{feature.icon}</div>
              <h3 className="text-xl font-bold">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-8">
          <ContactFormDialog
            trigger={<Button className="bg-amber hover:bg-amber-hover text-black">{dict.ctaButton}</Button>}
            title={commonDict.form.featuresFormTitle}
            description={commonDict.form.featuresFormDescription}
            formType="features_inquiry"
            buttonText={commonDict.form.submitButton}
            dict={commonDict}
          />
        </div>
      </div>
    </section>
  )
}
