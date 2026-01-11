export interface TimeSlot {
  date: string // YYYY-MM-DD
  time: string // HH:MM
  datetime: string // ISO string
  endDatetime: string // ISO string
  displayTime: string // Formatted time for display
  period: 'morning' | 'afternoon' | 'evening'
}

export interface SlotsByDate {
  [date: string]: TimeSlot[]
}

export interface AvailableSlotsResponse {
  success: boolean
  slots: TimeSlot[]
  slotsByDate: SlotsByDate
  totalSlots: number
}

export interface BookingFormData {
  name: string
  email: string
  phone: string
  notes?: string
}

export interface BookingData extends BookingFormData {
  date: string
  time: string
  datetime: string
  endDatetime: string
}

export interface BookingResponse {
  success: boolean
  eventId?: string
  planfixTaskId?: string
  message: string
  error?: string
}

export type BookingStep = 'date' | 'time' | 'form' | 'success'

export interface BookingState {
  step: BookingStep
  selectedDate: Date | null
  selectedSlot: TimeSlot | null
  formData: BookingFormData | null
}
