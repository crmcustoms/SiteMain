import { Archivo, JetBrains_Mono } from 'next/font/google'

export const archivo = Archivo({ weight: ['600', '800'], subsets: ['latin'], variable: '--font-archivo', display: 'swap', fallback: ['Arial', 'sans-serif'], adjustFontFallback: false })
export const jetbrains = JetBrains_Mono({ weight: ['400', '500'], subsets: ['latin', 'cyrillic'], variable: '--font-jetbrains', display: 'swap', fallback: ['monospace'] })
