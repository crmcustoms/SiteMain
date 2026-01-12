"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { BookingCalendar } from "./booking-calendar"
import { BookingTimeSlots } from "./booking-time-slots"
import { BookingForm } from "./booking-form"
import { BookingSuccess } from "./booking-success"
import { BookingProgress } from "./booking-progress"
import {
  BookingStep,
  TimeSlot,
  BookingFormData,
  SlotsByDate
} from "@/lib/booking-types"
import { getDateRange, getSlotsForDate, getNextAvailableDate } from "@/lib/booking-utils"
import { format } from "date-fns"
import { toast } from "sonner"
import { AlertCircle } from "lucide-react"

interface BookingModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BookingModal({ open, onOpenChange }: BookingModalProps) {
  const [step, setStep] = useState<BookingStep>('date')
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [formData, setFormData] = useState<BookingFormData | null>(null)
  
  const [slotsByDate, setSlotsByDate] = useState<SlotsByDate>({})
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Завантаження доступних слотів
  useEffect(() => {
    console.log('[BookingModal] useEffect triggered, open:', open)
    if (open) {
      console.log('[BookingModal] Calling loadAvailableSlots')
      loadAvailableSlots()
    }
  }, [open])

  const loadAvailableSlots = async () => {
    console.log('[BookingModal] loadAvailableSlots started')
    setIsLoadingSlots(true)
    try {
      const { startDate, endDate } = getDateRange()
      const url = new URL('/api/booking/slots', window.location.origin)
      url.searchParams.set('startDate', startDate)
      url.searchParams.set('endDate', endDate)
      
      console.log('[BookingModal] Fetching slots:', url.toString())
      
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      })

      console.log('[BookingModal] Response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('[BookingModal] Response error:', errorText)
        throw new Error('Не вдалося завантажити слоти')
      }

      const data = await response.json()
      console.log('[BookingModal] Received data:', data)
      setSlotsByDate(data.slotsByDate || {})

      // Автоматично вибрати найближчу доступну дату
      const nextDate = getNextAvailableDate(data.slotsByDate)
      if (nextDate) {
        setSelectedDate(nextDate)
      }
    } catch (error) {
      console.error('Error loading slots:', error)
      toast.error('Помилка завантаження доступних слотів', {
        description: 'Спробуйте ще раз або зв\'яжіться з нами'
      })
    } finally {
      setIsLoadingSlots(false)
    }
  }

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    setSelectedSlot(null)
    if (date) {
      setStep('time')
    }
  }

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot)
  }

  const handleContinueToForm = () => {
    if (!selectedSlot) {
      toast.error('Оберіть час консультації')
      return
    }
    setStep('form')
  }

  const handleFormSubmit = async (data: BookingFormData) => {
    if (!selectedDate || !selectedSlot) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/booking/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: format(selectedDate, 'yyyy-MM-dd'),
          time: selectedSlot.time,
          startDateTime: selectedSlot.datetime,
          endDateTime: selectedSlot.endDatetime,
          clientName: data.name,
          clientEmail: data.email,
          clientPhone: data.phone,
          notes: data.notes || ''
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Не вдалося створити бронювання')
      }

      const result = await response.json()
      
      setFormData(data)
      setStep('success')
      
      toast.success('Бронювання створено!', {
        description: 'Перевірте свій email для підтвердження'
      })
    } catch (error) {
      console.error('Error creating booking:', error)
      toast.error('Помилка створення бронювання', {
        description: error instanceof Error ? error.message : 'Спробуйте ще раз'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBack = () => {
    if (step === 'time') {
      setStep('date')
      setSelectedSlot(null)
    } else if (step === 'form') {
      setStep('time')
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    // Скидання стану через 300мс (після анімації закриття)
    setTimeout(() => {
      setStep('date')
      setSelectedDate(undefined)
      setSelectedSlot(null)
      setFormData(null)
    }, 300)
  }

  const availableSlots = selectedDate ? getSlotsForDate(selectedDate, slotsByDate) : []

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {step === 'success' ? 'Готово!' : 'Записатися на консультацію'}
          </DialogTitle>
          <DialogDescription>
            {step === 'date' && 'Оберіть зручний день для консультації'}
            {step === 'time' && 'Оберіть зручний час'}
            {step === 'form' && 'Заповніть ваші контактні дані'}
            {step === 'success' && 'Ваше бронювання підтверджено'}
          </DialogDescription>
        </DialogHeader>

        {step !== 'success' && <BookingProgress currentStep={step} />}

        {step === 'date' && (
          <BookingCalendar
            selectedDate={selectedDate}
            onSelectDate={handleDateSelect}
            slotsByDate={slotsByDate}
            isLoading={isLoadingSlots}
          />
        )}

        {step === 'time' && selectedDate && (
          <div className="space-y-4">
            <BookingTimeSlots
              slots={availableSlots}
              selectedSlot={selectedSlot}
              onSelectSlot={handleSlotSelect}
            />
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleBack}
                className="flex-1"
              >
                Назад
              </Button>
              <Button
                onClick={handleContinueToForm}
                disabled={!selectedSlot}
                className="flex-1"
              >
                Продовжити
              </Button>
            </div>
          </div>
        )}

        {step === 'form' && selectedDate && selectedSlot && (
          <BookingForm
            selectedDate={selectedDate}
            selectedSlot={selectedSlot}
            onSubmit={handleFormSubmit}
            onBack={handleBack}
            isSubmitting={isSubmitting}
          />
        )}

        {step === 'success' && selectedDate && selectedSlot && formData && (
          <BookingSuccess
            selectedDate={selectedDate}
            selectedSlot={selectedSlot}
            formData={formData}
            onClose={handleClose}
          />
        )}

        {/* Інформація про підтримку */}
        {step !== 'success' && (
          <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 p-3 rounded-md mt-4">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p>
              Маєте питання? Зв'яжіться з нами: <a href="mailto:tm@crmcustoms.com" className="underline">tm@crmcustoms.com</a>
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
