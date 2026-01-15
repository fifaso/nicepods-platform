// app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import type React from "react";
import "./globals.css";

import { ErrorBoundary } from "@/components/error-boundary";
import { Navigation } from "@/components/navigation";
import { PageTransition } from "@/components/page-transition";
import { PlayerOrchestrator } from "@/components/player-orchestrator";
import { ScrollToTop } from "@/components/scroll-to-top";
import { SmoothScrollWrapper } from "@/components/smooth-scroll-wrapper";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { AudioProvider } from "@/contexts/audio-context";
import { AuthProvider } from "@/hooks/use-auth";
import { createClient } from '@/lib/supabase/server';

// Providers y PWA
import { InstallPwaButton } from '@/components/install-pwa-button';
import { OfflineIndicator } from '@/components/offline-indicator';
import { CSPostHogProvider } from '@/components/providers/posthog-provider';
import { PwaLifecycle } from "@/components/pwa-lifecycle";
import { ServiceWorkerRegister } from '@/components/sw-register';

const inter = Inter({ subsets: ["latin"], display: "swap", preload: false });

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "NicePod - Create & Share Micro-Podcasts",
  description: "Fomenta el conocimiento y el pensamiento crítico a través de contenido de audio conciso.",
  manifest: "/manifest.json",
  icons: { icon: "/nicepod-logo.png", apple: "/nicepod-logo.png" },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: { session } } = await supabase.auth.getSession();
  const validatedSession = user ? session : null;

  return (
    <html lang="es" suppressHydrationWarning className="gradient-mesh">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('nicepod-theme') || 'dark';
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.className} min-h-screen antialiased transition-colors duration-700`}>
        <CSPostHogProvider>
          <ServiceWorkerRegister />
          <PwaLifecycle />
          <ErrorBoundary>
            <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={true} storageKey="nicepod-theme">
              <AuthProvider session={validatedSession}>
                <AudioProvider>

                  {/* [CAPA ATMOSFÉRICA]: ESFERAS DE LUZ */}
                  <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 opacity-40 dark:opacity-60">
                    <div className="absolute top-[-10%] left-[-5%] w-[60vw] h-[60vw] bg-purple-500/20 dark:bg-purple-600/30 rounded-full blur-[100px] animate-float" />
                    <div className="absolute top-[20%] right-[-10%] w-[50vw] h-[50vw] bg-blue-400/20 dark:bg-blue-600/20 rounded-full blur-[120px] animate-float" style={{ animationDelay: "2s" }} />
                    <div className="absolute bottom-[-10%] left-[10%] w-[70vw] h-[70vw] bg-pink-400/10 dark:bg-pink-500/20 rounded-full blur-[140px] animate-float" style={{ animationDelay: "4s" }} />
                  </div>

                  <OfflineIndicator />
                  <InstallPwaButton />

                  <SmoothScrollWrapper>
                    <div className="relative flex flex-col min-h-screen">
                      <ScrollToTop />
                      <Navigation />
                      <PageTransition>
                        <main className="flex-1 relative z-10 w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
                          {children}
                        </main>
                      </PageTransition>
                      <PlayerOrchestrator />
                      <Toaster />
                    </div>
                  </SmoothScrollWrapper>

                </AudioProvider>
              </AuthProvider>
            </ThemeProvider>
          </ErrorBoundary>
        </CSPostHogProvider>
      </body>
    </html>
  );
}