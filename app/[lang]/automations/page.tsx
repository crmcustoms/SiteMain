import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { availableAutomations, findAutomations, categoryLabels, automationBase, automationOrigin } from '@/lib/automations'
import styles from './catalog.module.css'

type Props = { params: Promise<{ lang: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }
const value = (input: string | string[] | undefined) => typeof input === 'string' ? input.trim().slice(0, 200) : ''

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams
  const index = availableAutomations().some(record => record.status === 'published') && !value(params.q) && !value(params.category)
  return {
    title: { absolute: 'Автоматизації бізнесу — каталог рішень | CRMCUSTOMS' },
    description: 'Практичні рішення для бізнесу: проблема, результат, варіанти реалізації та попередня оцінка впровадження.',
    alternates: { canonical: `${automationOrigin}${automationBase}` },
    robots: { index, follow: true, googleBot: { index, follow: true } }
  }
}

export default async function AutomationsPage({ params, searchParams }: Props) {
  if ((await params).lang !== 'uk') notFound()
  const filters = await searchParams
  const query = value(filters.q)
  const rawCategory = value(filters.category)
  const category = Object.hasOwn(categoryLabels, rawCategory) ? rawCategory : ''
  const records = findAutomations(query, category)
  const categories = [...new Set(availableAutomations().map(record => record.category))]
  return <section className={styles.catalog}><div className={styles.container}>
    <nav aria-label="Навігаційний шлях"><Link href="/uk">CRMCUSTOMS</Link> / Автоматизації</nav>
    <h1>Автоматизації бізнесу</h1>
    <p>Знайдіть рішення для своєї бізнес-проблеми. Порівняйте варіанти, вимоги та попередній бюджет впровадження.</p>
    <p className={styles.muted}>Пілотний каталог. Чернетки й оцінки проходять перевірку; остаточний обсяг та бюджет узгоджуємо після аудиту.</p>
    <form method="get" action={automationBase} className={styles.filters}>
      <label>Ваша проблема<input type="search" name="q" defaultValue={query} maxLength={200} placeholder="Наприклад, прострочена оплата" /></label>
      <label>Категорія<select name="category" defaultValue={category}><option value="">Усі категорії</option>{categories.map(id => <option key={id} value={id}>{categoryLabels[id]}</option>)}</select></label>
      <button className={styles.button} type="submit">Знайти рішення</button>
    </form>
    <p role="status">Знайдено рішень: {records.length}</p>
    {!availableAutomations().length && <p>Готуємо каталог до публікації. Поки що можна <Link href="/uk/landing/implementation-crm">обговорити впровадження з CRMCUSTOMS</Link>.</p>}
    {!!availableAutomations().length && !records.length && <p>За цим запитом рішень не знайдено. Спробуйте іншу фразу або приберіть категорію.</p>}
    <div className={styles.grid}>{records.map(record => <article className={styles.card} key={record.id}>
      <p className={styles.muted}>{categoryLabels[record.category]}{record.status !== 'published' ? ' · Чернетка' : ''}</p>
      <h2><Link href={`${automationBase}/${record.slug}`}>{record.title}</Link></h2>
      <p><strong>Проблема</strong>{record.problem}</p><p><strong>Результат</strong>{record.outcome}</p>
      <Link href={`${automationBase}/${record.slug}`}>Варіанти та оцінка</Link>
    </article>)}</div>
  </div></section>
}
