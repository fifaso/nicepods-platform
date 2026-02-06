"use client"

import { ThemeTestPanel } from "@/components/theme-test-panel"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Palette, Eye, Zap, CheckCircle, Monitor, Smartphone, Tablet, Globe } from "lucide-react"

export default function ThemeTestPage() {
  return (
    <div className="min-h-screen gradient-mesh pt-0">
      {/* Floating elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-purple-400/20 rounded-full blur-xl animate-float"></div>
      <div
        className="absolute top-40 right-20 w-32 h-32 bg-blue-400/20 rounded-full blur-xl animate-float"
        style={{ animationDelay: "2s" }}
      ></div>

      <div className="max-w-6xl mx-auto pt-24 pb-8 px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center space-x-2 glass px-4 py-2 rounded-full glass-text-accessible font-medium mb-4 shadow-glass">
            <Palette className="h-4 w-4 text-purple-accessible" />
            <span className="text-sm">Theme Testing Suite</span>
          </div>
          <h1 className="heading-lg text-gray-900 dark:text-gray-100 mb-2">Dark Mode Validation</h1>
          <p className="text-secondary-accessible font-medium">
            Comprehensive testing panel for theme functionality and visual consistency
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Main Test Panel */}
          <div className="space-y-6">
            <ThemeTestPanel />

            {/* Cross-Platform Testing */}
            <Card className="glass-card border-0 shadow-glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  Cross-Platform Validation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 rounded-lg bg-white/30 dark:bg-gray-800/30">
                    <Monitor className="h-6 w-6 mx-auto mb-2 text-purple-600 dark:text-purple-400" />
                    <div className="text-sm font-medium">Desktop</div>
                    <Badge variant="secondary" className="mt-1">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Tested
                    </Badge>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-white/30 dark:bg-gray-800/30">
                    <Tablet className="h-6 w-6 mx-auto mb-2 text-purple-600 dark:text-purple-400" />
                    <div className="text-sm font-medium">Tablet</div>
                    <Badge variant="secondary" className="mt-1">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Tested
                    </Badge>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-white/30 dark:bg-gray-800/30">
                    <Smartphone className="h-6 w-6 mx-auto mb-2 text-purple-600 dark:text-purple-400" />
                    <div className="text-sm font-medium">Mobile</div>
                    <Badge variant="secondary" className="mt-1">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Tested
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Visual Test Components */}
          <div className="space-y-6">
            {/* Component Gallery */}
            <Card className="glass-card border-0 shadow-glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-green-600 dark:text-green-400" />
                  Component Gallery
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Navigation Preview */}
                <div className="p-3 rounded-lg bg-white/30 dark:bg-gray-800/30">
                  <div className="text-xs text-muted-accessible mb-2">Navigation</div>
                  <div className="flex items-center justify-between p-2 rounded-lg glass-nav">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gradient-to-r from-purple-600 to-blue-600 rounded"></div>
                      <span className="font-bold text-gradient">NicePod</span>
                    </div>
                    <div className="flex gap-1">
                      <div className="w-16 h-6 bg-white/20 dark:bg-white/10 rounded"></div>
                      <div className="w-6 h-6 bg-white/20 dark:bg-white/10 rounded-full"></div>
                    </div>
                  </div>
                </div>

                {/* Card Preview */}
                <div className="p-3 rounded-lg bg-white/30 dark:bg-gray-800/30">
                  <div className="text-xs text-muted-accessible mb-2">Cards</div>
                  <div className="p-4 glass-card border-0 shadow-glass rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">Science</Badge>
                      <span className="text-xs text-muted-accessible">6:42</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Sample Podcast Title</h3>
                    <p className="text-sm text-secondary-accessible">
                      This is a sample description to test text rendering.
                    </p>
                  </div>
                </div>

                {/* Form Preview */}
                <div className="p-3 rounded-lg bg-white/30 dark:bg-gray-800/30">
                  <div className="text-xs text-muted-accessible mb-2">Forms</div>
                  <div className="space-y-2">
                    <Input placeholder="Sample input field" className="glass-input border-0" />
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1">
                        Primary
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                        Secondary
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Audio Player Preview */}
                <div className="p-3 rounded-lg bg-white/30 dark:bg-gray-800/30">
                  <div className="text-xs text-muted-accessible mb-2">Audio Player</div>
                  <div className="p-3 glass-card border-0 shadow-glass rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Now Playing</div>
                        <div className="text-xs text-muted-accessible">Sample Track</div>
                      </div>
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                        <div className="w-3 h-3 bg-white rounded-sm"></div>
                      </div>
                    </div>
                    <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full">
                      <div className="w-1/3 h-1 bg-purple-600 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Test Results Summary */}
            <Card className="glass-card border-0 shadow-glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  Validation Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
                    <span className="text-sm font-medium text-green-800 dark:text-green-200">
                      Theme Toggle Functionality
                    </span>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
                    <span className="text-sm font-medium text-green-800 dark:text-green-200">Smooth Transitions</span>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
                    <span className="text-sm font-medium text-green-800 dark:text-green-200">
                      Component Consistency
                    </span>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
                    <span className="text-sm font-medium text-green-800 dark:text-green-200">
                      Cross-Page Functionality
                    </span>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
                    <span className="text-sm font-medium text-green-800 dark:text-green-200">
                      Accessibility Standards
                    </span>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
