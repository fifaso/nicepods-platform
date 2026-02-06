// app/layout.tsx
// VERSIÓN: 17.2 (NicePod Core Identity - Total Integrity Edition)
// Misión: Orquestador global del sistema, blindaje PWA y sincronización de identidad server-to-client.

import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import type React from "react";

/**
 * --- CAPA DE ESTILOS CRÍTICOS ---
 */
import "./globals.css";

/**
 * [FIX]: Inyección prioritaria de Mapbox CSS.
 * Al estar en el Root Layout, garantizamos que el motor WebGL del Mapa 3D 
 * tenga sus definiciones de clase listas antes de inicializar la GPU.
 */
import "mapbox-gl/dist/mapbox-gl.css";

/**
 * --- INFRAESTRUCTURA DE COMPONENTES ---
 */
import { ErrorBoundary } from "@/components/error-boundary";
import { CSPostHogProvider } from '@/components/providers/posthog-provider';
import { PwaLifecycle } from "@/components/pwa-lifecycle";
import { ServiceWorkerRegister } from '@/components/sw-register';
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/hooks/use-auth";
import { createClient } from '@/lib/supabase/server';

/**
 * CONFIGURACIÓN DE TIPOGRAFÍA: Inter
 * Optimizamos con preload: false para evitar conflictos con el Service Worker en PWA.
 */
const inter = Inter({
  subsets: ["latin"],
  preload: false,
  display: "swap"
});

/**
 * VIEWPORT: Configuración de hardware y barra de estado.
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
 * METADATA: Identidad PWA y SEO (Next.js 14 API).
 * [FIX]: Se utiliza 'appleWebApp' para sustituir el tag 'apple-mobile-web-app-capable'
 * que estaba dando errores de depreciación en la consola de Vercel/Safari.
 */
export const metadata: Metadata = {
  title: "NicePod | Witness, Not Diarist",
  description: "Plataforma de inteligencia personal y memoria urbana. Crea micro-podcasts anclados al mundo real.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "NicePod"
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
 * Al ser un Server Component, realiza el "Handshake" de identidad antes de enviar el HTML.
 */
export default async function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  // 1. Inicialización del cliente Supabase en el Servidor (Next.js context)
  const supabase = createClient();

  /**
   * 2. PROTOCOLO DE SINCRONIZACIÓN DE IDENTIDAD
   * Obtenemos la sesión directamente en el servidor. Esto es lo que soluciona
   * que el Header no muestre "Ingresar" erróneamente cuando el usuario ya está logueado.
   */
  const { data: { user } } = await supabase.auth.getUser();
  const { data: { session } } = await supabase.auth.getSession();

  // Validamos que el usuario del token coincida con la sesión activa
  const validatedSession = user ? session : null;

  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* 
            SCRIPT ANTI-PESTAÑEO (Critical Theme Injection):
            Este bloque se ejecuta antes que React. Lee la preferencia de tema 
            del localStorage y aplica la clase 'dark' instantáneamente para 
            evitar el destello blanco al cargar la plataforma.
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
      <body className={`${inter.className} min-h-screen bg-background font-sans antialiased selection:bg-primary/30`}>

        {/* CAPA DE TELEMETRÍA: PostHog para seguimiento de eventos de IA */}
        <CSPostHogProvider>

          {/* CICLO DE VIDA PWA: Registro de SW y gestión de estados offline */}
          <ServiceWorkerRegister />
          <PwaLifecycle />

          {/* ESCUDO DE ERRORES: Captura fallos de renderizado en el cliente */}
          <ErrorBoundary>

            {/* MOTOR DE TEMAS: Shadcn/UI compatible con Aurora System */}
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange={false}
              storageKey="theme"
            >

              {/* PROVIDER DE IDENTIDAD: Inyectamos la sesión del servidor al cliente */}
              <AuthProvider session={validatedSession}>

                {/* --- CONTENEDOR MAESTRO DE LA EXPERIENCIA --- */}
                <div className="min-h-screen gradient-mesh relative overflow-x-hidden">

                  {/* IDENTIDAD VISUAL AURORA: Blobs atmosféricos de fondo (Z-index: 0) */}
                  <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-40 dark:opacity-75">
                    <div className="absolute top-10 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-[120px] animate-float"></div>
                    <div className="absolute top-1/3 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[150px] animate-float" style={{ animationDelay: "2s" }}></div>
                    <div className="absolute -bottom-20 left-1/4 w-80 h-80 bg-pink-500/10 rounded-full blur-[130px] animate-float" style={{ animationDelay: "4s" }}></div>
                  </div>

                  {/* LIENZO DE CONTENIDO (Z-index: 10)
                      Aquí es donde Next.js inyectará el (marketing) layout o el (platform) layout.
                  */}
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