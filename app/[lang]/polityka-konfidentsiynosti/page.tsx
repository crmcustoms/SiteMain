import { readFileSync } from 'fs'
import { join } from 'path'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Політика конфіденційності | CRM Customs',
  description: 'Політика конфіденційності сайту CRM Customs. Узнайте як ми обробляємо ваші персональні дані.',
}

// Simple markdown to HTML converter
function markdownToHtml(md: string): string {
  let html = md

  // Headers
  html = html.replace(/^### (.*?)$/gm, '<h3 class="text-xl font-bold mt-6 mb-3 text-black">$1</h3>')
  html = html.replace(/^## (.*?)$/gm, '<h2 class="text-2xl font-bold mt-8 mb-4 text-black">$1</h2>')
  html = html.replace(/^# (.*?)$/gm, '<h1 class="text-4xl font-bold mb-6 text-black">$1</h1>')

  // Lists
  html = html.replace(/^\- (.*?)$/gm, '<li class="text-base text-black/70">$1</li>')
  html = html.replace(/(<li[^>]*>.*?<\/li>)/s, '<ul class="list-disc pl-6 mb-4 space-y-2">$1</ul>')

  // Bold and italic
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-black">$1</strong>')
  html = html.replace(/\*(.*?)\*/g, '<em class="italic text-black/70">$1</em>')

  // Paragraphs
  html = html.replace(/\n\n/g, '</p><p class="text-base text-black/70 leading-relaxed mb-4">')
  html = `<p class="text-base text-black/70 leading-relaxed mb-4">${html}</p>`

  return html
}

export default function PrivacyPage() {
  const filePath = join(process.cwd(), 'docs', 'polityka_konfidentsiynosti.md')
  const content = readFileSync(filePath, 'utf-8')
  const html = markdownToHtml(content)

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-8 py-16 max-w-4xl">
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>
  )
}
