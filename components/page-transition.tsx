"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    // Start transition
    setIsTransitioning(true)

    // Reset scroll position immediately
    window.scrollTo(0, 0)

    // End transition after a brief moment
    const timer = setTimeout(() => {
      setIsTransitioning(false)
    }, 150)

    return () => clearTimeout(timer)
  }, [pathname])

  return (
    <div className={`transition-opacity duration-150 ${isTransitioning ? "opacity-95" : "opacity-100"}`}>
      {children}
    </div>
  )
}
