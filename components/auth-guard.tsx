"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
}

export function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Skip during initial loading
    if (isLoading) return

    // If authentication is required but user is not authenticated
    if (requireAuth && !isAuthenticated) {
      // Redirect to login with the current path as redirect parameter
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`)
    }

    // If user is authenticated but on auth pages (login, signup, etc.)
    if (isAuthenticated && (pathname === "/login" || pathname === "/signup" || pathname === "/forgot-password")) {
      // Get the redirect URL from query params or default to profile
      const params = new URLSearchParams(window.location.search)
      const redirectUrl = params.get("redirect") || "/profile"
      router.push(redirectUrl)
    }
  }, [isAuthenticated, isLoading, pathname, router, requireAuth])

  // Show nothing while loading or redirecting
  if (isLoading || (requireAuth && !isAuthenticated)) {
    return null
  }

  return <>{children}</>
}
