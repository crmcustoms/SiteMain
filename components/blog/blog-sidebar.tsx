"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bookmark, Tag, TrendingUpIcon as Trending } from "lucide-react"
import { submitForm } from "@/lib/actions"
import { useToast } from "@/hooks/use-toast"

export default function BlogSidebar({ dict, lang = 'ua' }: { dict: any; lang?: string }) {
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("email", email)
      formData.append("formType", "subscribe")

      const result = await submitForm(formData)

      if (result.success) {
        toast({
          title: "Успішно!",
          description: result.message,
          variant: "default",
        })
        // Очищаємо форму після успішної відправки
        setEmail("")
      } else {
        toast({
          title: "Помилка!",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Помилка відправки форми:", error)
      toast({
        title: "Помилка!",
        description: "Сталася помилка при відправці форми. Спробуйте пізніше.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Trending className="mr-2 h-5 w-5 text-amber" />
            {dict.popularPosts}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {dict.popular.map((post: any, index: number) => (
              <li key={index}>
                <Link href={`/${lang}/blog/${post.slug}`} className="hover:underline">
                  {post.title}
                </Link>
                <p className="text-sm text-muted-foreground">{post.date}</p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Tag className="mr-2 h-5 w-5 text-amber" />
            {dict.categories}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {dict.categoryList.map((category: string, index: number) => (
              <Button key={index} variant="outline" size="sm">
                {category}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bookmark className="mr-2 h-5 w-5 text-amber" />
            {dict.subscribe}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">{dict.subscribeText}</p>
          <form onSubmit={handleSubmit} className="space-y-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={dict.emailPlaceholder}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              required
            />
            <Button type="submit" className="w-full bg-amber hover:bg-amber-hover text-black" disabled={isSubmitting}>
              {isSubmitting ? "Відправка..." : dict.subscribeButton}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
