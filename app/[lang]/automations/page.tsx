import type { Metadata } from 'next'
import Link from 'next/link'
import { Fragment } from 'react'
import { notFound } from 'next/navigation'
import { availableAutomations, findAutomations, categoryLabels, roleLabels, industryLabels, complexityLabels, budgetOptions, sortOptions, catalogUrl, automationRange, automationBase, automationOrigin, number, plural, type Automation } from '@/lib/automations'
import { ownedProject, projectBuilderEnabled, projectPath } from '@/lib/automation-project'
import { archivo, jetbrains } from '@/lib/automation-catalog-fonts'
import { ContactFormDialog } from '@/components/contact-form-dialog'
import styles from './catalog.module.css'

type Props = { params: Promise<{ lang: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }
const popular = [
  ['заявки губляться', 'як розподіляти нові заявки між менеджерами'], ['рахунки вручну', 'як створити рахунок із позицій підтвердженого замовлення'],
  ['дебіторка', 'як нагадати клієнту про прострочений рахунок'], ['залишки на складі', 'як повідомити про розбіжність фактичного і системного залишку'],
  ['договори на підпис', 'як контролювати хто затримує підписання договору'], ['онбординг працівника', 'як підготувати доступи і план адаптації нового співробітника'],
  ['звіт для власника', 'як отримувати щоденний звіт показників із кількох систем'], ['повернення товару', 'повернення товару']
]
export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams
  const filtered = ['q', 'category', 'role', 'industry', 'complexity', 'budget', 'sort', 'view', 'page'].some(key => !!params[key])
  const index = availableAutomations().some(record => record.status === 'published') && !filtered
  return { title: { absolute: 'Автоматизації бізнесу — каталог рішень | CRMCUSTOMS' }, description: 'Практичні рішення для бізнесу: проблема, результат, варіанти реалізації та попередня оцінка впровадження.', alternates: { canonical: `${automationOrigin}${automationBase}` }, robots: { index, follow: true, googleBot: { index, follow: true } } }
}
function Flow({ record }: { record: Automation }) {
  return <div className={styles.cover} aria-hidden="true">
    <div className={styles.coverLabels}><span>Тригер</span><span>{record.workflow_steps.length} {plural(record.workflow_steps.length, 'крок', 'кроки', 'кроків')}</span><span>Результат</span></div>
    <div className={styles.flow}><span className={`${styles.node} ${styles.nodeTrigger}`}>T</span>{record.workflow_steps.slice(0, 5).map((_, index) => <Fragment key={index}><span className={styles.edge} /><span className={styles.node}>{String(index + 1).padStart(2, '0')}</span></Fragment>)}<span className={styles.edge} /><span className={`${styles.node} ${styles.nodeResult}`}>✓</span></div>
    <div className={styles.coverTrigger}>→ {record.triggers[0]}</div>
  </div>
}
export default async function AutomationsPage({ params, searchParams }: Props) {
  if ((await params).lang !== 'uk') notFound()
  const urlParams = new URLSearchParams()
  for (const [key, value] of Object.entries(await searchParams)) if (typeof value === 'string') urlParams.set(key, value)
  const result = findAutomations(urlParams)
  const { filters, total, page, pages, categoryCounts } = result
  const available = availableAutomations()
  const categories = Object.keys(categoryLabels).filter(id => available.some(record => record.category === id))
  const categoryTotal = Object.values(categoryCounts).reduce((sum, count) => sum + count, 0)
  const enabled = projectBuilderEnabled()
  const project = enabled ? await ownedProject() : null
  const selections: { automation_id: string }[] = project?.result.selections || []
  const hasFilters = ['q', 'category', 'role', 'industry', 'complexity', 'budget'].some(key => !!filters[key])
  const formId = 'catalog-search'
  const activeGroups: [string, string][] = [['category', categoryLabels[filters.category]], ['role', roleLabels[filters.role]], ['industry', industryLabels[filters.industry]], ['complexity', complexityLabels[filters.complexity]], ['budget', budgetOptions[filters.budget as keyof typeof budgetOptions]]]
  const add = (record: Automation, variantId: string) => selections.some(item => item.automation_id === record.id)
    ? <Link className={`${styles.btn} ${styles.btnSm} ${styles.btnAdded} ${styles.cardAdd}`} href={projectPath}>✓ У проєкті</Link>
    : enabled ? <form method="post" action="/api/automation-project" className={styles.cardAdd}><input type="hidden" name="action" value="add" /><input type="hidden" name="revision" value={project?.revision || 0} /><input type="hidden" name="automation_id" value={record.id} /><input type="hidden" name="variant_id" value={variantId} /><button className={`${styles.btn} ${styles.btnSm}`} type="submit">+ До проєкту</button></form>
    : <Link className={`${styles.btn} ${styles.btnSm} ${styles.cardAdd}`} href={`${automationBase}/${record.slug}?variant=${encodeURIComponent(variantId)}`}>Обрати варіант →</Link>
  return <section className={`${styles.catalog} ${archivo.variable} ${jetbrains.variable} ${selections.length ? styles.withBar : ''}`}>
    <header className={styles.hero}><div className={`${styles.container} ${styles.heroInner}`}>
      <p className={styles.marker}>Каталог автоматизацій <span className={styles.muted}>· {number(available.length)} {plural(available.length, 'рішення', 'рішення', 'рішень')}</span></p>
      <h1 className={styles.h1}>Що <span className={styles.hook}>гальмує</span> ваш бізнес?</h1>
      <p className={styles.lead}>Опишіть проблему своїми словами. Покажемо готові рішення, варіанти реалізації та діапазон бюджету.</p>
      <form id={formId} method="get" action={automationBase} className={styles.search}>
        <label htmlFor="catalog-query" className={styles.searchPrefix}>Пошук /</label><input key={filters.q} id="catalog-query" aria-label="Ваша проблема" className={styles.searchInput} type="search" name="q" defaultValue={filters.q} maxLength={200} placeholder="Наприклад: заявки губляться між менеджерами" />
        {filters.q && <Link className={styles.searchClear} href={catalogUrl(filters, { q: '', page: 1 })} aria-label="Очистити пошуковий запит">× Очистити</Link>}
        <input type="hidden" name="category" value={filters.category} /><input type="hidden" name="view" value={filters.view} /><button className={styles.searchSubmit} type="submit">Знайти →</button>
      </form>
      <div className={styles.chips}><span className={styles.label}>Часто шукають</span>{popular.map(([title, query]) => <Link key={title} className={styles.chip} href={catalogUrl({ view: filters.view }, { q: query, page: 1 })}>{title}</Link>)}</div>
      <p className={styles.note}>Пілотний каталог. Чернетки й попередні оцінки проходять перевірку; обсяг погоджуємо після аудиту.</p>
    </div></header>
    <div className={styles.container}><div className={styles.body}>
      <aside className={styles.aside} aria-label="Фільтри каталогу"><details className={styles.filterDetails}><summary>Фільтри{hasFilters ? ' · застосовані' : ''}</summary><div className={styles.filterGroups}>
        <div className={styles.group}><h2 className={styles.label}>01 / Категорія</h2><nav className={styles.cats} aria-label="Категорії автоматизацій">
          <Link className={styles.cat} href={catalogUrl(filters, { category: '', page: 1 })} aria-current={!filters.category ? 'page' : undefined}><span className={styles.catName}>Усі категорії</span><span className={styles.count}>{number(categoryTotal)}</span></Link>
          {categories.map(id => <Link key={id} className={styles.cat} data-empty={!categoryCounts[id] || undefined} aria-current={filters.category === id ? 'page' : undefined} href={catalogUrl(filters, { category: id, page: 1 })}><span className={styles.catName}>{categoryLabels[id]}</span><span className={styles.count}>{categoryCounts[id]}</span></Link>)}
        </nav></div>
        {([['role', '02 / Роль', 'Усі ролі', roleLabels], ['industry', '03 / Галузь', 'Усі галузі', industryLabels]] as const).map(([name, label, empty, options]) => <div className={styles.group} key={name}><label className={styles.label} htmlFor={`catalog-${name}`}>{label}</label><select id={`catalog-${name}`} form={formId} className={styles.select} name={name} defaultValue={filters[name]}><option value="">{empty}</option>{Object.entries(options).filter(([id]) => id !== 'cross-industry').map(([id, text]) => <option value={id} key={id}>{text}</option>)}</select></div>)}
        {([['complexity', '04 / Складність', { '': 'Усі', ...complexityLabels }], ['budget', '05 / Бюджет до', { '': 'Будь-як', '300': '300', '600': '600', '1500': '1 500' }]] as const).map(([name, legend, options]) => <fieldset className={styles.group} key={name}><legend className={styles.label}>{legend}</legend><div className={styles.segs}>{Object.entries(options).sort(([a], [b]) => a === '' ? -1 : b === '' ? 1 : 0).map(([id, text]) => <label key={id} className={styles.seg}><input form={formId} type="radio" name={name} value={id} defaultChecked={filters[name] === id} /><span>{text}</span></label>)}</div>{name === 'budget' && <p className={styles.note}>USD · ставка 30 USD/год</p>}</fieldset>)}
        <button form={formId} className={`${styles.btn} ${styles.btnOutline}`} type="submit">Застосувати</button>{hasFilters && <Link className={`${styles.btn} ${styles.btnOutline}`} href={automationBase}>× Скинути фільтри</Link>}
      </div></details></aside>
      <div className={styles.main}><div className={styles.toolbar}>
        <p role="status" className={styles.found}>Знайдено {number(total)} {plural(total, 'рішення', 'рішення', 'рішень')}{filters.q ? ` · «${filters.q}»` : ''}</p>
        <label className={styles.sortLabel}>Сортування<select form={formId} className={styles.sortSelect} name="sort" defaultValue={filters.sort}>{Object.entries(sortOptions).map(([id, text]) => <option key={id} value={id}>{text}</option>)}</select></label><button className={styles.sortApply} form={formId} type="submit">Застосувати</button>
        <nav className={styles.toggle} aria-label="Вигляд каталогу">{['grid', 'list'].map(view => <Link key={view} href={catalogUrl({ ...filters, page }, { view })} aria-current={filters.view === view ? 'page' : undefined}>{view === 'grid' ? 'Сітка' : 'Список'}</Link>)}</nav>
      </div>
      {hasFilters && <div className={styles.tags}>{activeGroups.filter(([key]) => filters[key]).map(([key, title]) => <Link className={styles.tag} key={key} href={catalogUrl(filters, { [key]: '', page: 1 })} aria-label={`Прибрати фільтр: ${title}`}>{title} ×</Link>)}</div>}
      {!total && <div className={styles.empty}><span className={styles.label}>0 результатів</span><h2 className={styles.emptyTitle}>Готового рішення немає</h2><p>Опишіть задачу нам напряму. Ми розберемо процес і запропонуємо автоматизацію під ваш стек.</p><div className={styles.emptyActions}><ContactFormDialog trigger={<button className={styles.btn} type="button">Описати задачу →</button>} title="Заявка на впровадження" description="Опишіть процес, який хочете автоматизувати." buttonText="Надіслати заявку" dict={{}} initialMessage={filters.q ? `Потрібна автоматизація: ${filters.q}` : ''} /><Link className={`${styles.btn} ${styles.btnOutline}`} href={automationBase}>Скинути пошук</Link></div></div>}
      <div className={filters.view === 'list' ? styles.list : styles.grid}>{result.items.map(({ record, variant }) => {
        const range = automationRange(record)
        const price = <div className={styles.price}><strong>{number(range.priceMin)}–{number(range.priceMax)} USD</strong><span>{number(range.hoursMin)}–{number(range.hoursMax)} год · {record.variants.length} {plural(record.variants.length, 'варіант', 'варіанти', 'варіантів')}</span></div>
        return filters.view === 'list' ? <article key={record.id} className={styles.row}>
          <div className={styles.rowId}>{record.id}<span className={styles.bars} aria-hidden="true">{record.workflow_steps.slice(0, 5).map((_, index) => <i key={index} />)}<i /></span></div><div className={styles.rowMain}><p className={styles.cardMeta}>{categoryLabels[record.category]}{record.status !== 'published' ? ' · Чернетка' : ''}</p><h2 className={styles.rowTitle}><Link className={styles.cardLink} href={`${automationBase}/${record.slug}`}>{record.title}</Link></h2><p className={styles.rowProblem}>{record.problem}</p></div><div className={styles.rowPrice}>{price}</div>{add(record, variant.id)}
        </article> : <article key={record.id} className={styles.card}><Flow record={record} /><div className={styles.cardBody}>
          <p className={styles.cardMeta}><span>{record.id}</span><span>{categoryLabels[record.category]}{record.status !== 'published' ? ' · Чернетка' : ''}</span></p><h2 className={styles.cardTitle}><Link className={styles.cardLink} href={`${automationBase}/${record.slug}`}>{record.title}</Link></h2>
          <div className={styles.pr}><p className={`${styles.prRow} ${styles.prProblem}`}><span>Проблема</span><span>{record.problem}</span></p><p className={styles.prRow}><span>Результат</span><span>{record.outcome}</span></p></div><div className={styles.cardFoot}>{price}{add(record, variant.id)}</div>
        </div></article>
      })}</div>
      {pages > 1 && <nav className={styles.pagination} aria-label="Сторінки каталогу">{page > 1 && <Link className={`${styles.btn} ${styles.btnOutline}`} href={catalogUrl(filters, { page: page - 1 })}>← Попередня</Link>}<span className={styles.note}>{page} / {pages}</span>{page < pages && <Link className={`${styles.btn} ${styles.btnOutline}`} href={catalogUrl(filters, { page: page + 1 })}>Показати ще {Math.min(12, total - page * 12)} · Залишилось {total - page * 12}</Link>}</nav>}
      </div>
    </div></div>
    {!!selections.length && <div className={styles.projectBar}><div className={styles.container}><div className={styles.projectStats}><span>Мій проєкт · {selections.length} {plural(selections.length, 'рішення', 'рішення', 'рішень')}</span><span className={styles.hours}>{number(project.result.hours_min)}–{number(project.result.hours_max)} год</span><span className={styles.sum}>{number(project.result.price_usd_min)}–{number(project.result.price_usd_max)} USD</span></div><Link className={styles.btn} href={projectPath}>Сформувати заявку →</Link></div></div>}
  </section>
}
