import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { availableAutomations, findAutomation, automationEstimate, automationBase, automationOrigin, categoryLabels } from '@/lib/automations'
import styles from '../catalog.module.css'
import { ownedProject } from '@/lib/automation-project'

type Props = { params: Promise<{ lang: string; slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }
export function generateStaticParams() {
  return availableAutomations().map(record => ({ lang: 'uk', slug: record.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params
  const record = lang === 'uk' ? findAutomation(slug) : undefined
  if (!record) return { title: { absolute: 'Рішення не знайдено | CRMCUSTOMS' }, robots: { index: false, follow: false } }
  const url = `${automationOrigin}${automationBase}/${record.slug}`
  const index = record.status === 'published'
  return {
    title: { absolute: `${record.title} | CRMCUSTOMS` }, description: `${record.problem} ${record.outcome}`,
    alternates: { canonical: url }, robots: { index, follow: true, googleBot: { index, follow: true } },
    openGraph: { title: record.title, description: record.summary, url, siteName: 'CRMCUSTOMS', locale: 'uk_UA', type: 'website' }
  }
}

export default async function AutomationPage({ params, searchParams }: Props) {
  const { lang, slug } = await params
  const record = lang === 'uk' ? findAutomation(slug) : undefined
  if (!record) notFound()
  const variantId = (await searchParams).variant
  const variant = variantId === undefined ? record.variants[0] : record.variants.find(item => item.id === variantId)
  if (!variant) notFound()
  const estimate = automationEstimate(record, variant.id)
  const project = process.env.NODE_ENV === 'development' ? await ownedProject() : null
  const breadcrumbs = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'CRMCUSTOMS', item: `${automationOrigin}/uk` },
    { '@type': 'ListItem', position: 2, name: 'Автоматизації', item: `${automationOrigin}${automationBase}` },
    { '@type': 'ListItem', position: 3, name: record.title, item: `${automationOrigin}${automationBase}/${record.slug}` }
  ] }
  return <section className={styles.catalog}><div className={styles.container}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs).replace(/</g, '\\u003c') }} />
    <nav aria-label="Навігаційний шлях"><Link href="/uk">CRMCUSTOMS</Link> / <Link href={automationBase}>Автоматизації</Link> / {record.title}</nav>
    <p className={styles.muted}>{categoryLabels[record.category]} · {record.id}{record.status !== 'published' ? ' · Чернетка, оцінка потребує перевірки' : ''}</p>
    <h1>{record.title}</h1><p>{record.summary}</p>
    <h2>Проблема</h2><p>{record.problem}</p><h2>Результат</h2><p>{record.outcome}</p>
    <h2>Як працює рішення</h2><ol>{record.workflow_steps.map((step, index) => <li key={index}>{step}</li>)}</ol>
    <h2>Варіанти реалізації</h2><div className={styles.variants}>{record.variants.map(item => <Link key={item.id} href={`${automationBase}/${record.slug}?variant=${item.id}`} aria-current={item.id === variant.id ? 'true' : undefined}>{item.title}</Link>)}</div>
    <h2>{variant.title}</h2><p>{variant.description}</p><p><strong>Приклад:</strong> {variant.example}</p>
    <div className={styles.panel}><h2>Попередня оцінка</h2>
      <p>{estimate.hours_min}–{estimate.hours_max} год · {estimate.price_usd_min}–{estimate.price_usd_max} USD</p>
      <p>Оцінка включає необхідні залежності; ставка — {estimate.hourly_rate} USD/год. Остаточний обсяг уточнюємо після аудиту.</p>
      {process.env.NODE_ENV === 'development' && <form method="post" action="/api/automation-project"><input type="hidden" name="action" value="add" /><input type="hidden" name="revision" value={project?.revision || 0} /><input type="hidden" name="automation_id" value={record.id} /><input type="hidden" name="variant_id" value={variant.id} /><button className={styles.button}>Додати до проєкту</button></form>}
      <Link className={styles.button} href="/uk/landing/implementation-crm">Обговорити впровадження</Link>
    </div>
    <h2>Що потрібно для реалізації</h2><ul>{variant.requirements.map((text, index) => <li key={index}>{text}</li>)}</ul>
    <h2>Спосіб реалізації</h2><ul>{variant.implementation_methods.map((text, index) => <li key={index}>{text}</li>)}</ul>
    <h2>Обмеження</h2><ul>{variant.limitations.map((text, index) => <li key={index}>{text}</li>)}</ul>
    <h2>Що не входить у бюджет</h2><ul>{estimate.excluded_work.map((text, index) => <li key={index}>{text}</li>)}</ul>
    <h2>Що потрібно уточнити</h2><ul>{record.configurator_questions.map(question => <li key={question.id}>{question.question}<p>{question.help_text}</p></li>)}</ul>
    <h2>Джерела та межі підтвердження</h2><ul>{record.sources.map((source, index) => <li key={index}><strong>{source.title}</strong><p>{source.supports}</p>{'url' in source && typeof source.url === 'string' && /^https?:\/\//.test(source.url) && !new URL(source.url).username && !new URL(source.url).password && <a href={source.url} rel="noopener noreferrer">Переглянути джерело</a>}</li>)}</ul>
    <p><Link href={automationBase}>Повернутися до каталогу</Link></p>
  </div></section>
}
