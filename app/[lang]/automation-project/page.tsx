import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ownedProject, projectSharePath, type Selection } from '@/lib/automation-project'
import { availableAutomations, automationBase } from '@/lib/automations'
import { visibleQuestions } from '@/lib/automation-core/index.js'
import styles from '../automations/catalog.module.css'

export const metadata: Metadata = { title: { absolute: 'Мій проєкт автоматизацій | CRMCUSTOMS' }, robots: { index: false, follow: false, googleBot: { index: false, follow: false } } }
export const dynamic = 'force-dynamic'
const endpoint = '/api/automation-project'

export default async function ProjectPage({ params }: { params: Promise<{ lang: string }> }) {
  if ((await params).lang !== 'uk') notFound()
  if (process.env.NODE_ENV !== 'development') return <section className={styles.catalog}><div className={styles.container}><h1>Конструктор проєкту</h1><p>Готуємо постійне збереження проєктів. <Link href={automationBase}>Переглянути рішення</Link>.</p></div></section>
  const project = await ownedProject()
  const selections: Selection[] = project?.result.selections || []
  const revision = project?.revision || 0
  return <section className={styles.catalog}><div className={styles.container}>
    <nav><Link href={automationBase}>Каталог автоматизацій</Link> / Мій проєкт</nav><h1>Мій проєкт автоматизацій</h1>
    <form method="post" action={endpoint} className={styles.filters}>
      <input type="hidden" name="action" value="add" /><input type="hidden" name="revision" value={revision} />
      <label>Додати рішення<select name="automation_id">{availableAutomations().map(record => <option key={record.id} value={record.id}>{record.title}</option>)}</select></label>
      <button className={styles.button}>Додати до проєкту</button>
    </form>
    {!project ? <p>Оберіть перше рішення, щоб розрахувати проєкт.</p> : <>
      <div className={styles.panel}><h2>Попередній бюджет</h2><p>{project.result.hours_min}–{project.result.hours_max} год · {project.result.price_usd_min}–{project.result.price_usd_max} USD</p>
        <form method="post" action={endpoint} className={styles.filters}><input type="hidden" name="action" value="rate" /><input type="hidden" name="revision" value={revision} />
          <label>Ставка, USD/год<input type="number" name="hourly_rate" min="0" step="0.01" defaultValue={project.result.hourly_rate} required /></label><button className={styles.button}>Перерахувати ставку</button>
        </form><p>Попередня оцінка. Остаточний обсяг уточнюємо після аудиту.</p>
        <Link href={`${projectSharePath}/${project.id}`}>Посилання для перегляду</Link> · <a href={`${projectSharePath}/${project.id}/export`}>Завантажити JSON</a>
      </div>
      {project.result.items.map((item: { automation_id: string; variant_id: string; source: string; hours_min: number; hours_max: number }) => {
        const record = project.records.find((record: { id: string }) => record.id === item.automation_id)
        const selection = selections.find(selection => selection.automation_id === record.id)
        const answers = selection?.answers || {}
        const variant = record.variants.find((variant: { id: string }) => variant.id === item.variant_id)
        const questions = visibleQuestions(record, answers) as typeof record.configurator_questions
        return <article key={record.id} className={styles.card}>
          <h2>{record.title}</h2><p>{item.source === 'required_dependency' ? 'Необхідна залежність' : 'Обране рішення'} · {item.hours_min}–{item.hours_max} год</p>
          <form method="post" action={endpoint}>
            <input type="hidden" name="action" value="configure" /><input type="hidden" name="revision" value={revision} /><input type="hidden" name="automation_id" value={record.id} />
            <label>Варіант<select name="variant_id" defaultValue={item.variant_id}>{record.variants.map((variant: { id: string; title: string }) => <option key={variant.id} value={variant.id}>{variant.title}</option>)}</select></label>
            {questions.map((question: { id: string; question: string; type: string; options: string[]; help_text: string }) => <p key={question.id}>
              <label>{question.question}{question.type === 'number'
                ? <input type="number" name={`answer:${question.id}`} defaultValue={typeof answers[question.id] === 'number' ? String(answers[question.id]) : ''} />
                : <select name={`answer:${question.id}`} defaultValue={answers[question.id] === undefined ? '' : String(answers[question.id])}><option value="">Потрібно уточнити</option>{(question.type === 'boolean' ? ['true', 'false'] : question.options).map(option => <option key={option} value={option}>{option === 'true' ? 'Так' : option === 'false' ? 'Ні' : option}</option>)}</select>}
              </label><span className={styles.muted}>{question.help_text}</span>
            </p>)}
            <h3>Додаткові роботи</h3>{variant.pricing_modifiers.map((modifier: { id: string; label: string; hours_min: number; hours_max: number }) => <p key={modifier.id}><label><input style={{ width: 'auto' }} type="checkbox" name="modifier_ids" value={modifier.id} defaultChecked={selection?.modifier_ids?.includes(modifier.id)} /> {modifier.label} · {modifier.hours_min}–{modifier.hours_max} год</label></p>)}
            <button className={styles.button}>Зберегти налаштування</button>
          </form>
          {selection && selections.length > 1 && <form method="post" action={endpoint}><input type="hidden" name="action" value="remove" /><input type="hidden" name="revision" value={revision} /><input type="hidden" name="automation_id" value={record.id} /><button>Прибрати обране рішення</button></form>}
        </article>
      })}
      <h2>Припущення та відкриті питання</h2><ul>{[...project.result.assumptions, ...project.result.warnings].map((text: string, index: number) => <li key={index}>{text}</li>)}</ul>
      <h2>Що не входить у бюджет</h2><ul>{project.result.excluded_work.map((text: string, index: number) => <li key={index}>{text}</li>)}</ul>
      <p>Передача проєкту як заявки ще підключається. Зараз можна <Link href="/uk/landing/implementation-crm">обговорити впровадження з CRMCUSTOMS</Link>.</p>
    </>}
  </div></section>
}
