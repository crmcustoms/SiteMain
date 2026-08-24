import { Unbounded, Golos_Text } from "next/font/google"

export const unbounded = Unbounded({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "700", "900"],
  variable: "--font-unbounded",
  display: "swap",
})

export const golosText = Golos_Text({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600"],
  variable: "--font-golos",
  display: "swap",
})
