import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Settings, Users, LifeBuoy } from "@/components/icons"

export default function WhyChooseUs({ dict }: { dict: any }) {
  const reasons = [
    {
      icon: <Settings className="h-10 w-10 text-amber" />,
      title: dict.reasons[0].title,
      description: dict.reasons[0].description,
    },
    {
      icon: <Users className="h-10 w-10 text-amber" />,
      title: dict.reasons[1].title,
      description: dict.reasons[1].description,
    },
    {
      icon: <LifeBuoy className="h-10 w-10 text-amber" />,
      title: dict.reasons[2].title,
      description: dict.reasons[2].description,
    },
  ]

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
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 lg:gap-12 mt-8">
          {reasons.map((reason, index) => (
            <Card key={index} className="text-center">
              <CardHeader className="pb-2">
                <div className="flex justify-center mb-2">{reason.icon}</div>
                <CardTitle>{reason.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{reason.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
