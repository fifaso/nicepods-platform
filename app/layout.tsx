// app/layout.tsx
// VERSIÓN: 20.0 (NicePod Core Identity - Atomic Handshake Standard)
// Misión: Orquestar el núcleo global, blindar la identidad mediante SSR y eliminar el pestañeo de hidratación.
// [ESTABILIZACIÓN]: Ingesta de Perfil en Servidor (T0) para garantizar una carga visual profesional y estanca.

import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import type React from "react";

/**
 * --- CAPA DE ESTILOS CRÍTICOS ---
 * Importamos el CSS de Mapbox antes que los estilos globales para asegurar 
 * que el sistema Aurora pueda sobreescribir variables de diseño del motor geográfico.
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
 * Optimizamos el rendimiento de la PWA desactivando el pre-carga de Google Fonts
 * para priorizar el renderizado del contenido crítico bajo redes inestables.
 */
const inter = Inter({
  subsets: ["latin"],
  preload: false,
  display: "swap"
});

/**
 * VIEWPORT: Configuración de visualización táctica.
 * 'viewportFit: cover' es obligatorio para que el gradient-mesh ocupe el área del notch.
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
 * METADATA: Definición de la Identidad Digital NicePod.
 * Implementación del dogma 'Witness, Not Diarist' en el corazón del SEO.
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
 * RootLayout: El Gran Orquestador Síncrono de NicePod V2.5.
 */
export default async function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  /**
   * 1. PROTOCOLO DE IDENTIDAD ATÓMICA (SSR)
   * En lugar de esperar a que el cliente pregunte por el perfil, 
   * lo recuperamos en el servidor para inyectarlo en el render inicial.
   */
  const supabase = createClient();
  
  // Recuperamos el usuario validado (Handshake de seguridad)
  const { data: { user } } = await supabase.auth.getUser();
  
  let initialSession = null;
  let initialProfile = null;

  if (user) {
    // Si hay usuario, recuperamos la sesión y el perfil de forma concurrente
    const [sessionRes, profileRes] = await Promise.all([
      supabase.auth.getSession(),
      supabase.from('profiles').select('*').eq('id', user.id).single()
    ]);

    initialSession = sessionRes.data.session;
    initialProfile = profileRes.data;
  }

  return (
    /**
     * suppressHydrationWarning en <html> y <body>:
     * Necesario para que next-themes (Nivel 4) inyecte las clases de tema 
     * sin que React dispare errores por la discrepancia entre servidor y cliente.
     */
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* 
            SCRIPT ANTI-PESTAÑEO DE TEMA (Inyección Síncrona Crítica):
            Calcula la preferencia visual antes de que el motor de React se inicialice.
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
        {/* CAPA 1: Telemetría Global y Análisis de Comportamiento */}
        <CSPostHogProvider>

          {/* CAPA 2: Soporte Offline y Ciclo de Vida PWA */}
          <ServiceWorkerRegister />
          <PwaLifecycle />

          {/* CAPA 3: Red de Seguridad de Renderizado */}
          <ErrorBoundary>

            {/* CAPA 4: Motor de Diseño Aurora (Glassmorphism) */}
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange={false}
              storageKey="theme"
            >

              {/* CAPA 5: Soberanía de Identidad Atómica
                  Inyectamos la sesión y el perfil recuperados en SSR.
                  Esto garantiza que el AuthProvider no necesite realizar peticiones adicionales
                  en el cliente durante la hidratación inicial, matando el pestañeo visual.
              */}
              <AuthProvider initialSession={initialSession} initialProfile={initialProfile}>

                {/* --- UNIVERSO VISUAL NICEPOD V2.5 --- */}
                <div className="min-h-screen gradient-mesh relative overflow-x-hidden">

                  {/* ELEMENTOS ATMOSFÉRICOS (Z-index 0)
                      Blobs dinámicos que definen la estética Aurora. 
                      Se renderizan inmediatamente para dar sensación de 'App Viva'.
                  */}
                  <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-40 dark:opacity-80">
                    <div className="absolute top-10 left-10 w-80 h-80 bg-purple-500/10 rounded-full blur-[120px] animate-float"></div>
                    <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[160px] animate-float" style={{ animationDelay: "2s" }}></div>
                    <div className="absolute -bottom-20 left-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-[140px] animate-float" style={{ animationDelay: "4s" }}></div>
                  </div>

                  {/* LIENZO DE INTERACCIÓN (Z-index 10)
                      Contenedor principal donde se inyectan las páginas de la Workstation.
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