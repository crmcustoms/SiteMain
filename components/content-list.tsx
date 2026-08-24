import Image from "next/image"
import Link from "next/link"
import type { ContentMeta } from "@/lib/content"

interface ContentListProps {
  items: ContentMeta[]
  basePath: string
  emptyTitle: string
  emptyText: string
}

export function ContentList({ items, basePath, emptyTitle, emptyText }: ContentListProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold mb-4">{emptyTitle}</h3>
        <p className="text-gray-600 mb-6">{emptyText}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {items.map((item) => (
        <article
          key={item.slug}
          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow flex flex-col md:flex-row"
        >
          {item.image && (
            <div className="md:w-1/3 relative aspect-video md:aspect-auto">
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
              />
            </div>
          )}
          <div className="md:w-2/3 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                {item.tag && (
                  <span className="text-xs bg-black text-[#FFD700] px-2 py-1 rounded font-medium">{item.tag}</span>
                )}
                {item.date && <span className="text-xs text-gray-500">{item.date}</span>}
              </div>
              <h2 className="text-xl font-semibold mb-3 line-clamp-2">{item.title}</h2>
              {item.excerpt && <p className="text-gray-600 mb-4 line-clamp-2">{item.excerpt}</p>}
              {item.tags && item.tags.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {item.tags.slice(0, 3).map((t) => (
                    <span key={t} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div>
              <Link
                href={`${basePath}/${item.slug}`}
                className="inline-block bg-[#FFD700] text-black px-4 py-2 rounded transition-colors text-sm font-medium hover:bg-black hover:text-white"
              >
                Читати далі
              </Link>
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}
