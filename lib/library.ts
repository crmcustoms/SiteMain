import episodesData from "@/content/library/episodes.json"

/**
 * Рубрика «Книжка до кави»: аудіопереказ ключових ідей книги (вільний переказ,
 * не оригінальний текст автора). Дані епізодів лежать у content/library/episodes.json,
 * нові епізоди додаються туди ж.
 */
export interface LibraryEpisode {
  slug: string
  author: string
  authorShort: string
  book: string
  title: string
  description: string
  publishedAt: string
  durationSec: number
  audioUrl: string
  coverUrl: string
  youtubeId: string
  youtubePlaylistId?: string
  telegramUrl?: string
  photoCredit?: string
  photoLicenseUrl?: string
  transcript: string[]
}

const episodes = episodesData as LibraryEpisode[]

export function getLibraryEpisodes(): LibraryEpisode[] {
  return [...episodes].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
}

export function getLibraryEpisode(slug: string): LibraryEpisode | undefined {
  return episodes.find((e) => e.slug === slug)
}

export function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = Math.round(sec % 60)
  return `${m}:${String(s).padStart(2, "0")}`
}

/** Посилання на відео епізоду разом з плейлістом серії: автоплей іде по серії. */
export function youtubeWatchUrl(ep: LibraryEpisode): string {
  const list = ep.youtubePlaylistId ? `&list=${ep.youtubePlaylistId}` : ""
  return `https://www.youtube.com/watch?v=${ep.youtubeId}${list}`
}
