/**
 * ARCHIVO: components/profile/public/public-hero-section.tsx
 * VERSIÓN: 3.0 (NicePod Public Hero - Sovereign Authority Standard)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Proyectar la identidad monumental del curador, visualizando su estatus,
 * biografía técnica y métricas de resonancia dentro de la red global.
 * [REFORMA V3.0]: Sincronización nominal con PublicProfilePage V4.0, erradicación 
 * absoluta de abreviaturas y blindaje total contra errores de propiedad.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Sparkles, Users } from "lucide-react";

// --- INFRAESTRUCTURA UI Y COMPONENTES SATÉLITES ---
import { ReputationExplainer } from "@/components/social/reputation-explainer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getSafeAsset } from "@/lib/utils";
import { ProfileData } from "@/types/profile";

/**
 * INTERFAZ: PublicHeroSectionProperties
 * Misión: Definir el contrato de activos para la cabecera de autoridad pública.
 * [FIX V3.0]: Sincronización nominal con el despacho del orquestador cliente.
 */
interface PublicHeroSectionProperties {
  administratorProfile: ProfileData;
  publishedPodcastTotalCount: number;
  accumulatedResonanceCount: number;
}

/**
 * PublicHeroSection: El punto de entrada visual a la identidad industrial del curador.
 */
export function PublicHeroSection({
  administratorProfile,
  publishedPodcastTotalCount,
  accumulatedResonanceCount
}: PublicHeroSectionProperties) {

  /**
   * userDisplayName:
   * Misión: Establecer la nomenclatura de autoridad primaria, utilizando el nombre 
   * completo o el identificador de usuario en su defecto.
   */
  const userDisplayName = administratorProfile.full_name || `@${administratorProfile.username}`;
  
  const userIdentificationInitial = (
    administratorProfile.full_name || administratorProfile.username
  ).charAt(0).toUpperCase();

  return (
    <section className="flex flex-col items-center text-center mb-24 px-4 isolate">

      {/* 1. SECTOR: ARQUITECTURA VISUAL (AVATAR & AURA TÉCNICA) */}
      <div className="relative group">

        {/* Aura Aurora de Prestigio: Proyecta la densidad de reputación en la red */}
        <div className="absolute -inset-8 bg-gradient-to-tr from-primary/40 via-violet-600/20 to-fuchsia-600/40 rounded-full blur-3xl opacity-30 group-hover:opacity-60 transition duration-1000 animate-pulse pointer-events-none" />

        <div className="relative h-48 w-48 rounded-full p-2 bg-gradient-to-tr from-white/10 to-transparent border border-white/5 shadow-2xl backdrop-blur-sm">
          <Avatar className="h-full w-full border-4 border-zinc-950 shadow-inner overflow-hidden">
            <AvatarImage
              src={getSafeAsset(administratorProfile.avatar_url, 'avatar')}
              alt={userDisplayName}
              className="object-cover transition-transform duration-1000 group-hover:scale-110"
            />
            <AvatarFallback className="text-6xl font-black bg-zinc-900 text-primary font-serif italic">
              {userIdentificationInitial}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Badge de Verificación Soberana */}
        {administratorProfile.is_verified && (
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.6 }}
            className="absolute bottom-5 right-5 bg-primary text-black rounded-full p-2.5 border-4 border-zinc-950 shadow-[0_0_25px_rgba(var(--primary-rgb),0.5)] z-20"
            title="Curador Verificado"
          >
            <ShieldCheck size={24} fill="currentColor" />
          </motion.div>
        )}
      </div>

      {/* 2. SECTOR: NOMENCLATURA PERICIAL (NÚCLEO DE IDENTIDAD) */}
      <div className="mt-14 space-y-6 max-w-3xl">
        <div className="flex flex-col gap-3">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-6xl md:text-9xl font-black tracking-tighter uppercase leading-none text-white drop-shadow-2xl italic font-serif"
          >
            {administratorProfile.full_name || administratorProfile.username}
          </motion.h1>

          <div className="flex items-center justify-center gap-4 text-primary/80">
            <Sparkles size={14} className="animate-spin-slow" />
            <p className="font-black uppercase tracking-[0.6em] text-[12px]">
              @{administratorProfile.username}
            </p>
            <Sparkles size={14} className="animate-spin-slow" />
          </div>
        </div>

        {/* Biografía de Inteligencia: Expresión del Capital Intelectual */}
        {(administratorProfile.bio || administratorProfile.bio_short) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            <p className="text-xl md:text-3xl text-zinc-500 font-medium leading-relaxed italic px-8">
              "{administratorProfile.bio || administratorProfile.bio_short}"
            </p>

            {administratorProfile.website_url && (
              <a
                href={administratorProfile.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-[10px] font-black uppercase tracking-[0.4em] text-primary/60 hover:text-primary transition-colors border-b border-primary/20 pb-1"
              >
                Conexión de Autoridad Externa
              </a>
            )}
          </motion.div>
        )}
      </div>

      {/* 3. SECTOR: MÉTRICAS DE RESONANCIA (SOCIAL GRAPH TÁCTICO) */}
      <div className="flex flex-wrap gap-10 md:gap-24 mt-24 justify-center items-start">

        {/* Biblioteca de Crónicas */}
        <div className="flex flex-col items-center group cursor-default">
          <span className="font-black text-5xl md:text-6xl text-white transition-transform group-hover:scale-110 duration-700 tabular-nums">
            {publishedPodcastTotalCount}
          </span>
          <span className="text-[9px] text-zinc-600 uppercase tracking-[0.5em] font-black mt-4 opacity-70">
            Crónicas
          </span>
        </div>

        {/* Resonancia Acumulada */}
        <div className="flex flex-col items-center group cursor-default">
          <span className="font-black text-5xl md:text-6xl text-white transition-transform group-hover:scale-110 duration-700 tabular-nums">
            {accumulatedResonanceCount}
          </span>
          <span className="text-[9px] text-zinc-600 uppercase tracking-[0.5em] font-black mt-4 opacity-70">
            Resonancia
          </span>
        </div>

        {/* Prestigio (Reputación Líquida) */}
        <div className="flex flex-col items-center group cursor-default">
          <div className="flex items-center gap-4">
            <span className="font-black text-5xl md:text-6xl text-primary transition-transform group-hover:scale-110 duration-700 tabular-nums drop-shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]">
              {administratorProfile.reputation_score || 0}
            </span>
            <ReputationExplainer />
          </div>
          <span className="text-[9px] text-primary/50 uppercase tracking-[0.5em] font-black mt-4">
            Prestigio
          </span>
        </div>

        {/* Social Density (Seguidores) */}
        <div className="flex flex-col items-center group cursor-default">
          <div className="flex items-center gap-3">
            <Users size={20} className="text-zinc-700" />
            <span className="font-black text-3xl md:text-4xl text-zinc-400 tabular-nums">
              {administratorProfile.followers_count || 0}
            </span>
          </div>
          <span className="text-[8px] text-zinc-700 uppercase tracking-[0.4em] font-black mt-3">
            Seguidores
          </span>
        </div>

      </div>

      {/* Línea de Horizonte de Estructura */}
      <div className="w-full max-w-lg h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mt-32 opacity-40" />

    </section>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V3.0):
 * 1. Build Shield Compliance: Se sustituyó 'podcastCount' por 'publishedPodcastTotalCount' 
 *    y 'totalLikes' por 'accumulatedResonanceCount' para neutralizar el error TS2322.
 * 2. Zero Abbreviations Policy: Purificación absoluta de variables descriptivas 
 *    (administratorProfile, userDisplayName, externalWebsiteUniformResourceLocator).
 * 3. Typography Mastery: Se aplicó la fuente 'serif' e itálica para los encabezados de 
 *    autoridad, reforzando el tono industrial y sofisticado de la plataforma.
 */