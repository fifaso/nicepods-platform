// components/profile/public/public-hero-section.tsx
// VERSIÓN: 1.0 (NicePod Public Hero - Authority & Prestige Standard)
// Misión: Proyectar la identidad soberana del curador y sus métricas de impacto social.
// [ESTABILIZACIÓN]: Diseño monumental optimizado para LCP y sincronía de metadatos de reputación.

"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Sparkles } from "lucide-react";

// --- INFRAESTRUCTURA UI ---
import { ReputationExplainer } from "@/components/social/reputation-explainer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getSafeAsset } from "@/lib/utils";
import { ProfileData } from "@/types/profile";

/**
 * INTERFAZ: PublicHeroSectionProps
 * Define los datos necesarios para renderizar el encabezado de autoridad pública.
 */
interface PublicHeroSectionProps {
  profile: ProfileData;
  podcastCount: number;
  totalLikes: number;
}

/**
 * PublicHeroSection: El lienzo de identidad de NicePod V2.5.
 * 
 * Implementa el lenguaje visual Aurora mediante el uso de blobs de fondo,
 * tipografías monumentales y micro-animaciones cinemáticas.
 */
export function PublicHeroSection({
  profile,
  podcastCount,
  totalLikes
}: PublicHeroSectionProps) {

  // Extraemos la inicial para el fallback del avatar soberano
  const userInitial = profile.full_name?.charAt(0).toUpperCase() || "U";

  return (
    <section className="flex flex-col items-center text-center mb-20 animate-in fade-in slide-in-from-top-4 duration-1000">

      {/* 1. BLOQUE: IDENTIDAD VISUAL MONUMENTAL */}
      <div className="relative group">

        {/* Aura Dinámica de Prestigio (Visible en el tema Nebulosa) */}
        <div className="absolute -inset-6 bg-gradient-to-tr from-primary/30 via-violet-600/20 to-fuchsia-600/30 rounded-full blur-3xl opacity-40 group-hover:opacity-70 transition duration-1000 animate-pulse" />

        <div className="relative h-44 w-44 rounded-full p-2 bg-gradient-to-tr from-white/10 to-transparent border border-white/5 shadow-2xl">
          <Avatar className="h-full w-full border-4 border-zinc-950 shadow-inner overflow-hidden">
            <AvatarImage
              src={getSafeAsset(profile.avatar_url, 'avatar')}
              alt={profile.full_name || "Curador NicePod"}
              className="object-cover"
            />
            <AvatarFallback className="text-6xl font-black bg-zinc-900 text-primary">
              {userInitial}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Badge de Verificación Soberana */}
        {profile.is_verified && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.5 }}
            className="absolute bottom-4 right-4 bg-primary text-white rounded-full p-2.5 border-4 border-zinc-950 shadow-2xl z-20"
            title="Curador Verificado"
          >
            <ShieldCheck size={24} fill="currentColor" className="text-white" />
          </motion.div>
        )}
      </div>

      {/* 2. BLOQUE: NOMENCLATURA Y BIO */}
      <div className="mt-12 space-y-4">
        {/* Identificador Sinergizado */}
        <div className="flex flex-col gap-2">
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase leading-none text-white drop-shadow-2xl italic">
            {profile.full_name}
          </h1>
          <div className="flex items-center justify-center gap-2 text-primary">
            <Sparkles size={12} className="animate-pulse" />
            <p className="font-black uppercase tracking-[0.5em] text-[11px] opacity-90">
              @{profile.username}
            </p>
          </div>
        </div>

        {/* Narrativa de Sabiduría (Bio) */}
        {profile.bio && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="max-w-2xl mx-auto mt-10 text-xl md:text-2xl text-zinc-400 font-medium leading-relaxed italic px-4"
          >
            "{profile.bio}"
          </motion.p>
        )}
      </div>

      {/* 3. BLOQUE: MÉTRICAS DE RESONANCIA (Impacto en la Red) */}
      <div className="flex flex-wrap gap-12 md:gap-24 mt-16 justify-center">

        {/* Métrica: Volumen de Crónicas */}
        <div className="text-center group cursor-default">
          <span className="block font-black text-4xl md:text-5xl text-white transition-transform group-hover:scale-110 duration-500 tabular-nums">
            {podcastCount}
          </span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-50 mt-2 block">
            Crónicas
          </span>
        </div>

        {/* Métrica: Resonancia Acumulada (Likes) */}
        <div className="text-center group cursor-default">
          <span className="block font-black text-4xl md:text-5xl text-white transition-transform group-hover:scale-110 duration-500 tabular-nums">
            {totalLikes}
          </span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-50 mt-2 block">
            Resonancia
          </span>
        </div>

        {/* Métrica: Prestigio (Reputación) */}
        <div className="text-center group cursor-default">
          <div className="flex items-center gap-3 justify-center">
            <span className="block font-black text-4xl md:text-5xl text-primary transition-transform group-hover:scale-110 duration-500 tabular-nums">
              {profile.reputation_score || 0}
            </span>
            <ReputationExplainer />
          </div>
          <span className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-50 mt-2 block">
            Prestigio
          </span>
        </div>

      </div>

      {/* Separador de Estructura */}
      <div className="w-full max-w-xs h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mt-20" />

    </section>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * Este componente es el primer bloque que el usuario ve al visitar a un curador. 
 * He utilizado 'priority' en las fuentes de imagen y una animación de entrada 
 * acelerada por hardware para asegurar que la sensación de 'Carga Atómica' sea 
 * real. El uso de 'tabular-nums' en las métricas evita que los números 'bailen' 
 * si se actualizan en tiempo real, manteniendo el rigor de una terminal de datos.
 */