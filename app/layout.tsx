// app/layout.tsx
// VERSIÓN: 17.0 (Core Architecture Master - Mapbox CSS Fix & Auth Sync)
// Misión: Proveer el ecosistema global de NicePod, blindar la identidad visual y sincronizar la sesión.

import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import type React from "react";

// --- ESTILOS GLOBALES ---
import "./globals.css";
// [FIX CRÍTICO]: Importamos el CSS de Mapbox en el Root para eliminar la advertencia de declaraciones faltantes.
import "mapbox-gl/dist/mapbox-gl.css";

// --- COMPONENTES DE INFRAESTRUCTURA ---
import { ErrorBoundary } from "@/components/error-boundary";
import { CSPostHogProvider } from '@/components/providers/posthog-provider';
import { PwaLifecycle } from "@/components/pwa-lifecycle";
import { ServiceWorkerRegister } from '@/components/sw-register';
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/hooks/use-auth";
import { createClient } from '@/lib/supabase/server';

/**
 * CONFIGURACIÓN DE TIPOGRAFÍA
 * Usamos swap para asegurar que el texto sea legible mientras carga la fuente.
 */
const inter = Inter({
  subsets: ["latin"],
  preload: false,
  display: "swap"
});

/**
 * VIEWPORT: Configuración de escalado para dispositivos móviles.
 */
export const viewport: Viewport = {
  themeColor: "#111827",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

/**
 * METADATA: Definición de la identidad SEO y PWA de NicePod.
 */
export const metadata: Metadata = {
  title: "NicePod | Witness, Not Diarist",
  description: "Plataforma de inteligencia urbana y creación de micro-podcasts narrativos.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "NicePod"
  },
  icons: {
    icon: "/nicepod-logo.png",
    apple: "/nicepod-logo.png"
  },
};

/**
 * ROOT LAYOUT: El orquestador supremo del sistema.
 */
export default async function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  // 1. Inicialización del cliente Supabase en el Servidor
  const supabase = createClient();

  // 2. Recuperación de Sesión (Validación de Identidad de Nivel de Red)
  // Obtenemos tanto el user como la session para asegurar que el AuthProvider
  // tenga la información completa antes de que el navegador procese el JS.
  const { data: { user } } = await supabase.auth.getUser();
  const { data: { session } } = await supabase.auth.getSession();

  // Si no hay usuario válido, forzamos sesión nula para evitar ruidos de hidratación.
  const validatedSession = user ? session : null;

  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* SCRIPT ANTI-FLICKER: Ejecutado antes del renderizado para evitar destellos de tema blanco */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  var supportDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (theme === 'dark' || (!theme && supportDark)) {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.className} min-h-screen bg-background font-sans antialiased selection:bg-primary/30`}>
        <CSPostHogProvider>
          {/* Registro de Capas Técnicas (PWA & Service Workers) */}
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
              {/* [PIEZA CLAVE]: Inyectamos la sesión validada desde el servidor al cliente */}
              <AuthProvider session={validatedSession}>

                {/* IDENTIDAD VISUAL AURORA (Global Layer) */}
                <div className="min-h-screen gradient-mesh relative overflow-x-hidden">

                  {/* Blobs Atmosféricos: Capa de profundidad estética con Z-index cero */}
                  <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-40 dark:opacity-100">
                    <div className="absolute top-20 left-10 w-32 h-32 bg-purple-500/10 rounded-full blur-[100px] animate-float"></div>
                    <div className="absolute top-1/2 right-10 w-48 h-48 bg-blue-500/10 rounded-full blur-[120px] animate-float" style={{ animationDelay: "2s" }}></div>
                    <div className="absolute -bottom-10 left-1/3 w-40 h-40 bg-pink-500/10 rounded-full blur-[100px] animate-float" style={{ animationDelay: "4s" }}></div>
                  </div>

                  {/* LIENZO DE LA PLATAFORMA (Z-index 10) */}
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