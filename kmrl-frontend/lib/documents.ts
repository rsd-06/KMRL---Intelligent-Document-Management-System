export type DocumentItem = {
  id: string
  title: string
  tags: string[]
  category: string
  department: string
  policyType: string
  issuedDate?: string // YYYY-MM-DD
  deadlineDate?: string // YYYY-MM-DD
  shortSummary: string
  longSummary: string
  content: string
  relations: { targetId: string; type: "refers" | "updates" | "depends" }[]
}

export const documents: DocumentItem[] = [
  {
    id: "doc-001",
    title: "Safety SOP for Depot Operations",
    tags: ["safety", "sop", "depot"],
    category: "Operations",
    department: "Safety",
    policyType: "SOP",
    issuedDate: "2025-09-15",
    deadlineDate: "2025-10-15",
    shortSummary: "Quick guidelines for safe depot operations.",
    longSummary:
      "Comprehensive safety procedures covering personnel training, equipment handling, emergency protocols, and daily checklists.",
    content:
      "Section 1: Introduction...\nSection 2: Personnel Training...\nSection 3: Equipment Handling...\nSection 4: Emergency Protocols...\nSection 5: Daily Checklists...",
    relations: [
      { targetId: "doc-002", type: "refers" },
      { targetId: "doc-003", type: "updates" },
    ],
  },
  {
    id: "doc-002",
    title: "Policy: Vendor Compliance Requirements",
    tags: ["policy", "vendor", "compliance"],
    category: "Procurement",
    department: "Legal",
    policyType: "Policy",
    issuedDate: "2025-09-20",
    deadlineDate: "2025-11-01",
    shortSummary: "Baseline compliance for all KMRL vendors.",
    longSummary:
      "Defines mandatory compliance standards, documentation, audit frequency, and enforcement actions for third-party vendors.",
    content:
      "Purpose...\nScope...\nDefinitions...\nPolicy Statements...\nResponsibilities...\nEnforcement...\nAppendices...",
    relations: [{ targetId: "doc-001", type: "refers" }],
  },
  {
    id: "doc-003",
    title: "Operations Handbook v2",
    tags: ["operations", "handbook", "update"],
    category: "Operations",
    department: "Administration",
    policyType: "Handbook",
    issuedDate: "2025-09-05",
    deadlineDate: undefined,
    shortSummary: "Updated operations handbook for staff.",
    longSummary:
      "Adds new procedures for shift scheduling, asset management, and incident reporting. Supersedes v1 in specific sections.",
    content: "Chapter 1...\nChapter 2...\nChapter 3...\nAppendix...",
    relations: [{ targetId: "doc-001", type: "depends" }],
  },
]

// Gather all known dates for quick calendar highlight lookups
export function getAllDocumentDates(): Record<string, { ids: string[]; kind: "issued" | "deadline" | "both" }> {
  const map: Record<string, { ids: string[]; kind: "issued" | "deadline" | "both" }> = {}
  for (const d of documents) {
    const i = d.issuedDate
    const dl = d.deadlineDate
    if (i) {
      map[i] ||= { ids: [], kind: "issued" }
      map[i].ids.push(d.id)
    }
    if (dl) {
      map[dl] ||= { ids: [], kind: "deadline" }
      if (map[dl].kind === "issued") map[dl].kind = "both"
      map[dl].ids.push(d.id)
    }
  }
  return map
}
