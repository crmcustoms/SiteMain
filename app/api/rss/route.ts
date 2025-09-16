import { NextResponse } from 'next/server'
import { getBlogArticles } from '@/lib/blog'

export async function GET() {
  try {
    const articles = await getBlogArticles(false)
    const baseUrl = 'https://crmcustoms.com'
    
    // RSS заголовок
    const rssHeader = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>CRM Customs - Автоматизація бізнесу</title>
    <description>Професійна автоматизація бізнес-процесів. Налаштування CRM, інтеграція систем, покращення продажів та клієнтського сервісу.</description>
    <link>${baseUrl}</link>
    <language>uk</language>
    <copyright>© 2024 CRM Customs</copyright>
    <managingEditor>info@crmcustoms.com (CRM Customs)</managingEditor>
    <webMaster>info@crmcustoms.com (CRM Customs)</webMaster>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/api/rss" rel="self" type="application/rss+xml" />
    <image>
      <url>${baseUrl}/logo.png</url>
      <title>CRM Customs</title>
      <link>${baseUrl}</link>
    </image>`

    // Генерируем RSS элементы для каждой статьи
    const rssItems = Array.isArray(articles) 
      ? articles
          .filter((article: any) => article?.property_slug && article?.property_name)
          .map((article: any) => {
            const title = article.property_name || 'Без названия'
            const description = article.property_description || article.property_meta_description || ''
            const link = `${baseUrl}/cases/${article.property_slug}`
            const pubDate = article.property_created_time 
              ? new Date(article.property_created_time).toUTCString()
              : new Date().toUTCString()
            const guid = article.id || article.property_slug
            const image = article.property_background_photo || article.property_social_network_img
            
            // Собираем категории и теги
            const categories = [
              ...(article.property_category || []),
              ...(article.property_tags || [])
            ]

            return `
    <item>
      <title><![CDATA[${title}]]></title>
      <description><![CDATA[${description}]]></description>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pubDate}</pubDate>
      ${image ? `<enclosure url="${image}" type="image/jpeg" />` : ''}
      ${categories.map(cat => `<category><![CDATA[${cat}]]></category>`).join('')}
      <author>info@crmcustoms.com (CRM Customs)</author>
    </item>`
          })
          .join('')
      : ''

    // Собираем полный RSS
    const rssFooter = `
  </channel>
</rss>`

    const rssContent = rssHeader + rssItems + rssFooter

    return new NextResponse(rssContent, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=7200',
      },
    })
  } catch (error) {
    console.error('Ошибка при генерации RSS:', error)
    
    // Возвращаем базовый RSS в случае ошибки
    const errorRss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>CRM Customs - Автоматизація бізнесу</title>
    <description>Професійна автоматизація бізнес-процесів</description>
    <link>https://crmcustoms.com</link>
    <language>uk</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
  </channel>
</rss>`

    return new NextResponse(errorRss, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=300',
      },
    })
  }
} 