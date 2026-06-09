"use client"
import { useState, useCallback } from "react"
import type { AppPage, FPAResult, FinResult } from "@/types"

export function useAppState() {
  const [page, setPage]         = useState<AppPage>("home")
  const [fpaResult, setFpaResult] = useState<FPAResult | null>(null)
  const [finResult, setFinResult] = useState<FinResult | null>(null)
  const [history, setHistory]   = useState<AppPage[]>(["home"])

  const navigate = useCallback((to: AppPage) => {
    setHistory(h => [...h, to])
    setPage(to)
  }, [])

  const goBack = useCallback(() => {
    setHistory(h => {
      if (h.length <= 1) return h
      const next = [...h]
      next.pop()
      setPage(next[next.length - 1])
      return next
    })
  }, [])

  return { page, navigate, goBack, fpaResult, setFpaResult, finResult, setFinResult }
}
