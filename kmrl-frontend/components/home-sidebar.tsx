"use client"

import { ChatBox } from "./chat-box"

export function HomeSidebar() {
  return (
    <aside className="flex flex-col gap-6">
      {/* Removed Calendar block */}
      <div>
        <h3 className="mb-2 text-sm font-semibold">General Query</h3>
        <ChatBox />
      </div>
    </aside>
  )
}
