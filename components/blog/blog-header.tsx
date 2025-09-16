'use client';

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export default function BlogHeader({ dict }: { dict: any }) {
  return (
    <div className="flex flex-col space-y-4 pb-8">
      <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">{dict.title}</h1>
      <p className="text-muted-foreground">{dict.description}</p>
      <div className="flex w-full max-w-sm items-center space-x-2">
        <Input type="text" placeholder={dict.searchPlaceholder} />
        <Button type="submit" className="bg-amber hover:bg-amber-hover text-black">
          <Search className="h-4 w-4" />
          <span className="sr-only">{dict.searchButton}</span>
        </Button>
      </div>
    </div>
  )
}
