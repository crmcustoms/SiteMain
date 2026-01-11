"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { BookingModal } from "./booking-modal"
import { Calendar } from "lucide-react"

interface BookingButtonProps {
  variant?: "default" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  children?: React.ReactNode
}

export function BookingButton({
  variant = "default",
  size = "default",
  className = "",
  children
}: BookingButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => setIsOpen(true)}
      >
        <Calendar className="w-4 h-4 mr-2" />
        {children || "Записатися на консультацію"}
      </Button>

      <BookingModal open={isOpen} onOpenChange={setIsOpen} />
    </>
  )
}
