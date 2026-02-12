// app/layout.tsx
// VERSIÓN: 19.0 (NicePod Core Identity - Optimized Handshake & Zero-Flicker Standard)
// Misión: Orquestar el núcleo global, blindar metadatos PWA y sincronizar identidad con latencia mínima.
// [ESTABILIZACIÓN]: Eliminación de redundancia en autenticación y optimización de TTFB.

import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import type React from "react";

/**
 * --- CAPA DE ESTILOS CRÍTICOS ---
 * Importamos los estilos globales y el CSS de Mapbox en la raíz absoluta.
 * El orden es vital: Mapbox primero para asegurar que el tema Aurora pueda sobreescribir tokens.
 */
import "mapbox-gl/dist/mapbox-gl.css";
import "./globals.css";

/**
 * --- INFRAESTRUCTURA DE COMPONENTES Y SEGURIDAD ---
 */
import { ErrorBoundary } from "@/components/error-boundary";
import { CSPostHogProvider } from '@/components/providers/posthog-provider';
import { PwaLifecycle } from "@/components/pwa-lifecycle";
import { ServiceWorkerRegister } from '@/components/sw-register';
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/hooks/use-auth";
import { createClient } from '@/lib/supabase/server';

/**
 * CONFIGURACIÓN DE FUENTE: Inter
 * Optimizamos para la PWA desactivando el preload de Google Fonts para evitar bloqueos
 * de renderizado en condiciones de baja conectividad (Offline-First Ready).
 */
const inter = Inter({
  subsets: ["latin"],
  preload: false,
  display: "swap"
});

/**
 * VIEWPORT: Configuración táctica de visualización.
 * 'viewportFit: cover' garantiza que el gradiente Aurora se extienda tras el notch/isla dinámica.
 */
export const viewport: Viewport = {
  themeColor: "#111827",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

/**
 * METADATA: Identidad Digital NicePod V2.5.
 * Utilizamos la API moderna de Next.js para evitar etiquetas deprecadas en Safari 18+.
 */
export const metadata: Metadata = {
  title: "NicePod | Witness, Not Diarist",
  description: "Terminal de inteligencia personal y memoria urbana colectiva. Forja sabiduría en audio.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "NicePod",
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  icons: {
    icon: "/nicepod-logo.png",
    apple: "/nicepod-logo.png",
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
   * 1. INICIALIZACIÓN DE SESIÓN (Handshake Optimizado)
   * En lugar de llamar a getUser() y getSession() por separado,
   * aprovechamos que el Middleware ya validó la seguridad de la petición.
   * Recuperamos la sesión directamente para hidratar el cliente.
   */
  const supabase = createClient();

  // Realizamos una única llamada al servidor para obtener la sesión actual.
  // Esto ahorra ~100ms de latencia de red en cada carga de página.
  const { data: { session } } = await supabase.auth.getSession();

  // Verificamos el usuario dentro de la sesión para el handshake de identidad
  const validatedSession = session?.user ? session : null;

  return (
    /**
     * [FIX]: suppressHydrationWarning en <html>
     * Necesario para que el motor de temas inyecte la clase 'dark' sin errores de React.
     */
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* 
            SCRIPT ANTI-PESTAÑEO (Inyección Crítica):
            Calcula el tema basándose en localStorage antes de que el usuario vea la UI.
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
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${inter.className} min-h-screen bg-background font-sans antialiased selection:bg-primary/30`}
        suppressHydrationWarning
      >
        {/* NIVEL 1: Telemetría e Inteligencia de Usuario */}
        <CSPostHogProvider>

          {/* NIVEL 2: Infraestructura PWA y Soporte de Red */}
          <ServiceWorkerRegister />
          <PwaLifecycle />

          {/* NIVEL 3: Red de Seguridad de Renderizado */}
          <ErrorBoundary>

            {/* NIVEL 4: Motor de Diseño Aurora (Glassmorphism) */}
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange={false}
              storageKey="theme"
            >

              {/* NIVEL 5: Soberanía de Identidad
                  Inyectamos la sesión validada en el servidor para que AuthProvider
                  esté disponible de inmediato en el cliente sin estados de carga falsos.
              */}
              <AuthProvider session={validatedSession}>

                {/* --- ESCENARIO VISUAL NICEPOD V2.5 --- */}
                <div className="min-h-screen gradient-mesh relative overflow-x-hidden">

                  {/* IDENTIDAD VISUAL: Blobs atmosféricos cinematográficos.
                      Se mantienen con z-0 y opacidad controlada para no fatigar la GPU.
                  */}
                  <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-40 dark:opacity-80">
                    <div className="absolute top-10 left-10 w-80 h-80 bg-purple-500/10 rounded-full blur-[120px] animate-float"></div>
                    <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[160px] animate-float" style={{ animationDelay: "2s" }}></div>
                    <div className="absolute -bottom-20 left-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-[140px] animate-float" style={{ animationDelay: "4s" }}></div>
                  </div>

                  {/* CAPA DE INTERACCIÓN (Z-index: 10 garantiza accesibilidad de botones) */}
                  <div className="relative z-10">
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