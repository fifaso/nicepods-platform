// app/layout.tsx
// VERSIÓN: 17.1 (NicePod Architecture Standard - Total Integrity Edition)
// Misión: Orquestar el núcleo global de la plataforma, blindar el acceso y estabilizar el sistema visual Aurora.

import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import type React from "react";

// --- CAPA DE ESTILOS GLOBALES ---
// Importamos globals primero para establecer las variables CSS base
import "./globals.css";

// [FIX]: Elevamos Mapbox CSS a la raíz absoluta del proyecto.
// Esto garantiza que el motor WebGL encuentre sus definiciones de clase antes de inicializar el mapa 3D.
import "mapbox-gl/dist/mapbox-gl.css";

// --- INFRAESTRUCTURA DE COMPONENTES ---
import { ErrorBoundary } from "@/components/error-boundary";
import { CSPostHogProvider } from '@/components/providers/posthog-provider';
import { PwaLifecycle } from "@/components/pwa-lifecycle";
import { ServiceWorkerRegister } from '@/components/sw-register';
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/hooks/use-auth";
import { createClient } from '@/lib/supabase/server';

/**
 * CONFIGURACIÓN DE FUENTE INTER: Estándar de legibilidad de NicePod.
 * Utilizamos display: "swap" para evitar el bloqueo del renderizado por fuentes.
 */
const inter = Inter({
  subsets: ["latin"],
  preload: false,
  display: "swap"
});

/**
 * VIEWPORT: Configuración de hardware para dispositivos táctiles.
 * Optimizamos el zoom para evitar que el navegador redimensione la App al enfocar inputs.
 */
export const viewport: Viewport = {
  themeColor: "#111827", // Color de la barra de sistema (Nebulosa)
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

/**
 * METADATA: Definición de la identidad digital (Next.js 14 API).
 * [FIX]: Se actualiza appleWebApp para eliminar la advertencia de depreciación en Safari.
 */
export const metadata: Metadata = {
  title: "NicePod | Witness, Not Diarist",
  description: "Plataforma de inteligencia personal y memoria urbana. Crea micro-podcasts anclados al mundo real.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true, // Sustituye al tag 'apple-mobile-web-app-capable'
    statusBarStyle: "black-translucent",
    title: "NicePod"
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: "/nicepod-logo.png",
    apple: "/nicepod-logo.png",
  },
};

/**
 * RootLayout: El gran orquestador de NicePod V2.5.
 */
export default async function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  // 1. INICIALIZACIÓN DEL CLIENTE EN SERVIDOR
  // createClient() gestiona automáticamente las cookies de sesión.
  const supabase = createClient();

  // 2. PROTOCOLO DE IDENTIDAD SEGURA (Handshake)
  // Obtenemos los datos de sesión directamente en el servidor.
  // Esto es vital para pasar el estado a los Client Components sin parpadeos de Login.
  const { data: { user } } = await supabase.auth.getUser();
  const { data: { session } } = await supabase.auth.getSession();

  // Si el usuario existe pero la sesión es inválida, forzamos un estado nulo
  // para proteger la integridad de los datos en el AuthProvider.
  const validatedSession = user ? session : null;

  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* BLOQUEO DE FLICKER (Inyección Crítica)
            Este script se ejecuta antes de que React tome el control del DOM.
            Asegura que el modo oscuro esté activo según la preferencia del usuario,
            evitando el parpadeo blanco que degrada la experiencia premium.
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
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.className} min-h-screen bg-background font-sans antialiased`}>

        {/* CAPA 1: Telemetría y Monitoreo */}
        <CSPostHogProvider>

          {/* CAPA 2: Ciclo de Vida PWA */}
          <ServiceWorkerRegister />
          <PwaLifecycle />

          {/* CAPA 3: Gestión de Errores Críticos */}
          <ErrorBoundary>

            {/* CAPA 4: Motor de Temas Aurora */}
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange={false}
              storageKey="theme"
            >

              {/* CAPA 5: Identidad y Soberanía del Usuario
                  Inyectamos la sesión del servidor ( Fran ) para sincronía inmediata.
              */}
              <AuthProvider session={validatedSession}>

                {/* --- UNIVERSO VISUAL NICEPOD --- */}
                <div className="min-h-screen gradient-mesh relative overflow-x-hidden">

                  {/* BLOBS ATMOSFÉRICOS GLOBALES
                      Capa estética con z-index 0. No bloquea la interactividad (pointer-events-none).
                  */}
                  <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-40 dark:opacity-80">
                    <div className="absolute top-10 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-[120px] animate-float"></div>
                    <div className="absolute top-1/2 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[150px] animate-float" style={{ animationDelay: "2s" }}></div>
                    <div className="absolute -bottom-20 left-10 w-80 h-80 bg-pink-500/10 rounded-full blur-[130px] animate-float" style={{ animationDelay: "4s" }}></div>
                  </div>

                  {/* LIENZO OPERATIVO (Z-index superior para interacción) */}
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