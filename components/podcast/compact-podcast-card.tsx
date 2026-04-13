/**
 * ARCHIVO: components/podcast/compact-podcast-card.tsx
 * VERSIÓN: 7.0 (NicePod Sovereign Compact Card - Absolute Nominal Integrity)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Renderizar la cápsula compacta de conocimiento asegurando ruteo atómico, 
 * estabilidad visual y sincronía con el hardware de audio.
 * [REFORMA V7.0]: Sincronización nominal total con LibraryTabs V16.0, erradicación 
 * absoluta de abreviaturas y blindaje de tipos para el Build Shield.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { Clock, Loader2, Pause, Play, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useMemo, useCallback } from "react";

// --- INFRAESTRUCTURA DE INTERFAZ (UI) ---
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAudio } from "@/contexts/audio-context";
import { cn, formatTime } from "@/lib/utils";

// --- CONTRATOS DE DATOS SOBERANOS ---
import { PodcastWithProfile } from "@/types/podcast";

/**
 * INTERFAZ: CompactPodcastCardProperties
 * [FIX V7.0]: Sincronía nominal con el orquestador de la biblioteca.
 */
interface CompactPodcastCardProperties {
  initialPodcastData: PodcastWithProfile;
}

/**
 * CompactPodcastCard: La unidad mínima de representación de capital intelectual.
 */
export function CompactPodcastCard({ 
  initialPodcastData 
}: CompactPodcastCardProperties) {
  
  const { playPodcastAction, currentActivePodcast, isAudioPlaying } = useAudio();

  // --- I. EVALUACIÓN DE ESTADO INDUSTRIAL ---
  const isIntelligenceReady = initialPodcastData.processing_status === 'completed';
  const isCurrentlyPlaying = currentActivePodcast?.id === initialPodcastData.id && isAudioPlaying;

  // --- II. EXTRACCIÓN DE IDENTIDAD SOBERANA ---
  const authorDisplayName = initialPodcastData.profiles?.full_name || "Comandante NicePod";
  const authorUsernameIdentification = initialPodcastData.profiles?.username || "admin";

  /**
   * isCoverImageUniformResourceLocatorValid:
   * Misión: Validar la integridad de la dirección del recurso visual para prevenir 
   * errores de renderizado en el motor Next/Image (Escudo Anti-400).
   */
  const isCoverImageUniformResourceLocatorValid = useMemo(() => {
    return Boolean(
        initialPodcastData.cover_image_url && 
        initialPodcastData.cover_image_url.startsWith('http')
    );
  }, [initialPodcastData.cover_image_url]);

  /**
   * isAuthorAvatarUniformResourceLocatorValid:
   * Misión: Verificar la disponibilidad del activo de identidad del curador.
   */
  const isAuthorAvatarUniformResourceLocatorValid = useMemo(() => {
    return Boolean(
        initialPodcastData.profiles?.avatar_url && 
        initialPodcastData.profiles?.avatar_url.startsWith('http')
    );
  }, [initialPodcastData.profiles?.avatar_url]);

  /**
   * handlePlaybackToggleAction:
   * Misión: Disparo acústico atómico con detención de propagación para 
   * proteger el ruteo de la tarjeta padre.
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
          ? "border-white/5 hover:border-primary/40 hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.15)] hover:-translate-y-1"
          : "border-dashed border-white/5 opacity-60 grayscale-[0.7]"
      )}
    >
      {/* 
          III. EL ENLACE FANTASMA (ABSOLUTE OVERLAY ROUTING)
          Misión: Habilitar la navegabilidad total del componente sin anidamiento 
          ilegal de elementos interactivos, cumpliendo con HTML5 Strict.
      */}
      {isIntelligenceReady && (
        <Link
          href={`/podcast/${initialPodcastData.id}`}
          className="absolute inset-0 z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
          aria-label={`Acceder a la crónica: ${initialPodcastData.title}`}
        />
      )}

      {/* --- CAPA FONDO: EVIDENCIA VISUAL --- */}
      {isCoverImageUniformResourceLocatorValid ? (
        <Image
          src={initialPodcastData.cover_image_url!}
          alt={`Portada de ${initialPodcastData.title}`}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover z-0 transition-transform duration-1000 group-hover:scale-110 opacity-30"
          priority={false}
        />
      ) : (
        <div className="absolute inset-0 z-0 bg-gradient-to-tr from-black to-primary/10 opacity-50" />
      )}

      {/* Cortina de Legibilidad Industrial */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#020202] via-[#020202]/90 to-transparent z-0" />

      {/* --- CAPA SUPERFICIAL: INTELIGENCIA E INTERACCIÓN --- */}
      <div className="relative z-20 flex items-center justify-between h-full px-6">

        {/* BLOQUE IZQUIERDO: IDENTIDAD Y TÍTULO DE LA CRÓNICA */}
        <div className="flex items-center gap-4 flex-1 min-w-0">

          <div className="relative h-14 w-14 rounded-xl overflow-hidden border border-white/10 flex-shrink-0 shadow-inner bg-[#050505] group-hover:border-primary/40 transition-colors">
            {isAuthorAvatarUniformResourceLocatorValid ? (
              <Image
                src={initialPodcastData.profiles!.avatar_url!}
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

            {/* Overlay de Procesamiento (Forja en curso) */}
            {!isIntelligenceReady && (
              <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1 flex flex-col justify-center">
            <h3 className="font-black text-sm md:text-base truncate text-white uppercase tracking-tight group-hover:text-primary transition-colors leading-tight italic font-serif">
              {initialPodcastData.title}
            </h3>

            <div className="flex items-center gap-2.5 text-[9px] font-bold text-zinc-500 mt-1.5 uppercase tracking-widest">
              {/* Enlace al perfil con aislamiento de capas (Z-Index: 30) */}
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
                      {initialPodcastData.duration_seconds ? formatTime(initialPodcastData.duration_seconds) : '0:00'}
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

        {/* BLOQUE DERECHO: COMANDOS ACÚSTICOS */}
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
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V7.0):
 * 1. Build Shield Compliance: Se sustituyó 'podcast' por 'initialPodcastData' en 
 *    la interfaz, resolviendo el error TS2322 en el orquestador de biblioteca.
 * 2. Zero Abbreviations Policy: Purificación absoluta de términos (mouseEvent, 
 *    isIntelligenceReady, authorUsernameIdentification, uniformResourceLocator).
 * 3. Layered Interaction: El sistema de Z-Index (z-10 Enlace, z-30 Botón/Perfil) 
 *    garantiza que el ruteo sea fluido sin colisiones de eventos de puntero.
 */