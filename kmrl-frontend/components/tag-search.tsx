"use client"

import type React from "react"

import { useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

type Props = {
  value: string[]
  onChange: (tags: string[]) => void
  suggestions?: string[]
}

export function TagSearch({ value, onChange, suggestions = [] }: Props) {
  const [text, setText] = useState("")

  const normalized = useMemo(() => value.map((t) => t.trim().toLowerCase()).filter(Boolean), [value])

  const addTag = (t: string) => {
    const tag = t.trim().toLowerCase()
    if (!tag) return
    if (!normalized.includes(tag)) onChange([...normalized, tag])
    setText("")
  }

  const removeTag = (tag: string) => {
    onChange(normalized.filter((t) => t !== tag))
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      addTag(text)
    } else if (e.key === "Backspace" && text === "" && normalized.length > 0) {
      removeTag(normalized[normalized.length - 1])
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm text-muted-foreground">Search by tags</label>
      <div className="flex flex-wrap items-center gap-2 rounded-md border bg-card p-2">
        {normalized.map((t) => (
          <Badge
            key={t}
            variant="secondary"
            className="cursor-pointer"
            onClick={() => removeTag(t)}
            aria-label={`Remove tag ${t}`}
          >
            {t}
          </Badge>
        ))}
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Type a tag and press Enter"
          className="border-none shadow-none focus-visible:ring-0"
          aria-label="Tag search input"
        />
      </div>
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {suggestions.slice(0, 8).map((s) => (
            <button
              key={s}
              onClick={() => addTag(s)}
              className="text-xs text-muted-foreground underline-offset-2 hover:underline"
              aria-label={`Add suggested tag ${s}`}
            >
              #{s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
