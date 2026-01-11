"use client"

import { BookingStep } from "@/lib/booking-types"
import { Calendar, Clock, FileText, CheckCircle } from "lucide-react"

interface BookingProgressProps {
  currentStep: BookingStep
}

const steps = [
  { id: 'date' as BookingStep, label: 'Дата', icon: Calendar },
  { id: 'time' as BookingStep, label: 'Час', icon: Clock },
  { id: 'form' as BookingStep, label: 'Дані', icon: FileText },
  { id: 'success' as BookingStep, label: 'Готово', icon: CheckCircle }
]

export function BookingProgress({ currentStep }: BookingProgressProps) {
  const currentIndex = steps.findIndex(step => step.id === currentStep)

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between relative">
        {/* Лінія прогресу */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted -z-10">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
          />
        </div>

        {/* Кроки */}
        {steps.map((step, index) => {
          const Icon = step.icon
          const isActive = index === currentIndex
          const isCompleted = index < currentIndex
          const isFuture = index > currentIndex

          return (
            <div key={step.id} className="flex flex-col items-center flex-1">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all
                  ${isActive ? 'bg-primary text-primary-foreground scale-110' : ''}
                  ${isCompleted ? 'bg-primary text-primary-foreground' : ''}
                  ${isFuture ? 'bg-muted text-muted-foreground' : ''}
                `}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span
                className={`
                  text-xs font-medium transition-colors
                  ${isActive ? 'text-primary' : ''}
                  ${isCompleted ? 'text-primary' : ''}
                  ${isFuture ? 'text-muted-foreground' : ''}
                `}
              >
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
