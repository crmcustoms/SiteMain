"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

interface FaqItem {
  question: string;
  answer?: string;
}

interface ServicesFaqProps {
  title?: string;
  subtitle?: string;
  items: FaqItem[];
}

export default function ServicesFaq({ title = "Відповіді на часті запитання", subtitle = "Знайдіть відповіді на найпоширеніші запитання про наші послуги.", items = [] }: ServicesFaqProps) {
  const [openItem, setOpenItem] = useState<number | null>(null);
  
  const handleToggle = (index: number) => {
    setOpenItem(openItem === index ? null : index);
  };

  return (
    <section className="w-full py-12 bg-white">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">{title}</h2>
          <p className="text-gray-600 max-w-[800px]">{subtitle}</p>
        </div>
        
        <div className="mx-auto max-w-3xl">
          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="border rounded-md overflow-hidden">
                <button
                  onClick={() => handleToggle(index)}
                  className="w-full p-4 text-left flex justify-between items-center hover:bg-gray-50"
                >
                  <span className="font-medium">{item.question}</span>
                  <span>{openItem === index ? '▼' : '▶'}</span>
                </button>
                {openItem === index && (
                  <div className="p-4 bg-gray-50 border-t">{item.answer || "Відповідь на це питання буде додана найближчим часом."}</div>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-8 text-center">
            <Button className="bg-amber text-black hover:bg-amber-hover">
              Поставити своє запитання
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
} 