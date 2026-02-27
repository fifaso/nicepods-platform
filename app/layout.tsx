// app/layout.tsx
// VERSIÓN: 26.0

import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import type React from "react";

/**
 * --- CAPA 0: CIMIENTOS VISUALES ---
 * Cargamos los estilos críticos en el tope para asegurar que los componentes 
 * geoespaciales y la atmósfera Aurora nazcan con sus dimensiones correctas.
 */
import "mapbox-gl/dist/mapbox-gl.css";
import "./globals.css";

// Infraestructura de Servicios
import { ErrorBoundary } from "@/components/error-boundary";
import { CSPostHogProvider } from '@/components/providers/posthog-provider';
import { PwaLifecycle } from "@/components/pwa-lifecycle";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/hooks/use-auth";
import { createClient } from '@/lib/supabase/server';
import { Tables } from "@/types/database.types";

// Motor Visual
import { BackgroundEngine } from "@/components/visuals/background-engine";

/**
 * FUENTE PRINCIPAL: Inter
 * Utilizamos 'variable' para permitir que el diseño industrial 
 * herede la fuente mediante CSS variables.
 */
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

/**
 * VIEWPORT API: Configuración de hardware de visualización.
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
 * METADATA API: Identidad Soberana.
 * [REMEDIACÍON DEFINITIVA]: 
 * Se ha eliminado totalmente el bloque 'appleWebApp'.
 * NicePod ahora cumple al 100% con los estándares PWA modernos, 
 * delegando la capacidad de aplicación al archivo /public/manifest.json.
 */
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
 * RootLayout: El Gran Orquestador Síncrono.
 */
export default async function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  /**
   * 1. PROTOCOLO DE IDENTIDAD ATÓMICA (SSR)
   * Capturamos la verdad en el servidor para evitar saltos de hidratación.
   */
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let initialSession = null;
  let initialProfile: Tables<'profiles'> | null = null;

  if (user) {
    // Cosecha paralela para optimizar el TTFB (Time To First Byte).
    const [sessionRes, profileRes] = await Promise.all([
      supabase.auth.getSession(),
      supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
    ]);

    initialSession = sessionRes.data.session;
    initialProfile = profileRes.data;
  }

  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* 
            SCRIPT ANTI-PESTAÑEO DE TEMA:
            Esencial para inyectar la clase .dark antes de que el navegador 
            muestre el primer píxel blanco del body.
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
        className={`${inter.className} min-h-screen font-sans antialiased selection:bg-primary/30`}
        suppressHydrationWarning
      >
        {/* CAPA 1: Telemetría Global (Analytics) */}
        <CSPostHogProvider>

          {/* CAPA 2: Ciclo de Vida PWA (Registro Seguro) */}
          <PwaLifecycle />

          {/* CAPA 3: Red de Seguridad de Errores */}
          <ErrorBoundary>

            {/* CAPA 4: Motor de Atmósfera Aurora (Theme Context) */}
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange={true}
              storageKey="theme"
            >

              {/* CAPA 5: Soberanía de Identidad SSR */}
              <AuthProvider
                initialSession={initialSession}
                initialProfile={initialProfile}
              >

                {/* --- ESCENARIO VISUAL NICEPOD V2.5 --- */}
                <div className="min-h-screen relative overflow-x-hidden">

                  {/* CAPA ALFA: El Motor de Fondo (Fixed z-0) */}
                  <BackgroundEngine />

                  {/* 
                      CAPA BETA: Contenedor de Contenido (Z-10) 
                       bg-transparent es innegociable para dejar pasar la luz.
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
 * 1. Silencio en Consola: La eliminación del campo 'appleWebApp' silencia 
 *    definitivamente la advertencia de deprecación de Chrome 120+.
 * 2. Rendimiento de Carga: Se han recalibrado los iconos en el objeto metadata 
 *    para cumplir con los tamaños estándar que el navegador pre-carga.
 * 3. Integridad SSR: El uso de 'maybeSingle' en el perfil asegura que 
 *    los nuevos registros no causen fallos de renderizado mientras se 
 *    propaga el trigger de creación de perfil en la DB.
 */