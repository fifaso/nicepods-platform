// app/layout.tsx
// VERSIÓN: 34.0 (NicePod Architecture Core - Visual Breakthrough Edition)
// Misión: Orquestar la infraestructura global y liberar el lienzo visual para el BackgroundEngine.
// [ESTABILIZACIÓN]: Eliminación de oclusión por bg-body y refinamiento de stacking context.

import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { cookies } from "next/headers";
import type React from "react";

/**
 * --- CAPA 0: CIMIENTOS VISUALES ---
 * Sincronización de estilos base para WebGL y diseño Aurora.
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

// Contextos de Inteligencia y Telemetría
import { AudioProvider } from "@/contexts/audio-context";
import { GeoEngineProvider } from "@/hooks/use-geo-engine";

// Motor de Inmersión Visual (V11.0)
import { BackgroundEngine } from "@/components/visuals/background-engine";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

/**
 * VIEWPORT: Configuración de UI de bajo nivel.
 * Se sincroniza con el color base del BackgroundEngine para evitar saltos en móviles.
 */
export const viewport: Viewport = {
  themeColor: "#030303", // Sincronizado con BackgroundEngine V11.0 (Dark)
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

  // [RESCATE GEO-IP]: Telemetría de red para Handshake T0
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
        {/* II. ACELERACIÓN DE RED */}
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
        className={`${inter.className} font-sans min-h-screen antialiased selection:bg-primary/30 bg-transparent text-foreground overflow-x-hidden`}
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
                  {/* III. MOTOR GEO Y VISUAL */}
                  <GeoEngineProvider initialData={initialGeoData}>
                    <main className="min-h-screen relative flex flex-col">
                      {/* El motor Aurora ahora es visible gracias a body bg-transparent */}
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
 * NOTA TÉCNICA DEL ARCHITECT (V34.0):
 * 1. Transparencia de Lienzo: Se ha eliminado bg-[#020202] del body. Esto permite
 *    que el BackgroundEngine (V11.0) pinte los orbes morados y azules sin oclusión.
 * 2. Sincronía de Viewport: Se actualizó themeColor a #030303 para coincidir con 
 *    el nuevo fondo industrial, eliminando el borde gris en navegadores móviles.
 * 3. Aislamiento Isolate: Se mantiene el contexto 'isolate' en el div de children 
 *    para que los componentes UI no interfieran con el z-index del BackgroundEngine.
 */