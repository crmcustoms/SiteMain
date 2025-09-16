"use client"

import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Languages } from "@/components/icons"
import { useLanguage } from "@/components/language-provider"

export default function LanguageSwitch({
  currentLang,
  locales,
}: {
  currentLang: string
  locales: string[]
}) {
  const pathName = usePathname()
  const router = useRouter()
  const { dict } = useLanguage()

  const redirectedPathName = (locale: string) => {
    if (!pathName) return "/"
    const segments = pathName.split("/")
    segments[1] = locale
    return segments.join("/")
  }

  const languageNames: Record<string, string> = {
    uk: "Українська",
    ru: "Русский",
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Languages className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">{dict?.common.switchLanguage}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((locale) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => router.push(redirectedPathName(locale))}
            className={locale === currentLang ? "bg-accent" : ""}
          >
            {languageNames[locale]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
