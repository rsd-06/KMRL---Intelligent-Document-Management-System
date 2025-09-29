"use client"

import type React from "react"
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"

type AuthContextValue = {
  isLoggedIn: boolean
  login: () => void
  logout: () => void
  toggle: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // hydrate from localStorage for demo persistence
  useEffect(() => {
    try {
      const saved = localStorage.getItem("kmrl_demo_isLoggedIn")
      if (saved) setIsLoggedIn(saved === "true")
    } catch {}
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem("kmrl_demo_isLoggedIn", String(isLoggedIn))
    } catch {}
  }, [isLoggedIn])

  const login = useCallback(() => setIsLoggedIn(true), [])
  const logout = useCallback(() => setIsLoggedIn(false), [])
  const toggle = useCallback(() => setIsLoggedIn((v) => !v), [])

  const value = useMemo(() => ({ isLoggedIn, login, logout, toggle }), [isLoggedIn, login, logout, toggle])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
