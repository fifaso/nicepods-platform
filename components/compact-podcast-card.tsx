// components/compact-podcast-card.tsx
// VERSIÓN: 6.0 (NicePod Shielded Compact Card - HTML5 Strict & Fallback Safe)
// Misión: Renderizar la cápsula compacta asegurando ruteo atómico y estabilidad visual.
// [ESTABILIZACIÓN]: Implementación de Absolute Overlay Routing y mitigación de Error 400 (Next Image).

"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Clock, Loader2, Lock, Pause, Play, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAudio } from "@/contexts/audio-context";
import { cn, formatTime } from "@/lib/utils";
import { PodcastWithProfile } from "@/types/podcast";

interface CompactPodcastCardProps {
  podcast: PodcastWithProfile;
}

export function CompactPodcastCard({ podcast }: CompactPodcastCardProps) {
  const { playPodcast, currentPodcast, isPlaying } = useAudio();

  // 1. ESTADO DE INTEGRIDAD (La "Forja")
  const isReady = podcast.processing_status === 'completed';
  const isCurrentlyPlaying = currentPodcast?.id === podcast.id && isPlaying;

  // 2. METADATOS SEGUROS
  const authorName = podcast.profiles?.full_name || "Comandante NicePod";
  const authorUsername = podcast.profiles?.username || "";
  
  /**
   * [ESCUDO ANTI-400]: Sanitización de Activos Visuales.
   * Si la URL no es válida o está vacía, no forzamos a Next/Image a optimizarla.
   * Usamos una bandera booleana para decidir si pintar un color sólido o la imagen.
   */
  const hasValidCover = useMemo(() => {
    return Boolean(podcast.cover_image_url && podcast.cover_image_url.startsWith('http'));
  }, [podcast.cover_image_url]);

  const hasValidAvatar = useMemo(() => {
    return Boolean(podcast.profiles?.avatar_url && podcast.profiles?.avatar_url.startsWith('http'));
  }, [podcast.profiles?.avatar_url]);

  /**
   * ACCIÓN: handlePlay
   * Disparo acústico atómico. Controlamos la propagación para no 
   * activar el enlace subyacente.
   */
  const handlePlay = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.preventDefault();
    if (!isReady) return;
    playPodcast(podcast);
  };

  return (
    <Card 
      className={cn(
        "relative overflow-hidden h-24 transition-all duration-500 group border shadow-lg bg-zinc-950/60 backdrop-blur-xl",
        isReady 
          ? "border-white/5 hover:border-primary/40 hover:shadow-primary/5 hover:-translate-y-1" 
          : "border-dashed border-zinc-800 opacity-60 grayscale-[0.6]"
      )}
    >
      {/* 
          3. EL ENLACE FANTASMA (ABSOLUTE OVERLAY ROUTING)
          Esto hace que toda la tarjeta sea clickable sin romper la especificación HTML5
          al evitar anidar botones o enlaces secundarios dentro de él.
      */}
      {isReady && (
        <Link 
          href={`/podcast/${podcast.id}`} 
          className="absolute inset-0 z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
          aria-label={`Escuchar el podcast ${podcast.title}`}
        />
      )}

      {/* --- FONDO CINEMÁTICO --- */}
      {hasValidCover ? (
        <Image
          src={podcast.cover_image_url!}
          alt={podcast.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover z-0 transition-transform duration-1000 group-hover:scale-105 opacity-30"
          priority={false} // Evita bloquear el hilo principal en carga inicial masiva
        />
      ) : (
        // Fallback Industrial (Zero-Error) si no hay imagen
        <div className="absolute inset-0 z-0 bg-gradient-to-tr from-zinc-950 to-primary/10 opacity-50" />
      )}
      
      {/* Cortina de Oscuridad (Legibilidad) */}
      <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/90 to-transparent z-0" />

      {/* --- ESTRUCTURA DE INFORMACIÓN SUPERFICIAL --- */}
      <div className="relative z-20 flex items-center justify-between h-full px-5 md:px-6">
        
        {/* BLOQUE IZQUIERDO (Avatar e Info) */}
        <div className="flex items-center gap-5 flex-1 min-w-0">
          
          {/* Avatar / Estado de Procesamiento */}
          <div className="relative h-14 w-14 rounded-2xl overflow-hidden border border-white/10 flex-shrink-0 shadow-inner bg-zinc-900 group-hover:border-primary/40 transition-colors">
            {hasValidAvatar ? (
              <Image 
                src={podcast.profiles!.avatar_url!} 
                alt={authorName} 
                fill 
                sizes="56px" 
                className="object-cover" 
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-zinc-800 text-zinc-500 font-black">
                {authorName.charAt(0).toUpperCase()}
              </div>
            )}

            {/* Overlay de Forja Activa */}
            {!isReady && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            )}
          </div>

          {/* Textos y Metadatos */}
          <div className="min-w-0 flex-1 flex flex-col justify-center mt-1">
            <h3 className="font-black text-base md:text-lg truncate text-white uppercase tracking-tight group-hover:text-primary transition-colors leading-none">
              {podcast.title}
            </h3>
            
            <div className="flex items-center gap-3 text-[10px] font-bold text-zinc-500 mt-2">
              
              {/* Enlace al creador (Posicionado sobre el enlace fantasma mediante z-index superior) */}
              <Link 
                href={`/profile/${authorUsername}`}
                className="truncate hover:text-white transition-colors relative z-30"
              >
                {authorName}
              </Link>
              
              <span className="flex items-center gap-1.5 border-l border-white/10 pl-3">
                {isReady ? (
                  <>
                    <Clock className="h-3 w-3 text-zinc-600" />
                    <span className="tracking-widest">
                      {podcast.duration_seconds ? formatTime(podcast.duration_seconds) : '0:00'}
                    </span>
                  </>
                ) : (
                  <span className="text-primary animate-pulse flex items-center gap-1 uppercase tracking-widest text-[9px]">
                    <Zap size={10} className="fill-primary" /> EN FORJA
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* BLOQUE DERECHO (Control Acústico) */}
        <div className="pl-4 shrink-0 relative z-30">
          <Button
            onClick={handlePlay}
            disabled={!isReady}
            size="icon"
            aria-label={isCurrentlyPlaying ? "Pausar resonancia" : "Reproducir resonancia"}
            className={cn(
              "w-12 h-12 rounded-full transition-all duration-300 border-none group/play",
              isReady
                ? "bg-white text-black hover:bg-primary hover:text-white shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] hover:scale-105"
                : "bg-zinc-900 text-zinc-700 opacity-50 cursor-not-allowed"
            )}
          >
            {isCurrentlyPlaying ? (
              <Pause className="h-5 w-5 fill-current" />
            ) : (
              <Play className="h-5 w-5 fill-current ml-1" />
            )}
          </Button>
        </div>

      </div>
    </Card>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Erradicación de Errores 400: La combinación de 'hasValidCover' y el operador 
 *    'startsWith("http")' garantiza que Next.js jamás intente solicitar imágenes 
 *    nulas a Supabase o procesar rutas relativas inválidas en el servidor.
 * 2. Absolute Overlay Routing: El <Link> fantasma (inset-0, z-10) permite hacer click 
 *    en toda la tarjeta para navegar, mientras que el botón de Play (z-30) y el nombre 
 *    del autor (z-30) mantienen su propia interactividad sin violar los estándares W3C.
 * 3. UX de Forja: Si el estado no es 'completed', el enlace fantasma ni siquiera se 
 *    renderiza, evitando clics muertos o redirecciones a páginas 404 de podcasts 
 *    aún en construcción.
 */