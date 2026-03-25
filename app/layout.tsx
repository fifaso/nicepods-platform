// app/layout.tsx
// VERSIÓN: 33.0 (NicePod Architecture Core - Edge-Geo Integration Edition)
// Misión: Orquestar la infraestructura global y materializar la ubicación inicial desde el Edge.
// [ESTABILIZACIÓN]: Captura de Geo-IP Fallback y entrega síncrona al GeoEngineProvider.

import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { cookies } from "next/headers"; // [NUEVO]: Para lectura de telemetría de red
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

  // [RESCATE GEO-IP]: Leemos la ubicación estimada capturada por el Middleware
  const cookieStore = cookies();
  const geoFallbackRaw = cookieStore.get('nicepod-geo-fallback')?.value;
  let initialGeoData = null;

  if (geoFallbackRaw) {
    try {
      initialGeoData = JSON.parse(geoFallbackRaw);
    } catch (e) {
      console.error("Layout-Geo-Error:", e);
    }
  }

  if (user) {
    /**
     * COSECHA PARALELA DE DATOS (Fan-Out Pipeline)
     */
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
                <AudioProvider>
                  {/* 
                      [MANDATO V2.7]: Hidratación de Malla Geográfica.
                      Inyectamos la ubicación estimada por IP para que el Voyager 
                      se materialice antes de que el hardware GPS responda.
                  */}
                  <GeoEngineProvider initialData={initialGeoData}>
                    <main className="min-h-screen relative flex flex-col">
                      <BackgroundEngine />
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
 * NOTA TÉCNICA DEL ARCHITECT (V33.0):
 * 1. Materialización Progresiva T0: El Layout ahora captura la cookie 'nicepod-geo-fallback' 
 *    antes de montar el árbol de componentes. Al pasar este dato al GeoEngineProvider, 
 *    garantizamos que el mapa nazca en la ciudad real del usuario, eliminando el 
 *    anclaje genérico en Madrid Sol si el usuario está en otra ubicación.
 * 2. Cero Pestañeo Satelital: Mapbox recibirá sus coordenadas iniciales desde el servidor, 
 *    permitiendo que el primer renderizado ya incluya los tiles correctos.
 * 3. Robustez SSR: Se mantiene el uso de 'maybeSingle()' para proteger el flujo de 
 *    nuevos registros y se blinda la lectura de cookies con bloques try/catch.
 */