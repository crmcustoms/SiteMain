import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight } from "@/components/icons"

export default function CaseStudies({ dict }: { dict: any }) {
  // Значения по умолчанию для текста на украинском языке
  const defaultTexts = {
    title: "Історії успіху наших клієнтів",
    subtitle: "Дізнайтеся, як наші рішення допомогли реальним бізнесам досягти успіху.",
    problemLabel: "Проблема",
    solutionLabel: "Рішення",
    resultLabel: "Результат",
    ctaButton: "Дізнатися більше"
  };
  
  const caseStudies = [
    {
      image: "/images/landings/industry-solutions/industry.jpg",
      title: "Будівельна компанія 'Фундамент'",
      industry: "Будівництво",
      problem: "Складнощі з відстеженням проєктів та координацією роботи бригад.",
      solution: "Впровадження комплексної системи управління проєктами.",
      result: "Скорочення термінів будівництва на 20% та зниження витрат на 15%.",
      link: "/ua/cases"
    },
    {
      image: "/images/landings/industry-solutions/furniture.jpg",
      title: "Меблева компанія ВМКК",
      industry: "Виробництво",
      problem: "Менеджери вручну контролювали роботу аутсорсингових збирачів меблів через дзвінки та Viber.",
      solution: "Інтегрована Airtable-форма для звітів збирачів, що працює безпосередньо з CRM-системою.",
      result: "100% замовлень мають фото-звіт, економія 1,5 години щодня для кожного менеджера.",
      link: "/uk/cases/avtomatyzatsiya-zayavok-na-zbirku-zvitnist-pidryadnyky"
    },
    {
      image: "/images/case-studies/pr-agency.jpg",
      title: "PR-компанія ITComms",
      industry: "IT та технології",
      problem: "Витрати фіксувалися вручну, часто постфактум. Угоди перевищували бюджет без відома керівника.",
      solution: "Автоматизована система на базі CRM, завдань та Google Таблиць, що об'єднує управління витратами.",
      result: "Прозорі витрати, автоматичні звіти, зниження перевищення бюджету на 70%.",
      link: "/ua/cases/avtomatyzatsiya-kontrolyu-vytrat-u-proekti"
    },
  ]

  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              {dict?.title || defaultTexts.title}
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              {dict?.subtitle || defaultTexts.subtitle}
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 lg:gap-12 mt-8">
          {caseStudies.map((caseStudy, index) => (
            <Card key={index} className="flex flex-col">
              <div className="relative h-48 w-full">
                <Image
                  src={caseStudy.image}
                  alt={caseStudy.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                />
              </div>
              <CardHeader>
                <CardTitle>{caseStudy.title}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">{caseStudy.industry}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-2">
                  <div>
                    <span className="font-semibold">{dict?.problemLabel || defaultTexts.problemLabel}: </span>
                    <CardDescription className="inline">{caseStudy.problem}</CardDescription>
                  </div>
                  <div>
                    <span className="font-semibold">{dict?.solutionLabel || defaultTexts.solutionLabel}: </span>
                    <CardDescription className="inline">{caseStudy.solution}</CardDescription>
                  </div>
                  <div>
                    <span className="font-semibold">{dict?.resultLabel || defaultTexts.resultLabel}: </span>
                    <CardDescription className="inline">{caseStudy.result}</CardDescription>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Link href={caseStudy.link} passHref className="w-full">
                  <Button variant="ghost" className="w-full justify-between">
                    {dict?.ctaButton || defaultTexts.ctaButton} <ArrowRight className="h-4 w-4 ml-2" />
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
