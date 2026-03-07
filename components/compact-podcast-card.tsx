// components/compact-podcast-card.tsx
// VERSIÓN: 6.0 (NicePod Shielded Compact Card - HTML5 Strict & Fallback Safe)
// Misión: Renderizar la cápsula compacta asegurando ruteo atómico y estabilidad visual.
// [ESTABILIZACIÓN]: Implementación de Absolute Overlay Routing y mitigación de Error 400 (Next Image).

"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Clock, Loader2, Pause, Play, Zap } from "lucide-react";

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

  // 2. METADATOS SOBERANOS
  const authorName = podcast.profiles?.full_name || "Comandante NicePod";
  const authorUsername = podcast.profiles?.username || "admin";
  
  /**
   * [ESCUDO ANTI-400]: Sanitización de Activos Visuales.
   * Si la URL no es un HTTP válido, no usamos el componente Next/Image.
   * Esto previene que el servidor intente procesar nulls o URLs relativas rotas.
   */
  const hasValidCover = useMemo(() => {
    return Boolean(podcast.cover_image_url && podcast.cover_image_url.startsWith('http'));
  }, [podcast.cover_image_url]);

  const hasValidAvatar = useMemo(() => {
    return Boolean(podcast.profiles?.avatar_url && podcast.profiles?.avatar_url.startsWith('http'));
  }, [podcast.profiles?.avatar_url]);

  /**
   * ACCIÓN: handlePlay
   * Disparo acústico atómico. Detenemos la propagación para no 
   * activar la navegación a la página de detalle al pulsar Play.
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
        "relative overflow-hidden h-24 transition-all duration-500 group border shadow-lg bg-zinc-950/60 backdrop-blur-xl rounded-xl md:rounded-2xl",
        isReady 
          ? "border-white/5 hover:border-primary/40 hover:shadow-[0_0_20px_rgba(139,92,246,0.15)] hover:-translate-y-1" 
          : "border-dashed border-white/5 opacity-60 grayscale-[0.7]"
      )}
    >
      {/* 
          3. EL ENLACE FANTASMA (ABSOLUTE OVERLAY ROUTING)
          Permite hacer click en toda la tarjeta sin anidar botones dentro de enlaces (HTML5 Válido).
      */}
      {isReady && (
        <Link 
          href={`/podcast/${podcast.id}`} 
          className="absolute inset-0 z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
          aria-label={`Escuchar el podcast: ${podcast.title}`}
        />
      )}

      {/* --- CAPA FONDO: PORTADA O FALLBACK --- */}
      {hasValidCover ? (
        <Image
          src={podcast.cover_image_url!}
          alt={`Portada de ${podcast.title}`}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover z-0 transition-transform duration-1000 group-hover:scale-105 opacity-30"
          priority={false}
        />
      ) : (
        <div className="absolute inset-0 z-0 bg-gradient-to-tr from-black to-primary/10 opacity-50" />
      )}
      
      {/* Cortina de Oscuridad para asegurar que el texto blanco sea siempre legible */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#020202] via-[#020202]/90 to-transparent z-0" />

      {/* --- CAPA SUPERFICIAL: INFORMACIÓN E INTERACCIÓN --- */}
      <div className="relative z-20 flex items-center justify-between h-full px-4 md:px-6">
        
        {/* BLOQUE IZQUIERDO (Identidad y Título) */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          
          <div className="relative h-12 w-12 md:h-14 md:w-14 rounded-xl overflow-hidden border border-white/10 flex-shrink-0 shadow-inner bg-[#050505] group-hover:border-primary/40 transition-colors">
            {hasValidAvatar ? (
              <Image 
                src={podcast.profiles!.avatar_url!} 
                alt={authorName} 
                fill 
                sizes="56px" 
                className="object-cover" 
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-zinc-900 text-zinc-600 font-black uppercase">
                {authorName.charAt(0)}
              </div>
            )}

            {/* Overlay de Forja (Processing) */}
            {!isReady && (
              <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1 flex flex-col justify-center">
            <h3 className="font-black text-sm md:text-base truncate text-white uppercase tracking-tight group-hover:text-primary transition-colors leading-tight">
              {podcast.title}
            </h3>
            
            <div className="flex items-center gap-2.5 text-[9px] md:text-[10px] font-bold text-zinc-500 mt-1.5">
              
              {/* 
                  Enlace al perfil del curador. 
                  z-30 lo pone "por encima" del Link Fantasma.
              */}
              <Link 
                href={`/profile/${authorUsername}`}
                className="truncate hover:text-white transition-colors relative z-30"
              >
                {authorName}
              </Link>
              
              <span className="flex items-center gap-1.5 border-l border-white/10 pl-2.5">
                {isReady ? (
                  <>
                    <Clock className="h-3 w-3 text-zinc-600" />
                    <span className="tracking-widest uppercase">
                      {podcast.duration_seconds ? formatTime(podcast.duration_seconds) : '0:00'}
                    </span>
                  </>
                ) : (
                  <span className="text-primary animate-pulse flex items-center gap-1 uppercase tracking-widest">
                    <Zap size={10} className="fill-primary" /> FORJANDO
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* BLOQUE DERECHO (Controles de Resonancia) */}
        <div className="pl-4 shrink-0 relative z-30">
          <Button
            onClick={handlePlay}
            disabled={!isReady}
            size="icon"
            aria-label={isCurrentlyPlaying ? "Pausar resonancia" : "Reproducir resonancia"}
            className={cn(
              "w-10 h-10 md:w-12 md:h-12 rounded-full transition-all duration-300 border-none group/play",
              isReady
                ? "bg-white text-black hover:bg-primary hover:text-white shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] hover:scale-105"
                : "bg-zinc-900 text-zinc-800 opacity-40 cursor-not-allowed"
            )}
          >
            {isCurrentlyPlaying ? (
              <Pause className="h-4 w-4 md:h-5 md:w-5 fill-current" />
            ) : (
              <Play className="h-4 w-4 md:h-5 md:w-5 fill-current ml-1" />
            )}
          </Button>
        </div>

      </div>
    </Card>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Tolerancia a Fallos: Next.js 'Image' estricta el uso de URLs absolutas. 
 *    Con los validadores booleanos (hasValidCover), evitamos que la aplicación 
 *    entera falle por un avatar inexistente, sustituyéndolo con un UI nativo de CSS.
 * 2. Capas de Interactividad: HTML no permite un <button> dentro de un <a>.
 *    Al usar un enlace invisible (z-10) y elevar el botón de play (z-30), logramos
 *    que toda la tarjeta sea clickable sin romper los estándares web, manteniendo 
 *    una experiencia de "App Nativa".
 */