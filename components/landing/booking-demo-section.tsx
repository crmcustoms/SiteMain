"use client"

import { BookingButton } from "@/components/booking-button"
import { Calendar, Clock, CheckCircle } from "lucide-react"

export default function BookingDemoSection() {
  return (
    <section className="w-full py-16 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5">
      <div className="container px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Заголовок */}
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tighter">
              Готові обговорити ваш проєкт?
            </h2>
            <p className="text-xl text-muted-foreground">
              Оберіть зручний час для безкоштовної консультації
            </p>
          </div>

          {/* Переваги */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8">
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold">Зручний час</h3>
              <p className="text-sm text-muted-foreground">
                Оберіть будь-який вільний слот
              </p>
            </div>

            <div className="flex flex-col items-center gap-2 text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold">30 хвилин</h3>
              <p className="text-sm text-muted-foreground">
                Достатньо для обговорення ідей
              </p>
            </div>

            <div className="flex flex-col items-center gap-2 text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold">Google Meet</h3>
              <p className="text-sm text-muted-foreground">
                Посилання одразу на email
              </p>
            </div>
          </div>

          {/* Кнопка */}
          <div className="flex justify-center">
            <BookingButton size="lg" className="text-lg px-8 py-6 h-auto">
              Записатися на консультацію
            </BookingButton>
          </div>

          {/* Примітка */}
          <p className="text-sm text-muted-foreground">
            Це демо версія системи бронювання. Для роботи потрібно налаштувати n8n workflows.
          </p>
        </div>
      </div>
    </section>
  )
}
