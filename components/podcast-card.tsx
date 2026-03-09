// components/podcast-card.tsx
// VERSIÓN: 8.0 (NicePod Interactive Card - Click-Through Atomic Routing)
// Misión: Renderizar la unidad de conocimiento con navegabilidad atómica y protección contra 400s.
// [ESTABILIZACIÓN]: Implementación de navegación programática y gestión de estados de Forja.

"use client";

import { Clock, Lock, Pause, Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useMemo } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { useAudio } from "@/contexts/audio-context";
import { cn, formatTime, getSafeAsset } from "@/lib/utils";
import { PodcastWithProfile } from "@/types/podcast";

interface PodcastCardProps {
  podcast: PodcastWithProfile;
}

/**
 * COMPONENTE: PodcastCard
 * Representa un nodo de conocimiento en la biblioteca de NicePod.
 * 
 * [ESTRATEGIA DE NAVEGACIÓN]: 
 * Se ha eliminado el 'Link' absoluto que cubría la tarjeta para evitar colisiones 
 * con elementos interactivos internos (Play, Perfil). Utilizamos navegación 
 * programática y propagación controlada de eventos.
 */
export function PodcastCard({ podcast }: PodcastCardProps) {
  const router = useRouter();
  const { playPodcast, currentPodcast, isPlaying } = useAudio();

  // 1. ESTADO DE INTEGRIDAD (La Forja)
  const isReady = podcast.processing_status === 'completed';
  const isCurrentlyPlaying = currentPodcast?.id === podcast.id && isPlaying;

  // 2. METADATOS SOBERANOS
  const authorName = podcast.profiles?.full_name || "Creador NicePod";
  const authorUsername = podcast.profiles?.username || "admin";

  /**
   * [ESCUDO ANTI-400]: Sanitización de Activos Visuales.
   * Evita errores 400 de Next/Image al no solicitar assets inexistentes.
   */
  const coverUrl = useMemo(() => getSafeAsset(podcast.cover_image_url, 'cover'), [podcast.cover_image_url]);
  const authorImage = useMemo(() => getSafeAsset(podcast.profiles?.avatar_url, 'avatar'), [podcast.profiles?.avatar_url]);

  /**
   * ACCIÓN: handleCardClick
   * Navegación programática. Solo ocurre si el activo está listo.
   */
  const handleCardClick = () => {
    if (isReady) {
      router.push(`/podcast/${podcast.id}`);
    }
  };

  /**
   * ACCIÓN: handlePlay
   * Disparo acústico atómico. Controlamos la propagación para no 
   * activar la navegación a la página de detalle al pulsar Play.
   */
  const handlePlay = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.preventDefault();
    if (!isReady) return;
    playPodcast(podcast);
  };

  /**
   * ACCIÓN: handleProfileClick
   * Permite ir al perfil del curador sin activar el clic de la tarjeta.
   */
  const handleProfileClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.stopPropagation();
  };

  return (
    <Card
      onClick={handleCardClick}
      className={cn(
        "flex flex-col h-full overflow-hidden transition-all duration-500 group border shadow-lg bg-zinc-950/60 backdrop-blur-xl rounded-[2rem] cursor-pointer",
        isReady
          ? "border-white/5 hover:border-primary/40 hover:shadow-[0_0_20px_rgba(139,92,246,0.15)] hover:-translate-y-1"
          : "border-dashed border-zinc-800 opacity-70 grayscale-[0.5] cursor-default"
      )}
    >
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

        {/* Botón de Reproducción: Accionable independientemente */}
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
          {/* Enlace al perfil con prevención de propagación */}
          <Link
            href={`/profile/${authorUsername}`}
            onClick={handleProfileClick}
            className="flex items-center gap-2 hover:text-primary transition-colors"
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
                <span className="tracking-widest uppercase">{podcast.duration_seconds ? formatTime(podcast.duration_seconds) : '0:00'}</span>
              </>
            ) : (
              <span className="text-primary animate-pulse flex items-center gap-1 uppercase tracking-widest text-[9px]">
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
 * 1. Independencia Funcional: Al usar 'router.push' en lugar de un <Link> envolvente, 
 *    los componentes hijos (Play Button, Link al perfil) pueden tener sus propios 
 *    eventos sin causar colisiones.
 * 2. Cero Errores 400: La normalización mediante 'getSafeAsset' garantiza 
 *    que ninguna URL de imagen vacía toque el componente <Image>.
 * 3. UX de Forja: El estado 'grayscale' y el botón deshabilitado informan 
 *    al usuario sobre la inmadurez del activo sin necesidad de alertas de sistema.
 */