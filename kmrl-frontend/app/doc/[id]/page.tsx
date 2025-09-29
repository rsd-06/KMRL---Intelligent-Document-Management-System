import { notFound } from "next/navigation"
import { documents } from "@/lib/documents"
import { Card } from "@/components/ui/card"
import { ChatBox } from "@/components/chat-box"
import { CytoGraph } from "@/components/cyto-graph"

export default function DocDetailPage({ params }: { params: { id: string } }) {
  const doc = documents.find((d) => d.id === params.id)
  if (!doc) return notFound()

  const related = documents.filter(
    (d) =>
      d.id !== doc.id &&
      (d.relations.some((r) => r.targetId === doc.id) || doc.relations.some((r) => r.targetId === d.id)),
  )

  return (
    <section className="grid grid-cols-1 gap-6 md:grid-cols-5">
      {/* Left: content with summary below */}
      <div className="md:col-span-3 space-y-4">
        <Card className="p-4">
          <h1 className="text-pretty text-2xl font-bold">{doc.title}</h1>
          <div className="mt-2 text-sm text-muted-foreground">
            {doc.category} • {doc.department} • {doc.policyType}
          </div>
        </Card>
        <Card className="max-h-[70vh] overflow-auto p-4 leading-relaxed">
          <pre className="whitespace-pre-wrap text-sm">{doc.content}</pre>
        </Card>
        {/* Summary moved here under content */}
        <Card className="space-y-3 p-4">
          <div>
            <h3 className="text-sm font-semibold">Short Summary</h3>
            <p className="text-sm text-muted-foreground">{doc.shortSummary}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Long Summary</h3>
            <p className="text-sm text-muted-foreground">{doc.longSummary}</p>
          </div>
        </Card>
      </div>

      {/* Right: chat on top, interactive node graph below */}
      <div className="md:col-span-2 space-y-4">
        <Card className="p-2">
          <h3 className="mb-2 px-2 pt-2 text-sm font-semibold">Chat about this document</h3>
          <ChatBox />
        </Card>
        <Card className="p-2">
          <h3 className="mb-2 px-2 pt-2 text-sm font-semibold">Node Connections</h3>
          <CytoGraph focusId={doc.id} />
        </Card>
      </div>
    </section>
  )
}
// Simple local Tabs (no external lib)
;("use client")
import { useState, type PropsWithChildren } from "react"

function Tabs({ children }: PropsWithChildren) {
  const items = Array.isArray(children) ? children : [children]
  const [active, setActive] = useState(0)
  return (
    <div className="w-full">
      <div className="mb-2 flex flex-wrap gap-2">
        {items.map((child: any, i: number) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`rounded px-3 py-1 text-sm ${
              i === active ? "bg-muted" : "bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            {child.props.title}
          </button>
        ))}
      </div>
      <div>{items[active]}</div>
    </div>
  )
}

function Tab({ children }: PropsWithChildren & { title: string }) {
  return <div>{children}</div>
}
