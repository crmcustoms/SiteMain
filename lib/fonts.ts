import localFont from "next/font/local"

// Self-hosted (latin + cyrillic subsets of the Google Fonts variable files)
// instead of next/font/google: that one downloads the fonts from Google on
// every build, and a bad response from Google failed the 2026-09-30 Netlify
// production deploy, so the scheduled article never went live.
export const unbounded = localFont({
  src: "../assets/fonts/Unbounded.woff2",
  weight: "200 900",
  variable: "--font-unbounded",
  display: "swap",
})

export const golosText = localFont({
  src: "../assets/fonts/GolosText.woff2",
  weight: "400 900",
  variable: "--font-golos",
  display: "swap",
})
