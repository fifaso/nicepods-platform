// app/layout.tsx
// VERSIÓN: 18.0 (NicePod Core Identity - Zero-Error Hydration Standard)
// Misión: Orquestar el núcleo global, blindar metadatos PWA y sincronizar identidad sin logs de advertencia.
// [ESTABILIDAD]: Resolución definitiva de errores React #418/#422 y depreciación de Apple Metadata.

import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import type React from "react";

/**
 * --- CAPA DE ESTILOS CRÍTICOS ---
 * Importamos los estilos globales y el CSS de Mapbox en la raíz absoluta.
 * Esto garantiza que el motor WebGL encuentre sus definiciones antes de la carga de JS.
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
 * Utilizamos preload: false para maximizar la compatibilidad con el Service Worker de la PWA.
 */
const inter = Inter({
  subsets: ["latin"],
  preload: false,
  display: "swap"
});

/**
 * VIEWPORT: Configuración moderna de visualización.
 * 'viewportFit: cover' es vital para dispositivos con notch (iPhone/Android High-end).
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
 * METADATA: Definición de la Identidad Digital (Next.js Metadata API)
 * [FIX]: Se elimina el tag manual 'apple-mobile-web-app-capable' y se delega en 'appleWebApp'.
 * Esto resuelve la advertencia de depreciación en la consola de Vercel y Safari.
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
 * RootLayout: El gran orquestador de NicePod V2.5.
 */
export default async function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  // 1. INICIALIZACIÓN DE SESIÓN EN SERVIDOR
  // createClient recupera las cookies de sesión de forma segura en el borde.
  const supabase = createClient();

  /**
   * 2. PROTOCOLO DE HANDSHAKE DE IDENTIDAD
   * Obtenemos la sesión y el perfil en el servidor para inyectarlos al AuthProvider.
   * Esto elimina el pestañeo del Header y el error de "Fran" (sesión fantasma).
   */
  const { data: { user } } = await supabase.auth.getUser();
  const { data: { session } } = await supabase.auth.getSession();

  // Validamos la sesión solo si el usuario es verídico
  const validatedSession = user ? session : null;

  return (
    /**
     * [FIX]: suppressHydrationWarning en <html>
     * Necesario para el funcionamiento de next-themes (ThemeProvider).
     */
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* 
            SCRIPT ANTI-PESTAÑEO DE TEMA (Inyección Síncrona):
            Detecta la preferencia del usuario antes de que React se inicialice.
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
      {/* 
          [FIX]: suppressHydrationWarning en <body>
          React #418 y #422 ocurren porque el script superior inyecta clases en el body.
          Esta propiedad le indica a React que la discrepancia inicial es esperada y segura.
      */}
      <body
        className={`${inter.className} min-h-screen bg-background font-sans antialiased selection:bg-primary/30`}
        suppressHydrationWarning
      >
        {/* CAPA 1: Telemetría Global */}
        <CSPostHogProvider>

          {/* CAPA 2: Ciclo de Vida PWA y Soporte Offline */}
          <ServiceWorkerRegister />
          <PwaLifecycle />

          {/* CAPA 3: Gestión de Errores de Renderizado */}
          <ErrorBoundary>

            {/* CAPA 4: Motor de Temas Aurora */}
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange={false}
              storageKey="theme"
            >

              {/* CAPA 5: Soberanía de Identidad
                  Inyectamos la sesión del servidor al cliente para sincronía instantánea.
              */}
              <AuthProvider session={validatedSession}>

                {/* --- UNIVERSO VISUAL NICEPOD V2.5 --- */}
                <div className="min-h-screen gradient-mesh relative overflow-x-hidden">

                  {/* IDENTIDAD VISUAL AURORA: Blobs atmosféricos cinematográficos.
                      Z-index: 0 para asegurar que no bloqueen la interactividad de la UI.
                  */}
                  <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-40 dark:opacity-80">
                    <div className="absolute top-10 left-10 w-80 h-80 bg-purple-500/10 rounded-full blur-[120px] animate-float"></div>
                    <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[160px] animate-float" style={{ animationDelay: "2s" }}></div>
                    <div className="absolute -bottom-20 left-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-[140px] animate-float" style={{ animationDelay: "4s" }}></div>
                  </div>

                  {/* LIENZO DE CONTENIDO (Z-index: 10 para asegurar clics) */}
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