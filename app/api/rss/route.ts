import { NextResponse } from 'next/server'
import { getAllContent, type ContentType } from '@/lib/content'
import { i18n } from '@/lib/i18n-config'

const SECTIONS: ContentType[] = ['cases', 'blog', 'news']
const baseUrl = 'https://crmcustoms.com'

export async function GET() {
  try {
    const entries = SECTIONS.flatMap((section) =>
      getAllContent(section, i18n.defaultLocale).map((entry) => ({ section, entry })),
    ).sort(
      (a, b) => new Date(b.entry.date || 0).getTime() - new Date(a.entry.date || 0).getTime(),
    )

    const rssHeader = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>CRM Customs - Автоматизація бізнесу</title>
    <description>Професійна автоматизація бізнес-процесів. Налаштування CRM, інтеграція систем, покращення продажів та клієнтського сервісу.</description>
    <link>${baseUrl}</link>
    <language>uk</language>
    <copyright>© 2024 CRM Customs</copyright>
    <managingEditor>tm@crmcustoms.com (CRM Customs)</managingEditor>
    <webMaster>tm@crmcustoms.com (CRM Customs)</webMaster>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/api/rss" rel="self" type="application/rss+xml" />
    <image>
      <url>${baseUrl}/logo.png</url>
      <title>CRM Customs</title>
      <link>${baseUrl}</link>
    </image>`

    const rssItems = entries
      .map(({ section, entry }) => {
        const link = `${baseUrl}/${i18n.defaultLocale}/${section}/${entry.slug}`
        const pubDate = entry.date ? new Date(entry.date).toUTCString() : new Date().toUTCString()
        const categories = [entry.tag, ...(entry.tags || [])].filter(Boolean) as string[]

        return `
    <item>
      <title><![CDATA[${entry.title}]]></title>
      <description><![CDATA[${entry.excerpt || ''}]]></description>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pubDate}</pubDate>
      ${entry.image ? `<enclosure url="${entry.image}" type="image/jpeg" />` : ''}
      ${categories.map((cat) => `<category><![CDATA[${cat}]]></category>`).join('')}
      <author>tm@crmcustoms.com (CRM Customs)</author>
    </item>`
      })
      .join('')

    const rssFooter = `
  </channel>
</rss>`

    return new NextResponse(rssHeader + rssItems + rssFooter, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=7200',
      },
    })
  } catch (error) {
    console.error('Ошибка при генерации RSS:', error)

    const errorRss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>CRM Customs - Автоматизація бізнесу</title>
    <description>Професійна автоматизація бізнес-процесів</description>
    <link>${baseUrl}</link>
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
