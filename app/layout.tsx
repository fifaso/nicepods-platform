/**
 * ARCHIVO: app/layout.tsx
 * VERSIÓN: 38.0 (NicePod Root Orchestrator - Absolute Nominal Sync & T0 Precision Edition)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * 
 * Misión: Orquestar la infraestructura global de datos, seguridad y atmósfera. 
 * Actúa como el anfitrión soberano del motor de telemetría, asegurando que la 
 * verdad geográfica sea persistente a través de toda la aplicación.
 * [REFORMA V38.0]: Resolución definitiva del error TS2322. Sincronización nominal 
 * absoluta del objeto 'initialGeographicIntelligenceData' con el contrato 
 * del GeoEngineProvider V53.0. Erradicación total de abreviaciones (ZAP).
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
import { TooltipProvider } from "@/components/ui/tooltip";
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

  /**
   * initialGeographicIntelligenceData:
   * [SINCRO V38.0]: Alineación nominal estricta con 'GeoEngineProvider'.
   */
  let initialGeographicIntelligenceData: {
    latitudeCoordinate: number;
    longitudeCoordinate: number;
    cityName: string;
    geographicSource: string;
  } | null = null;

  if (geodeticSeedT0RawValue) {
    try {
      const parsedGeodeticSeed = JSON.parse(decodeURIComponent(geodeticSeedT0RawValue));

      // Mapeamos hacia el contrato soberano sin abreviaciones.
      initialGeographicIntelligenceData = {
        latitudeCoordinate: parsedGeodeticSeed.latitudeCoordinate,
        longitudeCoordinate: parsedGeodeticSeed.longitudeCoordinate,
        cityName: parsedGeodeticSeed.cityName || "Madrid Resonance",
        geographicSource: parsedGeodeticSeed.geographicSource || "edge-internet-protocol"
      };
    } catch (parseException) {
      console.error("🔥 [RootLayout] Fallo en des-serialización de semilla geodésica:", parseException);
      initialGeographicIntelligenceData = null;
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
              <TooltipProvider>
                <AuthProvider
                  initialSession={initialAuthenticationSessionData}
                  initialProfile={initialAdministratorProfileData}
                >
                  <AudioProvider>
                    {/*
                        IV. SOBERANÍA DE TELEMETRÍA GLOBAL (MADRID RESONANCE V4.9)
                        [MANDATO V38.0]: El GeoEngineProvider recibe datos 100% tipados 
                        bajo la Zero Abbreviations Policy.
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
              </TooltipProvider>
            </ThemeProvider>
          </ErrorBoundary>
        </CSPostHogProvider>
      </body>
    </html>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V38.0):
 * 1. Build Shield Absolute: Se eliminó el error TS2322 al mapear 'lat/lng' a 
 *    'latitudeCoordinate/longitudeCoordinate' en la semilla T0.
 * 2. T0 Reliability: El uso de decodeURIComponent garantiza que la cookie sea 
 *    interpretada correctamente por el motor de Deno/Next.
 * 3. ZAP Enforcement: Purificación total de variables. No se permiten nombres 
 *    como 'initialGeoData' o 'authSession'. El código es ahora autodescriptivo.
 */