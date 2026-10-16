import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { i18n } from "@/lib/i18n-config"
import { formatDuration, getLibraryEpisode, getLibraryEpisodes, youtubeWatchUrl } from "@/lib/library"

type Params = { lang: string; slug: string }

export function generateStaticParams() {
  return i18n.locales.flatMap((lang) => getLibraryEpisodes().map((ep) => ({ lang, slug: ep.slug })))
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params
  const ep = getLibraryEpisode(slug)
  if (!ep) return { title: "Епізод не знайдено | CRMCUSTOMS" }
  const url = `https://crmcustoms.com/uk/biblioteka/${ep.slug}`
  return {
    title: `${ep.title} | Книжка до кави | CRMCUSTOMS`,
    description: ep.description,
    alternates: { canonical: url },
    openGraph: { title: ep.title, description: ep.description, url, type: "article", images: [ep.coverUrl] },
  }
}

export default async function LibraryEpisodePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  const ep = getLibraryEpisode(slug)
  if (!ep) notFound()

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AudioObject",
    name: ep.title,
    description: ep.description,
    contentUrl: ep.audioUrl,
    encodingFormat: "audio/mpeg",
    duration: `PT${Math.floor(ep.durationSec / 60)}M${Math.round(ep.durationSec % 60)}S`,
    uploadDate: ep.publishedAt,
    thumbnailUrl: ep.coverUrl,
    inLanguage: "uk",
    publisher: { "@type": "Organization", name: "CRMCUSTOMS", url: "https://crmcustoms.com" },
  }

  return (
    <div className="min-h-screen bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <article className="container mx-auto px-8 py-16 max-w-4xl">
        <p className="font-mono text-sm tracking-widest text-[#767676] mb-4 flex items-center gap-3">
          <span className="inline-block w-2 h-6 bg-[#FFD700]" />
          <Link href="/uk/biblioteka" className="hover:underline">
            КНИЖКА ДО КАВИ
          </Link>{" "}
          · АУДІО · {formatDuration(ep.durationSec)}
        </p>
        <h1 className="text-3xl md:text-5xl font-extrabold uppercase tracking-tight text-black mb-6">
          {ep.authorShort}: «{ep.book}»
        </h1>
        <p className="text-lg text-black/70 leading-relaxed mb-8 max-w-2xl">{ep.description}</p>

        <div className="grid gap-8 md:grid-cols-[360px_1fr] items-start mb-12">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={ep.coverUrl} alt={`Обкладинка епізоду: ${ep.title}`} width={1080} height={1080} className="w-full h-auto border border-[#E5E5E5]" />
          <div>
            <audio controls preload="none" src={ep.audioUrl} className="w-full mb-6">
              Ваш браузер не підтримує відтворення аудіо.{" "}
              <a href={ep.audioUrl}>Завантажити mp3</a>.
            </audio>
            <div className="flex flex-wrap gap-3">
              <a
                href={youtubeWatchUrl(ep)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-[#FFD700] text-black font-mono text-sm tracking-widest uppercase px-6 py-4"
              >
                Слухати на YouTube
              </a>
              {ep.telegramUrl && (
                <a
                  href={ep.telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block border border-black text-black font-mono text-sm tracking-widest uppercase px-6 py-4"
                >
                  Слухати в Telegram
                </a>
              )}
            </div>
            <p className="text-sm text-[#767676] mt-6">
              Це вільний переказ книжки, а не оригінальний текст автора. Повний зміст, приклади й нюанси читайте
              в самій книзі.
            </p>
          </div>
        </div>

        <section aria-label="Текст епізоду">
          <h2 className="font-mono text-sm tracking-widest text-[#767676] mb-6">ТЕКСТ ЕПІЗОДУ</h2>
          <div className="space-y-5 max-w-2xl">
            {ep.transcript.map((p, i) => (
              <p key={i} className="text-base text-black/80 leading-relaxed">
                {p}
              </p>
            ))}
          </div>
        </section>

        {ep.photoCredit && (
          <p className="text-xs text-[#767676] mt-12 max-w-2xl">
            {ep.photoCredit}
            {ep.photoLicenseUrl && (
              <>
                {" "}
                <a className="underline" href={ep.photoLicenseUrl} target="_blank" rel="noopener noreferrer">
                  Ліцензія
                </a>
              </>
            )}
          </p>
        )}

        <p className="mt-12">
          <Link href="/uk/biblioteka" className="underline text-black">
            ← Усі епізоди «Книжки до кави»
          </Link>
        </p>
      </article>
    </div>
  )
}
