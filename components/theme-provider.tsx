'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = React.useState(false)

  // Для предотвращения ошибок гидратации, монтируем компонент только после первого рендера на клиенте
  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Если компонент не смонтирован, возвращаем только детей без темы
  if (!mounted) {
    return <>{children}</>
  }

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
