/**
 * ARCHIVO: components/profile/public/public-hero-section.tsx
 * VERSIÓN: 3.0 (NicePod Public Hero - Sovereign Protocol V4.0)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Proyectar la autoridad y esencia del curador en la zona de impacto primario.
 * [REFORMA V3.0]: Sincronización absoluta con ProfileData V4.0 y ZAP.
 * Nivel de Integridad: 100% (Soberano / ZAP Compliant / Build Shield Green)
 */

"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getSafeAsset } from "@/lib/utils";
import { ProfileData } from "@/types/profile";
import {
  ExternalLink,
  MessageSquare,
  Share2,
  ShieldCheck,
  Users,
  Zap
} from "lucide-react";

/**
 * INTERFAZ: PublicHeroSectionComponentProperties
 */
interface PublicHeroSectionComponentProperties {
  administratorProfile: ProfileData;
  publishedPodcastTotalCount: number;
  accumulatedResonanceCount: number;
}

/**
 * PublicHeroSection: El búnker de identidad monumental del curador.
 */
export function PublicHeroSection({
  administratorProfile,
  publishedPodcastTotalCount,
  accumulatedResonanceCount
}: PublicHeroSectionComponentProperties) {

  const userDisplayName = administratorProfile.fullName || `@${administratorProfile.username}`;

  return (
    <section className="relative w-full py-20 md:py-32 overflow-hidden flex flex-col items-center">

      {/* CAPA 0: ATMÓSFERA CINEMÁTICA */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent opacity-60" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/10 blur-[120px] rounded-full opacity-20 animate-pulse" />
      </div>

      <div className="container relative z-10 px-4 flex flex-col items-center text-center">

        {/* BLOQUE I: AVATAR SOBERANO */}
        <div className="relative mb-10 group">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-110 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          <Avatar className="h-32 w-32 md:h-44 md:w-44 border-4 border-background shadow-2xl relative z-10 transition-transform duration-700 group-hover:scale-105">
            <AvatarImage
              src={getSafeAsset(administratorProfile.avatarUniformResourceLocator, 'avatar')}
              className="object-cover"
            />
            <AvatarFallback className="bg-zinc-900 text-primary text-4xl font-black">
              {administratorProfile.fullName?.charAt(0) || administratorProfile.username.charAt(0)}
            </AvatarFallback>
          </Avatar>

          {/* Sello de Verificación */}
          {administratorProfile.isVerifiedAccountStatus && (
            <div className="absolute -bottom-2 -right-2 z-20 bg-background p-2 rounded-full shadow-xl border border-white/5">
              <div className="bg-primary/10 p-2 rounded-full">
                <ShieldCheck size={24} className="text-primary fill-primary/20" />
              </div>
            </div>
          )}
        </div>

        {/* BLOQUE II: IDENTIDAD NOMINAL */}
        <div className="space-y-4 max-w-3xl">
          <div className="flex flex-col items-center gap-3">
            <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter italic text-white leading-none">
              {administratorProfile.fullName || administratorProfile.username}
            </h1>
            <p className="text-primary font-black uppercase tracking-[0.4em] text-[10px] md:text-xs bg-primary/5 px-4 py-1 rounded-full border border-primary/10">
              Curador Soberano @{administratorProfile.username}
            </p>
          </div>

          <p className="text-sm md:text-xl text-zinc-400 font-medium leading-relaxed italic">
            "{administratorProfile.biographyTextContent || "Explorador de frecuencias y recolector de sabiduría sónica en la red NicePod."}"
          </p>

          {/* Enlaces y Acciones Externas */}
          <div className="flex items-center justify-center gap-4 pt-4">
            {administratorProfile.websiteUniformResourceLocator && (
              <a
                href={administratorProfile.websiteUniformResourceLocator}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-primary transition-colors group"
              >
                IDENTIDAD DIGITAL
                <ExternalLink size={12} className="opacity-40 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </a>
            )}
            <span className="h-1 w-1 rounded-full bg-zinc-800" />
            <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">
              COMPARTIR PERFIL
              <Share2 size={12} />
            </button>
          </div>
        </div>

        {/* BLOQUE III: TELEMETRÍA DE IMPACTO */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-20 mt-16 md:mt-24 w-full max-w-5xl px-8 py-10 rounded-[3rem] bg-white/[0.02] border border-white/5 backdrop-blur-sm">

          <div className="flex flex-col items-center gap-2">
            <span className="text-3xl md:text-5xl font-black text-white italic tracking-tighter">
              {publishedPodcastTotalCount}
            </span>
            <div className="flex items-center gap-2 text-[9px] font-bold text-zinc-600 uppercase tracking-widest">
              <Zap size={10} className="text-primary" />
              Crónicas
            </div>
          </div>

          <div className="flex flex-col items-center gap-2">
            <span className="text-3xl md:text-5xl font-black text-white italic tracking-tighter">
              {administratorProfile.reputationScoreValue}
            </span>
            <div className="flex items-center gap-2 text-[9px] font-bold text-zinc-600 uppercase tracking-widest">
              <ShieldCheck size={10} className="text-primary" />
              Prestigio
            </div>
          </div>

          <div className="flex flex-col items-center gap-2">
            <span className="text-3xl md:text-5xl font-black text-white italic tracking-tighter">
              {administratorProfile.followersCountInventory}
            </span>
            <div className="flex items-center gap-2 text-[9px] font-bold text-zinc-600 uppercase tracking-widest">
              <Users size={10} className="text-primary" />
              Seguidores
            </div>
          </div>

          <div className="flex flex-col items-center gap-2">
            <span className="text-3xl md:text-5xl font-black text-white italic tracking-tighter">
              {accumulatedResonanceCount}
            </span>
            <div className="flex items-center gap-2 text-[9px] font-bold text-zinc-600 uppercase tracking-widest">
              <MessageSquare size={10} className="text-primary" />
              Resonancia
            </div>
          </div>

        </div>

      </div>

    </section>
  );
}
