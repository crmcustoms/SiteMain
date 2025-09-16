"use client"

import React from "react"

import { createContext, useContext, type ReactNode } from "react"

type LanguageContextType = {
  lang: string
  dict: any
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({
  children,
  lang,
  initialDict,
}: {
  children: ReactNode
  lang: string
  initialDict: any
}) {
  const [dict, setDict] = React.useState<any>(initialDict)

  return <LanguageContext.Provider value={{ lang, dict }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
