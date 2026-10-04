import 'server-only'
import { records, labels, search, composeProject } from '@/lib/automation-core/index.js'

export type Automation = (typeof records)[number]
export const automationBase = '/uk/automations'
export const automationOrigin = 'https://crmcustoms.com'
export const categoryLabels: Record<string, string> = labels.categories

export function previewEnabled() {
  return process.env.AUTOMATIONS_PREVIEW === 'true' && (
    process.env.NODE_ENV === 'development' ||
    process.env.CONTEXT === 'deploy-preview' || process.env.CONTEXT === 'branch-deploy'
  )
}

export function availableAutomations(): Automation[] {
  // Public pilot authorized by the owner; draft cards retain noindex and review labels.
  return records.filter(record => record.status === 'published' || record.status === 'draft' || previewEnabled())
}

export function findAutomation(slug: string) {
  return availableAutomations().find(record => record.slug === slug)
}

export function findAutomations(query = '', category = ''): Automation[] {
  const available = availableAutomations()
  const matches: string[] = query ? search(available, query, available.length).map((hit: { id: string }) => hit.id) : available.map(record => record.id)
  const byId = new Map(available.map(record => [record.id, record]))
  return matches.map(id => byId.get(id)!).filter(record => !category || record.category === category)
}

export function automationEstimate(record: Automation, variantId: string) {
  return composeProject(records, [{ automation_id: record.id, variant_id: variantId }])
}

export function automationSitemapEntries() {
  const published = records.filter(record => record.status === 'published')
  return published.length ? [
    { url: `${automationOrigin}${automationBase}` },
    ...published.map(record => ({ url: `${automationOrigin}${automationBase}/${record.slug}` }))
  ] : []
}
