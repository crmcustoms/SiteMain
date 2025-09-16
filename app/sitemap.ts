import type { MetadataRoute } from 'next'
import { getBlogArticles } from '@/lib/blog'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://crmcustoms.com'

  // Статические страницы
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/cases`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/landing/audit-crm`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
  ]

  // Получаем динамические страницы кейсов
  let dynamicPages: MetadataRoute.Sitemap = []
  
  try {
    const articles = await getBlogArticles(true)
    
    if (Array.isArray(articles)) {
      dynamicPages = articles
        .filter((article: any) => article?.property_slug)
        .map((article: any) => ({
          url: `${baseUrl}/cases/${article.property_slug}`,
          lastModified: article.property_last_edited_time 
            ? new Date(article.property_last_edited_time)
            : new Date(),
          changeFrequency: 'monthly' as const,
          priority: 0.6,
        }))
    }
  } catch (error) {
    console.error('Error generating sitemap:', error)
  }

  return [...staticPages, ...dynamicPages]
}

export const revalidate = 3600 // Обновлять каждый час 