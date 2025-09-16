import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <h2 className="text-4xl font-bold">Страница не найдена</h2>
      <p className="mt-4 text-muted-foreground">
        Запрошенная страница не существует или была перемещена
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center justify-center rounded-md bg-amber px-4 py-2 text-sm font-medium text-black shadow transition-colors hover:bg-amber-hover focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        Вернуться на главную
      </Link>
    </div>
  )
} 