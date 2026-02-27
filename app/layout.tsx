// app/layout.tsx
// VERSIÓN: 22.0 (NicePod Aurora Restoration - Deep Immersion Standard)

import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import type React from "react";

import "mapbox-gl/dist/mapbox-gl.css";
import "./globals.css";

import { ErrorBoundary } from "@/components/error-boundary";
import { CSPostHogProvider } from '@/components/providers/posthog-provider';
import { PwaLifecycle } from "@/components/pwa-lifecycle";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/hooks/use-auth";
import { createClient } from '@/lib/supabase/server';
import { Tables } from "@/types/database.types";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const viewport: Viewport = {
  themeColor: "#020202",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "NicePod | Witness, Not Diarist",
  description: "Workstation de inteligencia industrial y memoria urbana. Forja sabiduría en audio.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "NicePod",
  },
  icons: {
    icon: "/nicepod-logo.png",
    apple: "/nicepod-logo.png",
  },
};

export default async function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let initialSession = null;
  let initialProfile: Tables<'profiles'> | null = null;

  if (user) {
    const [sessionRes, profileRes] = await Promise.all([
      supabase.auth.getSession(),
      supabase.from('profiles').select('*').eq('id', user.id).single()
    ]);
    initialSession = sessionRes.data.session;
    initialProfile = profileRes.data;
  }

  return (
    <html lang="es" suppressHydrationWarning className="dark">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var storedTheme = localStorage.getItem('theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (storedTheme === 'dark' || (!storedTheme && prefersDark)) {
                    document.documentElement.classList.add('dark');
                    document.documentElement.style.colorScheme = 'dark';
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.style.colorScheme = 'light';
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        // [FIX CRÍTICO]: Eliminamos bg-[#020202] estricto. Usamos bg-background nativo
        // para que soporte el cambio Claro/Oscuro y deje respirar a los colores.
        className={`${inter.className} min-h-screen bg-background font-sans antialiased selection:bg-primary/30`}
        suppressHydrationWarning
      >
        <CSPostHogProvider>
          <PwaLifecycle />
          <ErrorBoundary>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange={true}
              storageKey="theme"
            >
              <AuthProvider initialSession={initialSession} initialProfile={initialProfile}>

                {/* CONTENEDOR MAESTRO DE INMERSIÓN */}
                <div className="min-h-screen relative overflow-hidden transition-colors duration-500">

                  {/* 
                      [RESTAURACIÓN]: LA ATMÓSFERA AURORA
                      Estos Blobs estaban ocultos. Ahora son el z-0 absoluto.
                      Aumentamos la opacidad para que la refracción en el cristal sea evidente.
                  */}
                  <div className="fixed inset-0 pointer-events-none z-0">
                    {/* Modo Oscuro / Nebulosa */}
                    <div className="absolute inset-0 opacity-40 dark:opacity-80">
                      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] animate-pulse"></div>
                      <div className="absolute top-[30%] right-[-20%] w-[800px] h-[800px] bg-purple-600/15 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: "2s" }}></div>
                      <div className="absolute bottom-[-20%] left-[20%] w-[600px] h-[600px] bg-indigo-500/15 rounded-full blur-[160px] animate-pulse" style={{ animationDelay: "4s" }}></div>
                    </div>
                  </div>

                  {/* 
                      LIENZO DE CONTENIDO DINÁMICO
                      Z-10 garantiza que quede por encima de la atmósfera, pero
                      al NO tener fondo (bg-transparent), deja pasar la luz.
                  */}
                  <div className="relative z-10 flex flex-col min-h-screen bg-transparent">
                    {children}
                  </div>

                </div>
              </AuthProvider>
            </ThemeProvider>
          </ErrorBoundary>
        </CSPostHogProvider>
      </body>
    </html>
  );
}