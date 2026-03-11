"use client"

import type React from "react"

import { useEffect } from "react"

export function SmoothScrollWrapper({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Enable smooth scrolling behavior globally
    const originalScrollBehavior = document.documentElement.style.scrollBehavior
    document.documentElement.style.scrollBehavior = "smooth"

    // Cleanup function to restore original behavior
    return () => {
      document.documentElement.style.scrollBehavior = originalScrollBehavior
    }
  }, [])

  return <>{children}</>
}
