"use client"

import { Button } from "@/components/ui/button"
import { ContactFormDialog } from "@/components/contact-form-dialog"
import { BookingButton } from "@/components/booking-button"

export default function StaticFinalCta({ dict, commonDict, lang = "uk" }) {
  return (
    <section className="w-full pt-16 pb-16">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">{dict.title}</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              {dict.subtitle}
            </p>
          </div>
          <div className="flex flex-col gap-2 min-[400px]:flex-row">
            <BookingButton size="lg">
              Записатися на консультацію
            </BookingButton>
            <ContactFormDialog
              trigger={<Button variant="outline" size="lg">{dict.auditButton}</Button>}
              title={commonDict.form.auditFormTitle}
              description={commonDict.form.auditFormDescription}
              formType="final_audit"
              buttonText={commonDict.form.submitButton}
              dict={commonDict}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
