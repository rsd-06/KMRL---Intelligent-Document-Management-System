"use client"

import type React from "react"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { getAllDocumentDates } from "@/lib/documents"

type UserEvent = { date: string; text: string }
const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`)

function daysInMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0).getDate()
}

export function CalendarWidget(props: { large?: boolean; emphasizeBlue?: boolean }) {
  const { large, emphasizeBlue } = props
  const [cursor, setCursor] = useState(() => {
    const now = new Date()
    return { y: now.getFullYear(), m: now.getMonth() } // 0-based month
  })
  const [userEvents, setUserEvents] = useState<UserEvent[]>([])
  const [eventText, setEventText] = useState("")
  const [eventDate, setEventDate] = useState("")

  // Persist user events for demo
  useEffect(() => {
    try {
      const raw = localStorage.getItem("kmrl_demo_user_events")
      if (raw) setUserEvents(JSON.parse(raw))
    } catch {}
  }, [])
  useEffect(() => {
    try {
      localStorage.setItem("kmrl_demo_user_events", JSON.stringify(userEvents))
    } catch {}
  }, [userEvents])

  const docDates = useMemo(() => getAllDocumentDates(), [])

  const yearMonth = `${cursor.y}-${pad(cursor.m + 1)}`
  const days = useMemo(() => {
    const count = daysInMonth(cursor.y, cursor.m)
    const first = new Date(cursor.y, cursor.m, 1).getDay() // 0=Sun
    const leading = (first + 6) % 7 // shift to Monday-first grid
    return { count, leading }
  }, [cursor.y, cursor.m])

  const grid = useMemo(() => {
    const cells: { date?: string; type?: "issued" | "deadline" | "both" | "user"; labels?: string[] }[] = []
    for (let i = 0; i < days.leading; i++) cells.push({})
    for (let d = 1; d <= days.count; d++) {
      const date = `${cursor.y}-${pad(cursor.m + 1)}-${pad(d)}`
      const doc = docDates[date]
      const user = userEvents.filter((e) => e.date === date)
      const labels = [
        ...(doc?.ids?.map((id) => (doc.kind === "issued" ? "Issued" : doc.kind === "deadline" ? "Deadline" : "Both")) ||
          []),
        ...user.map(() => "User"),
      ]
      cells.push({ date, type: doc?.kind, labels })
    }
    return cells
  }, [days, cursor, docDates, userEvents])

  const addEvent = (e: React.FormEvent) => {
    e.preventDefault()
    if (!eventDate || !eventText) return
    setUserEvents((prev) => [...prev, { date: eventDate, text: eventText }])
    setEventDate("")
    setEventText("")
  }

  return (
    <div
      className={emphasizeBlue ? "rounded-lg border p-4 md:p-6" : "flex flex-col gap-4"}
      style={
        emphasizeBlue
          ? {
              background: "var(--calendar-bg)",
              borderColor: "var(--calendar-border)",
            }
          : undefined
      }
    >
      <div className="flex items-center justify-between mb-3">
        <div
          className="text-sm font-medium px-2 py-1 rounded"
          style={
            emphasizeBlue ? { background: "var(--calendar-chip-bg)", color: "var(--calendar-chip-fg)" } : undefined
          }
        >
          {new Date(cursor.y, cursor.m, 1).toLocaleString(undefined, { month: "long", year: "numeric" })}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={emphasizeBlue ? "default" : "outline"}
            size="icon"
            aria-label="Previous month"
            onClick={() =>
              setCursor((c) => {
                const m = c.m - 1
                return m < 0 ? { y: c.y - 1, m: 11 } : { y: c.y, m }
              })
            }
            style={
              emphasizeBlue ? { background: "var(--calendar-primary)", color: "var(--calendar-primary-fg)" } : undefined
            }
          >
            ‹
          </Button>
          <Button
            variant={emphasizeBlue ? "default" : "outline"}
            size="icon"
            aria-label="Next month"
            onClick={() =>
              setCursor((c) => {
                const m = c.m + 1
                return m > 11 ? { y: c.y + 1, m: 0 } : { y: c.y, m }
              })
            }
            style={
              emphasizeBlue ? { background: "var(--calendar-primary)", color: "var(--calendar-primary-fg)" } : undefined
            }
          >
            ›
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground mb-1">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>
      <div className={`grid grid-cols-7 gap-1 ${large ? "md:gap-2" : ""}`}>
        {grid.map((cell, i) => (
          <Card
            key={i}
            className={`${large ? "min-h-24 p-3" : "min-h-16 p-2"} ${emphasizeBlue ? "border" : ""}`}
            style={
              emphasizeBlue
                ? { background: "var(--calendar-cell-bg)", borderColor: "var(--calendar-border)" }
                : undefined
            }
          >
            <div className={`flex items-start justify-between text-xs ${large ? "text-sm" : ""}`}>
              <span className="font-medium">{cell.date?.split("-")[2]}</span>
              {cell.type && (
                <span
                  className={`${large ? "text-[11px]" : "text-[10px]"} rounded px-1`}
                  style={
                    emphasizeBlue ? { background: "var(--calendar-pill)", color: "var(--calendar-pill-fg)" } : undefined
                  }
                >
                  {cell.type}
                </span>
              )}
            </div>
            <div className="mt-1 space-y-1">
              {cell.date &&
                userEvents
                  .filter((e) => e.date === cell.date)
                  .slice(0, large ? 3 : 2)
                  .map((e, idx) => (
                    <div
                      key={idx}
                      className="truncate rounded px-1"
                      style={
                        emphasizeBlue
                          ? {
                              background: "var(--calendar-user-pill)",
                              color: "var(--calendar-user-pill-fg)",
                              fontSize: large ? "12px" : "10px",
                            }
                          : { background: "var(--muted)", fontSize: "10px" }
                      }
                    >
                      {e.text}
                    </div>
                  ))}
            </div>
          </Card>
        ))}
      </div>

      <form onSubmit={addEvent} className={`flex flex-col gap-2 mt-3`}>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          <Input
            type="text"
            placeholder="Event description"
            value={eventText}
            onChange={(e) => setEventText(e.target.value)}
            aria-label="Event description"
          />
          <Input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} aria-label="Event date" />
        </div>
        <Button
          type="submit"
          style={
            emphasizeBlue ? { background: "var(--calendar-primary)", color: "var(--calendar-primary-fg)" } : undefined
          }
        >
          Add to calendar
        </Button>
      </form>
    </div>
  )
}
