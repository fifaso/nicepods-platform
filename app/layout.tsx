// app/layout.tsx
// VERSIÓN: 20.2 (NicePod Core Identity - Unified PWA & Atomic Handshake)
// Misión: Orquestar el núcleo global eliminando el pestañeo y consolidando el registro único PWA.
// [RESOLUCIÓN]: Eliminación de referencia huérfana a ServiceWorkerRegister para corregir error TS2307.

import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import type React from "react";

/**
 * --- CAPA DE ESTILOS CRÍTICOS ---
 * Importación del CSS de Mapbox en la raíz para evitar el flash de mapa sin estilos.
 * Los estilos globales se cargan después para permitir la personalización del sistema Aurora.
 */
import "mapbox-gl/dist/mapbox-gl.css";
import "./globals.css";

/**
 * --- INFRAESTRUCTURA DE COMPONENTES Y SEGURIDAD ---
 */
import { ErrorBoundary } from "@/components/error-boundary";
import { CSPostHogProvider } from '@/components/providers/posthog-provider';
import { PwaLifecycle } from "@/components/pwa-lifecycle";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/hooks/use-auth";
import { createClient } from '@/lib/supabase/server';
import { Tables } from "@/types/database.types";

/**
 * CONFIGURACIÓN DE FUENTE: Inter
 * Priorizamos la carga del sistema operativo para evitar Layout Shifts tipográficos.
 */
const inter = Inter({
  subsets: ["latin"],
  preload: false,
  display: "swap"
});

/**
 * VIEWPORT: Configuración táctica para dispositivos móviles.
 */
export const viewport: Viewport = {
  themeColor: "#111827",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

/**
 * METADATA: Identidad Soberana NicePod V2.5.
 */
export const metadata: Metadata = {
  title: "NicePod | Witness, Not Diarist",
  description: "Terminal de inteligencia personal y memoria urbana colectiva. Forja sabiduría en audio.",
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
 * RootLayout: El Gran Orquestador Síncrono.
 */
export default async function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  /**
   * 1. PROTOCOLO DE IDENTIDAD ATÓMICA (SSR)
   * Recuperamos la identidad completa en el servidor (T0).
   * Esto garantiza que el cliente nazca con la sesión y el perfil hidratados.
   */
  const supabase = createClient();

  // Handshake inicial de seguridad mediante validación de token
  const { data: { user } } = await supabase.auth.getUser();

  let initialSession = null;
  let initialProfile: Tables<'profiles'> | null = null;

  if (user) {
    // Si el usuario existe, recuperamos sesión y perfil en paralelo (Performance T0)
    const [sessionRes, profileRes] = await Promise.all([
      supabase.auth.getSession(),
      supabase.from('profiles').select('*').eq('id', user.id).single()
    ]);

    initialSession = sessionRes.data.session;
    initialProfile = profileRes.data;
  }

  return (
    /**
     * suppressHydrationWarning: Necesario para la inyección síncrona del tema Aurora.
     */
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* SCRIPT ANTI-PESTAÑEO DE TEMA (Ejecución Pre-React) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var storedTheme = localStorage.getItem('theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (storedTheme === 'dark' || (!storedTheme && prefersDark)) {
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
      <body
        className={`${inter.className} min-h-screen bg-background font-sans antialiased selection:bg-primary/30`}
        suppressHydrationWarning
      >
        {/* NIVEL 1: Telemetría e Inteligencia */}
        <CSPostHogProvider>

          {/* NIVEL 2: Orquestador Único PWA
              [FIX]: Se ha eliminado ServiceWorkerRegister para evitar el conflicto de registro 
              y errores de compilación TS2307.
          */}
          <PwaLifecycle />

          {/* NIVEL 3: Red de Seguridad */}
          <ErrorBoundary>

            {/* NIVEL 4: Motor de Diseño y Atmósfera */}
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange={true}
              storageKey="theme"
            >

              {/* NIVEL 5: Soberanía de Identidad Atómica
                  Inyectamos los datos de servidor para una hidratación sin latencia.
              */}
              <AuthProvider initialSession={initialSession} initialProfile={initialProfile}>

                <div className="min-h-screen gradient-mesh relative overflow-x-hidden">

                  {/* IDENTIDAD VISUAL AURORA (Blobs Atmosféricos Cinematográficos) */}
                  <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-40 dark:opacity-80">
                    <div className="absolute top-10 left-10 w-80 h-80 bg-purple-500/10 rounded-full blur-[120px] animate-float"></div>
                    <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[160px] animate-float" style={{ animationDelay: "2s" }}></div>
                    <div className="absolute -bottom-20 left-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-[140px] animate-float" style={{ animationDelay: "4s" }}></div>
                  </div>

                  {/* LIENZO DE INTERACCIÓN (Z-index superior para clics garantizados) */}
                  <div className="relative z-10">
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