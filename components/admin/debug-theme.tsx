"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Monitor, Sun, Moon, RefreshCw } from "lucide-react"

export function DebugTheme() {
  const { theme, setTheme, resolvedTheme, systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [htmlClass, setHtmlClass] = useState("")

  useEffect(() => {
    setMounted(true)

    // Check HTML class
    const checkHtmlClass = () => {
      setHtmlClass(document.documentElement.className)
    }

    checkHtmlClass()

    // Set up observer to watch for class changes
    const observer = new MutationObserver(checkHtmlClass)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })

    return () => observer.disconnect()
  }, [])

  if (!mounted) {
    return (
      <Card className="glass-card border-0 shadow-glass">
        <CardContent className="p-4">
          <div className="animate-pulse">Loading debug info...</div>
        </CardContent>
      </Card>
    )
  }

  const forceTheme = (newTheme: string) => {
    // Force set theme and update HTML class immediately
    setTheme(newTheme)

    if (newTheme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  return (
    <Card className="glass-card border-0 shadow-glass">
      <CardHeader>
        <CardTitle className="text-sm">Theme Debug Panel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-muted-accessible">Current Theme:</span>
            <Badge variant="secondary" className="ml-1">
              {theme || "undefined"}
            </Badge>
          </div>
          <div>
            <span className="text-muted-accessible">Resolved:</span>
            <Badge variant="secondary" className="ml-1">
              {resolvedTheme || "undefined"}
            </Badge>
          </div>
          <div>
            <span className="text-muted-accessible">System:</span>
            <Badge variant="outline" className="ml-1">
              {systemTheme || "undefined"}
            </Badge>
          </div>
          <div>
            <span className="text-muted-accessible">HTML Class:</span>
            <Badge variant="outline" className="ml-1">
              {htmlClass || "none"}
            </Badge>
          </div>
        </div>

        <div className="flex gap-1">
          <Button
            size="sm"
            variant={theme === "light" ? "default" : "outline"}
            onClick={() => forceTheme("light")}
            className="flex-1"
          >
            <Sun className="h-3 w-3 mr-1" />
            Light
          </Button>
          <Button
            size="sm"
            variant={theme === "dark" ? "default" : "outline"}
            onClick={() => forceTheme("dark")}
            className="flex-1"
          >
            <Moon className="h-3 w-3 mr-1" />
            Dark
          </Button>
          <Button
            size="sm"
            variant={theme === "system" ? "default" : "outline"}
            onClick={() => forceTheme("system")}
            className="flex-1"
          >
            <Monitor className="h-3 w-3 mr-1" />
            System
          </Button>
        </div>

        <Button size="sm" variant="outline" onClick={() => window.location.reload()} className="w-full">
          <RefreshCw className="h-3 w-3 mr-1" />
          Reload Page
        </Button>
      </CardContent>
    </Card>
  )
}
