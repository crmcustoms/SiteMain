import { readFileSync } from 'fs'
import { join } from 'path'
import ReactMarkdown from 'react-markdown'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Умови використання | CRM Customs',
  description: 'Умови використання сайту CRM Customs. Ознайомтесь з правилами користування нашим сервісом.',
}

export default function TermsPage({ params }: { params: { lang: string } }) {
  const filePath = join(process.cwd(), 'docs', 'umovy_vykorystannia.md')
  const content = readFileSync(filePath, 'utf-8')

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-8 py-16 max-w-4xl">
        <div className="prose prose-lg max-w-none dark:prose-invert">
          <ReactMarkdown
            components={{
              h1: ({ node, ...props }) => <h1 className="text-4xl font-bold mb-6 text-black" {...props} />,
              h2: ({ node, ...props }) => <h2 className="text-2xl font-bold mt-8 mb-4 text-black" {...props} />,
              h3: ({ node, ...props }) => <h3 className="text-xl font-bold mt-6 mb-3 text-black" {...props} />,
              p: ({ node, ...props }) => <p className="text-base text-black/70 leading-relaxed mb-4" {...props} />,
              ul: ({ node, ...props }) => <ul className="list-disc pl-6 mb-4 space-y-2" {...props} />,
              ol: ({ node, ...props }) => <ol className="list-decimal pl-6 mb-4 space-y-2" {...props} />,
              li: ({ node, ...props }) => <li className="text-base text-black/70" {...props} />,
              strong: ({ node, ...props }) => <strong className="font-bold text-black" {...props} />,
              em: ({ node, ...props }) => <em className="italic text-black/70" {...props} />,
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  )
}
