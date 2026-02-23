//componentes/profile/public/public-hero-section.tsx
//VERSIÓN: 2.0 (NicePod Public Hero - Authority & Social Prestige Standard)
"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Sparkles, Users } from "lucide-react";

// --- INFRAESTRUCTURA UI Y COMPONENTES SATÉLITES ---
import { ReputationExplainer } from "@/components/social/reputation-explainer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getSafeAsset } from "@/lib/utils";
import { ProfileData } from "@/types/profile";

/**
 * INTERFAZ: PublicHeroSectionProps
 * Define los datos necesarios para renderizar el encabezado de autoridad pública.
 * Sincronizado con la cosecha de datos realizada en el Server Component.
 */
interface PublicHeroSectionProps {
  profile: ProfileData;
  podcastCount: number;
  totalLikes: number;
}

/**
 * COMPONENTE: PublicHeroSection
 * El punto de entrada visual a la identidad del curador en NicePod V2.5.
 * 
 * Implementa la 'Doctrina de Identidad Monumental', utilizando tipografía 
 * itálica de alto impacto y un sistema de métricas tabulares para 
 * proyectar soberanía técnica y social.
 */
export function PublicHeroSection({
  profile,
  podcastCount,
  totalLikes
}: PublicHeroSectionProps) {

  /**
   * FALLBACK DE IDENTIDAD:
   * Si el curador no ha definido su 'full_name', utilizamos su 'username' 
   * como identificador primario para evitar vacíos visuales en el DOM.
   */
  const displayName = profile.full_name || `@${profile.username}`;
  const userInitial = (profile.full_name || profile.username).charAt(0).toUpperCase();

  return (
    <section className="flex flex-col items-center text-center mb-24 px-4">

      {/* 1. BLOQUE: ARQUITECTURA VISUAL (AVATAR & AURA) */}
      <div className="relative group">

        {/* Aura Aurora de Prestigio: Sincronizada con el Reputation Score */}
        <div className="absolute -inset-8 bg-gradient-to-tr from-primary/40 via-violet-600/20 to-fuchsia-600/40 rounded-full blur-3xl opacity-30 group-hover:opacity-60 transition duration-1000 animate-pulse" />

        <div className="relative h-48 w-48 rounded-full p-2 bg-gradient-to-tr from-white/10 to-transparent border border-white/5 shadow-2xl backdrop-blur-sm">
          <Avatar className="h-full w-full border-4 border-zinc-950 shadow-inner overflow-hidden">
            <AvatarImage
              src={getSafeAsset(profile.avatar_url, 'avatar')}
              alt={displayName}
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <AvatarFallback className="text-6xl font-black bg-zinc-900 text-primary">
              {userInitial}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Badge de Verificación Soberana: Solo visible si el curador ha sido validado */}
        {profile.is_verified && (
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.6 }}
            className="absolute bottom-5 right-5 bg-primary text-black rounded-full p-2.5 border-4 border-zinc-950 shadow-[0_0_20px_rgba(var(--primary),0.4)] z-20"
            title="Curador Verificado"
          >
            <ShieldCheck size={24} fill="currentColor" />
          </motion.div>
        )}
      </div>

      {/* 2. BLOQUE: NOMENCLATURA Y BIO (NÚCLEO DE IDENTIDAD) */}
      <div className="mt-14 space-y-6 max-w-3xl">
        <div className="flex flex-col gap-3">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-6xl md:text-8xl font-black tracking-tighter uppercase leading-none text-white drop-shadow-2xl italic"
          >
            {profile.full_name || profile.username}
          </motion.h1>

          <div className="flex items-center justify-center gap-3 text-primary/80">
            <Sparkles size={14} className="animate-spin-slow" />
            <p className="font-black uppercase tracking-[0.6em] text-[12px]">
              @{profile.username}
            </p>
            <Sparkles size={14} className="animate-spin-slow" />
          </div>
        </div>

        {/* Biografía Técnica: Expresión de Sabiduría */}
        {(profile.bio || profile.bio_short) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            <p className="text-xl md:text-2xl text-zinc-400 font-medium leading-relaxed italic px-6">
              "{profile.bio || profile.bio_short}"
            </p>

            {profile.website_url && (
              <a
                href={profile.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-[10px] font-black uppercase tracking-[0.3em] text-primary/60 hover:text-primary transition-colors border-b border-primary/20 pb-1"
              >
                Conexión Externa
              </a>
            )}
          </motion.div>
        )}
      </div>

      {/* 3. BLOQUE: MÉTRICAS DE RESONANCIA Y SOCIAL GRAPH */}
      <div className="flex flex-wrap gap-10 md:gap-20 mt-20 justify-center items-start">

        {/* Métrica: Biblioteca de Crónicas */}
        <div className="flex flex-col items-center group cursor-default">
          <span className="font-black text-4xl md:text-5xl text-white transition-transform group-hover:scale-110 duration-500 tabular-nums">
            {podcastCount}
          </span>
          <span className="text-[9px] text-zinc-500 uppercase tracking-[0.4em] font-black mt-3 opacity-60">
            Crónicas
          </span>
        </div>

        {/* Métrica: Resonancia Acumulada */}
        <div className="flex flex-col items-center group cursor-default">
          <span className="font-black text-4xl md:text-5xl text-white transition-transform group-hover:scale-110 duration-500 tabular-nums">
            {totalLikes}
          </span>
          <span className="text-[9px] text-zinc-500 uppercase tracking-[0.4em] font-black mt-3 opacity-60">
            Resonancia
          </span>
        </div>

        {/* Métrica: Prestigio (Reputación Líquida) */}
        <div className="flex flex-col items-center group cursor-default">
          <div className="flex items-center gap-3">
            <span className="font-black text-4xl md:text-5xl text-primary transition-transform group-hover:scale-110 duration-500 tabular-nums">
              {profile.reputation_score || 0}
            </span>
            <ReputationExplainer />
          </div>
          <span className="text-[9px] text-primary/40 uppercase tracking-[0.4em] font-black mt-3">
            Prestigio
          </span>
        </div>

        {/* Métrica: Seguidores (Social Density) */}
        <div className="flex flex-col items-center group cursor-default">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-zinc-600" />
            <span className="font-black text-2xl md:text-3xl text-zinc-300 tabular-nums">
              {profile.followers_count}
            </span>
          </div>
          <span className="text-[8px] text-zinc-600 uppercase tracking-[0.3em] font-black mt-2">
            Seguidores
          </span>
        </div>

      </div>

      {/* Línea de Horizonte de Estructura */}
      <div className="w-full max-w-sm h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mt-24" />

    </section>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Optimización LCP: El avatar utiliza 'getSafeAsset' para asegurar fallbacks 
 *    inmediatos y evitar saltos de layout si la imagen de Supabase Storage tarda.
 * 2. Jerarquía de Datos: Se ha priorizado el 'full_name' en tipografía 
 *    monumental para establecer autoridad, relegando el 'username' a una 
 *    función de localizador técnico.
 * 3. Diseño Holístico: El uso de 'animate-spin-slow' y gradientes sutiles 
 *    mantiene la Workstation dentro de la atmósfera de 'Inteligencia Industrial'.
 */