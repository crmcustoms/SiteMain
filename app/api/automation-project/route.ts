import { NextRequest, NextResponse } from 'next/server'
import { availableAutomations } from '@/lib/automations'
import { records, visibleQuestions } from '@/lib/automation-core/index.js'
import { ProjectError } from '@/lib/automation-core/preview-project-store.js'
import { requestOrigin, isSameOriginRequest } from '@/lib/automation-core/request-origin.js'
import { validateContact, createLeadSender } from '@/lib/automation-core/lead-contract.js'
import { projectBuilderEnabled, projectCookie, projectPath, projectSession, projectStore, type Selection } from '@/lib/automation-project'

export const runtime = 'nodejs'
const responseHeaders = { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex, nofollow' }

async function readForm(request: NextRequest) {
  if (request.headers.get('content-type')?.split(';')[0] !== 'application/x-www-form-urlencoded') throw new ProjectError('Непідтримуваний формат форми.', 415)
  const reader = request.body?.getReader()
  if (!reader) throw new ProjectError('Форма порожня.')
  const chunks: Uint8Array[] = []
  let size = 0
  while (true) {
    const chunk = await reader.read()
    if (chunk.done) break
    size += chunk.value.byteLength
    if (size > 65536) { await reader.cancel(); throw new ProjectError('Форма надто велика.', 413) }
    chunks.push(chunk.value)
  }
  const form = new URLSearchParams(Buffer.concat(chunks).toString('utf8'))
  for (const key of new Set(form.keys())) if (key !== 'modifier_ids' && form.getAll(key).length > 1) throw new ProjectError('Повторні параметри форми.')
  return form
}

export async function POST(request: NextRequest) {
  try {
    const targetOrigin = requestOrigin(request)
    if (!targetOrigin || !isSameOriginRequest(request)) throw new ProjectError('Надішліть форму зі сторінки проєкту.', 403)
    if (!projectBuilderEnabled()) return NextResponse.json({ error: 'Постійне збереження проєктів ще не підключене.' }, { status: 503, headers: responseHeaders })
    const form = await readForm(request)
    const store = projectStore()
    const session = await projectSession()
    let project = session ? await store.read(session.id) : null
    if (!session || !store.owns(project, session.token)) project = null
    const action = form.get('action')
    if (action === 'submit') {
      if (!project || !session) throw new ProjectError('Заявка доступна власнику проєкту.', 403)
      const contact = validateContact(form)
      const sender = createLeadSender({ url: process.env.N8N_ORDERS_URL, secret: process.env.WEBHOOK_SECRET, projectPath: '/uk/automation-projects' })
      if (!sender) throw new ProjectError('Приймання заявок тимчасово недоступне. Зверніться до CRMCUSTOMS.', 503)
      await store.submit(project.id, session.token, Number(form.get('revision')), (snapshot: unknown, key: string) => sender(snapshot, key, contact, 'https://crmcustoms.com'))
      return NextResponse.redirect(new URL(projectPath, targetOrigin), { status: 303, headers: responseHeaders })
    }
    const id = form.get('automation_id') || ''
    if (action === 'copy') {
      const source = await store.read(form.get('project_id'))
      if (!source) throw new ProjectError('Проєкт не знайдено.', 404)
      const created = await store.create(source.records, source.result.selections, source.result.hourly_rate)
      const response = NextResponse.redirect(new URL(projectPath, targetOrigin), 303)
      response.cookies.set(projectCookie, `${created.project.id}.${created.token}`, { httpOnly: true, sameSite: 'strict', secure: request.nextUrl.protocol === 'https:', path: '/', maxAge: 31536000 })
      Object.entries(responseHeaders).forEach(([key, value]) => response.headers.set(key, value))
      return response
    }
    const revision = Number(form.get('revision'))
    if (project && project.revision !== revision) throw new ProjectError('Проєкт уже змінено. Оновіть сторінку.', 409)
    if (!project && action !== 'add') throw new ProjectError('Спочатку додайте рішення з каталогу.', 403)
    let selections: Selection[] = structuredClone(project?.result.selections || [])
    const snapshot = project?.records || records
    let hourlyRate = project?.result.hourly_rate || 30
    if (action === 'add') {
      const record = project ? snapshot.find((item: { id: string }) => item.id === id) : availableAutomations().find(item => item.id === id)
      const variantId = form.get('variant_id') || record?.variants[0].id
      if (!record || !record.variants.some((item: { id: string }) => item.id === variantId)) throw new ProjectError('Невідоме рішення або варіант.')
      if (!selections.some(item => item.automation_id === id)) selections.push({ automation_id: id, variant_id: variantId as string })
    } else if (action === 'remove') {
      selections = selections.filter(item => item.automation_id !== id)
      if (!selections.length) throw new ProjectError('У проєкті має залишитися хоча б одне рішення.')
    } else if (action === 'rate') {
      hourlyRate = Number(form.get('hourly_rate'))
    } else if (action === 'configure') {
      const record = snapshot.find((item: { id: string }) => item.id === id)
      const variantId = form.get('variant_id') || ''
      if (!record?.variants.some((item: { id: string }) => item.id === variantId)) throw new ProjectError('Невідомий варіант.')
      const answers: Record<string, string | boolean | number> = {}
      for (const question of record.configurator_questions) {
        const raw = form.get(`answer:${question.id}`)
        if (raw !== null && raw !== '') answers[question.id] = question.type === 'boolean' ? raw === 'true' : question.type === 'number' ? Number(raw) : raw
      }
      const visible = new Set(visibleQuestions(record, answers).map((question: { id: string }) => question.id))
      for (const key of Object.keys(answers)) if (!visible.has(key)) delete answers[key]
      const previous = selections.find(item => item.automation_id === id)
      const modifierIds = previous && previous.variant_id !== variantId ? [] : form.getAll('modifier_ids')
      const selection = { automation_id: id, variant_id: variantId, answers, modifier_ids: modifierIds }
      selections = [...selections.filter(item => item.automation_id !== id), selection]
    } else throw new ProjectError('Невідома дія.')
    let token = session?.token
    if (project) await store.update(project.id, token, revision, snapshot, selections, hourlyRate)
    else { const created = await store.create(snapshot, selections, hourlyRate); project = created.project; token = created.token }
    const response = NextResponse.redirect(new URL(projectPath, targetOrigin), 303)
    response.cookies.set(projectCookie, `${project.id}.${token}`, { httpOnly: true, sameSite: 'strict', secure: request.nextUrl.protocol === 'https:', path: '/', maxAge: 31536000 })
    Object.entries(responseHeaders).forEach(([key, value]) => response.headers.set(key, value))
    return response
  } catch (error) {
    const status = error instanceof ProjectError ? error.status : 400
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Не вдалося змінити проєкт.' }, { status, headers: responseHeaders })
  }
}
