import { projectStore } from '@/lib/automation-project'
export const runtime = 'nodejs'
export async function GET(_request: Request, { params }: { params: Promise<{ lang: string; id: string }> }) {
  const { lang, id } = await params
  const headers = { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex, nofollow', 'Content-Disposition': 'attachment; filename="project.json"' }
  if (lang !== 'uk' || process.env.NODE_ENV !== 'development') return Response.json({ error: 'Проєкт не знайдено.' }, { status: 404, headers })
  try { const project = await projectStore().read(id); return project ? Response.json(project.result, { headers }) : Response.json({ error: 'Проєкт не знайдено.' }, { status: 404, headers }) }
  catch { return Response.json({ error: 'Проєкт не знайдено.' }, { status: 404, headers }) }
}
