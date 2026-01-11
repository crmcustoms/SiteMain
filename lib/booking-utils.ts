import { TimeSlot, SlotsByDate } from './booking-types'
import { format, addDays, startOfDay, endOfDay } from 'date-fns'
import { uk } from 'date-fns/locale'

/**
 * Отримати діапазон дат для запиту слотів (наступні 14 днів)
 */
export function getDateRange() {
  const start = startOfDay(new Date())
  const end = endOfDay(addDays(start, 14))
  
  return {
    startDate: start.toISOString(),
    endDate: end.toISOString()
  }
}

/**
 * Форматувати дату для відображення
 */
export function formatDateDisplay(date: Date): string {
  return format(date, 'd MMMM, EEEE', { locale: uk })
}

/**
 * Форматувати час для відображення
 */
export function formatTimeDisplay(time: string): string {
  const [hours, minutes] = time.split(':')
  return `${hours}:${minutes}`
}

/**
 * Групувати слоти за періодами дня
 */
export function groupSlotsByPeriod(slots: TimeSlot[]) {
  return {
    morning: slots.filter(slot => slot.period === 'morning'),
    afternoon: slots.filter(slot => slot.period === 'afternoon'),
    evening: slots.filter(slot => slot.period === 'evening')
  }
}

/**
 * Отримати назву періоду дня українською
 */
export function getPeriodName(period: 'morning' | 'afternoon' | 'evening'): string {
  const names = {
    morning: 'Ранок',
    afternoon: 'День',
    evening: 'Вечір'
  }
  return names[period]
}

/**
 * Перевірити, чи є доступні слоти на дату
 */
export function hasAvailableSlots(date: Date, slotsByDate: SlotsByDate): boolean {
  const dateStr = format(date, 'yyyy-MM-dd')
  return !!(slotsByDate[dateStr] && slotsByDate[dateStr].length > 0)
}

/**
 * Отримати кількість доступних слотів на дату
 */
export function getAvailableSlotsCount(date: Date, slotsByDate: SlotsByDate): number {
  const dateStr = format(date, 'yyyy-MM-dd')
  return slotsByDate[dateStr]?.length || 0
}

/**
 * Отримати слоти для конкретної дати
 */
export function getSlotsForDate(date: Date, slotsByDate: SlotsByDate): TimeSlot[] {
  const dateStr = format(date, 'yyyy-MM-dd')
  return slotsByDate[dateStr] || []
}

/**
 * Валідація телефону (український формат)
 */
export function validatePhone(phone: string): boolean {
  // Підтримка форматів: +380XXXXXXXXX, 380XXXXXXXXX, 0XXXXXXXXX
  const phoneRegex = /^(\+?380|0)\d{9}$/
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))
}

/**
 * Форматування телефону
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/[\s\-\(\)]/g, '')
  if (cleaned.startsWith('0')) {
    return '+38' + cleaned
  }
  if (cleaned.startsWith('380')) {
    return '+' + cleaned
  }
  return cleaned
}

/**
 * Генерація .ics файлу для додавання в календар
 */
export function generateICSFile(
  startDateTime: string,
  endDateTime: string,
  title: string,
  description: string,
  location?: string
): string {
  const start = new Date(startDateTime).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  const end = new Date(endDateTime).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//CRM Customs//Booking System//UK',
    'BEGIN:VEVENT',
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description.replace(/\n/g, '\\n')}`,
    location ? `LOCATION:${location}` : '',
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'END:VEVENT',
    'END:VCALENDAR'
  ].filter(Boolean).join('\r\n')
  
  return icsContent
}

/**
 * Завантажити .ics файл
 */
export function downloadICSFile(icsContent: string, filename: string = 'consultation.ics'): void {
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(link.href)
}

/**
 * Отримати emoji для періоду дня
 */
export function getPeriodEmoji(period: 'morning' | 'afternoon' | 'evening'): string {
  const emojis = {
    morning: '🌅',
    afternoon: '☀️',
    evening: '🌆'
  }
  return emojis[period]
}

/**
 * Перевірити, чи дата в майбутньому
 */
export function isFutureDate(date: Date): boolean {
  return date > new Date()
}

/**
 * Отримати найближчу доступну дату
 */
export function getNextAvailableDate(slotsByDate: SlotsByDate): Date | null {
  const dates = Object.keys(slotsByDate)
    .filter(dateStr => slotsByDate[dateStr].length > 0)
    .sort()
  
  if (dates.length === 0) return null
  
  return new Date(dates[0])
}
