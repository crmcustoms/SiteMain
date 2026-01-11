"use client"

import { Calendar } from "@/components/ui/calendar"
import { SlotsByDate } from "@/lib/booking-types"
import { getAvailableSlotsCount, isFutureDate } from "@/lib/booking-utils"
import { uk } from "date-fns/locale"

interface BookingCalendarProps {
  selectedDate: Date | undefined
  onSelectDate: (date: Date | undefined) => void
  slotsByDate: SlotsByDate
  isLoading?: boolean
}

export function BookingCalendar({
  selectedDate,
  onSelectDate,
  slotsByDate,
  isLoading = false
}: BookingCalendarProps) {
  // Модифікатор для днів з доступними слотами
  const modifiers = {
    available: (date: Date) => {
      if (!isFutureDate(date)) return false
      return getAvailableSlotsCount(date, slotsByDate) > 0
    },
    unavailable: (date: Date) => {
      if (!isFutureDate(date)) return false
      return getAvailableSlotsCount(date, slotsByDate) === 0
    }
  }

  const modifiersClassNames = {
    available: "bg-primary/10 hover:bg-primary/20 font-semibold relative after:content-[attr(data-slots)] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:text-[8px] after:text-primary after:font-bold",
    unavailable: "opacity-30"
  }

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={onSelectDate}
            locale={uk}
            disabled={(date) => {
              // Відключити минулі дати
              if (!isFutureDate(date)) return true
              // Відключити дати без слотів
              return getAvailableSlotsCount(date, slotsByDate) === 0
            }}
            modifiers={modifiers}
            modifiersClassNames={modifiersClassNames}
            className="rounded-md border"
            fromDate={new Date()}
          />
          
          <div className="text-sm text-muted-foreground space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary/10 border border-primary/30"></div>
              <span>Дні з вільними слотами</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-muted opacity-30"></div>
              <span>Недоступні дні</span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
