"use client"

import { useMemo, useState } from "react"
import { documents } from "@/lib/documents"
import { TagSearch } from "@/components/tag-search"
import { DocumentList } from "@/components/document-list"

export default function CategoryPage() {
  const [tags, setTags] = useState<string[]>([])
  const categories = useMemo(() => Array.from(new Set(documents.map((d) => d.category))), [])
  const [active, setActive] = useState<string | "All">("All")

  const filtered = useMemo(() => {
    return active === "All" ? documents : documents.filter((d) => d.category === active)
  }, [active])

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {["All", ...categories].map((c) => (
          <button
            key={c}
            onClick={() => setActive(c)}
            className={`rounded px-3 py-1 text-sm ${active === c ? "bg-muted" : "bg-card text-muted-foreground hover:text-foreground"}`}
          >
            {c}
          </button>
        ))}
      </div>
      <TagSearch value={tags} onChange={setTags} />
      <DocumentList documents={filtered} filterTags={tags} />
    </section>
  )
}
