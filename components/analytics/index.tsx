"use client"

import { GoogleAnalytics } from "./google-analytics"
import { MicrosoftClarity } from "./microsoft-clarity"

export function Analytics() {
  return (
    <>
      <GoogleAnalytics />
      <MicrosoftClarity />
    </>
  )
}
