/**
 * ARCHIVO: app/layout.tsx
 * VERSIÓN: 5.1 (Madrid Resonance)
 * PROTOCOLO: Intellectual Capital & Traceability
 * MISIÓN: Orquestación de la infraestructura global de datos, seguridad y atmósfera con SEO industrial.
 * NIVEL DE INTEGRIDAD: 100%
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
  description: "Workstation de Inteligencia Industrial para la captura y síntesis de Capital Intelectual Urbano.",
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
 * El orquestador maestro de la infraestructura distribuida de NicePod.
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

  let initialGeographicIntelligenceData: {
    latitudeCoordinate: number;
    longitudeCoordinate: number;
    cityName: string;
    geographicSource: string;
  } | null = null;

  if (geodeticSeedT0RawValue) {
    try {
      const parsedGeodeticSeed = JSON.parse(decodeURIComponent(geodeticSeedT0RawValue));

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
     * Recuperamos sesión y perfil de perito de forma concurrente desde el Metal.
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

  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={concatenateClassNames(interFontConfiguration.variable, "bg-[#010101] dark")}
      data-auth-state={authenticatedUser ? "authenticated" : "unauthenticated"}
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
                {/* 
                    [SINCRO V39.0]: Uso de propiedades purificadas para satisfacer 
                    el contrato soberano del AuthProvider V5.1.
                */}
                <AuthProvider
                  initialAuthenticationSession={initialAuthenticationSessionData}
                  initialAdministratorProfile={initialAdministratorProfileData}
                >
                  <AudioProvider>
                    {/*
                        IV. SOBERANÍA DE TELEMETRÍA GLOBAL (MADRID RESONANCE V4.9)
                        Provee ubicación persistente a través de toda la Workstation.
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
 * NOTA TÉCNICA DEL ARCHITECT (V39.0):
 * 1. Auth Contract Alignment: Se resolvió el error TS2322 al renombrar las propiedades 
 *    inyectadas en 'AuthProvider' hacia sus descriptores industriales.
 * 2. ZAP Enforcement: Purificación nominal absoluta. Se han eliminado residuos como 
 *    'initialSession' o 'initialProfile' en la interfaz de componentes.
 * 3. Geodetic Integrity: El 'GeoEngineProvider' ahora recibe la semilla T0 con el 
 *    tipado estricto que exige el motor geodésico estabilizado.
 */