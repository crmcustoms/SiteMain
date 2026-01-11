"use client"

import { TimeSlot } from "@/lib/booking-types"
import { groupSlotsByPeriod, getPeriodName, getPeriodEmoji } from "@/lib/booking-utils"
import { Button } from "@/components/ui/button"
import { Clock } from "lucide-react"

interface BookingTimeSlotsProps {
  slots: TimeSlot[]
  selectedSlot: TimeSlot | null
  onSelectSlot: (slot: TimeSlot) => void
  isLoading?: boolean
}

export function BookingTimeSlots({
  slots,
  selectedSlot,
  onSelectSlot,
  isLoading = false
}: BookingTimeSlotsProps) {
  const groupedSlots = groupSlotsByPeriod(slots)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (slots.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>На цей день немає вільних слотів</p>
        <p className="text-sm">Оберіть іншу дату</p>
      </div>
    )
  }

  const renderPeriodSlots = (
    period: 'morning' | 'afternoon' | 'evening',
    periodSlots: TimeSlot[]
  ) => {
    if (periodSlots.length === 0) return null

    return (
      <div key={period} className="space-y-2">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          <span>{getPeriodEmoji(period)}</span>
          <span>{getPeriodName(period)}</span>
          <span className="text-xs text-muted-foreground">({periodSlots.length})</span>
        </h4>
        <div className="grid grid-cols-3 gap-2">
          {periodSlots.map((slot) => (
            <Button
              key={slot.datetime}
              variant={selectedSlot?.datetime === slot.datetime ? "default" : "outline"}
              size="sm"
              onClick={() => onSelectSlot(slot)}
              className="font-mono"
            >
              {slot.displayTime}
            </Button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Оберіть час</h3>
        <span className="text-sm text-muted-foreground">
          Доступно {slots.length} {slots.length === 1 ? 'слот' : 'слотів'}
        </span>
      </div>

      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
        {renderPeriodSlots('morning', groupedSlots.morning)}
        {renderPeriodSlots('afternoon', groupedSlots.afternoon)}
        {renderPeriodSlots('evening', groupedSlots.evening)}
      </div>

      <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-md">
        <p>💡 Кожна консультація триває 30 хвилин</p>
        <p>📅 Бронювати можна мінімум за 24 години</p>
      </div>
    </div>
  )
}
