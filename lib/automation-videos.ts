import videosData from '@/content/automation-videos.json'

/**
 * Відео до карточок каталогу автоматизацій (моушн-ролики «приклад автоматизації»).
 * Окремо від даних каталогу (lib/automation-core), бо ті генеруються з business-automation-platform
 * за строгою схемою. Записи дописує фабрика контенту після публікації ролика на YouTube.
 */
export interface AutomationVideo {
  youtubeId: string
  title: string
  description?: string
  publishedAt: string
}

const videos = videosData as Record<string, AutomationVideo>

export function automationVideo(id: string): AutomationVideo | undefined {
  const video = videos[id]
  return video && /^[\w-]{6,20}$/.test(video.youtubeId) ? video : undefined
}

export const youtubeEmbedUrl = (video: AutomationVideo) => `https://www.youtube-nocookie.com/embed/${video.youtubeId}?rel=0`
export const youtubeThumbUrl = (video: AutomationVideo) => `https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`
