/**
 * ARCHIVO: app/layout.tsx
 * VERSIÓN: 5.2 (Madrid Resonance)
 * PROTOCOLO: Intellectual Capital & Traceability
 * MISIÓN: Orquestación de la infraestructura global de datos, seguridad y atmósfera con SEO industrial y trazabilidad de cimientos.
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
import { concatenateClassNames, nicepodLog } from "@/lib/utils";

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

/**
 * METADATA SOBERANA: Configuración de la identidad global de la plataforma.
 */
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
  const { data: { user: authenticatedUserSnapshot } } = await supabaseSovereignClient.auth.getUser();

  let initialAuthenticationSessionDataSnapshot = null;
  let initialAdministratorProfileDataSnapshot: Tables<'profiles'> | null = null;
  let userAuthorityRoleDescriptor = 'guest';

  /**
   * 2. RECUPERACIÓN DE SEMILLA GEODÉSICA T0 (HANDSHAKE)
   * Misión: Inyectar la ubicación estimada por el Middleware (Edge-IP) para evitar 
   * el estado de mapa nulo durante la ignición de hardware.
   */
  const browserCookiesStore = cookies();
  const geodeticSeedT0RawValue = browserCookiesStore.get('nicepod-geodetic-seed-t0')?.value;

  let initialGeographicIntelligenceDataSnapshot: {
    latitudeCoordinate: number;
    longitudeCoordinate: number;
    cityName: string;
    geographicSource: string;
  } | null = null;

  if (geodeticSeedT0RawValue) {
    try {
      const parsedGeodeticSeedDictionary = JSON.parse(decodeURIComponent(geodeticSeedT0RawValue));

      initialGeographicIntelligenceDataSnapshot = {
        latitudeCoordinate: parsedGeodeticSeedDictionary.latitudeCoordinate,
        longitudeCoordinate: parsedGeodeticSeedDictionary.longitudeCoordinate,
        cityName: parsedGeodeticSeedDictionary.cityName || "Madrid Resonance",
        geographicSource: parsedGeodeticSeedDictionary.geographicSource || "edge-internet-protocol"
      };
    } catch (parseException: unknown) {
      nicepodLog("🔥 [RootLayout] Fallo en des-serialización de semilla geodésica.", parseException, 'error');
      initialGeographicIntelligenceDataSnapshot = null;
    }
  }

  if (authenticatedUserSnapshot) {
    /**
     * COSECHA PARALELA DE DATOS (FAN-OUT PIPELINE)
     * Recuperamos sesión y perfil de perito de forma concurrente desde el Metal.
     */
    const [sessionQueryResponse, profileQueryResponse] = await Promise.all([
      supabaseSovereignClient.auth.getSession(),
      supabaseSovereignClient.from('profiles')
        .select('*')
        .eq('id', authenticatedUserSnapshot.id)
        .maybeSingle()
    ]);

    initialAuthenticationSessionDataSnapshot = sessionQueryResponse.data.session;
    initialAdministratorProfileDataSnapshot = profileQueryResponse.data;

    const userApplicationMetadataSnapshot = authenticatedUserSnapshot.app_metadata || {};
    userAuthorityRoleDescriptor = userApplicationMetadataSnapshot.user_role || userApplicationMetadataSnapshot.role || (initialAdministratorProfileDataSnapshot?.role) || 'user';
  }

  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={concatenateClassNames(interFontConfiguration.variable, "bg-[#010101] dark")}
      data-auth-state={authenticatedUserSnapshot ? "authenticated" : "unauthenticated"}
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
                  var storedSystemThemeValue = localStorage.getItem('theme');
                  var prefersDarkModeActiveStatus = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  var finalAppliedThemeDescriptor = (storedSystemThemeValue === 'dark' || (!storedSystemThemeValue && prefersDarkModeActiveStatus)) ? 'dark' : 'light';
                  document.documentElement.classList.add(finalAppliedThemeDescriptor);
                  document.documentElement.style.colorScheme = finalAppliedThemeDescriptor;
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
                  initialAuthenticationSession={initialAuthenticationSessionDataSnapshot}
                  initialAdministratorProfile={initialAdministratorProfileDataSnapshot}
                >
                  <AudioProvider>
                    <GeoEngineProvider initialData={initialGeographicIntelligenceDataSnapshot}>
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
 * NOTA TÉCNICA DEL ARCHITECT (V5.2):
 * 1. Industrial Traceability: Reemplazo de console.error por nicepodLog en la gestión de semillas geodésicas.
 * 2. ZAP Absolute Compliance: Purificación total de variables SSR ('user' -> 'authenticatedUserSnapshot', 'seed' -> 'geodeticSeedT0RawValue').
 * 3. SEO Integrity: Consolidación del objeto Metadata siguiendo los estándares de Next.js 15.
 */
