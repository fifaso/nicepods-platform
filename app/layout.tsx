// app/layout.tsx
// VERSIÓN: 29.0 (NicePod Architecture Core - Sovereign Sync Edition)
// Misión: Orquestar la infraestructura global, la identidad atómica SSR y la atmósfera Aurora.
// [ESTABILIZACIÓN]: Handshake T0 consolidado para erradicar el flasheo de hidratación.

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

// Motor de Inmersión Visual (GPU-driven)
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
 * COMPONENTE: RootLayout (The Master Orchestrator)
 * Realiza el Handshake de Identidad (T0) en el servidor para evitar 
 * saltos visuales durante la hidratación del cliente.
 */
export default async function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  /**
   * 1. PROTOCOLO DE IDENTIDAD SOBERANA (SSR)
   * Validamos la existencia del usuario en el metal del servidor antes de 
   * enviar el HTML al navegador.
   */
  const supabase = createClient();

  // Obtenemos el usuario autenticado desde el JWT de la cookie
  const { data: { user } } = await supabase.auth.getUser();

  let initialSession = null;
  let initialProfile: Tables<'profiles'> | null = null;

  if (user) {
    /**
     * COSECHA PARALELA DE DATOS (Fan-Out Pipeline):
     * Optimizamos el rendimiento recuperando la sesión técnica y el perfil 
     * nominal simultáneamente.
     */
    const [sessionRes, profileRes] = await Promise.all([
      supabase.auth.getSession(),
      supabase.from('profiles')
        .select('*')
        .eq('id', user.id)
        .single() // Usamos .single() para forzar la integridad del registro
    ]);

    initialSession = sessionRes.data.session;
    initialProfile = profileRes.data;

    /**
     * [AUTO-REMEDICACIÓN]: 
     * Si hay usuario pero no hay perfil (caso de registro muy reciente), 
     * dejamos el perfil en null para que el AuthProvider dispare 
     * el reintento sintonizado en el cliente.
     */
  }

  return (
    <html lang="es" suppressHydrationWarning className={inter.variable}>
      <head>
        {/* 
            SCRIPT ANTI-PESTAÑEO DE TEMA (Lumen-Shield):
            Inyecta la clase CSS '.dark' antes de que React se inicialice, 
            evitando que el usuario vea una pantalla blanca antes del tema oscuro.
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
        {/* CAPA 1: Telemetría y Análisis Operativo */}
        <CSPostHogProvider>

          {/* CAPA 2: Orquestador de Ciclo de Vida PWA */}
          <PwaLifecycle />

          {/* CAPA 3: Red de Seguridad y Captura de Excepciones */}
          <ErrorBoundary>

            {/* CAPA 4: Motor Atmosférico Aurora (Gestor de Temas) */}
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange={true}
              storageKey="theme"
            >

              {/* CAPA 5: EL HANDSHAKE T0 (AuthProvider)
                  Inyectamos la identidad SSR para que el cliente nazca sintonizado. */}
              <AuthProvider
                initialSession={initialSession}
                initialProfile={initialProfile}
              >

                {/* --- ESCENARIO VISUAL NICEPOD V2.9 --- */}
                <div className="min-h-screen relative overflow-x-hidden">

                  {/* CAPA ALFA: La Aurora (Fixed z-0)
                      Dibuja los gradientes que reaccionan al hardware (Glow) */}
                  <BackgroundEngine />

                  {/* 
                      CAPA BETA: El Chasis de Contenido (Z-10) 
                      Transparente para permitir la visualización de la Aurora.
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
 * NOTA TÉCNICA DEL ARCHITECT (V29.0):
 * 1. Sincronía Atómica: Al utilizar 'supabase.auth.getUser()' en el servidor, 
 *    el Middleware y el Layout actúan como un solo bloque lógico de seguridad.
 * 2. Cero Pestañeo: La inyección de 'initialProfile' resuelve el problema donde 
 *    el nombre del usuario aparecía vacío por milisegundos tras el refresco.
 * 3. Aislamiento de Red: Las hojas de estilo de Mapbox se cargan aquí para que 
 *    cualquier subpágina de la plataforma pueda renderizar el radar sin 
 *    esperar descargas adicionales de CSS.
 */