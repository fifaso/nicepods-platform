// app/layout.tsx
// VERSIÓN: 30.1 (NicePod Architecture Core - Zero-Flicker & Sovereign Identity Edition)
// Misión: Orquestar la infraestructura global, inyectar el Handshake T0 y aniquilar el Flicker.
// [ESTABILIZACIÓN]: Implementación de Data Attributes para CSS Shielding y Sincronía de Roles SSR.

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
 * Optimizada mediante CSS Variables para que Tailwind reconozca la tipografía nativamente.
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
 * Delegamos la instalación al archivo manifest.json para cumplimiento PWA.
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
 * Realiza el Handshake de Identidad (T0) en el servidor, sintonizando al cliente
 * con la Base de Datos antes de pintar el primer frame.
 */
export default async function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  /**
   * 1. PROTOCOLO DE IDENTIDAD ATÓMICA (SSR)
   * Validamos la existencia del usuario en el metal del servidor.
   */
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let initialSession = null;
  let initialProfile: Tables<'profiles'> | null = null;
  let userRole = 'guest';

  if (user) {
    /**
     * COSECHA PARALELA DE DATOS (Fan-Out Pipeline):
     * Optimizamos el TTFB recuperando la sesión y el perfil simultáneamente.
     */
    const [sessionRes, profileRes] = await Promise.all([
      supabase.auth.getSession(),
      supabase.from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle() // maybeSingle evita que la consulta tire Error 500 si el perfil aún no existe
    ]);

    initialSession = sessionRes.data.session;
    initialProfile = profileRes.data;

    // [EXTRACCIÓN DE AUTORIDAD]: Leemos el rol desde el JWT para inyectarlo en el HTML
    const appMetadata = user.app_metadata || {};
    userRole = appMetadata.user_role || appMetadata.role || (initialProfile?.role) || 'user';
  }

  // Determinamos el estado binario para el CSS Shield
  const authState = user ? "authenticated" : "unauthenticated";

  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={inter.variable}
      // [SHIELD TÁCTICO]: Estos atributos permiten que globals.css oculte 
      // elementos de UI que no corresponden al rol ANTES de que React cargue.
      data-auth-state={authState}
      data-user-role={userRole}
    >
      <head>
        {/* 
            SCRIPT ANTI-PESTAÑEO (Lumen-Shield & Identity-Lock):
            Inyecta el tema visual (Dark) síncronamente. Además, puede usar los 
            atributos data-* para prevenir destellos blancos en el primer renderizado.
        */}
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
                  
                  // Forzamos visibilidad inicial para evitar la pantalla blanca de React
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
        className={`${inter.className} font-sans min-h-screen antialiased selection:bg-primary/30 bg-background text-foreground`}
        suppressHydrationWarning
      >
        {/* CAPA 1: Telemetría Operativa */}
        <CSPostHogProvider>

          {/* CAPA 2: Orquestador PWA (Registro Diferido) */}
          <PwaLifecycle />

          {/* CAPA 3: Red de Seguridad */}
          <ErrorBoundary>

            {/* CAPA 4: Motor Atmosférico Aurora */}
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange={true}
              storageKey="theme"
            >

              {/* 
                  CAPA 5: EL HANDSHAKE T0 (AuthProvider)
                  Entregamos la sesión y el perfil al cliente. Como ya vienen 
                  del SSR, el hook no disparará 'isInitialLoading', aniquilando 
                  el parpadeo del Dashboard.
              */}
              <AuthProvider
                initialSession={initialSession}
                initialProfile={initialProfile}
              >

                {/* --- ESCENARIO VISUAL NICEPOD V2.9 --- */}
                <div className="min-h-screen relative overflow-x-hidden">

                  {/* CAPA ALFA: Fondo Dinámico GPU-driven */}
                  <BackgroundEngine />

                  {/* 
                      CAPA BETA: El Chasis de Contenido (Z-10) 
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
 * NOTA TÉCNICA DEL ARCHITECT (V30.1):
 * 1. Resiliencia SSR: Al cambiar '.single()' por '.maybeSingle()' en la consulta 
 *    del perfil (Línea 90), garantizamos que si el Trigger de Auth de Supabase 
 *    está demorado al crear un nuevo usuario, el Root Layout no lance un Error 500, 
 *    permitiendo que el AuthProvider maneje el estado de carga ('PGRST116').
 * 2. Inyección de Atributos de Soberanía: Al colocar 'data-user-role' en la etiqueta 
 *    html, abrimos la puerta para que en 'globals.css' podamos definir reglas como:
 *    [data-user-role="user"] .admin-only { display: none !important; }.
 *    Esto erradica el parpadeo de botones que aparecen y desaparecen por milisegundos.
 * 3. Consistencia JWT: La lectura del rol prioriza el JWT ('app_metadata') sobre la DB,
 *    alineándose al 100% con la nueva política de 'middleware.ts'.
 */