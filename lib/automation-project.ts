import 'server-only'
import path from 'node:path'
import { cookies } from 'next/headers'
import { ProjectStore, isProjectId } from '@/lib/automation-core/preview-project-store.js'

export const projectCookie = 'crmcustoms_automation_project'
export const projectPath = '/uk/automation-project'
export const projectSharePath = '/uk/automation-projects'
export type Selection = { automation_id: string; variant_id: string; answers?: Record<string, string | boolean | number>; modifier_ids?: string[] }

export function projectStore() {
  // Files are a local development adapter, never a Netlify fallback.
  if (process.env.NODE_ENV !== 'development') throw new Error('Постійне збереження проєктів ще не підключене.')
  return new ProjectStore(process.env.AUTOMATION_PROJECT_DIR || path.join(process.cwd(), 'var/automation-projects'))
}

export async function projectSession() {
  const raw = (await cookies()).get(projectCookie)?.value || ''
  const [id, token] = raw.split('.')
  return isProjectId(id) && /^[a-f0-9]{64}$/.test(token || '') ? { id, token } : null
}

export async function ownedProject() {
  const session = await projectSession()
  if (!session) return null
  const store = projectStore()
  const project = await store.read(session.id)
  return store.owns(project, session.token) ? project : null
}
