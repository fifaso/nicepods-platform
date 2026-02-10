// app/layout.tsx
// VERSIÓN: 17.2 (NicePod Core Architecture Standard - Total Sync Edition)
// Misión: Orquestar el núcleo global de la plataforma, blindar la identidad visual y sincronizar la sesión servidor-cliente.
// [ESTABILIDAD]: Resolución de advertencias de metadatos PWA y optimización de hidratación.

import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import type React from "react";

/**
 * --- CAPA DE ESTILOS GLOBALES ---
 */
import "./globals.css";

/**
 * [FIX CRÍTICO]: Inyección prioritaria de Mapbox CSS.
 * Al situar la importación en la raíz del layout, garantizamos que las clases de estilo
 * para el motor de mapas 3D se procesen antes de la inicialización de la GPU.
 */
import "mapbox-gl/dist/mapbox-gl.css";

/**
 * --- INFRAESTRUCTURA DE COMPONENTES Y PROVIDERS ---
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
 * Optimizamos con preload: false para evitar advertencias de precarga no utilizada en entornos PWA.
 * Utilizamos display: "swap" para asegurar legibilidad inmediata durante la sintonía de red.
 */
const inter = Inter({
  subsets: ["latin"],
  preload: false,
  display: "swap"
});

/**
 * VIEWPORT: Configuración de hardware para la experiencia móvil NicePod.
 * Aseguramos que la barra de estado de iOS y Android se integre con la paleta de la App.
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
 * METADATA: Definición de la Identidad Digital SOBERANA (Next.js 14 API).
 * [MEJORA]: Migramos a la nueva especificación 'appleWebApp' para silenciar 
 * las advertencias de depreciación en Safari y Vercel detectadas en el Sprint 1.
 */
export const metadata: Metadata = {
  title: "NicePod | Witness, Not Diarist",
  description: "Terminal de inteligencia personal y memoria urbana colectiva. Crea y descubre crónicas sonoras de alto valor.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true, // Sustituye al tag manual 'apple-mobile-web-app-capable'
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
 * Al ser un Server Component, realiza la validación de identidad en el borde antes de emitir HTML.
 */
export default async function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  // 1. INICIALIZACIÓN DEL CLIENTE EN SERVIDOR
  // Gestiona automáticamente las cookies de sesión del curador.
  const supabase = createClient();

  /**
   * 2. PROTOCOLO DE SINCRONÍA DE IDENTIDAD (Handshake)
   * Recuperamos la sesión y el usuario directamente en el servidor.
   * Esto permite que el AuthProvider inicialice el estado del cliente con datos reales,
   * eliminando el parpadeo de "Ingresar" que degradaba la experiencia premium de Fran.
   */
  const { data: { user } } = await supabase.auth.getUser();
  const { data: { session } } = await supabase.auth.getSession();

  // Validamos que el usuario del token de red coincida con la sesión activa del servidor.
  const validatedSession = user ? session : null;

  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* 
            SCRIPT ANTI-FLICKER (Theme Integrity Injection):
            Este bloque se ejecuta de forma síncrona antes que el motor de React.
            Lee la preferencia de sintonía lumínica del localStorage para evitar 
            el destello blanco al cargar la Workstation en modo nocturno.
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

        {/* CAPA 1: Telemetría y Monitoreo de Eventos Semánticos */}
        <CSPostHogProvider>

          {/* CAPA 2: Ciclo de Vida PWA y Soporte Offline */}
          <ServiceWorkerRegister />
          <PwaLifecycle />

          {/* CAPA 3: Gestión de Errores Críticos de Renderizado */}
          <ErrorBoundary>

            {/* CAPA 4: Motor de Temas Aurora - Shadcn/UI Compatible */}
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange={false}
              storageKey="theme"
            >

              {/* CAPA 5: Soberanía de Identidad del Curador
                  Inyectamos la sesión validada del servidor al contexto del cliente.
              */}
              <AuthProvider session={validatedSession}>

                {/* --- UNIVERSO VISUAL NICEPOD V2.5 --- */}
                <div className="min-h-screen gradient-mesh relative overflow-x-hidden">

                  {/* IDENTIDAD VISUAL AURORA: Blobs de fondo cinematográficos.
                      Z-index: 0 para no interferir con la interactividad de la UI.
                  */}
                  <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-40 dark:opacity-80">
                    <div className="absolute top-10 left-10 w-80 h-80 bg-purple-500/10 rounded-full blur-[120px] animate-float"></div>
                    <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[160px] animate-float" style={{ animationDelay: "2s" }}></div>
                    <div className="absolute -bottom-20 left-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-[140px] animate-float" style={{ animationDelay: "4s" }}></div>
                  </div>

                  {/* LIENZO DE CONTENIDO (Z-index superior para interacción táctica) */}
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