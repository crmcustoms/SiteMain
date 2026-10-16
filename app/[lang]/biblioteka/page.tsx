import type { Metadata } from "next"
import Link from "next/link"
import { formatDuration, getLibraryEpisodes } from "@/lib/library"

export const metadata: Metadata = {
  title: "Книжка до кави: аудіопереказ книг для бізнесу | CRMCUSTOMS",
  description:
    "Книги для власників і керівників бізнесу в аудіопереказі на 7 хвилин. Слухайте за кавою: ключові ідеї без води. Вільний переказ, не оригінальний текст автора.",
  alternates: { canonical: "https://crmcustoms.com/uk/biblioteka" },
}

export default function LibraryPage() {
  const episodes = getLibraryEpisodes()

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-8 py-16 max-w-4xl">
        <p className="font-mono text-sm tracking-widest text-[#767676] mb-4 flex items-center gap-3">
          <span className="inline-block w-2 h-6 bg-[#FFD700]" />
          БІБЛІОТЕКА · КНИЖКА ДО КАВИ
        </p>
        <h1 className="text-4xl md:text-5xl font-extrabold uppercase tracking-tight text-black mb-6">
          Книжка до кави
        </h1>
        <p className="text-lg text-black/70 leading-relaxed mb-4 max-w-2xl">
          Книги для власників і керівників бізнесу в аудіопереказі на 7 хвилин: ключові ідеї без води, щоб
          послухати за кавою.
        </p>
        <p className="text-sm text-[#767676] mb-12 max-w-2xl">
          Це вільний переказ книжок, а не оригінальний текст авторів. Повний зміст, приклади й нюанси читайте
          в самих книгах.
        </p>

        <ul className="grid gap-8 md:grid-cols-2">
          {episodes.map((ep) => (
            <li key={ep.slug} className="border border-[#E5E5E5]">
              <Link href={`/uk/biblioteka/${ep.slug}`} className="block group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={ep.coverUrl} alt={`Обкладинка епізоду: ${ep.title}`} width={1080} height={1080} className="w-full h-auto" />
                <div className="p-5">
                  <p className="font-mono text-xs tracking-widest text-[#767676] mb-2">
                    АУДІО · {formatDuration(ep.durationSec)}
                  </p>
                  <h2 className="text-xl font-extrabold text-black group-hover:underline">{ep.title}</h2>
                  <p className="text-sm text-black/70 mt-2">{ep.description}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>

        <p className="mt-12 text-sm text-black/70">
          Нові епізоди виходять щонеділі в{" "}
          <a className="underline" href="https://t.me/prodayslonakume" target="_blank" rel="noopener noreferrer">
            Telegram
          </a>{" "}
          і на{" "}
          <a className="underline" href="https://www.youtube.com/@crmcustomsua" target="_blank" rel="noopener noreferrer">
            YouTube
          </a>
          .
        </p>
      </div>
    </div>
  )
}
