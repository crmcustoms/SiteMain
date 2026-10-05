import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { projectBuilderEnabled, projectStore, projectPath } from '@/lib/automation-project'
import styles from '../../automations/catalog.module.css'
export const metadata: Metadata = { title: { absolute: 'Перегляд проєкту | CRMCUSTOMS' }, robots: { index: false, follow: false, googleBot: { index: false, follow: false } } }
export const dynamic = 'force-dynamic'
export default async function SharedProject({ params }: { params: Promise<{ lang: string; id: string }> }) {
  const { lang, id } = await params
  if (lang !== 'uk' || !projectBuilderEnabled()) notFound()
  let project
  try { project = await projectStore().read(id) } catch { notFound() }
  if (!project) notFound()
  return <section className={styles.catalog}><div className={styles.container}><h1>Проєкт автоматизацій</h1>
    <p>{project.result.hours_min}–{project.result.hours_max} год · {project.result.price_usd_min}–{project.result.price_usd_max} USD</p>
    <p>Попередня оцінка · версія {project.revision}. Це посилання дозволяє переглядати проєкт.</p>
    <ul>{project.result.items.map((item: { automation_id: string; variant_id: string; hours_min: number; hours_max: number }) => <li key={item.automation_id}>{project.records.find((record: { id: string }) => record.id === item.automation_id)?.title} · {item.variant_id} · {item.hours_min}–{item.hours_max} год</li>)}</ul>
    <h2>Початкові налаштування</h2><pre style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{JSON.stringify(project.result.selections, null, 2)}</pre>
    <h2>Припущення та попередження</h2><ul>{[...project.result.assumptions, ...project.result.warnings].map((text: string, index: number) => <li key={index}>{text}</li>)}</ul>
    <form method="post" action="/api/automation-project"><input type="hidden" name="action" value="copy" /><input type="hidden" name="project_id" value={project.id} /><button className={styles.button}>Створити власну копію</button></form>
    <p><Link href={projectPath}>Мій проєкт</Link></p>
  </div></section>
}
