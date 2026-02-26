// app/layout.tsx
// VERSIÓN: 21.0

import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import type React from "react";

// --- CAPA 0: CIMIENTOS VISUALES (ESTILOS CRÍTICOS) ---
import "mapbox-gl/dist/mapbox-gl.css";
import "./globals.css";

// --- INFRAESTRUCTURA DE COMPONENTES Y SERVICIOS ---
import { ErrorBoundary } from "@/components/error-boundary";
import { CSPostHogProvider } from '@/components/providers/posthog-provider';
import { PwaLifecycle } from "@/components/pwa-lifecycle";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/hooks/use-auth";
import { createClient } from '@/lib/supabase/server';
import { Tables } from "@/types/database.types";

/**
 * FUENTE PRINCIPAL: Inter
 * Optimizada con display swap para priorizar la visibilidad del texto técnico.
 */
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

/**
 * VIEWPORT API: Configuración de hardware de visualización.
 * Bloqueamos el escalado manual para garantizar la integridad de la Workstation.
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
 * METADATA API: Identidad Digital Soberana.
 * Centralizamos el branding y eliminamos las etiquetas manuales del <head>.
 */
export const metadata: Metadata = {
  title: "NicePod | Witness, Not Diarist",
  description: "Workstation de inteligencia industrial y memoria urbana. Forja sabiduría en audio.",
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
 * 
 * Este componente es el primer código que se ejecuta en el servidor.
 * Su diseño jerárquico asegura que ninguna capa superior bloquee a la inferior.
 */
export default async function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  /**
   * 1. PROTOCOLO DE IDENTIDAD ATÓMICA (SSR - T0)
   * Recuperamos la sesión y el perfil en el metal del servidor.
   * Al inyectarlos en el AuthProvider, el cliente nace con la verdad establecida.
   */
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let initialSession = null;
  let initialProfile: Tables<'profiles'> | null = null;

  if (user) {
    // Cosecha concurrente para minimizar latencia de carga inicial.
    const [sessionRes, profileRes] = await Promise.all([
      supabase.auth.getSession(),
      supabase.from('profiles').select('*').eq('id', user.id).single()
    ]);

    initialSession = sessionRes.data.session;
    initialProfile = profileRes.data;
  }

  return (
    <html lang="es" suppressHydrationWarning className="dark">
      <head>
        {/* 
            SCRIPT DE PROTECCIÓN LUMÍNICA:
            Inyecta el estado de tema antes de que el navegador procese el CSS de React.
            Esto aniquila el flash blanco en el 100% de las cargas.
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
        className={`${inter.className} min-h-screen bg-[#020202] font-sans antialiased selection:bg-primary/30`}
        suppressHydrationWarning
      >
        {/* CAPA 1: Telemetría Global */}
        <CSPostHogProvider>

          {/* CAPA 2: Ciclo de Vida PWA (Registro de Service Worker Único) */}
          <PwaLifecycle />

          {/* CAPA 3: Centinela de Fallos UI */}
          <ErrorBoundary>

            {/* CAPA 4: Motor de Atmósfera Aurora */}
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange={true}
              storageKey="theme"
            >

              {/* CAPA 5: Soberanía de Identidad (SSR Injected) */}
              <AuthProvider
                initialSession={initialSession}
                initialProfile={initialProfile}
              >

                {/* --- ESCENARIO VISUAL NICEPOD V2.5 --- */}
                <div className="min-h-screen relative overflow-x-hidden bg-background transition-colors duration-500">

                  {/* 
                      IDENTIDAD VISUAL: Blobs Atmosféricos 
                      - z-0: Siempre detrás de la interactividad.
                      - fixed: Persisten durante el scroll.
                  */}
                  <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-40 dark:opacity-70">
                    <div className="absolute top-[10%] left-[5%] w-96 h-96 bg-primary/10 rounded-full blur-[140px] animate-pulse"></div>
                    <div className="absolute top-[40%] right-[-5%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[180px] animate-pulse" style={{ animationDelay: "3s" }}></div>
                    <div className="absolute bottom-[-10%] left-[20%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: "6s" }}></div>
                  </div>

                  {/* 
                      LIENZO DE INTERACCIÓN (Z-10)
                      Contenedor de alto rendimiento para el contenido dinámico.
                  */}
                  <div className="relative z-10 flex flex-col min-h-screen">
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

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Sincronía Atómica: El uso de 'supabase.auth.getUser()' en el servidor garantiza 
 *    que los Server Components descendientes no tengan que re-validar la sesión, 
 *    ahorrando peticiones redundantes.
 * 2. Higiene de Consola: Se han eliminado los meta-tags 'apple-mobile-web-app' manuales 
 *    que causaban advertencias en Chrome 120+, sustituyéndolos por el objeto Metadata oficial.
 * 3. Jerarquía de Capas: El 'z-10' del contenedor de children asegura que los botones 
 *    y modales (como el buscador Portal) capturen los clics sin que los Blobs 
 *    decorativos interfieran en el puntero del mouse.
 */