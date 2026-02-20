// app/layout.tsx
// VERSIÓN: 20.3 (NicePod Core Identity - Clean Console & Atomic Sync Edition)
// Misión: Orquestar el núcleo global eliminando advertencias de consola y pestañeos de hidratación.
// [RESOLUCIÓN]: Purga de metadatos duplicados (Apple Deprecation) y optimización de cadena de proveedores.

import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import type React from "react";

/**
 * --- CAPA 0: CIMIENTOS VISUALES ---
 * Importamos los estilos de Mapbox y los globales en la raíz.
 * El CSS de Mapbox es crítico para evitar el 'Layout Shift' del motor geográfico.
 */
import "mapbox-gl/dist/mapbox-gl.css";
import "./globals.css";

/**
 * --- INFRAESTRUCTURA DE COMPONENTES ---
 */
import { ErrorBoundary } from "@/components/error-boundary";
import { CSPostHogProvider } from '@/components/providers/posthog-provider';
import { PwaLifecycle } from "@/components/pwa-lifecycle";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/hooks/use-auth";
import { createClient } from '@/lib/supabase/server';
import { Tables } from "@/types/database.types";

/**
 * FUENTE PRINCIPAL: Inter
 * 'display: swap' asegura que el texto sea visible mientras se carga la fuente,
 * cumpliendo con el protocolo de accesibilidad de NicePod.
 */
const inter = Inter({
  subsets: ["latin"],
  display: "swap"
});

/**
 * VIEWPORT API: Configuración nativa de visualización.
 * [RESOLUCIÓN]: Sustituimos el tag manual de Apple por la API de Next.js para limpiar la consola.
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
 * METADATA API: Identidad Soberana Digital.
 * [FIX]: Se ha removido cualquier meta tag manual del <head> a favor de este objeto.
 * 'appleWebApp' reemplaza de forma segura a 'apple-mobile-web-app-capable'.
 */
export const metadata: Metadata = {
  title: "NicePod | Witness, Not Diarist",
  description: "Workstation de inteligencia personal y memoria urbana. Forja sabiduría en audio.",
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
 * RootLayout: El Gran Orquestador Síncrono de NicePod V2.5.
 */
export default async function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  /**
   * 1. PROTOCOLO DE IDENTIDAD ATÓMICA (SSR)
   * Recuperamos la identidad completa en el servidor (T0).
   * Esto garantiza que el cliente nazca con la sesión y el perfil hidratados.
   */
  const supabase = createClient();

  // Realizamos el handshake de seguridad en el servidor
  const { data: { user } } = await supabase.auth.getUser();

  let initialSession = null;
  let initialProfile: Tables<'profiles'> | null = null;

  if (user) {
    // Si el usuario existe, recuperamos sesión y perfil en paralelo para optimizar TTFB
    const [sessionRes, profileRes] = await Promise.all([
      supabase.auth.getSession(),
      supabase.from('profiles').select('*').eq('id', user.id).single()
    ]);

    initialSession = sessionRes.data.session;
    initialProfile = profileRes.data;
  }

  return (
    /**
     * suppressHydrationWarning: Necesario para que ThemeProvider pueda inyectar 
     * clases en el <html> basándose en localStorage sin alertas de React.
     */
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* 
            SCRIPT ANTI-PESTAÑEO DE TEMA:
            Inyecta la clase .dark antes de que React despierte, matando el flash blanco.
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
        className={`${inter.className} min-h-screen bg-background font-sans antialiased selection:bg-primary/30`}
        suppressHydrationWarning
      >
        {/* CAPA 1: Telemetría Global (Analytics) */}
        <CSPostHogProvider>

          {/* CAPA 2: Ciclo de Vida PWA (Registro Único) */}
          <PwaLifecycle />

          {/* CAPA 3: Red de Seguridad UI */}
          <ErrorBoundary>

            {/* CAPA 4: Motor de Atmósfera Aurora
                disableTransitionOnChange={true} es vital para evitar pestañeos 
                de color durante la navegación interna.
            */}
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange={true}
              storageKey="theme"
            >

              {/* CAPA 5: Soberanía de Identidad Atómica
                  Inyectamos la sesión y el perfil de servidor para una hidratación sin latencia.
              */}
              <AuthProvider initialSession={initialSession} initialProfile={initialProfile}>

                {/* --- ESCENARIO VISUAL NICEPOD V2.5 --- */}
                <div className="min-h-screen gradient-mesh relative overflow-x-hidden">

                  {/* IDENTIDAD VISUAL (Blobs Atmosféricos) */}
                  <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-40 dark:opacity-80">
                    <div className="absolute top-10 left-10 w-80 h-80 bg-purple-500/10 rounded-full blur-[120px] animate-float"></div>
                    <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[160px] animate-float" style={{ animationDelay: "2s" }}></div>
                    <div className="absolute -bottom-20 left-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-[140px] animate-float" style={{ animationDelay: "4s" }}></div>
                  </div>

                  {/* LIENZO DE INTERACCIÓN (Contenido Dinámico) */}
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