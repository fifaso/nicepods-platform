// app/layout.tsx
// VERSIÓN: 30.0 (NicePod Architecture Core - Hydration Shield Edition)
// Misión: Orquestar la infraestructura global y aniquilar el flicker mediante atributos SSR.
// [ESTABILIZACIÓN]: Inyección de data-auth-state y optimización de carga de Mapbox.

import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import type React from "react";

/**
 * --- CAPA 0: CIMIENTOS VISUALES ---
 */
import "mapbox-gl/dist/mapbox-gl.css";
import "./globals.css";

// Infraestructura de Servicios
import { CSPostHogProvider } from '@/components/providers/posthog-provider';
import { ErrorBoundary } from "@/components/system/error-boundary";
import { PwaLifecycle } from "@/components/system/pwa-lifecycle";
import { ThemeProvider } from "@/components/system/theme-provider";
import { AuthProvider } from "@/hooks/use-auth";
import { createClient } from '@/lib/supabase/server';
import { Tables } from "@/types/database.types";

// Motor de Inmersión Visual (GPU-driven)
import { BackgroundEngine } from "@/components/visuals/background-engine";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const viewport: Viewport = {
  themeColor: "#020202",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: {
    default: "NicePod | Witness, Not Diarist",
    template: "%s | NicePod Intelligence"
  },
  description: "Workstation de inteligencia industrial y memoria urbana.",
  manifest: "/manifest.json",
  icons: {
    icon: [{ url: "/nicepod-logo.png", sizes: "32x32" }],
    apple: [{ url: "/nicepod-logo.png", sizes: "180x180" }],
  },
};

/**
 * COMPONENTE: RootLayout
 * Ejecuta el Handshake T0 y sella el estado de la aplicación en el DOM raíz.
 */
export default async function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  /**
   * 1. PROTOCOLO DE IDENTIDAD ATÓMICA (SSR)
   * Realizamos la resolución de identidad en el "metal" del servidor.
   */
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let initialSession = null;
  let initialProfile: Tables<'profiles'> | null = null;

  if (user) {
    const [sessionRes, profileRes] = await Promise.all([
      supabase.auth.getSession(),
      supabase.from('profiles').select('*').eq('id', user.id).single()
    ]);

    initialSession = sessionRes.data.session;
    initialProfile = profileRes.data;
  }

  // Determinamos el estado de autenticación para el Shield Script
  const authState = user ? "authenticated" : "guest";

  return (
    <html 
      lang="es" 
      suppressHydrationWarning 
      className={inter.variable}
      // [SHIELD]: Este atributo permite al CSS (globals.css) ocultar 
      // visualmente el Dashboard hasta que React tome el control.
      data-auth-state={authState}
    >
      <head>
        {/* 
            SCRIPT MAESTRO DE SINTONÍA (Lumen & Identity Shield):
            Este script es síncrono y bloqueante por diseño. Se ejecuta antes 
            de que el navegador pinte el primer píxel del body.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // 1. Sincronía de Tema
                  var storedTheme = localStorage.getItem('theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  var theme = (storedTheme === 'dark' || (!storedTheme && prefersDark)) ? 'dark' : 'light';
                  document.documentElement.classList.add(theme);
                  document.documentElement.style.colorScheme = theme;

                  // 2. Sincronía de Identidad (Anti-Flicker)
                  // Si el servidor inyectó 'authenticated', forzamos opacidad inmediata
                  // en las zonas que sabemos que el usuario debe ver.
                  if (document.documentElement.getAttribute('data-auth-state') === 'authenticated') {
                    document.documentElement.style.visibility = 'visible';
                  }
                } catch (e) { console.error('Shield Error:', e); }
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${inter.className} font-sans min-h-screen antialiased bg-background text-foreground selection:bg-primary/30`}
        suppressHydrationWarning
      >
        <CSPostHogProvider>
          {/* El Service Worker se registra de forma diferida (window.load) 
              para no bloquear la hidratación de la identidad. */}
          <PwaLifecycle />

          <ErrorBoundary>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange={true}
              storageKey="theme"
            >
              {/* Entregamos el control al AuthProvider con los datos ya resueltos. */}
              <AuthProvider
                initialSession={initialSession}
                initialProfile={initialProfile}
              >
                <div className="min-h-screen relative overflow-x-hidden">
                  
                  {/* Capa de atmósfera (GPU) */}
                  <BackgroundEngine />

                  {/* Contenedor de Contenido Principal */}
                  <div className="relative z-10 flex flex-col min-h-screen bg-transparent">
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
 * NOTA TÉCNICA DEL ARCHITECT (V30.0):
 * 1. Atributo data-auth-state: Es la pieza clave contra el flicker. 
 *    En 'globals.css' debemos tener una regla: [data-auth-state="authenticated"] .guest-only { display: none; }.
 *    Esto oculta elementos de invitado antes de que React cargue.
 * 2. Optimización de Carga: Mapbox CSS está en la raíz, pero el JS de Mapbox 
 *    se carga dinámicamente en los componentes para no penalizar el FCP (First Contentful Paint).
 * 3. Integridad SSR: Al usar 'await supabase.auth.getUser()' y 'Promise.all', 
 *    garantizamos que el 'AuthProvider' nazca con una "Certeza Atómica". 
 *    React no tendrá que "re-calcular" quién es el usuario, evitando el parpadeo.
 */