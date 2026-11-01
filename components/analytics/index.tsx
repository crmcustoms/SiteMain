"use client"

import { GoogleAnalytics } from "./google-analytics"
import { MicrosoftClarity } from "./microsoft-clarity"
import { MetaPixel } from "./meta-pixel"

export function Analytics() {
  return (
    <>
      <GoogleAnalytics />
      <MicrosoftClarity />
      <MetaPixel />
    </>
  )
}
