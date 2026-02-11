// app/(auth)/layout.tsx
// VERSIÓN: 1.1 (NicePod Auth Isolation Standard - Zero Noise Edition)
// Misión: Contenedor dedicado para el flujo de identidad. Optimiza la carga y silencia advertencias de PWA.
// [FIX]: Eliminación de metadatos manuales redundantes y optimización de jerarquía Z-index.

import { getSafeAsset } from "@/lib/utils";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import React from "react";

/**
 * METADATA LOCAL:
 * Next.js fusiona esto con el RootLayout. Al definir un título específico, 
 * mejoramos el SEO y el historial del navegador del usuario sin disparar 
 * advertencias de tags depreciados (apple-mobile-web-app-capable).
 */
export const metadata: Metadata = {
  title: "Acceso Seguro | NicePod",
  description: "Inicia sesión en tu terminal de inteligencia personal.",
  // No añadimos appleWebApp aquí para que herede la configuración corregida del RootLayout
};

/**
 * AuthLayout: El lienzo de transición para Login, Signup y Recuperación.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Recuperación segura del logo corporativo NicePod
  const logoSrc = getSafeAsset("/nicepod-logo.png", "logo");

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-background overflow-hidden">

      {/* 
          1. CAPA DE RETORNO (Botón Táctico) 
          Diseñado para que el invitado pueda abortar el login y volver al portal.
      */}
      <div className="absolute top-8 left-8 z-50">
        <Link
          href="/"
          title="Regresar a la página principal"
          className="group flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/10 hover:border-primary/30 transition-all duration-500 shadow-2xl"
        >
          <ArrowLeft className="h-4 w-4 text-primary group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80">
            Cerrar Túnel
          </span>
        </Link>
      </div>

      {/* 
          2. CABECERA DE IDENTIDAD (Branding)
          Situada en la parte superior para dar peso visual al formulario.
      */}
      <div className="absolute top-16 md:top-24 flex flex-col items-center gap-5 z-20 pointer-events-none animate-in fade-in slide-in-from-top-4 duration-1000">
        <div className="relative h-20 w-20 rounded-[2rem] overflow-hidden border border-white/10 shadow-[0_0_40px_rgba(139,92,246,0.2)]">
          <Image
            src={logoSrc}
            alt="NicePod Intelligence Studio"
            fill
            sizes="80px"
            className="object-cover"
            priority
          />
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-black tracking-tighter uppercase italic text-white/40">
            NicePod
          </h2>
          <div className="flex items-center gap-2 justify-center opacity-20">
            <ShieldCheck size={12} className="text-primary" />
            <span className="text-[8px] font-bold uppercase tracking-[0.4em]">Secure Protocol V2.5</span>
          </div>
        </div>
      </div>

      {/* 
          3. ÁREA DE TRABAJO (Formularios)
          Este es el punto donde se inyectan las páginas de Login/Signup.
          El padding-top compensa el logo absoluto superior.
      */}
      <main className="relative z-30 w-full flex items-center justify-center px-4 pt-40 pb-20">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>

      {/* 
          4. ATMÓSFERA AURORA (Capa de Fondo)
          Utilizamos blobs con opacidad controlada para mantener la identidad 
          visual sin comprometer el contraste del texto de los formularios.
      */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Blob Primario (Esquina Superior Izquierda) */}
        <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[160px] animate-pulse" />

        {/* Blob Secundario (Esquina Inferior Derecha) */}
        <div className="absolute -bottom-[10%] -right-[10%] w-[60%] h-[60%] bg-purple-600/10 rounded-full blur-[160px]" />

        {/* Sutil brillo central */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-radial from-blue-500/5 to-transparent" />
      </div>

      {/* 5. FOOTER DE CUMPLIMIENTO */}
      <footer className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
        <div className="flex flex-col items-center gap-2 opacity-30">
          <p className="text-[9px] font-black text-white uppercase tracking-[0.5em]">
            Sovereign Identity Access
          </p>
        </div>
      </footer>

    </div>
  );
}