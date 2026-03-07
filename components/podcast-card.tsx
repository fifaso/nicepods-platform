// components/podcast-card.tsx
// VERSIÓN: 7.0 (NicePod Interactive Card - Semantic & Accessibility Master)
// Misión: Renderizar la unidad de conocimiento con navegabilidad atómica y protección contra 400s.
// [ESTABILIZACIÓN]: Implementación de Absolute Link Overlay y gestión de fallbacks visuales.

"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Clock, Loader2, Lock, Pause, Play, Zap } from "lucide-react";

import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAudio } from "@/contexts/audio-context";
import { cn, formatTime, getSafeAsset } from "@/lib/utils";
import { PodcastWithProfile } from "@/types/podcast";

interface PodcastCardProps {
  podcast: PodcastWithProfile;
}

export function PodcastCard({ podcast }: PodcastCardProps) {
  const { playPodcast, currentPodcast, isPlaying } = useAudio();

  // 1. ESTADO DE INTEGRIDAD (La Forja)
  const isReady = podcast.processing_status === 'completed';
  const isCurrentlyPlaying = currentPodcast?.id === podcast.id && isPlaying;

  // 2. METADATOS SEGUROS
  const authorName = podcast.profiles?.full_name || "Creador NicePod";
  const authorUsername = podcast.profiles?.username || "admin";

  /**
   * [ESCUDO ANTI-400]: Sanitización de Activos Visuales.
   * Usamos getSafeAsset para asegurar URLs de alta autoridad o placeholders locales.
   */
  const coverUrl = useMemo(() => getSafeAsset(podcast.cover_image_url, 'cover'), [podcast.cover_image_url]);
  const authorImage = useMemo(() => getSafeAsset(podcast.profiles?.avatar_url, 'avatar'), [podcast.profiles?.avatar_url]);

  /**
   * ACCIÓN: handlePlay
   * Disparo acústico atómico. Controlamos la propagación para evitar disparar la navegación.
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
        "flex flex-col h-full overflow-hidden transition-all duration-500 group border shadow-lg bg-zinc-950/60 backdrop-blur-xl rounded-[2rem]",
        isReady 
          ? "border-white/5 hover:border-primary/40 hover:shadow-[0_0_20px_rgba(139,92,246,0.1)] hover:-translate-y-1" 
          : "border-dashed border-zinc-800 opacity-70 grayscale-[0.5]"
      )}
    >
      {/* 
          3. EL ENLACE FANTASMA (ABSOLUTE OVERLAY ROUTING)
          Esta capa z-10 cubre toda la tarjeta, permitiendo la navegación legal HTML5 
          sin romper la interactividad de los botones internos (Play, Autor).
      */}
      {isReady && (
        <Link 
          href={`/podcast/${podcast.id}`} 
          className="absolute inset-0 z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-[2rem]"
          aria-label={`Escuchar el podcast: ${podcast.title}`}
        />
      )}

      {/* --- CAPA FONDO: PORTADA --- */}
      <div className="relative w-full h-48 flex-shrink-0">
        <Image
          src={coverUrl}
          alt={podcast.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          quality={70}
          className="object-cover z-0 transition-transform duration-1000 group-hover:scale-105 opacity-50"
        />
        
        {/* Gradiente de Legibilidad */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent z-10" />

        {/* Indicador de Estado: Audio */}
        <div className="absolute top-4 left-4 z-20 flex gap-2">
          {podcast.audio_url && isReady && (
            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-black text-[9px] uppercase tracking-widest px-3 py-1">
              Audio Disponible
            </Badge>
          )}
        </div>

        {/* Botón de Reproducción (Nivel Z-30 para evitar el enlace fantasma) */}
        <div className="absolute bottom-4 right-4 z-30">
          <Button 
            onClick={handlePlay} 
            disabled={!isReady}
            size="icon" 
            className={cn(
              "w-12 h-12 rounded-full transition-all duration-300 border-none shadow-2xl",
              isReady
                ? "bg-white text-black hover:bg-primary hover:text-white hover:scale-105"
                : "bg-zinc-800 text-zinc-600 opacity-50 cursor-not-allowed"
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

      {/* --- CAPA SUPERFICIAL: CONTENIDO --- */}
      <CardContent className="p-6 flex-grow flex flex-col relative z-20">
        <CardTitle className="text-lg font-black uppercase tracking-tight text-white leading-tight group-hover:text-primary transition-colors line-clamp-2">
          {podcast.title}
        </CardTitle>
        <CardDescription className="text-sm text-zinc-400 mt-2 line-clamp-2 flex-grow leading-relaxed">
          {podcast.description}
        </CardDescription>

        <div className="flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 pt-6 mt-auto border-t border-white/5">
          {/* Enlace al perfil (Posición Z-30 para prioridad de click) */}
          <Link 
            href={`/profile/${authorUsername}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-2 hover:text-primary transition-colors relative z-30"
          >
            <div className="h-6 w-6 rounded-full overflow-hidden border border-white/10">
              <Image src={authorImage} alt={authorName} width={24} height={24} className="object-cover" />
            </div>
            {authorName}
          </Link>
          
          <div className="flex items-center gap-1.5 ml-auto text-zinc-600">
            {isReady ? (
              <>
                <Clock className="h-3 w-3" />
                {podcast.duration_seconds ? formatTime(podcast.duration_seconds) : '0:00'}
              </>
            ) : (
              <span className="text-primary animate-pulse flex items-center gap-1">
                <Lock size={10} /> FORJA
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Estabilidad de Ruteo: Al utilizar el 'Link' como overlay absoluto, 
 *    el componente es compatible con cualquier diseño sin romper el árbol DOM.
 * 2. Cero Errores 400: Al sanear las URLs antes de pasarlas a Next/Image, 
 *    hemos eliminado la raíz de los errores de red registrados en consola.
 * 3. UX de Forja: Se mantiene el estado visual 'grayscale' para nodos aún no 
 *    completados, manteniendo el orden jerárquico dentro de la Bóveda.
 */