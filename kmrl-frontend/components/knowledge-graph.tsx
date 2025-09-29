"use client"

import { useMemo } from "react"
import { Card } from "@/components/ui/card"
import type { DocumentItem } from "@/lib/documents"
import Link from "next/link"

type Node = { id: string; label: string }
type Edge = { source: string; target: string; type: string }

function radialLayout(nodes: Node[], radius = 120) {
  const center = { x: 160, y: 160 }
  const coords: Record<string, { x: number; y: number }> = {}
  const step = (2 * Math.PI) / Math.max(1, nodes.length)
  nodes.forEach((n, i) => {
    const angle = i * step
    coords[n.id] = {
      x: center.x + radius * Math.cos(angle),
      y: center.y + radius * Math.sin(angle),
    }
  })
  return { coords, center }
}

export function KnowledgeGraph({ focus, all }: { focus: DocumentItem; all: DocumentItem[] }) {
  const { nodes, edges } = useMemo(() => {
    const nodes: Node[] = [{ id: focus.id, label: focus.title }]
    const edges: Edge[] = []
    const relatedIds = new Set<string>()
    // outbound
    for (const r of focus.relations) {
      relatedIds.add(r.targetId)
      edges.push({ source: focus.id, target: r.targetId, type: r.type })
    }
    // inbound (other docs referencing focus)
    for (const d of all) {
      if (d.id === focus.id) continue
      for (const r of d.relations) {
        if (r.targetId === focus.id) {
          relatedIds.add(d.id)
          edges.push({ source: d.id, target: focus.id, type: r.type })
        }
      }
    }
    for (const id of relatedIds) {
      const d = all.find((x) => x.id === id)
      if (d) nodes.push({ id: d.id, label: d.title })
    }
    return { nodes, edges }
  }, [focus, all])

  const { coords, center } = useMemo(() => radialLayout(nodes.slice(1)), [nodes])
  const focusPos = { x: center.x, y: center.y }

  return (
    <Card className="p-3">
      <svg viewBox="0 0 320 320" className="h-80 w-full">
        {/* edges */}
        {edges.map((e, i) => {
          const a = e.source === focus.id ? focusPos : coords[e.source]
          const b = e.target === focus.id ? focusPos : coords[e.target]
          if (!a || !b) return null
          return (
            <g key={i}>
              <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="currentColor" strokeOpacity={0.3} />
              {/* mid label */}
              <text
                x={(a.x + b.x) / 2}
                y={(a.y + b.y) / 2}
                className="fill-foreground text-[10px]"
                textAnchor="middle"
                dy="-2"
              >
                {e.type}
              </text>
            </g>
          )
        })}
        {/* focus node */}
        <circle cx={focusPos.x} cy={focusPos.y} r={18} className="fill-primary" />
        <text x={focusPos.x} y={focusPos.y + 34} textAnchor="middle" className="fill-foreground text-[10px]">
          {focus.title}
        </text>
        {/* related nodes */}
        {nodes
          .filter((n) => n.id !== focus.id)
          .map((n) => {
            const p = coords[n.id]
            if (!p) return null
            return (
              <g key={n.id}>
                <circle cx={p.x} cy={p.y} r={14} className="fill-muted" />
                <Link href={`/doc/${n.id}`}>
                  {/* Accessible label as title */}
                  <title>{n.label}</title>
                </Link>
                <text x={p.x} y={p.y + 26} textAnchor="middle" className="fill-foreground text-[9px]">
                  {n.label.slice(0, 18)}
                  {n.label.length > 18 ? "…" : ""}
                </text>
              </g>
            )
          })}
      </svg>
    </Card>
  )
}
