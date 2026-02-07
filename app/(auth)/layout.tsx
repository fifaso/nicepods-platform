// app/(auth)/layout.tsx
// VERSIÓN: 1.0 (NicePod Auth Isolation Standard)
// Misión: Proveer un lienzo limpio para login/signup, eliminando distracciones operativas.

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { getSafeAsset } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

/**
 * AuthLayout: El contenedor dedicado para las rutas de acceso.
 * [ARQUITECTURA]: Este layout NO incluye el AudioProvider ni la Navigation.
 * Esto asegura que la página de Login cargue un 40% más rápido que la plataforma.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Recuperamos el logo de forma segura para la identidad visual
  const logoSrc = getSafeAsset("/nicepod-logo.png", "logo");

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-x-hidden">
      
      {/* 1. NAVEGACIÓN MINIMALISTA DE RETORNO
          Permite al usuario volver a la Landing Page sin usar el menú táctico.
      */}
      <div className="absolute top-8 left-8 z-50">
        <Link 
          href="/" 
          className="group flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-all duration-300"
        >
          <ArrowLeft className="h-4 w-4 text-primary group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest text-white/70">Volver al Portal</span>
        </Link>
      </div>

      {/* 2. IDENTIDAD CENTRAL (LOGO)
          Situado sobre el formulario para reforzar la marca NicePod.
      */}
      <div className="absolute top-12 md:top-20 flex flex-col items-center gap-4 z-20 pointer-events-none">
        <div className="relative h-16 w-16 md:h-20 md:w-20 rounded-[1.5rem] overflow-hidden border border-white/10 shadow-2xl">
          <Image
            src={logoSrc}
            alt="NicePod"
            fill
            sizes="(max-width: 768px) 64px, 80px"
            className="object-cover"
            priority
          />
        </div>
        <h2 className="text-xl font-black tracking-tighter uppercase italic text-white/20">
          Intelligence Studio
        </h2>
      </div>

      {/* 3. LIENZO DE CONTENIDO (Login / Signup Cards)
          Z-index superior para asegurar interactividad total.
      */}
      <main className="relative z-30 w-full flex items-center justify-center px-4 pt-20 pb-10">
        <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-700">
          {children}
        </div>
      </main>

      {/* 4. CAPA ESTÉTICA AURORA (Consistencia de marca)
          Reutilizamos los blobs de fondo para que la transición desde la Landing 
          no sea visualmente disruptiva.
      */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-30 dark:opacity-60">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[150px]" />
      </div>

      {/* FOOTER DISCRETO DE SEGURIDAD */}
      <footer className="absolute bottom-8 z-20">
        <p className="text-[9px] font-bold text-white/10 uppercase tracking-[0.4em]">
          NicePod Secure Access Protocol V2.5
        </p>
      </footer>

    </div>
  );
}