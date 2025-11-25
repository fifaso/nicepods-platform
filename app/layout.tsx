// app/layout.tsx
// VERSIÓN MAESTRA PWA: Implementación de Metadata y Viewport según estándares Next.js 14+.

import { cookies } from 'next/headers';
import type React from "react";
import type { Metadata, Viewport } from "next";
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
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

const inter = Inter({ subsets: ["latin"] });

// Definimos el Viewport (Color y Escala Móvil)
// Esto reemplaza al <meta name="theme-color"> y asegura que se sienta como app nativa.
export const viewport: Viewport = {
  themeColor: "#111827",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Evita que el usuario haga zoom en inputs, vital para PWA.
};

// Enlazamos el Manifiesto y Configuración Apple
export const metadata: Metadata = {
  title: "NicePod - Create & Share Micro-Podcasts",
  description: "Fomenta el conocimiento y el pensamiento crítico a través de contenido de audio conciso.",
  manifest: "/manifest.json", // Enlace oficial al manifiesto
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "NicePod",
  },
  icons: {
    icon: "/nicepod-logo.png", // Icono por defecto para navegadores
    apple: "/nicepod-logo.png", // Icono para iPhone
  },
  // [CAMBIO QUIRÚRGICO]: Añadimos la etiqueta estándar para silenciar el warning de Chrome
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
        {/* Eliminamos las etiquetas manuales <meta> y <link manifest> 
            porque Next.js ahora las inyecta gracias a las exportaciones de arriba. 
            Mantenemos solo el script de tema crítico. */}
        
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
        <ErrorBoundary>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange={false}
            storageKey="theme"
          >
            <AuthProvider session={session}>
              <AudioProvider>
                <SmoothScrollWrapper>
                  <div className="min-h-screen gradient-mesh">
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
        
        {process.env.NODE_ENV === 'production' && (
          <>
            <Analytics />
            <SpeedInsights />
          </>
        )}
      </body>
    </html>
  );
}