"use client"

import React, { useState } from "react"
import Link from "next/link"
import { Menu } from "@/components/icons"
import { CloseIcon } from "@/components/icons/dialog-icons"
import { Button } from "@/components/ui/button"
import { 
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { ContactFormDialog } from "@/components/contact-form-dialog"

interface MobileMenuProps {
  dict: any
  lang: string
}

export function MobileMenu({ dict, lang }: MobileMenuProps) {
  const [open, setOpen] = useState(false)

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden"
          aria-label={dict.common.mobileMenu || "Меню"}
        >
          <Menu className="h-6 w-6" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="px-4">
        <DrawerHeader className="text-left">
          <div className="flex items-center justify-between">
            <Link href={`/${lang}`} className="flex items-center" onClick={() => setOpen(false)}>
              <div className="flex flex-col items-start">
                <div className="text-xl font-bold tracking-wide w-full">
                  <span className="text-amber">CRM</span>
                  <span>CUSTOMS</span>
                </div>
              </div>
            </Link>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon">
                <CloseIcon className="h-6 w-6" />
                <span className="sr-only">Закрыть</span>
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>
        <div className="flex flex-col gap-4 p-4">
          <Link 
            href={`/${lang}`} 
            className="text-base font-medium transition-colors hover:text-amber py-2 border-b"
            onClick={() => setOpen(false)}
          >
            {dict.navigation.home}
          </Link>
          <Link 
            href={`/${lang}/cases`} 
            className="text-base font-medium transition-colors hover:text-amber py-2 border-b"
            onClick={() => setOpen(false)}
          >
            {dict.navigation.cases || 'Кейси'}
          </Link>
          <Link 
            href={`/${lang}/blog`} 
            className="text-base font-medium transition-colors hover:text-amber py-2 border-b"
            onClick={() => setOpen(false)}
          >
            {dict.navigation.blog}
          </Link>
          <Link 
            href={`/${lang}#features`} 
            className="text-base font-medium transition-colors hover:text-amber py-2 border-b"
            onClick={() => setOpen(false)}
          >
            {dict.navigation.features}
          </Link>
          <Link 
            href={`/${lang}#services`} 
            className="text-base font-medium transition-colors hover:text-amber py-2 border-b"
            onClick={() => setOpen(false)}
          >
            {dict.navigation.pricing}
          </Link>
        </div>
        <DrawerFooter className="pt-2">
          <div className="flex flex-col gap-4">
            <div className="flex justify-center gap-4">
              <a
                href="https://t.me/crmcustomsua"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-500 hover:bg-blue-600 transition"
                title="Telegram"
              >
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M9.036 16.956l-.398 3.77c.57 0 .816-.246 1.113-.54l2.67-2.53 5.537 4.04c1.014.56 1.74.266 1.99-.94l3.61-16.84c.33-1.54-.56-2.14-1.56-1.77l-21.1 8.13c-1.44.56-1.42 1.36-.25 1.72l5.39 1.68 12.52-7.9c.59-.38 1.13-.17.69.24z"/></svg>
              </a>
              <a
                href="viber://chat?number=%2B380671706703"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-purple-600 hover:bg-purple-700 transition"
                title="Viber"
              >
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.198.297-.767.967-.94 1.166-.173.198-.347.223-.644.074-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.372-.01-.571-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.099 3.2 5.077 4.363.71.306 1.263.489 1.694.626.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.288.173-1.413-.074-.124-.272-.198-.57-.347z"/></svg>
              </a>
            </div>
            <ContactFormDialog
              trigger={
                <Button variant="default" className="bg-amber hover:bg-amber-hover text-black w-full">
                  {dict.common.contactUs}
                </Button>
              }
              title={dict.common.form.contactFormTitle}
              description={dict.common.form.contactFormDescription}
              formType="mobile_contact"
              buttonText={dict.common.form.submitButton}
              dict={dict.common}
            />
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
} 