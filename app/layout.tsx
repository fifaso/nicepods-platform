// app/layout.tsx
// VERSIÓN FINAL COMPLETA CON PASO DE SESIÓN DEL SERVIDOR AL CLIENTE

import { cookies } from 'next/headers';
import type React from "react";
import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "NicePod - Create & Share Micro-Podcasts",
  description: "Fomenta el conocimiento y el pensamiento crítico a través de contenido de audio conciso.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // [INTERVENCIÓN ARQUITECTÓNICA]: Se obtiene la sesión en el servidor.
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
        <ErrorBoundary>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange={false}
            storageKey="theme"
          >
            {/* [INTERVENCIÓN ARQUITECTÓNICA]: Se pasa la sesión del servidor al AuthProvider. */}
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
      </body>
    </html>
  );
}