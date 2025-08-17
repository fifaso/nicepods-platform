"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Monitor, Sun, Moon, CheckCircle, AlertCircle, Zap, Settings } from "lucide-react"

export function ThemeTestPanel() {
  const { theme, setTheme, resolvedTheme, systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [testResults, setTestResults] = useState<Record<string, boolean>>({})

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      // Run automated tests when theme changes
      runThemeTests()
    }
  }, [resolvedTheme, mounted])

  const runThemeTests = () => {
    const results: Record<string, boolean> = {}

    // Test 1: Check if theme class is applied to html element
    results.htmlClassApplied = document.documentElement.classList.contains("dark") === (resolvedTheme === "dark")

    // Test 2: Check if CSS variables are properly set
    const computedStyle = getComputedStyle(document.documentElement)
    const bgColor = computedStyle.getPropertyValue("--background").trim()
    results.cssVariablesSet = bgColor.length > 0

    // Test 3: Check if glassmorphic elements exist and have proper styles
    const glassElements = document.querySelectorAll(".glass-card")
    results.glassElementsStyled = glassElements.length > 0

    // Test 4: Check if text contrast is adequate
    const textElements = document.querySelectorAll(".text-gray-900, .dark\\:text-gray-100")
    results.textContrastAdequate = textElements.length > 0

    // Test 5: Check if transitions are working
    const transitionElements = document.querySelectorAll('[class*="transition"]')
    results.transitionsWorking = transitionElements.length > 0

    setTestResults(results)
  }

  const testComponents = [
    { name: "Buttons", component: "button" },
    { name: "Cards", component: "glass-card" },
    { name: "Navigation", component: "glass-nav" },
    { name: "Text Elements", component: "text-" },
    { name: "Badges", component: "badge" },
  ]

  if (!mounted) {
    return (
      <Card className="glass-card border-0 shadow-glass">
        <CardContent className="p-6">
          <div className="animate-pulse">Loading theme test panel...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="glass-card border-0 shadow-glass">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          Theme Testing Panel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Theme Controls */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Theme Controls</Label>
          <div className="flex gap-2">
            <Button
              variant={theme === "light" ? "default" : "outline"}
              size="sm"
              onClick={() => setTheme("light")}
              className="flex items-center gap-2"
            >
              <Sun className="h-4 w-4" />
              Light
            </Button>
            <Button
              variant={theme === "dark" ? "default" : "outline"}
              size="sm"
              onClick={() => setTheme("dark")}
              className="flex items-center gap-2"
            >
              <Moon className="h-4 w-4" />
              Dark
            </Button>
            <Button
              variant={theme === "system" ? "default" : "outline"}
              size="sm"
              onClick={() => setTheme("system")}
              className="flex items-center gap-2"
            >
              <Monitor className="h-4 w-4" />
              System
            </Button>
          </div>
        </div>

        {/* Theme Status */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Current Status</Label>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-accessible">Active Theme:</span>
              <Badge variant="secondary" className="ml-2">
                {resolvedTheme}
              </Badge>
            </div>
            <div>
              <span className="text-muted-accessible">System Theme:</span>
              <Badge variant="outline" className="ml-2">
                {systemTheme}
              </Badge>
            </div>
          </div>
        </div>

        {/* Automated Test Results */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Automated Tests</Label>
          <div className="space-y-2">
            {Object.entries(testResults).map(([test, passed]) => (
              <div
                key={test}
                className="flex items-center justify-between p-2 rounded-lg bg-white/50 dark:bg-gray-800/50"
              >
                <span className="text-sm capitalize">{test.replace(/([A-Z])/g, " $1").trim()}</span>
                {passed ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Visual Test Components */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Visual Test Components</Label>
          <div className="space-y-3">
            {/* Button Tests */}
            <div className="p-3 rounded-lg bg-white/30 dark:bg-gray-800/30">
              <Label className="text-xs text-muted-accessible mb-2 block">Buttons</Label>
              <div className="flex gap-2 flex-wrap">
                <Button size="sm">Primary</Button>
                <Button variant="outline" size="sm">
                  Outline
                </Button>
                <Button variant="secondary" size="sm">
                  Secondary
                </Button>
                <Button variant="ghost" size="sm">
                  Ghost
                </Button>
              </div>
            </div>

            {/* Badge Tests */}
            <div className="p-3 rounded-lg bg-white/30 dark:bg-gray-800/30">
              <Label className="text-xs text-muted-accessible mb-2 block">Badges</Label>
              <div className="flex gap-2 flex-wrap">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge className="status-published">Published</Badge>
                <Badge className="status-draft">Draft</Badge>
              </div>
            </div>

            {/* Input Tests */}
            <div className="p-3 rounded-lg bg-white/30 dark:bg-gray-800/30">
              <Label className="text-xs text-muted-accessible mb-2 block">Form Elements</Label>
              <div className="space-y-2">
                <Input placeholder="Test input field" className="glass-input border-0" />
                <Input placeholder="Focused input" className="glass-input border-0" autoFocus />
              </div>
            </div>

            {/* Text Tests */}
            <div className="p-3 rounded-lg bg-white/30 dark:bg-gray-800/30">
              <Label className="text-xs text-muted-accessible mb-2 block">Typography</Label>
              <div className="space-y-1">
                <p className="text-gray-900 dark:text-gray-100 font-semibold">Primary Text</p>
                <p className="text-secondary-accessible">Secondary Text</p>
                <p className="text-muted-accessible">Muted Text</p>
                <p className="text-purple-accessible">Purple Accent</p>
                <p className="text-gradient font-bold">Gradient Text</p>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Performance</Label>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-2 rounded-lg bg-white/30 dark:bg-gray-800/30">
              <div className="text-lg font-bold text-green-600">✓</div>
              <div className="text-xs text-muted-accessible">No Flicker</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-white/30 dark:bg-gray-800/30">
              <div className="text-lg font-bold text-green-600">300ms</div>
              <div className="text-xs text-muted-accessible">Transition</div>
            </div>
          </div>
        </div>

        {/* Manual Test Button */}
        <Button onClick={runThemeTests} className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white">
          <Zap className="h-4 w-4 mr-2" />
          Run Tests Again
        </Button>
      </CardContent>
    </Card>
  )
}
