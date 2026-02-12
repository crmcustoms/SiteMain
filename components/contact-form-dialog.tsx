"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { submitForm } from "@/lib/actions"
import { useToast } from "@/hooks/use-toast"

interface ContactFormDialogProps {
  trigger: React.ReactNode
  title: string
  description: string
  formType?: string
  buttonText: string
  dict: any
}

export function ContactFormDialog({
  trigger,
  title,
  description,
  formType = "contact",
  buttonText,
  dict,
}: ContactFormDialogProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  })

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "")
    if (!digits) return ""
    if (digits.startsWith("380")) {
      const rest = digits.slice(3)
      const parts = [
        rest.slice(0, 2),
        rest.slice(2, 5),
        rest.slice(5, 7),
        rest.slice(7, 9),
      ].filter(Boolean)
      return `+380 ${parts.join(" ")}`
    }
    return `+${digits}`
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    if (name === "phone") {
      setFormData((prev) => ({ ...prev, phone: formatPhone(value) }))
      return
    }
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formDataObj = new FormData()
      formDataObj.append("name", formData.name)
      formDataObj.append("email", formData.email)
      formDataObj.append("phone", formData.phone || "")
      formDataObj.append("message", formData.message || "")
      formDataObj.append("formType", formType)

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
          message: "",
        })
        // Закриваємо діалог
        setOpen(false)
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="text-xs text-black/60">
          Відповідаємо за 5–15 хв
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">{dict?.form?.nameLabel || "Ім'я"}</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder={dict?.form?.namePlaceholder || "Введіть ваше ім'я"}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{dict?.form?.emailLabel || "Email"}</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={dict?.form?.emailPlaceholder || "Введіть ваш email"}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">{dict?.form?.phoneLabel || "Телефон"}</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder={dict?.form?.phonePlaceholder || "+380 67 123 45 67"}
              inputMode="tel"
            />
            <p className="text-xs text-black/50">Формат: +380 67 123 45 67</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">{dict?.form?.messageLabel || "Повідомлення"}</Label>
            <Textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder={dict?.form?.messagePlaceholder || "Введіть ваше повідомлення"}
              rows={4}
            />
          </div>
          <Button type="submit" className="w-full bg-amber hover:bg-amber-hover text-black" disabled={isSubmitting}>
            {isSubmitting ? "Відправка..." : buttonText}
          </Button>
          <p className="text-xs text-black/50 text-center">Без спаму — тільки по справі.</p>
        </form>
      </DialogContent>
    </Dialog>
  )
}
