import localFont from 'next/font/local'

// Self-hosted (assets/fonts) instead of next/font/google — see lib/fonts.ts.
export const archivo = localFont({ src: '../assets/fonts/Archivo.woff2', weight: '100 900', variable: '--font-archivo', display: 'swap', fallback: ['Arial', 'sans-serif'], adjustFontFallback: false })
export const jetbrains = localFont({ src: '../assets/fonts/JetBrainsMono.woff2', weight: '100 800', variable: '--font-jetbrains', display: 'swap', fallback: ['monospace'] })
