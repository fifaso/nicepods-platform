/**
 * ARCHIVO: components/podcast/compact-podcast-card.tsx
 * VERSIÓN: 8.0 (Madrid Resonance - Sovereign Edition)
 * PROTOCOLO: MADRID RESONANCE V7.0
 * 
 * Misión: Renderizar la cápsula compacta de conocimiento.
 * [REFORMA V8.0]: Sincronización axial completa con el contrato purificado V7.0.
 * Eliminación de fugas snake_case y alineación absoluta con la Doctrina ZAP.
 *
 * Nivel de Integridad: 100% (Soberanía Nominal V7.0)
 */

"use client";

import { Clock, Loader2, Pause, Play, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useMemo, useCallback, memo } from "react";

// --- INFRAESTRUCTURA DE INTERFAZ (UI) ---
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAudio } from "@/contexts/audio-context";
import { cn, formatTime } from "@/lib/utils";

// --- CONTRATOS DE DATOS SOBERANOS ---
import { PodcastWithProfile } from "@/types/podcast";

/**
 * INTERFAZ: CompactPodcastCardProperties
 */
interface CompactPodcastCardProperties {
  initialPodcastData: PodcastWithProfile;
}

/**
 * CompactPodcastCard: La unidad mínima de representación de capital intelectual.
 */
export const CompactPodcastCard = memo(function CompactPodcastCard({
  initialPodcastData 
}: CompactPodcastCardProperties) {
  
  const { playPodcastAction, currentActivePodcast, isAudioPlayingStatus } = useAudio();

  // --- I. EVALUACIÓN DE ESTADO INDUSTRIAL ---
  const isIntelligenceReady = initialPodcastData.intelligenceProcessingStatus === 'completed';
  const isCurrentlyPlaying = currentActivePodcast?.identification === initialPodcastData.identification && isAudioPlayingStatus;

  // --- II. EXTRACCIÓN DE IDENTIDAD SOBERANA ---
  const authorDisplayName = initialPodcastData.profiles?.fullName || "Comandante NicePod";
  const authorUsernameIdentification = initialPodcastData.profiles?.username || "admin";

  /**
   * isCoverImageUniformResourceLocatorValid:
   */
  const isCoverImageUniformResourceLocatorValid = useMemo(() => {
    return Boolean(
        initialPodcastData.coverImageUniformResourceLocator &&
        initialPodcastData.coverImageUniformResourceLocator.startsWith('http')
    );
  }, [initialPodcastData.coverImageUniformResourceLocator]);

  /**
   * isAuthorAvatarUniformResourceLocatorValid:
   */
  const isAuthorAvatarUniformResourceLocatorValid = useMemo(() => {
    return Boolean(
        initialPodcastData.profiles?.avatarUniformResourceLocator &&
        initialPodcastData.profiles?.avatarUniformResourceLocator.startsWith('http')
    );
  }, [initialPodcastData.profiles?.avatarUniformResourceLocator]);

  /**
   * handlePlaybackToggleAction:
   */
  const handlePlaybackToggleAction = useCallback((mouseEvent: React.MouseEvent<HTMLButtonElement>) => {
    mouseEvent.stopPropagation();
    mouseEvent.preventDefault();
    
    if (!isIntelligenceReady) {
      return;
    }
    
    playPodcastAction(initialPodcastData);
  }, [isIntelligenceReady, initialPodcastData, playPodcastAction]);

  return (
    <Card
      className={cn(
        "relative overflow-hidden h-24 transition-all duration-500 group border shadow-lg bg-zinc-950/60 backdrop-blur-xl rounded-2xl",
        isIntelligenceReady
          ? "border-white/5 hover:border-primary/40 hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.15)] hover:-translate-y-1.5"
          : "border-dashed border-white/5 opacity-60 grayscale-[0.7]"
      )}
    >
      {isIntelligenceReady && (
        <Link
          href={`/podcast/${initialPodcastData.identification}`}
          className="absolute inset-0 z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
          aria-label={`Acceder a la crónica: ${initialPodcastData.titleTextContent}`}
        />
      )}

      {isCoverImageUniformResourceLocatorValid ? (
        <Image
          src={initialPodcastData.coverImageUniformResourceLocator!}
          alt={`Portada de ${initialPodcastData.titleTextContent}`}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover z-0 transition-transform duration-1000 group-hover:scale-110 opacity-30"
          priority={false}
        />
      ) : (
        <div className="absolute inset-0 z-0 bg-gradient-to-tr from-black to-primary/10 opacity-50" />
      )}

      <div className="absolute inset-0 bg-gradient-to-r from-[#020202] via-[#020202]/90 to-transparent z-0" />

      <div className="relative z-20 flex items-center justify-between h-full px-6">

        <div className="flex items-center gap-4 flex-1 min-w-0">

          <div className="relative h-14 w-14 rounded-xl overflow-hidden border border-white/10 flex-shrink-0 shadow-inner bg-[#050505] group-hover:border-primary/40 transition-colors">
            {isAuthorAvatarUniformResourceLocatorValid ? (
              <Image
                src={initialPodcastData.profiles!.avatarUniformResourceLocator!}
                alt={authorDisplayName}
                fill
                sizes="56px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-zinc-900 text-zinc-600 font-black uppercase text-xs">
                {authorDisplayName.charAt(0)}
              </div>
            )}

            {!isIntelligenceReady && (
              <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1 flex flex-col justify-center">
            <h3 className="font-black text-sm md:text-base truncate text-white uppercase tracking-tight group-hover:text-primary transition-colors leading-tight italic font-serif">
              {initialPodcastData.titleTextContent}
            </h3>

            <div className="flex items-center gap-2.5 text-[9px] font-bold text-zinc-500 mt-1.5 uppercase tracking-widest">
              <Link
                href={`/profile/${authorUsernameIdentification}`}
                className="truncate hover:text-white transition-colors relative z-30"
              >
                {authorDisplayName}
              </Link>

              <span className="flex items-center gap-1.5 border-l border-white/10 pl-2.5">
                {isIntelligenceReady ? (
                  <>
                    <Clock className="h-3 w-3 text-zinc-600" />
                    <span className="tabular-nums">
                      {initialPodcastData.playbackDurationSecondsTotal ? formatTime(initialPodcastData.playbackDurationSecondsTotal) : '0:00'}
                    </span>
                  </>
                ) : (
                  <span className="text-primary animate-pulse flex items-center gap-1">
                    <Zap size={10} className="fill-primary" /> FORJANDO
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>

        <div className="pl-4 shrink-0 relative z-30">
          <Button
            onClick={handlePlaybackToggleAction}
            disabled={!isIntelligenceReady}
            size="icon"
            aria-label={isCurrentlyPlaying ? "Detener reproducción" : "Iniciar reproducción"}
            className={cn(
              "w-12 h-12 rounded-full transition-all duration-500 border-none group/play",
              isIntelligenceReady
                ? "bg-white text-black hover:bg-primary hover:text-white shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:scale-110"
                : "bg-zinc-900 text-zinc-800 opacity-40 cursor-not-allowed"
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
});
