// app/layout.tsx
// VERSIÓN: 23.0 (Clean Architecture - Integrated Visual Engine)

import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@/components/theme-provider";
import { BackgroundEngine } from "@/components/visuals/background-engine"; // Importamos el nuevo motor
import { AuthProvider } from "@/hooks/use-auth";
import { createClient } from '@/lib/supabase/server';

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const viewport: Viewport = {
  themeColor: "#020202",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "NicePod | Witness, Not Diarist",
  description: "Workstation de inteligencia industrial.",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent" },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Handshake de identidad simplificado
  let initialSession = null;
  let initialProfile = null;
  if (user) {
    const [s, p] = await Promise.all([
      supabase.auth.getSession(),
      supabase.from('profiles').select('*').eq('id', user.id).single()
    ]);
    initialSession = s.data.session;
    initialProfile = p.data;
  }

  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.className} antialiased selection:bg-primary/30`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <AuthProvider initialSession={initialSession} initialProfile={initialProfile}>

            {/* EL ÚNICO DUEÑO DEL FONDO */}
            <BackgroundEngine />

            {/* CONTENEDOR DE CONTENIDO (Transparente para dejar ver el fondo) */}
            <div className="relative z-10 min-h-screen">
              {children}
            </div>

          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}