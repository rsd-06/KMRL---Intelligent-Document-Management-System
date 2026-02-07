"use client"

import Link from "next/link"
import { useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { DocumentItem } from "@/lib/documents"

type Props = {
  documents: DocumentItem[]
  filterTags: string[]
}

export function DocumentList({ documents, filterTags }: Props) {
  const filtered = useMemo(() => {
    if (filterTags.length === 0) return documents
    const wanted = new Set(filterTags.map((t) => t.toLowerCase()))
    return documents.filter((d) => d.tags.some((t) => wanted.has(t.toLowerCase())))
  }, [documents, filterTags])

  return (
    <div className="grid grid-cols-1 gap-4">
      {filtered.map((doc) => (
        <Card key={doc.id} className="p-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <div>
              <Link
                href={`/doc/${doc.id}`}
                className="text-pretty text-lg font-semibold underline-offset-4 hover:underline"
              >
                {doc.title}
              </Link>
              <div className="mt-1 text-sm text-muted-foreground">
                {doc.category} • {doc.department} • {doc.policyType}
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {doc.tags.map((t) => (
                  <Badge key={t} variant="outline">
                    {t}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-muted-foreground md:mt-0">
              <div className={cn("rounded border px-2 py-1", !doc.issuedDate && "opacity-50")}>
                Issued: {doc.issuedDate || "—"}
              </div>
              <div className={cn("rounded border px-2 py-1", !doc.deadlineDate && "opacity-50")}>
                Deadline: {doc.deadlineDate || "—"}
              </div>
            </div>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{doc.shortSummary}</p>
        </Card>
      ))}
      {filtered.length === 0 && <p className="text-sm text-muted-foreground">No documents match the selected tags.</p>}
    </div>
  )
}
