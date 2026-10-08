import 'server-only'
import { records, labels, composeProject } from '@/lib/automation-core/index.js'
import { queryCatalog, budgetOptions, sortOptions, pageSize } from '@/lib/automation-core/catalog-view.js'

export type Automation = (typeof records)[number]
export const automationBase = '/uk/automations'
export const automationOrigin = 'https://crmcustoms.com'
export const categoryLabels: Record<string, string> = labels.categories
export const roleLabels: Record<string, string> = labels.roles
export const industryLabels: Record<string, string> = labels.industries
export const complexityLabels: Record<string, string> = labels.complexity
export const dependencyLabels: Record<string, string> = labels.dependencies
export { budgetOptions, sortOptions, pageSize }
const estimates = new Map(records.flatMap(record => record.variants.map(variant => [
  `${record.id}/${variant.id}`, composeProject(records, [{ automation_id: record.id, variant_id: variant.id }])
] as const)))

export function previewEnabled() {
  return process.env.AUTOMATIONS_PREVIEW === 'true' && (
    process.env.NODE_ENV === 'development' ||
    process.env.CONTEXT === 'deploy-preview' || process.env.CONTEXT === 'branch-deploy'
  )
}

export function availableAutomations(): Automation[] {
  // Public pilot authorized by the owner; draft cards retain noindex and review labels.
  return records.filter(record => record.status !== 'retired' && (record.status === 'published' || record.status === 'draft' || previewEnabled()))
}

export function findAutomation(slug: string) {
  const record = records.find(record => record.slug === slug)
  const id = record?.status === 'retired' ? record.superseded_by : record?.id
  return availableAutomations().find(record => record.id === id)
}

export function findAutomations(params = new URLSearchParams()) {
  const result = queryCatalog({ records: availableAutomations(), labels, estimates }, params)
  const view = params.get('view') === 'list' ? 'list' : 'grid'
  return {
    ...result,
    filters: { ...result.filters, view } as Record<string, string>,
    items: result.items as { record: Automation; variant: Automation['variants'][number]; estimate: ReturnType<typeof automationEstimate>; score: number }[]
  }
}

export function catalogUrl(filters: Record<string, string | number>, changes: Record<string, string | number> = {}) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries({ ...filters, ...changes })) {
    if (value && !(key === 'sort' && value === 'relevance') && !(key === 'view' && value === 'grid') && !(key === 'page' && Number(value) === 1)) params.set(key, String(value))
  }
  return `${automationBase}${params.size ? `?${params}` : ''}`
}

export const number = (value: number) => value.toLocaleString('uk-UA')
export function plural(count: number, one: string, few: string, many: string) {
  const remainder = count % 100
  return remainder >= 11 && remainder <= 14 ? many : count % 10 === 1 ? one : count % 10 >= 2 && count % 10 <= 4 ? few : many
}

export function automationRange(record: Automation) {
  const variants = record.variants.map(variant => automationEstimate(record, variant.id))
  return {
    priceMin: Math.min(...variants.map(estimate => estimate.price_usd_min)), priceMax: Math.max(...variants.map(estimate => estimate.price_usd_max)),
    hoursMin: Math.min(...variants.map(estimate => estimate.hours_min)), hoursMax: Math.max(...variants.map(estimate => estimate.hours_max))
  }
}

export function automationEstimate(record: Automation, variantId: string) {
  return estimates.get(`${record.id}/${variantId}`) || composeProject(records, [{ automation_id: record.id, variant_id: variantId }])
}

export function automationSitemapEntries() {
  const published = records.filter(record => record.status === 'published')
  return published.length ? [
    { url: `${automationOrigin}${automationBase}` },
    ...published.map(record => ({ url: `${automationOrigin}${automationBase}/${record.slug}` }))
  ] : []
}
