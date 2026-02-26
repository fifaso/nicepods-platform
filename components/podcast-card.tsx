// components/podcast-card.tsx
// VERSIÓN: 2.0

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAudio } from "@/contexts/audio-context";
import { cn, formatTime } from "@/lib/utils";
import { PodcastWithProfile } from "@/types/podcast";
import { Clock, Pause, Play, User as UserIcon, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type React from "react";

interface PodcastCardProps {
  podcast: PodcastWithProfile;
}

/**
 * COMPONENTE: PodcastCard
 * La unidad de valor fundamental de la Biblioteca NicePod V2.5.
 * 
 * [ARQUITECTURA VISUAL]:
 * - Glassmorphism V2: Fondo bg-white/[0.02] con backdrop-blur extremo.
 * - Tipografía Industrial: Tracking-tighter y font-black para títulos.
 * - Hover Cinematic: Escalado de imagen y revelación de bordes Aurora.
 */
export function PodcastCard({ podcast }: PodcastCardProps) {
  const { playPodcast, currentPodcast, isPlaying } = useAudio();

  const handlePlay = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.preventDefault();
    playPodcast(podcast);
  };

  const isCurrentlyPlaying = currentPodcast?.id === podcast.id && isPlaying;
  const authorName = podcast.profiles?.full_name || "Curador Anónimo";
  const authorImage = podcast.profiles?.avatar_url;
  const authorUsername = podcast.profiles?.username;

  return (
    <Link href={`/podcast/${podcast.id}`} className="group block outline-none">
      <article className={cn(
        "flex flex-col h-full overflow-hidden transition-all duration-700",
        "bg-white/[0.02] backdrop-blur-2xl rounded-[2.5rem]",
        "border border-white/5 group-hover:border-primary/40",
        "shadow-2xl group-hover:shadow-primary/10 relative"
      )}>

        {/* I. ESCENARIO VISUAL (COVER) */}
        <div className="relative w-full h-56 md:h-64 overflow-hidden">
          <Image
            src={podcast.cover_image_url || "/images/placeholder-logo.svg"}
            alt={podcast.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            quality={80}
            className="object-cover transition-transform duration-1000 ease-[0.16, 1, 0.3, 1] group-hover:scale-110 opacity-80 group-hover:opacity-100"
          />

          {/* Velo de contraste Aurora */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-80" />

          {/* Badge de Estado: Audio Ready */}
          <div className="absolute top-5 left-5">
            <Badge className="bg-primary/20 text-primary border-primary/30 backdrop-blur-md font-black text-[8px] uppercase tracking-[0.3em] px-3 py-1 rounded-full">
              <Zap size={10} className="mr-1.5 fill-current" />
              Sincronizado
            </Badge>
          </div>

          {/* Gatillo de Reproducción (Mecánico) */}
          <div className="absolute bottom-5 right-5 z-20">
            <Button
              onClick={handlePlay}
              size="icon"
              className={cn(
                "w-14 h-14 rounded-2xl transition-all duration-500 shadow-2xl",
                isCurrentlyPlaying
                  ? "bg-white text-black scale-110"
                  : "bg-primary text-white hover:bg-primary/90 scale-100 group-hover:scale-105"
              )}
            >
              {isCurrentlyPlaying ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6 fill-current translate-x-0.5" />
              )}
            </Button>
          </div>
        </div>

        {/* II. CUERPO NARRATIVO */}
        <div className="p-7 flex-grow flex flex-col space-y-4">
          <div className="space-y-2">
            <h3 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter leading-[0.9] text-white group-hover:text-primary transition-colors duration-500 line-clamp-2">
              {podcast.title}
            </h3>
            <p className="text-xs font-medium text-zinc-500 line-clamp-2 leading-relaxed italic">
              {podcast.description}
            </p>
          </div>

          {/* III. PIE DE AUTORÍA (METADATOS) */}
          <div className="flex items-center justify-between pt-6 mt-auto border-t border-white/5">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative h-7 w-7 rounded-full overflow-hidden border border-white/10 shrink-0">
                {authorImage ? (
                  <Image
                    src={authorImage}
                    alt={authorName}
                    fill
                    sizes="28px"
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-zinc-800 flex items-center justify-center">
                    <UserIcon size={12} className="text-zinc-500" />
                  </div>
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-black text-white/80 uppercase tracking-widest truncate">
                  {authorName}
                </span>
                <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-tighter">
                  @{authorUsername || 'curador'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-zinc-500 bg-white/5 px-3 py-1 rounded-full border border-white/5">
              <Clock size={10} className="text-primary/60" />
              <span className="text-[9px] font-black tabular-nums tracking-widest">
                {podcast.duration_seconds ? formatTime(podcast.duration_seconds) : 'V-NUL'}
              </span>
            </div>
          </div>
        </div>

      </article>
    </Link>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Densidad Tipográfica: Se aumentó el tamaño de los títulos y se usó 'leading-[0.9]' 
 *    para lograr ese aspecto compacto y agresivo de NicePod.
 * 2. Hit-boxes: El botón de Play es ahora de 56px (w-14), garantizando accesibilidad 
 *    táctil premium.
 * 3. Estética de Hardware: La tarjeta abandona el radio de borde estándar por un 
 *    'rounded-[2.5rem]', alineándose con el panel de navegación superior.
 */