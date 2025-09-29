"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "./auth-context"
import { Button } from "@/components/ui/button"

const navItems = [
  { href: "/", label: "Home" },
  { href: "/category", label: "Category" },
  { href: "/department", label: "Department" },
  { href: "/policies", label: "Policies / SOP" },
]

export function SiteHeader() {
  const pathname = usePathname()
  const { isLoggedIn, login, logout } = useAuth()

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded bg-primary" aria-hidden />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-muted-foreground">KMRL</span>
            <span className="text-balance text-base font-semibold">Intelligent Document System</span>
          </div>
        </div>

        <nav className="hidden gap-2 md:flex">
          {navItems.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded px-3 py-2 text-sm ${active ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <Button variant="default" onClick={logout} aria-label="Logout">
              Logout
            </Button>
          ) : (
            <Button variant="default" onClick={login} aria-label="Login">
              Login
            </Button>
          )}
        </div>
      </div>

      {/* mobile nav */}
      <nav className="mx-auto w-full max-w-7xl px-4 pb-3 md:hidden">
        <div className="grid grid-cols-2 gap-2">
          {navItems.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded px-3 py-2 text-sm text-center ${active ? "bg-muted text-foreground" : "bg-card text-muted-foreground hover:text-foreground"}`}
              >
                {item.label}
              </Link>
            )
          })}
        </div>
      </nav>
    </header>
  )
}
