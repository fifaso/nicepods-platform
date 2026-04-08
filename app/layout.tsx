/**
 * ARCHIVO: app/layout.tsx
 * VERSIÓN: 36.0 (NicePod Architecture Core - Zero Flicker Edition)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Orquestar la infraestructura de datos y atmósfera, aislando el contexto WebGL.
 * [REFORMA V36.0]: Eliminación de pestañeo de carga inicial mediante inyección síncrona
 * de color de fondo y cumplimiento absoluto de la Zero Abbreviations Policy.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { cookies } from "next/headers";
import type React from "react";

/**
 * --- CAPA 0: CIMIENTOS VISUALES ---
 * Sincronización de estilos base. El CSS del motor geoespacial se carga aquí 
 * para estar disponible en los proveedores locales de cada ruta.
 */
import "mapbox-gl/dist/mapbox-gl.css";
import "./globals.css";

// --- INFRAESTRUCTURA DE SERVICIOS SINCRONIZADOS ---
import { CSPostHogProvider } from '@/components/providers/posthog-provider';
import { ErrorBoundary } from "@/components/system/error-boundary";
import { PwaLifecycle } from "@/components/system/pwa-lifecycle";
import { ThemeProvider } from "@/components/system/theme-provider";
import { AuthProvider } from "@/hooks/use-auth";
import { createClient } from '@/lib/supabase/server';
import { Tables } from "@/types/database.types";

// --- CONTEXTOS DE INTELIGENCIA Y TELEMETRÍA (SOBERANÍA DE DATOS) ---
import { AudioProvider } from "@/contexts/audio-context";
import { GeoEngineProvider } from "@/hooks/use-geo-engine";

// --- MOTOR DE INMERSIÓN VISUAL (SOBERANÍA ATMOSFÉRICA) ---
import { BackgroundEngine } from "@/components/visuals/background-engine";

import { cn } from "@/lib/utils";

const interFontConfiguration = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

/**
 * VIEWPORT: Configuración de la Interfaz de Usuario de Bajo Nivel.
 */
export const viewport: Viewport = {
  themeColor: "#010101",
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
 * COMPONENTE: RootLayout (El Orquestador Maestro)
 */
export default async function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  /**
   * 1. PROTOCOLO DE IDENTIDAD ATÓMICA EN SERVIDOR
   */
  const supabaseClient = createClient();
  const { data: { user: authenticatedUser } } = await supabaseClient.auth.getUser();

  let initialAuthenticationSession = null;
  let initialAdministratorProfile: Tables<'profiles'> | null = null;
  let userAuthorityRole = 'guest';

  // [RESCATE GEO-IP]: Telemetría de red pasiva para establecer el epicentro inicial
  const browserCookiesStore = cookies();
  const geographicFallbackRawValue = browserCookiesStore.get('nicepod-geo-fallback')?.value;
  let initialGeographicData = null;

  if (geographicFallbackRawValue) {
    try {
      initialGeographicData = JSON.parse(geographicFallbackRawValue);
    } catch (parseException) {
      console.error("Layout-Geo-Error:", parseException);
    }
  }

  if (authenticatedUser) {
    /**
     * COSECHA PARALELA DE DATOS (Fan-Out Pipeline)
     */
    const [sessionQueryResponse, profileQueryResponse] = await Promise.all([
      supabaseClient.auth.getSession(),
      supabaseClient.from('profiles')
        .select('*')
        .eq('id', authenticatedUser.id)
        .maybeSingle()
    ]);

    initialAuthenticationSession = sessionQueryResponse.data.session;
    initialAdministratorProfile = profileQueryResponse.data;

    const userApplicationMetadata = authenticatedUser.app_metadata || {};
    userAuthorityRole = userApplicationMetadata.user_role || userApplicationMetadata.role || (initialAdministratorProfile?.role) || 'user';
  }

  const authenticationStateDescriptor = authenticatedUser ? "authenticated" : "unauthenticated";

  return (
    <html
      lang="es"
      suppressHydrationWarning
      // [FIX V36.0]: Inyección síncrona de fondo oscuro para evitar salto blanco pre-hidratación.
      className={cn(interFontConfiguration.variable, "bg-[#010101] dark")}
      data-auth-state={authenticationStateDescriptor}
      data-user-role={userAuthorityRole}
    >
      <head>
        {/* II. ACELERACIÓN DE RED PARA EL MOTOR WEBGL */}
        <link rel="preconnect" href="https://api.mapbox.com" />
        <link rel="preconnect" href="https://events.mapbox.com" />

        {/* 
            SCRIPT DE TEMA: Evalúa preferencias del sistema antes de que React despierte.
            Se purifican las variables para cumplir con el Dogma NicePod.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var storedSystemTheme = localStorage.getItem('theme');
                  var prefersDarkModeActive = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  var finalAppliedTheme = (storedSystemTheme === 'dark' || (!storedSystemTheme && prefersDarkModeActive)) ? 'dark' : 'light';
                  document.documentElement.classList.add(finalAppliedTheme);
                  document.documentElement.style.colorScheme = finalAppliedTheme;
                } catch (themeException) {
                  console.error('Lumen-Shield Error:', themeException);
                }
              })();
            `,
          }}
        />
      </head>
      <body
        // [FIX V36.0]: Fondo sólido oscuro en el body para sellar la protección Anti-Pestañeo
        className={`${interFontConfiguration.className} font-sans min-h-screen antialiased selection:bg-primary/30 bg-[#010101] text-foreground overflow-x-hidden`}
        suppressHydrationWarning
      >
        <CSPostHogProvider>
          <PwaLifecycle />
          <ErrorBoundary>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem={false} // Desactivado para mantener consistencia de estilo industrial
              disableTransitionOnChange={true}
              storageKey="theme"
            >
              <AuthProvider
                initialSession={initialAuthenticationSession}
                initialProfile={initialAdministratorProfile}
              >
                <AudioProvider>
                  {/* 
                      III. SOBERANÍA DE DATOS SIN CONTEXTO VISUAL GLOBAL
                      [MANDATO V35.0]: GeoEngineProvider gestiona el flujo de coordenadas.
                      NO inyectar MapProvider aquí para evitar el Ghosting rotacional.
                  */}
                  <GeoEngineProvider initialData={initialGeographicData}>
                    <main className="min-h-screen relative flex flex-col bg-[#010101]">
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
 * NOTA TÉCNICA DEL ARCHITECT (V36.0):
 * 1. Anti-Flicker Shield: La inyección de clases 'bg-[#010101] dark' en html y body 
 *    garantiza que el lienzo de pintura inicial sea negro puro.
 * 2. Zero Abbreviations Policy: Se purificaron términos legacy (e, user, sessionRes, 
 *    geoFallbackRaw) sustituyéndolos por sus descriptores nominales de grado pericial.
 * 3. Typography Unification: El utilitario 'inter' se renombra a 'interFontConfiguration' 
 *    para evitar ambigüedad léxica en la inyección de clases.
 */