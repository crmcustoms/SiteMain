"use client"

import Link from "next/link"
import { ChevronRight } from "lucide-react"

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  lang?: string
}

export function Breadcrumbs({ items, lang = 'uk' }: BreadcrumbsProps) {
  return (
    <div className="w-full bg-white border-b border-gray-200 py-4 sticky top-16 z-40">
      <div className="container mx-auto px-4 md:px-6 flex items-center gap-2 text-sm">
        {/* Home link */}
        <Link
          href={`/${lang}`}
          className="text-amber hover:text-amber-hover transition font-medium"
        >
          Головна
        </Link>

        {/* Breadcrumb items */}
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <ChevronRight className="w-4 h-4 text-gray-400" />
            {item.href ? (
              <Link
                href={item.href}
                className="text-gray-600 hover:text-amber transition font-medium"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-800 font-medium">{item.label}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
