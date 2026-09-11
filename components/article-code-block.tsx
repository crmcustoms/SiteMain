"use client"

import { useRef, useState } from "react"
import type { ReactNode } from "react"

export function ArticleCodeBlock({ children }: { children?: ReactNode }) {
  const ref = useRef<HTMLPreElement>(null)
  const [copied, setCopied] = useState(false)

  async function copy() {
    const text = ref.current?.innerText ?? ""
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const ta = document.createElement("textarea")
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand("copy")
      document.body.removeChild(ta)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="codeblock">
      <button type="button" className="codeblock-copy" onClick={copy}>
        {copied ? "Скопійовано ✓" : "Копіювати"}
      </button>
      <pre ref={ref}>{children}</pre>
    </div>
  )
}
