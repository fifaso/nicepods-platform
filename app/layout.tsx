import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { Navigation } from "@/components/navigation"
import { ScrollToTop } from "@/components/scroll-to-top"
import { SmoothScrollWrapper } from "@/components/smooth-scroll-wrapper"
import { PageTransition } from "@/components/page-transition"
import { AudioProvider } from "@/contexts/audio-context"
import { MiniAudioPlayer } from "@/components/mini-audio-player"
import { ErrorBoundary } from "@/components/error-boundary"
import { AuthProvider } from "@/hooks/use-auth"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "NicePod - Create & Share Micro-Podcasts",
  description: "Foster knowledge enhancement and critical thinking through bite-sized audio content",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // Prioritize dark mode: if no theme is set, or if system prefers dark, default to dark.
                  // Otherwise, if a theme is explicitly 'light', use light.
                  var theme = localStorage.getItem('theme');
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  } else if (theme === 'light') {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {
                  console.warn('Theme initialization failed:', e);
                }
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.className} min-h-screen`}>
        <ErrorBoundary>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark" // Changed to default to dark mode
            enableSystem
            disableTransitionOnChange={false}
            storageKey="theme"
          >
            <AuthProvider>
              <AudioProvider>
                <SmoothScrollWrapper>
                  {/* Full viewport background container */}
                  <div className="min-h-screen gradient-mesh">
                    {/* Floating background elements */}
                    <div className="fixed inset-0 pointer-events-none overflow-hidden">
                      <div className="absolute top-20 left-10 w-20 h-20 bg-purple-400/20 rounded-full blur-xl animate-float"></div>
                      <div
                        className="absolute top-40 right-20 w-32 h-32 bg-blue-400/20 rounded-full blur-xl animate-float"
                        style={{ animationDelay: "2s" }}
                      ></div>
                      <div
                        className="absolute bottom-20 left-1/4 w-24 h-24 bg-pink-400/20 rounded-full blur-xl animate-float"
                        style={{ animationDelay: "4s" }}
                      ></div>
                      <div
                        className="absolute top-1/2 right-1/3 w-16 h-16 bg-indigo-400/20 rounded-full blur-xl animate-float"
                        style={{ animationDelay: "6s" }}
                      ></div>
                    </div>

                    <ScrollToTop />
                    <Navigation />
                    <PageTransition>
                      <main className="relative z-10">{children}</main>
                    </PageTransition>
                    <MiniAudioPlayer />
                    <Toaster />
                  </div>
                </SmoothScrollWrapper>
              </AudioProvider>
            </AuthProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
