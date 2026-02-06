// app/layout.tsx - VERSIÓN: 17.0 (Core Identity Layout)
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import type React from "react";
import "./globals.css";

import { ErrorBoundary } from "@/components/error-boundary";
import { CSPostHogProvider } from '@/components/providers/posthog-provider';
import { PwaLifecycle } from "@/components/pwa-lifecycle";
import { ServiceWorkerRegister } from '@/components/sw-register';
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/hooks/use-auth";
import { createClient } from '@/lib/supabase/server';

const inter = Inter({ subsets: ["latin"], preload: false, display: "swap" });

export const viewport: Viewport = {
  themeColor: "#111827",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "NicePod | Witness, Not Diarist",
  description: "Sistema Nervioso Digital para la creación y descubrimiento de crónicas sonoras urbanas.",
  manifest: "/manifest.json",
  icons: { icon: "/nicepod-logo.png", apple: "/nicepod-logo.png" },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: { session } } = await supabase.auth.getSession();
  const validatedSession = user ? session : null;

  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-background font-sans antialiased`}>
        <CSPostHogProvider>
          <ServiceWorkerRegister />
          <PwaLifecycle />
          <ErrorBoundary>
            <ThemeProvider attribute="class" defaultTheme="dark" enableSystem storageKey="theme">
              <AuthProvider session={validatedSession}>
                {/* La identidad visual Aurora es global */}
                <div className="min-h-screen gradient-mesh relative overflow-x-hidden">
                  <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                    <div className="absolute top-20 left-10 w-20 h-20 bg-purple-400/20 rounded-full blur-xl animate-float"></div>
                    <div className="absolute top-40 right-20 w-32 h-32 bg-blue-400/20 rounded-full blur-xl animate-float" style={{ animationDelay: "2s" }}></div>
                    <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-pink-400/20 rounded-full blur-xl animate-float" style={{ animationDelay: "4s" }}></div>
                  </div>
                  {children}
                </div>
              </AuthProvider>
            </ThemeProvider>
          </ErrorBoundary>
        </CSPostHogProvider>
      </body>
    </html>
  );
}