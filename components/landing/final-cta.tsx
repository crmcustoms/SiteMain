"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { submitForm } from "@/lib/actions"
import { useToast } from "@/hooks/use-toast"
import { ContactFormDialog } from "@/components/contact-form-dialog"

export default function FinalCta({ dict, commonDict }: { dict: any; commonDict: any }) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formDataObj = new FormData()
      formDataObj.append("name", formData.name)
      formDataObj.append("email", formData.email)
      formDataObj.append("phone", formData.phone)
      formDataObj.append("formType", "contact")

      const result = await submitForm(formDataObj)

      if (result.success) {
        toast({
          title: "Успішно!",
          description: result.message,
          variant: "default",
        })
        // Очищаємо форму після успішної відправки
        setFormData({
          name: "",
          email: "",
          phone: "",
        })
      } else {
        toast({
          title: "Помилка!",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Помилка відправки форми:", error)
      toast({
        title: "Помилка!",
        description: "Сталася помилка при відправці форми. Спробуйте пізніше.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Проверяем наличие необходимых полей в dict.form с резервными значениями
  const formLabels = {
    nameLabel: dict?.form?.nameLabel || "Ім'я",
    namePlaceholder: dict?.form?.namePlaceholder || "Введіть ваше ім'я",
    emailLabel: dict?.form?.emailLabel || "Email",
    emailPlaceholder: dict?.form?.emailPlaceholder || "Введіть ваш email",
    phoneLabel: dict?.form?.phoneLabel || "Телефон",
    phonePlaceholder: dict?.form?.phonePlaceholder || "Введіть ваш телефон",
    submitButton: dict?.form?.submitButton || "Відправити"
  }

  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">{dict.title}</h2>
              <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                {dict.subtitle}
              </p>
            </div>
            <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-2">
              <div className="space-y-1">
                <Label htmlFor="name">{formLabels.nameLabel}</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={formLabels.namePlaceholder}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="email">{formLabels.emailLabel}</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={formLabels.emailPlaceholder}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="phone">{formLabels.phoneLabel}</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder={formLabels.phonePlaceholder}
                />
              </div>
              <Button type="submit" className="w-full bg-amber hover:bg-amber-hover text-black" disabled={isSubmitting}>
                {isSubmitting ? "Відправка..." : formLabels.submitButton}
              </Button>
            </form>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <ContactFormDialog
                trigger={<Button variant="outline">{dict.auditButton}</Button>}
                title={commonDict.form.auditFormTitle}
                description={commonDict.form.auditFormDescription}
                formType="final_audit"
                buttonText={commonDict.form.submitButton}
                dict={commonDict}
              />
              <ContactFormDialog
                trigger={<Button variant="outline">{dict.consultationButton}</Button>}
                title={commonDict.form.consultationFormTitle}
                description={commonDict.form.consultationFormDescription}
                formType="final_consultation"
                buttonText={commonDict.form.submitButton}
                dict={commonDict}
              />
            </div>
          </div>
          <div className="flex items-center justify-center">
            <Image
              src="/images/landings/common/happy-employees-crm.jpg"
              alt="Задоволені співробітники з системою автоматизації"
              width={600}
              height={400}
              className="rounded-lg object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
