// app/layout.tsx
// VERSIÓN: 24.0

import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import type React from "react";

/**
 * --- CAPA 0: CIMIENTOS VISUALES ---
 * La importación de Mapbox debe ser la primera para asegurar que los estilos 
 * del mapa se carguen antes de la hidratación de los componentes geográficos.
 */
import "mapbox-gl/dist/mapbox-gl.css";
import "./globals.css";

/**
 * --- INFRAESTRUCTURA DE COMPONENTES Y SERVICIOS ---
 */
import { ErrorBoundary } from "@/components/error-boundary";
import { CSPostHogProvider } from '@/components/providers/posthog-provider';
import { PwaLifecycle } from "@/components/pwa-lifecycle";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/hooks/use-auth";
import { createClient } from '@/lib/supabase/server';
import { Tables } from "@/types/database.types";

// Motor Visual Centralizado
import { BackgroundEngine } from "@/components/visuals/background-engine";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

/**
 * VIEWPORT API: Configuración de hardware de visualización.
 * Color base sincronizado con el fondo oscuro de la Bóveda.
 */
export const viewport: Viewport = {
  themeColor: "#020202",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

/**
 * METADATA API: Identidad Digital Soberana.
 */
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

/**
 * RootLayout: El Gran Orquestador Síncrono de NicePod V2.5.
 */
export default async function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  /**
   * 1. PROTOCOLO DE IDENTIDAD ATÓMICA (SSR)
   * Recuperamos la identidad completa en el servidor (T0) para evitar pestañeos.
   */
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
        {/* 
            SCRIPT ANTI-PESTAÑEO DE TEMA:
            Inyecta la clase .dark antes de que React despierte.
        */}
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
        // [FIX CRÍTICO]: Se ha eliminado 'bg-background' del body. 
        // Permitimos que el BackgroundEngine sea el único que pinte el lienzo.
        className={`${inter.className} min-h-screen font-sans antialiased selection:bg-primary/30`}
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
              <AuthProvider
                initialSession={initialSession}
                initialProfile={initialProfile}
              >

                {/* --- ESCENARIO VISUAL NICEPOD V2.5 --- */}
                <div className="min-h-screen relative overflow-x-hidden">

                  {/* 
                      CAPA 1: EL MOTOR DE ATMÓSFERA (Z-0)
                      Componente centralizado que gestiona los Blobs Aurora.
                  */}
                  <BackgroundEngine />

                  {/* 
                      CAPA 2: LIENZO DE INTERACCIÓN (Z-10)
                      [FIX]: bg-transparent es imperativo para dejar pasar la luz del fondo.
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

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Estrategia de Transparencia: Al eliminar el color de fondo del 'body' y 
 *    del contenedor de 'children', permitimos que el 'BackgroundEngine' (fixed) 
 *    sea visible perpetuamente.
 * 2. Rendimiento LCP: El orden de los imports asegura que el CSS crítico 
 *    de Mapbox no sea bloqueado por el procesamiento de otros estilos.
 * 3. Handshake Sincronizado: La inyección de metadatos SSR garantiza que el 
 *    cliente reconozca su identidad soberana desde el primer bit renderizado.
 */