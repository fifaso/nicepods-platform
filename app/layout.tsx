// app/layout.tsx
// VERSIÓN: 32.0 (NicePod Architecture Core - High Speed Orbital Edition)
// Misión: Orquestar la infraestructura global y garantizar la persistencia absoluta de Audio y GPS.
// [ESTABILIZACIÓN]: Implementación de Preconnects para Mapbox y optimización de jerarquía GPU.

import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import type React from "react";

/**
 * --- CAPA 0: CIMIENTOS VISUALES ---
 * Cargamos las hojas de estilo críticas en la raíz para asegurar que 
 * el motor WebGL (Mapbox) y el sistema de diseño Aurora nazcan sintonizados.
 */
import "mapbox-gl/dist/mapbox-gl.css";
import "./globals.css";

// Infraestructura de Servicios Sincronizados
import { CSPostHogProvider } from '@/components/providers/posthog-provider';
import { ErrorBoundary } from "@/components/system/error-boundary";
import { PwaLifecycle } from "@/components/system/pwa-lifecycle";
import { ThemeProvider } from "@/components/system/theme-provider";
import { AuthProvider } from "@/hooks/use-auth";
import { createClient } from '@/lib/supabase/server';
import { Tables } from "@/types/database.types";

// --- CONTEXTOS DE INTELIGENCIA Y TELEMETRÍA (ROOT ELEVATION) ---
import { AudioProvider } from "@/contexts/audio-context";
import { GeoEngineProvider } from "@/hooks/use-geo-engine";

// Motor de Inmersión Visual (GPU-driven)
import { BackgroundEngine } from "@/components/visuals/background-engine";

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
  title: {
    default: "NicePod | Witness, Not Diarist",
    template: "%s | NicePod Intelligence"
  },
  description: "Workstation de inteligencia industrial y memoria urbana. Forja sabiduría en audio.",
  manifest: "/manifest.json",
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  icons: {
    icon: [
      { url: "/nicepod-logo.png", sizes: "32x32" },
      { url: "/nicepod-logo.png", sizes: "192x192" }
    ],
    apple: [
      { url: "/nicepod-logo.png", sizes: "180x180" }
    ],
  },
};

/**
 * COMPONENTE: RootLayout (The Master Orchestrator)
 */
export default async function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  /**
   * 1. PROTOCOLO DE IDENTIDAD ATÓMICA (SSR)
   */
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let initialSession = null;
  let initialProfile: Tables<'profiles'> | null = null;
  let userRole = 'guest';

  if (user) {
    const [sessionRes, profileRes] = await Promise.all([
      supabase.auth.getSession(),
      supabase.from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()
    ]);

    initialSession = sessionRes.data.session;
    initialProfile = profileRes.data;

    const appMetadata = user.app_metadata || {};
    userRole = appMetadata.user_role || appMetadata.role || (initialProfile?.role) || 'user';
  }

  const authState = user ? "authenticated" : "unauthenticated";

  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={inter.variable}
      data-auth-state={authState}
      data-user-role={userRole}
    >
      <head>
        {/* 
            II. ACELERACIÓN DE RED (PRECONNECT PROTOCOL)
            Reducimos el TTFB de la Malla Urbana abriendo los sockets de Mapbox de forma anticipada.
        */}
        <link rel="preconnect" href="https://api.mapbox.com" />
        <link rel="preconnect" href="https://events.mapbox.com" />

        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var storedTheme = localStorage.getItem('theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  var theme = (storedTheme === 'dark' || (!storedTheme && prefersDark)) ? 'dark' : 'light';
                  document.documentElement.classList.add(theme);
                  document.documentElement.style.colorScheme = theme;
                  
                  if (document.documentElement.getAttribute('data-auth-state') === 'authenticated') {
                    document.documentElement.style.visibility = 'visible';
                  }
                } catch (e) {
                  console.error('Lumen-Shield Error:', e);
                }
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${inter.className} font-sans min-h-screen antialiased selection:bg-primary/30 bg-[#020202] text-foreground overflow-x-hidden`}
        suppressHydrationWarning
      >
        {/* CAPA 1: Telemetría Operativa */}
        <CSPostHogProvider>

          {/* CAPA 2: Orquestador PWA (Registro Diferido) */}
          <PwaLifecycle />

          {/* CAPA 3: Red de Seguridad */}
          <ErrorBoundary>

            {/* CAPA 4: Motor Atmosférico Aurora */}
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange={true}
              storageKey="theme"
            >

              {/* CAPA 5: EL HANDSHAKE T0 (AuthProvider) */}
              <AuthProvider
                initialSession={initialSession}
                initialProfile={initialProfile}
              >

                {/* 
                    CAPA 6: RED SENSORIAL Y ACÚSTICA GLOBAL 
                    Anclados en la raíz para garantizar la soberanía física del Voyager.
                */}
                <AudioProvider>
                  <GeoEngineProvider>

                    {/* --- ESCENARIO VISUAL NICEPOD V2.9 --- */}
                    <main className="min-h-screen relative flex flex-col">

                      {/* CAPA ALFA: Fondo Dinámico GPU-driven (Z-INDEX: -20) */}
                      <BackgroundEngine />

                      {/* 
                          CAPA BETA: EL CHASIS DE CONTENIDO (Z-INDEX: 10) 
                          La propiedad 'isolate' crea un nuevo contexto de apilamiento 
                          protegiendo al UI de las fugas de WebGL.
                      */}
                      <div className="relative z-10 flex flex-col flex-1 bg-transparent isolate">
                        {children}
                      </div>

                    </main>

                  </GeoEngineProvider>
                </AudioProvider>

              </AuthProvider>
            </ThemeProvider>
          </ErrorBoundary>
        </CSPostHogProvider>
      </body>
    </html>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V32.0):
 * 1. Aceleración Mapbox: Se inyectaron 'preconnects' para las APIs de tiles de Mapbox,
 *    ahorrando tiempo precioso en la resolución de red inicial.
 * 2. Estabilidad de Fondo: Se forzó el color de fondo 'bg-[#020202]' en el body para 
 *    eliminar cualquier micro-flash blanco durante la carga de las Edge Functions.
 * 3. Aislamiento Táctico: Se añadió la propiedad 'isolate' al contenedor de children 
 *    para evitar colisiones de contexto entre el BackgroundEngine y el SpatialEngine 
 *    del mapa, permitiendo que ambos operen en sus propios hilos de la GPU.
 */