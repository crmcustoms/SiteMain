import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { availableAutomations, findAutomation, automationEstimate, automationBase, automationOrigin, categoryLabels, complexityLabels, dependencyLabels, number, plural } from '@/lib/automations'
import { archivo, jetbrains } from '@/lib/automation-catalog-fonts'
import { ownedProject, projectBuilderEnabled, projectPath } from '@/lib/automation-project'
import { ContactFormDialog } from '@/components/contact-form-dialog'
import styles from '../catalog.module.css'

type Props = { params: Promise<{ lang: string; slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }
export function generateStaticParams() { return availableAutomations().map(record => ({ lang: 'uk', slug: record.slug })) }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params
  const record = lang === 'uk' ? findAutomation(slug) : undefined
  if (!record) return { title: { absolute: 'Рішення не знайдено | CRMCUSTOMS' }, robots: { index: false, follow: false } }
  const url = `${automationOrigin}${automationBase}/${record.slug}`
  const index = record.status === 'published'
  return { title: { absolute: `${record.title} | CRMCUSTOMS` }, description: `${record.problem} ${record.outcome}`, alternates: { canonical: url }, robots: { index, follow: true, googleBot: { index, follow: true } }, openGraph: { title: record.title, description: record.summary, url, siteName: 'CRMCUSTOMS', locale: 'uk_UA', type: 'website' } }
}
export default async function AutomationPage({ params, searchParams }: Props) {
  const { lang, slug } = await params
  const record = lang === 'uk' ? findAutomation(slug) : undefined
  if (!record) notFound()
  const variantId = (await searchParams).variant
  const variant = variantId === undefined ? record.variants[0] : record.variants.find(item => item.id === variantId)
  if (!variant) notFound()
  const estimate = automationEstimate(record, variant.id)
  const enabled = projectBuilderEnabled()
  const project = enabled ? await ownedProject() : null
  const added = project?.result.selections.some((item: { automation_id: string }) => item.automation_id === record.id)
  const planfixSources = record.sources.filter(source => {
    if (!('url' in source) || typeof source.url !== 'string') return false
    try { const url = new URL(source.url); return url.protocol === 'https:' && !url.username && !url.password && /(^|\.)planfix\.(com|ru|ua)$/.test(url.hostname) } catch { return false }
  })
  const byId = new Map(availableAutomations().map(item => [item.id, item]))
  const related = record.dependencies.flatMap(dependency => {
    const item = byId.get(dependency.target_id)
    return item ? [{ ...dependency, record: item }] : []
  })
  const requirements = [...new Set([...record.requirements, ...variant.requirements])]
  const limitations = [...new Set([...record.limitations, ...variant.limitations])]
  const add = added ? <Link className={`${styles.btn} ${styles.btnAdded}`} href={projectPath}>✓ У проєкті</Link> : enabled ? <form method="post" action="/api/automation-project"><input type="hidden" name="action" value="add" /><input type="hidden" name="revision" value={project?.revision || 0} /><input type="hidden" name="automation_id" value={record.id} /><input type="hidden" name="variant_id" value={variant.id} /><button type="submit" className={styles.btn}>+ Додати до проєкту</button></form> : null
  const breadcrumbs = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'CRMCUSTOMS', item: `${automationOrigin}/uk` },
    { '@type': 'ListItem', position: 2, name: 'Автоматизації', item: `${automationOrigin}${automationBase}` },
    { '@type': 'ListItem', position: 3, name: record.title, item: `${automationOrigin}${automationBase}/${record.slug}` }
  ] }
  return <section className={`${styles.catalog} ${archivo.variable} ${jetbrains.variable}`}><div className={`${styles.container} ${styles.detailContainer}`}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs).replace(/</g, '\\u003c') }} />
    <nav className={styles.breadcrumbs} aria-label="Навігаційний шлях"><Link href="/uk">CRMCUSTOMS</Link><span>/</span><Link href={automationBase}>Автоматизації</Link><span>/</span><span>{record.id}</span></nav>
    <header className={styles.detailHeader}><p className={styles.marker}>{record.id}<span className={styles.muted}>· {categoryLabels[record.category]}</span></p><h1 className={styles.detailTitle}>{record.title}</h1><p className={styles.detailSummary}>{record.summary}</p>{record.status !== 'published' && <p className={styles.note}>Чернетка · Оцінка потребує перевірки</p>}</header>
    <div className={styles.overview}><section className={styles.sectionCard}><h2 className={styles.label}>01 / Проблема</h2><p>{record.problem}</p></section><section className={`${styles.sectionCard} ${styles.resultCard}`}><h2 className={styles.label}>02 / Результат</h2><p>{record.outcome}</p></section></div>
    <div className={styles.detailLayout}><div className={styles.detailContent}>
      <section><h2 className={`${styles.label} ${styles.sectionHeading}`}>03 / Процес</h2><div className={styles.step}><span className={`${styles.stepNode} ${styles.stepTrigger}`} aria-hidden="true">T</span><p><span className={styles.triggerLabel}>Тригер</span>{record.triggers.join(' · ')}</p></div><ol className={styles.steps}>{record.workflow_steps.map((step, index) => <li className={styles.step} key={index}><span className={styles.stepNode} aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><p>{step}</p></li>)}</ol></section>
      <section><h2 className={`${styles.label} ${styles.sectionHeading}`}><span>04 / Реалізація</span><span>{record.variants.length} {plural(record.variants.length, 'варіант', 'варіанти', 'варіантів')}</span></h2><nav className={styles.variants} aria-label="Варіанти реалізації">{record.variants.map(item => {
        const itemEstimate = automationEstimate(record, item.id)
        return <Link className={styles.variant} key={item.id} href={`${automationBase}/${record.slug}?variant=${encodeURIComponent(item.id)}`} aria-current={item.id === variant.id ? 'page' : undefined}><span className={styles.variantCheck} aria-hidden="true" /><span className={styles.variantMain}><strong className={styles.variantTitle}>{item.title}</strong><span className={styles.variantDescription}>{item.description}</span></span><span className={styles.variantPrice}><strong>{number(itemEstimate.price_usd_min)}–{number(itemEstimate.price_usd_max)} USD</strong><span>{number(itemEstimate.hours_min)}–{number(itemEstimate.hours_max)} год</span><span>{complexityLabels[item.complexity]}</span></span></Link>
      })}</nav><div className={styles.selectedVariant}><h3 className={styles.label}>Приклад · {variant.title}</h3><p>{variant.example}</p><h3 className={styles.label}>Спосіб реалізації</h3><ul>{variant.implementation_methods.map((text, index) => <li key={index}>{text}</li>)}</ul></div></section>
      <details className={styles.disclosure}><summary>Що потрібно для реалізації</summary><ul>{requirements.map((text, index) => <li key={index}>{text}</li>)}</ul></details>
      <section className={styles.limitations}><h2 className={styles.label}>Обмеження</h2><ul>{limitations.map((text, index) => <li key={index}>{text}</li>)}</ul></section>
      <details className={styles.disclosure}><summary>Що потрібно уточнити ({record.configurator_questions.length})</summary><ul>{record.configurator_questions.map(question => <li key={question.id}><strong>{question.question}</strong><p>{question.help_text}</p></li>)}</ul></details>
      {!!related.length && <section><h2 className={`${styles.label} ${styles.sectionHeading}`}>05 / Пов’язані рішення</h2><nav className={styles.related} aria-label="Пов’язані рішення">{related.map(item => <Link key={`${item.type}/${item.target_id}`} href={`${automationBase}/${item.record.slug}`}><span className={styles.relatedId}>{item.target_id}</span><span className={styles.relatedMain}>{item.record.title}<small>{dependencyLabels[item.type]}</small></span><span aria-hidden="true">→</span></Link>)}</nav></section>}
      {!!planfixSources.length && <details className={styles.disclosure}><summary>Матеріали PlanFix</summary><ul>{planfixSources.map((source, index) => <li key={index}><a href={source.url as string} target="_blank" rel="noopener noreferrer">{source.title}</a></li>)}</ul></details>}
    </div><aside className={styles.estimate} aria-label="Попередня оцінка"><h2 className={styles.label}>Бюджет впровадження</h2><p className={styles.estimatePrice}>{number(estimate.price_usd_min)}–{number(estimate.price_usd_max)} USD</p><p className={styles.estimateHours}>{number(estimate.hours_min)}–{number(estimate.hours_max)} год · {variant.title}</p><p className={styles.note}>Оцінка включає необхідні залежності; ставка — {estimate.hourly_rate} USD/год. Остаточний обсяг уточнюємо після аудиту.</p>{add}
      <ContactFormDialog key={variant.id} trigger={<button type="button" className={styles.btn}>Обговорити впровадження</button>} title="Заявка на впровадження" description={`Обговоримо рішення «${record.title}» та обсяг робіт для вашого бізнесу.`} buttonText="Надіслати заявку" dict={{}} initialMessage={`Автоматизація: ${record.title} (${record.id})\nВаріант: ${variant.title}\nПопередня оцінка: ${estimate.hours_min}–${estimate.hours_max} год; ${estimate.price_usd_min}–${estimate.price_usd_max} USD\nСторінка: ${automationOrigin}${automationBase}/${record.slug}?variant=${variant.id}`} />
      <details className={styles.disclosure}><summary>Що не входить у бюджет</summary><ul>{estimate.excluded_work.map((text, index) => <li key={index}>{text}</li>)}</ul></details>
    </aside></div>
    <div className={styles.detailBottom}><div className={styles.price}><strong>{number(estimate.price_usd_min)}–{number(estimate.price_usd_max)} USD</strong><span>{number(estimate.hours_min)}–{number(estimate.hours_max)} год · {variant.title}</span></div>{add}</div><nav className={styles.breadcrumbs}><Link href={automationBase}>← Повернутися до каталогу</Link></nav>
  </div></section>
}
