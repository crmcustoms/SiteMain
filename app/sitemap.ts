import type { MetadataRoute } from "next"
import { getAllContent } from "@/lib/content"
import { i18n } from "@/lib/i18n-config"

const baseUrl = "https://crmcustoms.com"

const LANDING_SLUGS = [
  "audit-crm",
  "custom-development",
  "implementation-crm",
  "industry-solutions",
  "project-management",
  "support-crm",
]

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  const entries: MetadataRoute.Sitemap = []

  for (const locale of i18n.locales) {
    entries.push(
      { url: `${baseUrl}/${locale}`, lastModified: now, changeFrequency: "weekly", priority: 1 },
      { url: `${baseUrl}/${locale}/blog`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
      { url: `${baseUrl}/${locale}/cases`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    )

    for (const slug of LANDING_SLUGS) {
      entries.push({
        url: `${baseUrl}/${locale}/landing/${slug}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.7,
      })
    }

    for (const article of getAllContent("blog", locale)) {
      entries.push({
        url: `${baseUrl}/${locale}/blog/${article.slug}`,
        lastModified: article.date ? new Date(article.date) : now,
        changeFrequency: "monthly",
        priority: 0.6,
      })
    }

    for (const caseItem of getAllContent("cases", locale)) {
      entries.push({
        url: `${baseUrl}/${locale}/cases/${caseItem.slug}`,
        lastModified: caseItem.date ? new Date(caseItem.date) : now,
        changeFrequency: "monthly",
        priority: 0.6,
      })
    }
  }

  return entries
}
