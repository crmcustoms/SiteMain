"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { BookingFormData, TimeSlot } from "@/lib/booking-types"
import { formatDateDisplay, validatePhone } from "@/lib/booking-utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Calendar, Clock, User, Mail, Phone, MessageSquare } from "lucide-react"

const bookingFormSchema = z.object({
  name: z.string().min(2, "Ім'я повинно містити мінімум 2 символи"),
  email: z.string().email("Введіть коректну email адресу"),
  phone: z.string().refine(validatePhone, "Введіть коректний номер телефону"),
  notes: z.string().optional()
})

interface BookingFormProps {
  selectedDate: Date
  selectedSlot: TimeSlot
  onSubmit: (data: BookingFormData) => Promise<void>
  onBack: () => void
  isSubmitting?: boolean
}

export function BookingForm({
  selectedDate,
  selectedSlot,
  onSubmit,
  onBack,
  isSubmitting = false
}: BookingFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema)
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

  const handleFormSubmit = async (data: BookingFormData) => {
    await onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Вибрані дата і час */}
      <div className="bg-primary/5 rounded-lg p-4 space-y-2">
        <h3 className="font-semibold">Ви обрали:</h3>
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-primary" />
          <span>{formatDateDisplay(selectedDate)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-primary" />
          <span>{selectedSlot.displayTime}</span>
        </div>
      </div>

      {/* Форма */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Ваше ім'я *
          </Label>
          <Input
            id="name"
            placeholder="Іван Петренко"
            {...register("name")}
            disabled={isSubmitting}
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email *
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="ivan@example.com"
            {...register("email")}
            disabled={isSubmitting}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            Телефон *
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+380 67 123 45 67"
            inputMode="tel"
            {...register("phone", {
              onChange: (e) => setValue("phone", formatPhone(e.target.value), { shouldValidate: true })
            })}
            disabled={isSubmitting}
          />
          {errors.phone && (
            <p className="text-sm text-destructive">{errors.phone.message}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Формат: +380 67 123 45 67
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Коментар (необов'язково)
          </Label>
          <Textarea
            id="notes"
            placeholder="Розкажіть, що саме ви хочете обговорити..."
            rows={3}
            {...register("notes")}
            disabled={isSubmitting}
          />
          {errors.notes && (
            <p className="text-sm text-destructive">{errors.notes.message}</p>
          )}
        </div>
      </div>

      {/* Кнопки */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isSubmitting}
          className="flex-1"
        >
          Назад
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Бронюємо...
            </>
          ) : (
            'Забронювати'
          )}
        </Button>
      </div>

      {/* Примітка */}
      <p className="text-xs text-muted-foreground text-center">
        Після бронювання ми зв'яжемося з вами для підтвердження
      </p>
      <p className="text-xs text-muted-foreground text-center">
        Без спаму — тільки по справі.
      </p>
    </form>
  )
}
