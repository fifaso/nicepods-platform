// components/page-transition.tsx
"use client"

import { usePathname } from "next/navigation"
import type React from "react"
import { useEffect, useState } from "react"

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    // Iniciamos la transición sutil
    setIsTransitioning(true)

    // El scroll se mueve al inicio
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

    const timer = setTimeout(() => {
      setIsTransitioning(false)
    }, 100); // Reducimos a 100ms para mayor agilidad de hidratación

    return () => clearTimeout(timer)
  }, [pathname])

  return (
    <div className={`transition-opacity duration-200 ease-in-out ${isTransitioning ? "opacity-0" : "opacity-100"}`}>
      {children}
    </div>
  )
}