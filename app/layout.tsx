/**
 * ARCHIVO: app/layout.tsx
 * VERSIÓN: 37.0 (NicePod Root Orchestrator - Global Geodetic Ubiquity Edition)
 * PROTOCOLO: MADRID RESONANCE V4.8
 * 
 * Misión: Orquestar la infraestructura global de datos, seguridad y atmósfera. 
 * Actúa como el anfitrión soberano del motor de telemetría, asegurando que la 
 * verdad geográfica sea persistente a través de toda la aplicación.
 * [REFORMA V37.0]: Elevación del GeoEngineProvider a la raíz absoluta. Sincronización 
 * con la semilla T0 del Middleware y cumplimiento estricto de la Zero Abbreviations 
 * Policy (ZAP). Sellado del Build Shield contra la asincronía de hidratación.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { cookies } from "next/headers";
import type React from "react";

/**
 * --- CAPA 0: CIMIENTOS VISUALES ---
 * Carga de activos estructurales y estilos del reactor WebGL.
 */
import "mapbox-gl/dist/mapbox-gl.css";
import "./globals.css";

// --- INFRAESTRUCTURA DE SERVICIOS SOBERANOS ---
import { CSPostHogProvider } from '@/components/providers/posthog-provider';
import { ErrorBoundary } from "@/components/system/error-boundary";
import { PwaLifecycle } from "@/components/system/pwa-lifecycle";
import { ThemeProvider } from "@/components/system/theme-provider";
import { AuthProvider } from "@/hooks/use-auth";
import { createClient } from '@/lib/supabase/server';
import { Tables } from "@/types/database.types";

// --- CONTEXTOS DE INTELIGENCIA Y TELEMETRÍA (SINGLETON GLOBAL) ---
import { AudioProvider } from "@/contexts/audio-context";
import { GeoEngineProvider } from "@/hooks/use-geo-engine";

// --- MOTOR DE INMERSIÓN ATMOSFÉRICA ---
import { BackgroundEngine } from "@/components/visuals/background-engine";

// --- UTILIDADES INDUSTRIALES ---
import { concatenateClassNames } from "@/lib/utils";

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
  description: "Workstation de inteligencia industrial para la captura de capital intelectual urbano.",
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
 * COMPONENTE: RootLayout
 * El orquestador maestro de la infraestructura de NicePod.
 */
export default async function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  /**
   * 1. PROTOCOLO DE IDENTIDAD SOBERANA EN EL BORDE (SSR)
   */
  const supabaseSovereignClient = createClient();
  const { data: { user: authenticatedUser } } = await supabaseSovereignClient.auth.getUser();

  let initialAuthenticationSessionData = null;
  let initialAdministratorProfileData: Tables<'profiles'> | null = null;
  let userAuthorityRoleDescriptor = 'guest';

  /**
   * 2. RECUPERACIÓN DE SEMILLA GEODÉSICA T0 (HANDSHAKE)
   * Misión: Inyectar la ubicación estimada por el Middleware (Edge-IP) para evitar 
   * el estado de mapa nulo durante la ignición de hardware.
   */
  const browserCookiesStore = cookies();
  const geodeticSeedT0RawValue = browserCookiesStore.get('nicepod-geodetic-seed-t0')?.value;
  let initialGeographicIntelligenceData = null;

  if (geodeticSeedT0RawValue) {
    try {
      const parsedGeodeticSeed = JSON.parse(geodeticSeedT0RawValue);
      // Mapeamos hacia el contrato esperado por el GeoEngineProvider
      initialGeographicIntelligenceData = {
        lat: parsedGeodeticSeed.latitudeCoordinate,
        lng: parsedGeodeticSeed.longitudeCoordinate,
        city: parsedGeodeticSeed.cityName,
        source: parsedGeodeticSeed.geographicSource
      };
    } catch (parseException) {
      console.error("🔥 [RootLayout] Fallo en des-serialización de semilla geodésica:", parseException);
    }
  }

  if (authenticatedUser) {
    /**
     * COSECHA PARALELA DE DATOS (FAN-OUT PIPELINE)
     * Recuperamos sesión y perfil de perito de forma concurrente.
     */
    const [sessionQueryResponse, profileQueryResponse] = await Promise.all([
      supabaseSovereignClient.auth.getSession(),
      supabaseSovereignClient.from('profiles')
        .select('*')
        .eq('id', authenticatedUser.id)
        .maybeSingle()
    ]);

    initialAuthenticationSessionData = sessionQueryResponse.data.session;
    initialAdministratorProfileData = profileQueryResponse.data;

    const userApplicationMetadata = authenticatedUser.app_metadata || {};
    userAuthorityRoleDescriptor = userApplicationMetadata.user_role || userApplicationMetadata.role || (initialAdministratorProfileData?.role) || 'user';
  }

  const authenticationStateDescriptor = authenticatedUser ? "authenticated" : "unauthenticated";

  return (
    <html
      lang="es"
      suppressHydrationWarning
      // [FIX V37.0]: Inyección síncrona de fondo #010101 para neutralizar el parpadeo blanco.
      className={concatenateClassNames(interFontConfiguration.variable, "bg-[#010101] dark")}
      data-auth-state={authenticationStateDescriptor}
      data-user-role={userAuthorityRoleDescriptor}
    >
      <head>
        {/* III. ACELERACIÓN DE RED PARA WebGL */}
        <link rel="preconnect" href="https://api.mapbox.com" />
        <link rel="preconnect" href="https://events.mapbox.com" />

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
                  console.error('Lumen-Shield Runtime Exception:', themeException);
                }
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${interFontConfiguration.className} font-sans min-h-screen antialiased selection:bg-primary/30 bg-[#010101] text-foreground overflow-x-hidden`}
        suppressHydrationWarning
      >
        <CSPostHogProvider>
          <PwaLifecycle />
          <ErrorBoundary>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem={false} 
              disableTransitionOnChange={true}
              storageKey="theme"
            >
              <AuthProvider
                initialSession={initialAuthenticationSessionData}
                initialProfile={initialAdministratorProfileData}
              >
                <AudioProvider>
                  {/* 
                      IV. SOBERANÍA DE TELEMETRÍA GLOBAL (MADRID RESONANCE V4.8)
                      [MANDATO ESTRATÉGICO]: El GeoEngineProvider reside en la raíz 
                      para garantizar que la ubicación sea compartida entre Marketing, 
                      Dashboard y la Terminal de Forja sin interrupciones.
                  */}
                  <GeoEngineProvider initialData={initialGeographicIntelligenceData}>
                    <main className="min-h-screen relative flex flex-col bg-[#010101] isolate">
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
 * NOTA TÉCNICA DEL ARCHITECT (V37.0):
 * 1. Global Geodetic Singleton: La elevación de 'GeoEngineProvider' asegura que 
 *    el Voyager no pierda la triangulación al navegar de la Landing al Dashboard.
 * 2. T0 Seed Handshake: Sincronización con la cookie 'nicepod-geodetic-seed-t0' 
 *    proveyendo una materialización instantánea basada en el borde de red.
 * 3. Zero Abbreviations Policy (ZAP): Refactorización total de variables de 
 *    servidor (initialGeographicIntelligenceData, supabaseSovereignClient).
 */