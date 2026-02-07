"use client"

import { useEffect, useRef } from "react"
import cytoscape, { type ElementsDefinition } from "cytoscape"
import { documents } from "@/lib/documents"

type Props = { focusId: string }

export function CytoGraph({ focusId }: Props) {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!ref.current) return

    // derive simple elements: focus node and neighbors
    const focus = documents.find((d) => d.id === focusId)
    const related = documents.filter(
      (d) =>
        d.id !== focusId &&
        (d.relations.some((r) => r.targetId === focusId) || focus?.relations.some((r) => r.targetId === d.id)),
    )

    const nodes = [
      { data: { id: focusId, label: focus?.title || focusId, kind: "focus" } },
      ...related.map((r) => ({ data: { id: r.id, label: r.title, kind: "doc" } })),
    ]

    const edges = [
      ...(focus?.relations
        .filter((r) => related.some((x) => x.id === r.targetId))
        .map((r) => ({
          data: { id: `${focusId}->${r.targetId}`, source: focusId, target: r.targetId, type: r.type },
        })) || []),
      ...related
        .filter((r) => r.relations.some((x) => x.targetId === focusId))
        .map((r) => ({
          data: {
            id: `${r.id}->${focusId}`,
            source: r.id,
            target: focusId,
            type: r.relations.find((x) => x.targetId === focusId)?.type || "refers",
          },
        })),
    ]

    const elements: ElementsDefinition = { nodes, edges }

    const cy = cytoscape({
      container: ref.current,
      elements,
      style: [
        {
          selector: "node",
          style: {
            "background-color": "var(--cy-node)",
            label: "data(label)",
            color: "var(--cy-node-fg)",
            "font-size": "11px",
            "text-wrap": "wrap",
            "text-max-width": 140,
            "text-valign": "center",
            "text-halign": "center",
            width: "label",
            height: "label",
            padding: "8px",
            "border-width": 2,
            "border-color": "var(--cy-node-border)",
            "border-opacity": 1,
            shape: "round-rectangle",
          },
        },
        {
          selector: "node[kind = 'focus']",
          style: {
            "background-color": "var(--cy-focus)",
            "border-color": "var(--cy-focus-border)",
            "font-weight": "bold",
          },
        },
        {
          selector: "edge",
          style: {
            "curve-style": "bezier",
            "line-color": "var(--cy-edge)",
            "target-arrow-color": "var(--cy-edge)",
            "target-arrow-shape": "triangle",
            width: 2,
            label: "data(type)",
            "font-size": "9px",
            "text-background-color": "var(--cy-edge-label-bg)",
            "text-background-opacity": 0.8,
            "text-background-shape": "round-rectangle",
            "text-background-padding": 2,
            color: "var(--cy-edge-label-fg)",
          },
        },
        {
          selector: ":selected",
          style: {
            "border-color": "var(--cy-selected)",
            "line-color": "var(--cy-selected)",
            "target-arrow-color": "var(--cy-selected)",
          },
        },
      ],
      layout: { name: "concentric", minNodeSpacing: 30, animate: true },
      wheelSensitivity: 0.2,
    })

    // basic interactivity: click to highlight neighborhood
    cy.on("tap", "node", (evt) => {
      const node = evt.target
      const neighborhood = node.closedNeighborhood()
      cy.elements().removeClass("faded")
      cy.elements().difference(neighborhood).addClass("faded")
      neighborhood.removeClass("faded")
    })
    cy.on("tap", (evt) => {
      if (evt.target === cy) {
        cy.elements().removeClass("faded")
      }
    })

    cy.style().selector(".faded").style({ opacity: 0.25 }).update()

    // fit on load
    cy.fit(undefined, 20)

    return () => {
      cy.destroy()
    }
  }, [focusId])

  return (
    <div
      ref={ref}
      role="img"
      aria-label="Interactive node connection graph"
      className="h-[360px] w-full rounded-md border"
      style={{
        background: "var(--card)",
        borderColor: "var(--border)",
        // graph-specific tokens
        // these can be themed globally later if needed
        // prefer blues to align with calendar emphasis
        // (values fall back to computed styles if CSS vars unknown)
        ["--cy-node" as any]: "oklch(0.96 0.02 240)",
        ["--cy-node-fg" as any]: "oklch(0.2 0 0)",
        ["--cy-node-border" as any]: "oklch(0.72 0.06 240)",
        ["--cy-focus" as any]: "oklch(0.86 0.08 240)",
        ["--cy-focus-border" as any]: "oklch(0.6 0.12 240)",
        ["--cy-edge" as any]: "oklch(0.5 0.1 240)",
        ["--cy-edge-label-bg" as any]: "oklch(0.98 0.01 240)",
        ["--cy-edge-label-fg" as any]: "oklch(0.2 0 0)",
        ["--cy-selected" as any]: "oklch(0.45 0.15 240)",
      }}
    />
  )
}
