// app/layout.tsx
// VERSIÓN: 16.1 (Production Ready - Supabase SSR Fixed & Theme Synchronized)

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
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "NicePod",
  },
  icons: {
    icon: "/nicepod-logo.png",
    apple: "/nicepod-logo.png",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // [CORRECCIÓN QUIRÚRGICA]: createClient() no requiere argumentos en la nueva arquitectura
  const supabase = createClient();

  // Verificación de sesión de alta seguridad
  const { data: { user } } = await supabase.auth.getUser();
  const { data: { session } } = await supabase.auth.getSession();

  // Si no hay usuario real, invalidamos la sesión para evitar ataques de replay
  const validatedSession = user ? session : null;

  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* Script de prevención de flash de tema (Inline para máxima velocidad de renderizado) */}
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
          {/* Inicialización de Capas Offline y Analíticas */}
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
                    [CAPA 0]: EL LIENZO (Fondo Aurora)
                    Se mantiene fijo detrás de todo el contenido.
                    La clase 'gradient-mesh' en globals.css maneja el cambio Light/Dark.
                  */}
                  <div className="fixed inset-0 gradient-mesh -z-20" aria-hidden="true" />

                  {/* 
                    [CAPA 1]: DINAMISMO (Blobs Atmosféricos)
                    Opacidad reducida en Modo Claro (base) y aumentada en Modo Oscuro (.dark).
                  */}
                  <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 opacity-30 dark:opacity-50 transition-opacity duration-1000">
                    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-500/20 rounded-full blur-[120px] animate-float"></div>
                    <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-blue-500/20 rounded-full blur-[120px] animate-float" style={{ animationDelay: "2s" }}></div>
                    <div className="absolute bottom-[-10%] left-[20%] w-[45%] h-[45%] bg-pink-500/20 rounded-full blur-[120px] animate-float" style={{ animationDelay: "4s" }}></div>
                  </div>

                  {/* UI de Utilidad PWA */}
                  <OfflineIndicator />
                  <InstallPwaButton />

                  {/* [CAPA 2]: EL CONTENIDO (Arquitectura Responsiva) */}
                  <SmoothScrollWrapper>
                    <div className="relative flex flex-col min-h-screen">

                      <ScrollToTop />
                      <Navigation />

                      <PageTransition>
                        <main className="flex-1 relative z-10 w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
                          {children}
                        </main>
                      </PageTransition>

                      {/* Componentes de persistencia global */}
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