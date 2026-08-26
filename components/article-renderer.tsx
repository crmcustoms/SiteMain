import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"
import { unbounded, golosText } from "@/lib/fonts"
import "@/styles/article.css"

interface ArticleRendererProps {
  title: string
  date?: string
  excerpt?: string
  body: string
  tag?: string
  readTime?: string
  author?: string
  image?: string
  url?: string
  ctaTitle?: string
  ctaText?: string
  ctaLabel?: string
  ctaHref?: string
}

export function ArticleRenderer({
  title,
  date,
  excerpt,
  body,
  tag,
  readTime,
  author = "CRMCUSTOMS",
  image,
  url,
  ctaTitle = "Є питання по вашому бізнесу?",
  ctaText = "30 хвилин — і зрозумієте, що реально зробити у вашому випадку.",
  ctaLabel = "Записатись на консультацію",
  ctaHref = "https://crmcustoms.com",
}: ArticleRendererProps) {
  const meta = [author, readTime].filter(Boolean).join(" · ")

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description: excerpt,
    datePublished: date || undefined,
    dateModified: date || undefined,
    image: image ? [image] : undefined,
    author: { "@type": "Organization", name: "CRMCUSTOMS", url: "https://crmcustoms.com" },
    publisher: { "@type": "Organization", name: "CRMCUSTOMS", url: "https://crmcustoms.com" },
    mainEntityOfPage: url ? { "@type": "WebPage", "@id": url } : undefined,
  }

  return (
    <section className={`article-page ${unbounded.variable} ${golosText.variable}`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="page">
        {tag && <span className="tag">{tag}</span>}
        <h1>{title}</h1>
        {meta && <p className="meta">{meta}</p>}
        {excerpt && <p className="subtitle">{excerpt}</p>}

        <div className="body">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
            {body}
          </ReactMarkdown>
        </div>

        <div className="cta-block">
          <h3>{ctaTitle}</h3>
          <p>{ctaText}</p>
          <a href={ctaHref} className="cta-btn">
            {ctaLabel}
          </a>
        </div>
      </div>
    </section>
  )
}
