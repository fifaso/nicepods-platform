// app/layout.tsx
// VERSIÓN: 14.0 (PWA Complete: Install Button Added)

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

// Importación del Proveedor de PostHog (Named Export)
import { CSPostHogProvider } from '@/components/providers/posthog-provider';

// Importación de componentes PWA (Ciclo de vida, Offline y Botón de Instalación)
import { PwaLifecycle } from "@/components/pwa-lifecycle";
import { OfflineIndicator } from '@/components/offline-indicator';
import { InstallPwaButton } from '@/components/install-pwa-button';

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
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  
  const { data: { session } } = await supabase.auth.getSession();

  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.className} min-h-screen bg-background font-sans antialiased`}>
        
        {/* NIVEL 1: Analítica y Sesión */}
        <CSPostHogProvider>
          
          {/* NIVEL 2: PWA Service Worker & Tools */}
          <PwaLifecycle />
          <OfflineIndicator />
          <InstallPwaButton /> {/* <--- Botón de instalación manual */}
          
          {/* NIVEL 3: Manejo de Errores */}
          <ErrorBoundary>
            
            {/* NIVEL 4: Tema Visual */}
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange={false}
              storageKey="theme"
            >
              {/* NIVEL 5: Autenticación */}
              <AuthProvider session={session}>
                
                {/* NIVEL 6: Estado de Audio Global */}
                <AudioProvider>
                  
                  {/* NIVEL 7: Scroll Suave */}
                  <SmoothScrollWrapper>
                    
                    <div className="min-h-screen gradient-mesh">
                      {/* Fondo Animado */}
                      <div className="fixed inset-0 pointer-events-none overflow-hidden">
                        <div className="absolute top-20 left-10 w-20 h-20 bg-purple-400/20 rounded-full blur-xl animate-float"></div>
                        <div className="absolute top-40 right-20 w-32 h-32 bg-blue-400/20 rounded-full blur-xl animate-float" style={{ animationDelay: "2s" }}></div>
                        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-pink-400/20 rounded-full blur-xl animate-float" style={{ animationDelay: "4s" }}></div>
                        <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-indigo-400/20 rounded-full blur-xl animate-float" style={{ animationDelay: "6s" }}></div>
                      </div>
                      
                      {/* Elementos UI Globales */}
                      <ScrollToTop />
                      <Navigation />
                      
                      {/* Contenido de la Página */}
                      <PageTransition>
                        <main className="relative z-10">{children}</main>
                      </PageTransition>
                      
                      {/* Reproductores y Notificaciones */}
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