"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { ContactFormDialog } from "@/components/contact-form-dialog"
import { useState } from "react"

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export default function Faq({ dict, commonDict }: { dict: any; commonDict: any }) {
  const [openItem, setOpenItem] = useState<string | null>(null);
  
  const faqs = dict.items.map((item: any, index: number) => ({
    id: `item-${index}`,
    question: item.question,
    answer: item.answer,
  }))
  
  const handleToggle = (value: string) => {
    setOpenItem(openItem === value ? null : value);
  };

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
        <div className="mx-auto max-w-3xl mt-8">
          <div className="space-y-4">
            {faqs.map((faq: FaqItem) => (
              <div key={faq.id} className="border rounded-md overflow-hidden">
                <button
                  onClick={() => handleToggle(faq.id)}
                  className="w-full p-4 text-left flex justify-between items-center bg-white hover:bg-gray-50"
                >
                  <span className="font-medium">{faq.question}</span>
                  <span>{openItem === faq.id ? '▼' : '▶'}</span>
                </button>
                {openItem === faq.id && (
                  <div className="p-4 bg-gray-50 border-t">{faq.answer}</div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <ContactFormDialog
              trigger={<Button className="bg-amber text-black hover:bg-amber-hover">{dict.ctaButton || "Поставити своє запитання"}</Button>}
              title={commonDict.form.questionFormTitle}
              description={commonDict.form.questionFormDescription}
              formType="faq_question"
              buttonText={commonDict.form.submitButton}
              dict={commonDict}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
