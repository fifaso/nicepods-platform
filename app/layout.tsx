// app/layout.tsx
// VERSIÓN: 17.3 (NicePod Core Architecture Standard - Total Sync Edition)
// Misión: Orquestar el núcleo global de la plataforma, blindar la identidad visual y sincronizar la sesión servidor-cliente.
// [ESTABILIDAD]: Resolución definitiva de Errores React #418/#422 y advertencias de metadatos PWA.

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
 * [MEJORA]: Hemos simplificado la definición de appleWebApp para que Next.js
 * utilice los estándares modernos, evitando los tags depreciados que ensucian la consola.
 */
export const metadata: Metadata = {
  title: "NicePod | Witness, Not Diarist",
  description: "Terminal de inteligencia personal y memoria urbana colectiva. Crea y descubre crónicas sonoras de alto valor.",
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
 */
export default async function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  // 1. INICIALIZACIÓN DEL CLIENTE EN SERVIDOR
  const supabase = createClient();

  /**
   * 2. PROTOCOLO DE SINCRONÍA DE IDENTIDAD (Handshake)
   * Recuperamos la sesión y el usuario directamente en el servidor para evitar 
   * el parpadeo de "Ingresar" en el Header.
   */
  const { data: { user } } = await supabase.auth.getUser();
  const { data: { session } } = await supabase.auth.getSession();

  const validatedSession = user ? session : null;

  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* 
            SCRIPT ANTI-FLICKER (Theme Integrity Injection):
            Este bloque inyecta la clase de tema antes de la hidratación de React.
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
          [FIX]: Añadimos suppressHydrationWarning al body para silenciar los errores
          418 y 422 provocados por la inyección de clases del script superior.
      */}
      <body
        className={`${inter.className} min-h-screen bg-background font-sans antialiased selection:bg-primary/30`}
        suppressHydrationWarning
      >

        <CSPostHogProvider>
          <ServiceWorkerRegister />
          <PwaLifecycle />

          <ErrorBoundary>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange={false}
              storageKey="theme"
            >
              <AuthProvider session={validatedSession}>

                {/* --- UNIVERSO VISUAL NICEPOD V2.5 --- */}
                <div className="min-h-screen gradient-mesh relative overflow-x-hidden">

                  {/* IDENTIDAD VISUAL AURORA: Blobs de fondo cinematográficos. */}
                  <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-40 dark:opacity-80">
                    <div className="absolute top-10 left-10 w-80 h-80 bg-purple-500/10 rounded-full blur-[120px] animate-float"></div>
                    <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[160px] animate-float" style={{ animationDelay: "2s" }}></div>
                    <div className="absolute -bottom-20 left-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-[140px] animate-float" style={{ animationDelay: "4s" }}></div>
                  </div>

                  {/* LIENZO DE CONTENIDO */}
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