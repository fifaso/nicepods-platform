// app/layout.tsx
// VERSIÓN: 28.0 (NicePod Architecture Core - Production Master)
// Misión: Orquestar la infraestructura global, la identidad SSR y la atmósfera Aurora.
// [ESTABILIZACIÓN]: Versión definitiva sin scripts de purga, optimizada para escalabilidad.

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
import { ErrorBoundary } from "@/components/system/error-boundary";
import { CSPostHogProvider } from '@/components/providers/posthog-provider';
import { PwaLifecycle } from "@/components/system/pwa-lifecycle";
import { ThemeProvider } from "@/components/system/theme-provider";
import { AuthProvider } from "@/hooks/use-auth";
import { createClient } from '@/lib/supabase/server';
import { Tables } from "@/types/database.types";

// Motor de Inmersión Visual
import { BackgroundEngine } from "@/components/visuals/background-engine";

/**
 * FUENTE PRINCIPAL: Inter
 * Optimizada mediante CSS Variables para garantizar que el 'Build Shield' 
 * de Tailwind reconozca la tipografía corporativa de forma nativa.
 */
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

/**
 * VIEWPORT API: Configuración de hardware de visualización.
 * Bloqueamos el escalado manual para garantizar la precisión táctil de la Workstation.
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
 * Delegamos la lógica de instalación al archivo manifest.json para cumplimiento PWA.
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
 * 
 * Este Server Component realiza el Handshake de Identidad (T0) recuperando
 * la sesión nominal antes de entregar el control al árbol de componentes cliente.
 */
export default async function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  /**
   * 1. PROTOCOLO DE IDENTIDAD ATÓMICA (SSR)
   * Validamos la existencia del usuario en el servidor para evitar saltos de hidratación.
   */
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let initialSession = null;
  let initialProfile: Tables<'profiles'> | null = null;

  if (user) {
    /**
     * COSECHA PARALELA DE DATOS (Fan-Out):
     * Optimizamos el rendimiento de carga ejecutando la validación de sesión
     * y la recuperación de perfil de forma simultánea.
     */
    const [sessionRes, profileRes] = await Promise.all([
      supabase.auth.getSession(),
      supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
    ]);

    initialSession = sessionRes.data.session;
    initialProfile = profileRes.data;
  }

  return (
    <html lang="es" suppressHydrationWarning className={inter.variable}>
      <head>
        {/* 
            SCRIPT ANTI-PESTAÑEO DE TEMA:
            Inyecta la clase CSS '.dark' antes del renderizado del body para 
            asegurar una transición lumínica profesional sin artefactos visuales.
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
        className={`${inter.className} font-sans min-h-screen antialiased selection:bg-primary/30 bg-background text-foreground`}
        suppressHydrationWarning
      >
        {/* CAPA 1: Telemetría y Análisis (Analytics) */}
        <CSPostHogProvider>

          {/* CAPA 2: Ciclo de Vida PWA (Gestión de Service Worker) */}
          <PwaLifecycle />

          {/* CAPA 3: Red de Seguridad de Errores (Fail-Safe) */}
          <ErrorBoundary>

            {/* CAPA 4: Motor Atmosférico (Gestor de Temas) */}
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange={true}
              storageKey="theme"
            >

              {/* CAPA 5: Soberanía de Identidad (Handshake T0) */}
              <AuthProvider
                initialSession={initialSession}
                initialProfile={initialProfile}
              >

                {/* --- ESCENARIO VISUAL NICEPOD V2.8 --- */}
                <div className="min-h-screen relative overflow-x-hidden">

                  {/* CAPA ALFA: La Aurora de Fondo (Fixed z-0) */}
                  <BackgroundEngine />

                  {/* 
                      CAPA BETA: Contenedor de Contenido (Z-10) 
                      Mantenemos el fondo transparente para permitir que la luz 
                      del BackgroundEngine atraviese la malla de la interfaz.
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
 * 1. Consolidación de Identidad: Al inyectar 'initialSession' e 'initialProfile' 
 *    desde el servidor, garantizamos que el AuthProvider no tenga que realizar 
 *    peticiones adicionales al cargarse, eliminando el parpadeo de sesión.
 * 2. Rendimiento LCP: La organización de capas asegura que el BackgroundEngine 
 *    (GPU-driven) no bloquee la renderización de los componentes hijos.
 * 3. Seguridad Estructural: El uso de 'font-sans' en el body, vinculado a la 
 *    fuente 'Inter' mediante variables CSS, asegura la coherencia tipográfica 
 *    incluso en componentes cargados dinámicamente.
 */