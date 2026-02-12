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
import { submitForm } from "@/lib/actions"
import { useToast } from "@/hooks/use-toast"

interface CallbackFormDialogProps {
  trigger: React.ReactNode
  title: string
  description: string
  formType?: string
  buttonText: string
}

export function CallbackFormDialog({
  trigger,
  title,
  description,
  formType = "contact",
  buttonText,
}: CallbackFormDialogProps) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
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
      formDataObj.append("phone", formData.phone)
      formDataObj.append("formType", formType)

      const result = await submitForm(formDataObj)

      if (result.success) {
        toast({
          title: "Успішно!",
          description: result.message,
          variant: "default",
        })
        setFormData({ name: "", phone: "" })
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
        description: "Сталася помилка при відправці. Спробуйте пізніше.",
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
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Ім'я</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ваше ім'я"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Телефон</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+380"
              required
            />
          </div>
          <Button type="submit" className="w-full bg-amber hover:bg-amber-hover text-black" disabled={isSubmitting}>
            {isSubmitting ? "Відправка..." : buttonText}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

