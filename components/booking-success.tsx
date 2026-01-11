"use client"

import { TimeSlot, BookingFormData } from "@/lib/booking-types"
import { formatDateDisplay, generateICSFile, downloadICSFile } from "@/lib/booking-utils"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Calendar, Clock, Mail, Download } from "lucide-react"

interface BookingSuccessProps {
  selectedDate: Date
  selectedSlot: TimeSlot
  formData: BookingFormData
  onClose: () => void
}

export function BookingSuccess({
  selectedDate,
  selectedSlot,
  formData,
  onClose
}: BookingSuccessProps) {
  const handleDownloadICS = () => {
    const icsContent = generateICSFile(
      selectedSlot.datetime,
      selectedSlot.endDatetime,
      'Консультація - CRM Customs',
      `Консультація з ${formData.name}\n\nEmail: ${formData.email}\nТелефон: ${formData.phone}\n\n${formData.notes ? `Коментар: ${formData.notes}` : ''}`,
      'Online (посилання буде в email)'
    )
    
    downloadICSFile(icsContent, `consultation-${selectedDate.toISOString().split('T')[0]}.ics`)
  }

  return (
    <div className="space-y-6 text-center py-4">
      {/* Іконка успіху */}
      <div className="flex justify-center">
        <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-4">
          <CheckCircle2 className="w-16 h-16 text-green-600 dark:text-green-400" />
        </div>
      </div>

      {/* Заголовок */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Чудово! Консультацію заброньовано</h2>
        <p className="text-muted-foreground">
          Підтвердження надіслано на ваш email
        </p>
      </div>

      {/* Деталі бронювання */}
      <div className="bg-muted/50 rounded-lg p-6 space-y-4 text-left">
        <div className="flex items-start gap-3">
          <Calendar className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <p className="font-semibold">Дата</p>
            <p className="text-muted-foreground">{formatDateDisplay(selectedDate)}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Clock className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <p className="font-semibold">Час</p>
            <p className="text-muted-foreground">{selectedSlot.displayTime} (30 хвилин)</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Mail className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <p className="font-semibold">Email</p>
            <p className="text-muted-foreground">{formData.email}</p>
          </div>
        </div>
      </div>

      {/* Додаткова інформація */}
      <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-sm">
        <p className="text-blue-900 dark:text-blue-100">
          <strong>📧 Перевірте свою пошту</strong>
        </p>
        <p className="text-blue-700 dark:text-blue-300 mt-1">
          Ми надіслали лист з підтвердженням та посиланням на відеодзвінок (Google Meet)
        </p>
      </div>

      {/* Кнопки */}
      <div className="space-y-3">
        <Button
          onClick={handleDownloadICS}
          variant="outline"
          className="w-full"
          size="lg"
        >
          <Download className="w-4 h-4 mr-2" />
          Додати в календар (.ics)
        </Button>
        
        <Button
          onClick={onClose}
          className="w-full"
          size="lg"
        >
          Готово
        </Button>
      </div>

      {/* Примітка */}
      <p className="text-xs text-muted-foreground">
        Потрібно перенести або скасувати? Зв'яжіться з нами відповівши на email з підтвердженням
      </p>
    </div>
  )
}
