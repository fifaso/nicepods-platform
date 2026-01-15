// app/layout.tsx
// VERSIÓN: 15.1 (Restored Background Identity & SSR Fix)
import { ErrorBoundary } from "@/components/error-boundary";
import { InstallPwaButton } from '@/components/install-pwa-button';
import { Navigation } from "@/components/navigation";
import { OfflineIndicator } from '@/components/offline-indicator';
import { PageTransition } from "@/components/page-transition";
import { PlayerOrchestrator } from "@/components/player-orchestrator";
import { CSPostHogProvider } from '@/components/providers/posthog-provider';
import { PwaLifecycle } from "@/components/pwa-lifecycle";
import { ScrollToTop } from "@/components/scroll-to-top";
import { SmoothScrollWrapper } from "@/components/smooth-scroll-wrapper";
import { ServiceWorkerRegister } from '@/components/sw-register';
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { AudioProvider } from "@/contexts/audio-context";
import { AuthProvider } from "@/hooks/use-auth";
import { createClient } from '@/lib/supabase/server';
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import type React from "react";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#111827",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "NicePod - Create & Share Micro-Podcasts",
  description: "Fomenta el conocimiento y el pensamiento crítico a través de contenido de audio conciso.",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "NicePod" },
  icons: { icon: "/nicepod-logo.png", apple: "/nicepod-logo.png" },
  other: { "mobile-web-app-capable": "yes" },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
  // 1. INSTANCIACIÓN DE SUPABASE (SSR COMPATIBLE)
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: { session } } = await supabase.auth.getSession();
  const validatedSession = user ? session : null;

  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-background font-sans antialiased`}>
        <CSPostHogProvider>
          <ServiceWorkerRegister />
          <PwaLifecycle />
          <ErrorBoundary>
            <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange={false} storageKey="theme">
              <AuthProvider session={validatedSession}>
                <AudioProvider>
                  <OfflineIndicator />
                  <InstallPwaButton />
                  <SmoothScrollWrapper>
                    <div className="min-h-screen gradient-mesh">
                      {/* 2. CAPA DE BLOBS DINÁMICOS ORIGINALES */}
                      <div className="fixed inset-0 pointer-events-none overflow-hidden">
                        <div className="absolute top-20 left-10 w-20 h-20 bg-purple-400/20 rounded-full blur-xl animate-float"></div>
                        <div className="absolute top-40 right-20 w-32 h-32 bg-blue-400/20 rounded-full blur-xl animate-float" style={{ animationDelay: "2s" }}></div>
                        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-pink-400/20 rounded-full blur-xl animate-float" style={{ animationDelay: "4s" }}></div>
                        <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-indigo-400/20 rounded-full blur-xl animate-float" style={{ animationDelay: "6s" }}></div>
                      </div>
                      <ScrollToTop />
                      <Navigation />
                      <PageTransition>
                        <main className="relative z-10">{children}</main>
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