// app/layout.tsx
// VERSIÓN: 27.0 (NicePod Architecture Core - Sovereign Purge Edition)
// Misión: Orquestar el chasis global, la identidad SSR y el saneamiento de red.
// [ESTABILIZACIÓN]: Inyección de protocolo de limpieza de Service Worker residual.

import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import type React from "react";

// --- CAPA 0: CIMIENTOS VISUALES ---
import "mapbox-gl/dist/mapbox-gl.css";
import "./globals.css";

// Infraestructura de Servicios de Grado Industrial
import { ErrorBoundary } from "@/components/error-boundary";
import { CSPostHogProvider } from '@/components/providers/posthog-provider';
import { PwaLifecycle } from "@/components/pwa-lifecycle";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/hooks/use-auth";
import { createClient } from '@/lib/supabase/server';
import { Tables } from "@/types/database.types";

// Motor de Atmósfera Aurora
import { BackgroundEngine } from "@/components/visuals/background-engine";

/**
 * FUENTE: Inter
 * Optimizada mediante CSS Variables para escalabilidad en el Design System.
 */
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

/**
 * VIEWPORT API: Configuración de hardware de visualización.
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
 * METADATA API: Identidad Corporativa Sincronizada con PWA Manifest.
 */
export const metadata: Metadata = {
  title: {
    default: "NicePod | Witness, Not Diarist",
    template: "%s | NicePod Intelligence"
  },
  description: "Workstation de inteligencia industrial y memoria urbana. Forja sabiduría en audio.",
  manifest: "/manifest.json",
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
 */
export default async function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  /**
   * 1. PROTOCOLO DE IDENTIDAD ATÓMICA (SSR T0)
   * Capturamos la verdad en el servidor antes del primer renderizado de cliente.
   */
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let initialSession = null;
  let initialProfile: Tables<'profiles'> | null = null;

  if (user) {
    // Cosecha paralela para optimizar el TTFB (Time To First Byte).
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
            Bloquea el renderizado hasta que el tema (dark/light) es resuelto.
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
        className={`${inter.className} font-sans min-h-screen antialiased selection:bg-primary/30`}
        suppressHydrationWarning
      >
        <CSPostHogProvider>
          <PwaLifecycle />
          <ErrorBoundary>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange={true}
              storageKey="theme"
            >
              <AuthProvider
                initialSession={initialSession}
                initialProfile={initialProfile}
              >
                {/* ESCENARIO VISUAL NICEPOD V2.5 */}
                <div className="min-h-screen relative overflow-x-hidden">
                  <BackgroundEngine />
                  <div className="relative z-10 flex flex-col min-h-screen bg-transparent">
                    {children}
                  </div>
                </div>
              </AuthProvider>
            </ThemeProvider>
          </ErrorBoundary>
        </CSPostHogProvider>

        {/* 
            [PROTOCOLO DE PURGA DE EMERGENCIA]
            Este bloque desinstala cualquier Service Worker residual que esté bloqueando 
            los WebSockets o corrompiendo la caché de imágenes. 
            Misión: Restaurar la Soberanía de Red en el cliente.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(function(registrations) {
                  for(let registration of registrations) {
                    registration.unregister();
                    console.log('🛡️ NicePod: Service Worker purgado para sincronía V2.5');
                  }
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Escalabilidad de Tipografía: Se inyectó 'inter.variable' en <html> y 'font-sans' en <body>. 
 *    Esto permite que Tailwind reconozca la fuente 'Inter' como la predeterminada del sistema.
 * 2. Resolución de Errores de Red: El script de purga al final del body es la solución 
 *    quirúrgica para los errores 'WebSocket is closed' provocados por interceptores PWA obsoletos.
 * 3. Rendimiento SSR: El fetching de perfil mediante 'maybeSingle' protege al servidor 
 *    de lanzar excepciones catastróficas durante la fase de registro de nuevos usuarios.
 */