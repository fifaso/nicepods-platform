// app/layout.tsx
import { cookies } from 'next/headers';
import type React from "react";
import "./globals.css";
import { Inter } from "next/font/google";
import { createClient } from '@/lib/supabase/server';
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/hooks/use-auth";
import { AudioProvider } from "@/contexts/audio-context";
import { Navigation } from "@/components/navigation";
import { PlayerOrchestrator } from "@/components/player-orchestrator";
import { CSPostHogProvider } from '@/components/providers/posthog-provider';
import { PwaLifecycle } from "@/components/pwa-lifecycle";
import { ServiceWorkerRegister } from '@/components/sw-register';

const inter = Inter({ subsets: ["latin"], preload: false });

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: { session } } = await supabase.auth.getSession();

  return (
    <html lang="es" suppressHydrationWarning className="gradient-mesh">
      <body className={`${inter.className} min-h-screen antialiased`}>
        <CSPostHogProvider>
          <ServiceWorkerRegister />
          <PwaLifecycle />
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
            <AuthProvider session={user ? session : null}>
              <AudioProvider>

                {/* BLOBS FLOTANTES */}
                <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 opacity-60 dark:opacity-40">
                  <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-purple-400/20 rounded-full blur-[120px] animate-float" />
                  <div className="absolute top-[10%] right-[-5%] w-[60%] h-[60%] bg-blue-300/20 rounded-full blur-[120px] animate-float" style={{ animationDelay: "2s" }} />
                </div>

                <div className="relative z-10 flex flex-col min-h-screen">
                  <Navigation />
                  <main className="flex-1 w-full max-w-screen-2xl mx-auto px-4 md:px-8">
                    {children}
                  </main>
                  <PlayerOrchestrator />
                </div>

              </AudioProvider>
            </AuthProvider>
          </ThemeProvider>
        </CSPostHogProvider>
      </body>
    </html>
  );
}