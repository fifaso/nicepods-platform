"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Prevent hydration mismatch by showing a placeholder until mounted
  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-gray-700 hover:bg-white/30 transition-all duration-300"
        disabled
      >
        <div className="h-5 w-5 animate-pulse bg-current opacity-20 rounded" />
        <span className="sr-only">Loading theme toggle</span>
      </Button>
    )
  }

  const toggleTheme = () => {
    const newTheme = resolvedTheme === "dark" ? "light" : "dark"
    setTheme(newTheme)
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-gray-700 hover:bg-white/30 dark:bg-white/10 dark:border-white/20 dark:text-gray-300 dark:hover:bg-white/20 transition-all duration-300 hover:scale-105 active:scale-95"
      title={`Switch to ${resolvedTheme === "light" ? "dark" : "light"} mode`}
      aria-label={`Switch to ${resolvedTheme === "light" ? "dark" : "light"} mode`}
    >
      <div className="relative w-5 h-5">
        {resolvedTheme === "light" ? (
          <Moon className="h-5 w-5 transition-all duration-300 rotate-0 scale-100 opacity-100" />
        ) : (
          <Sun className="h-5 w-5 transition-all duration-300 rotate-0 scale-100 opacity-100" />
        )}
      </div>
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
