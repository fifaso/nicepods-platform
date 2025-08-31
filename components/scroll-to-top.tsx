"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

export function ScrollToTop() {
  const pathname = usePathname()

  useEffect(() => {
    // Smooth scroll to top when route changes
    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth",
      })
    }

    // Small delay to ensure the new page content is rendered
    const timeoutId = setTimeout(scrollToTop, 100)

    return () => clearTimeout(timeoutId)
  }, [pathname])

  // Also handle immediate scroll for faster navigation
  useEffect(() => {
    // Immediate scroll to top (fallback for slower devices)
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}
