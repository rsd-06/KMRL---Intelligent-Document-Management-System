"use client"

import { useMemo, useState } from "react"
import { useAuth } from "@/components/auth-context"
import { TagSearch } from "@/components/tag-search"
import { DocumentList } from "@/components/document-list"
import { HomeSidebar } from "@/components/home-sidebar"
import { documents } from "@/lib/documents"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CalendarWidget } from "@/components/calendar"

export default function HomePage() {
  const { isLoggedIn, login } = useAuth()
  const [tags, setTags] = useState<string[]>([])

  const suggestions = useMemo(() => {
    const set = new Set<string>()
    documents.forEach((d) => d.tags.forEach((t) => set.add(t)))
    return Array.from(set)
  }, [])

  if (!isLoggedIn) {
    return (
      <section className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-balance text-3xl font-bold">Welcome to KMRL Intelligent Document System</h1>
        <p className="text-pretty leading-relaxed text-muted-foreground">
          Explore policies, SOPs, and documents with an interactive calendar, tag-based search, and a relationship
          graph-driven detail view. Login to access the dashboard.
        </p>
        <Button onClick={login} className="mt-2">
          Login
        </Button>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">
            Navigation preview:{" "}
            <Link className="underline underline-offset-4" href="/policies">
              Policies / SOP
            </Link>
            ,{" "}
            <Link className="underline underline-offset-4" href="/category">
              Category
            </Link>
            ,{" "}
            <Link className="underline underline-offset-4" href="/department">
              Department
            </Link>
            . Some features require login.
          </p>
        </Card>
      </section>
    )
  }

  return (
    <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <div className="space-y-4">
        <TagSearch value={tags} onChange={setTags} suggestions={suggestions} />
        <DocumentList documents={documents} filterTags={tags} />
      </div>
      <div className="order-first md:order-none md:col-span-1 flex items-start justify-center">
        {/* Centered, larger, blue-accent calendar */}
        <div className="w-full max-w-[680px]">
          <CalendarWidget emphasizeBlue large />
        </div>
      </div>
      <div className="md:col-span-1">
        {/* Sidebar now only chat and other widgets (calendar moved to center) */}
        <HomeSidebar />
      </div>
    </section>
  )
}
