// app/layout.tsx
// VERSIÓN: 16.4 (Final Master - PWA Stable + Vivid Aurora Aesthetics)

import { cookies } from 'next/headers';
import type React from "react";
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Inter } from "next/font/google";

import { createClient } from '@/lib/supabase/server';
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { Navigation } from "@/components/navigation";
import { ScrollToTop } from "@/components/scroll-to-top";
import { SmoothScrollWrapper } from "@/components/smooth-scroll-wrapper";
import { PageTransition } from "@/components/page-transition";
import { AudioProvider } from "@/contexts/audio-context";
import { ErrorBoundary } from "@/components/error-boundary";
import { PlayerOrchestrator } from "@/components/player-orchestrator";

// Providers y PWA
import { CSPostHogProvider } from '@/components/providers/posthog-provider';
import { PwaLifecycle } from "@/components/pwa-lifecycle";
import { OfflineIndicator } from '@/components/offline-indicator';
import { InstallPwaButton } from '@/components/install-pwa-button';
import { ServiceWorkerRegister } from '@/components/sw-register';

/**
 * OPTIMIZACIÓN DE FUENTE:
 * preload: false elimina el error de "Resource preloaded but not used"
 * causado por la colisión entre Next.js y el Service Worker.
 */
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: false
});

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
  icons: {
    icon: "/nicepod-logo.png",
    apple: "/nicepod-logo.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Cliente Supabase optimizado para SSR (Sin argumentos)
  const supabase = createClient();

  // Verificación de integridad de sesión dual
  const { data: { user } } = await supabase.auth.getUser();
  const { data: { session } } = await supabase.auth.getSession();
  const validatedSession = user ? session : null;

  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* Script Anti-Flash de Tema (Crítico para UX) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  var supportDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (theme === 'dark' || (!theme && supportDark)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.className} min-h-screen antialiased selection:bg-primary/30 transition-colors duration-500`}>

        <CSPostHogProvider>
          {/* 
            [LAYER: PWA] 
            Ubicado en la raíz para evitar re-registros y limpiar la consola.
          */}
          <ServiceWorkerRegister />
          <PwaLifecycle />

          <ErrorBoundary>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange={false}
              storageKey="theme"
            >
              <AuthProvider session={validatedSession}>
                <AudioProvider>

                  {/* 
                    [LAYER 0]: EL ESCENARIO (Fondo Aurora Recuperado)
                    La clase 'gradient-mesh' ahora tiene el tinte suave para modo claro.
                  */}
                  <div className="fixed inset-0 gradient-mesh -z-20" aria-hidden="true" />

                  {/* 
                    [LAYER 1]: EFECTOS ATMOSFÉRICOS (Blobs de color)
                    Opacidad aumentada (60%) en Modo Claro para recuperar la estética NicePod.
                  */}
                  <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 opacity-60 dark:opacity-40 transition-opacity duration-1000">
                    <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-purple-400/20 rounded-full blur-[120px] animate-float" />
                    <div className="absolute top-[10%] right-[-5%] w-[60%] h-[60%] bg-blue-300/20 rounded-full blur-[120px] animate-float" style={{ animationDelay: "2s" }} />
                    <div className="absolute bottom-[-15%] left-[10%] w-[80%] h-[80%] bg-pink-200/20 rounded-full blur-[120px] animate-float" style={{ animationDelay: "4s" }} />
                  </div>

                  {/* Elementos flotantes de sistema */}
                  <OfflineIndicator />
                  <InstallPwaButton />

                  {/* [LAYER 2]: EL CONTENIDO (Arquitectura de Scroll y Layout) */}
                  <SmoothScrollWrapper>
                    <div className="relative flex flex-col min-h-screen">

                      <ScrollToTop />
                      <Navigation />

                      <PageTransition>
                        <main className="flex-1 relative z-10 w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
                          {children}
                        </main>
                      </PageTransition>

                      {/* Persistencia del reproductor sobre el contenido */}
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