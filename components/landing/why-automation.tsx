import { AlertTriangle, Clock, Users, CheckCircle2 } from "@/components/icons"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function WhyAutomation({ dict }: { dict: any }) {
  const items = [
    {
      icon: <AlertTriangle className="h-10 w-10 text-amber" />,
      title: dict.items[0].title,
      description: dict.items[0].description,
      solution: dict.items[0].solution,
    },
    {
      icon: <Clock className="h-10 w-10 text-amber" />,
      title: dict.items[1].title,
      description: dict.items[1].description,
      solution: dict.items[1].solution,
    },
    {
      icon: <Users className="h-10 w-10 text-amber" />,
      title: dict.items[2].title,
      description: dict.items[2].description,
      solution: dict.items[2].solution,
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
          {items.map((item, index) => (
            <Card key={index} className="border-2 border-muted">
              <CardHeader className="pb-2">
                <div className="mb-2">{item.icon}</div>
                <CardTitle>{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base mb-4">{item.description}</CardDescription>
                <div className="flex items-start gap-2 bg-muted p-3 rounded-md">
                  <CheckCircle2 className="h-5 w-5 text-amber mt-0.5 flex-shrink-0" />
                  <p className="text-sm font-medium">
                    <span className="text-amber font-semibold">Рішення:</span> {item.solution}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
