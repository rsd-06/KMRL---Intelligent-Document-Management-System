"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

type Msg = { role: "user" | "assistant"; content: string }

export function ChatBox() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Hello! Ask me anything about KMRL documents." },
  ])
  const [input, setInput] = useState("")
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" })
  }, [messages.length])

  const onSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    const userMsg: Msg = { role: "user", content: input.trim() }
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    // mock assistant reply
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Thanks! I’ll look into that. Meanwhile, try searching by tags on the left." },
      ])
    }, 500)
  }

  return (
    <Card className="flex h-[360px] flex-col">
      <div ref={listRef} className="flex-1 space-y-2 overflow-y-auto p-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[80%] rounded px-3 py-2 text-sm ${
              m.role === "user" ? "ml-auto bg-primary text-primary-foreground" : "bg-muted"
            }`}
            aria-live="polite"
          >
            {m.content}
          </div>
        ))}
      </div>
      <form onSubmit={onSend} className="flex items-center gap-2 border-t p-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
          aria-label="Chat input"
        />
        <Button type="submit">Send</Button>
      </form>
    </Card>
  )
}
