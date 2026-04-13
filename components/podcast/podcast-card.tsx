/**
 * ARCHIVO: components/podcast/podcast-card.tsx
 * VERSIÓN: 9.0 (NicePod Interactive Card - Nominal Integrity Edition)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Renderizar la unidad de conocimiento con navegabilidad atómica, 
 * gestionando estados de forja y protegiendo la integridad del Main Thread.
 * [REFORMA V9.0]: Cumplimiento absoluto de la Zero Abbreviations Policy y 
 * alineación con el contrato de datos V4.0.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { Clock, Lock, Pause, Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useMemo } from "react";

// --- INFRAESTRUCTURA UI ---
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { useAudio } from "@/contexts/audio-context";
import { cn, formatTime, getSafeAsset } from "@/lib/utils";

// --- SOBERANÍA DE TIPOS ---
import { PodcastWithProfile } from "@/types/podcast";

/**
 * INTERFAZ: PodcastCardProperties
 */
interface PodcastCardProperties {
  /** initialPodcastData: Objeto de datos del podcast incluyendo el perfil del autor. */
  initialPodcastData: PodcastWithProfile;
}

/**
 * PodcastCard: El nodo de visualización de capital intelectual.
 */
export function PodcastCard({ initialPodcastData }: PodcastCardProperties) {
  const navigationRouter = useRouter();
  const { playPodcastAction, currentActivePodcast, isAudioPlaying } = useAudio();

  // --- I. EVALUACIÓN DE ESTADO INDUSTRIAL ---
  const isIntelligenceReady = initialPodcastData.processing_status === 'completed';
  const isCurrentlyPlaying = currentActivePodcast?.id === initialPodcastData.id && isAudioPlaying;

  // --- II. EXTRACCIÓN DE IDENTIDAD SOBERANA ---
  const authorDisplayName = initialPodcastData.profiles?.full_name || "Creador NicePod";
  const authorUsernameIdentification = initialPodcastData.profiles?.username || "admin";

  /**
   * [ESCUDO ANTI-400]: Sanitización de Activos Visuales.
   * Misión: Prevenir errores de carga en el motor Next/Image mediante validación previa.
   */
  const coverImageUniformResourceLocator = useMemo(() => 
    getSafeAsset(initialPodcastData.cover_image_url, 'cover'), 
    [initialPodcastData.cover_image_url]
  );

  const authorProfileImageUniformResourceLocator = useMemo(() => 
    getSafeAsset(initialPodcastData.profiles?.avatar_url, 'avatar'), 
    [initialPodcastData.profiles?.avatar_url]
  );

  /**
   * handleCardSelectionAction:
   * Misión: Ejecutar la navegación programática hacia el dossier de inteligencia.
   */
  const handleCardSelectionAction = () => {
    if (isIntelligenceReady) {
      navigationRouter.push(`/podcast/${initialPodcastData.id}`);
    }
  };

  /**
   * handlePlaybackToggleAction:
   * Misión: Controlar el flujo acústico sin interferir en la navegación de la tarjeta.
   */
  const handlePlaybackToggleAction = (mouseEvent: React.MouseEvent<HTMLButtonElement>) => {
    mouseEvent.stopPropagation();
    mouseEvent.preventDefault();
    
    if (!isIntelligenceReady) {
      return;
    }
    
    playPodcastAction(initialPodcastData);
  };

  /**
   * handleProfileNavigationAction:
   * Misión: Permitir el acceso al perfil del curador aislando el evento de clic.
   */
  const handleProfileNavigationAction = (mouseEvent: React.MouseEvent<HTMLAnchorElement>) => {
    mouseEvent.stopPropagation();
  };

  return (
    <Card
      onClick={handleCardSelectionAction}
      className={cn(
        "flex flex-col h-full overflow-hidden transition-all duration-700 group border shadow-2xl bg-zinc-950/60 backdrop-blur-xl rounded-[2.5rem] cursor-pointer",
        isIntelligenceReady
          ? "border-white/5 hover:border-primary/40 hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.15)] hover:-translate-y-1.5"
          : "border-dashed border-zinc-900 opacity-60 grayscale-[0.7] cursor-default"
      )}
    >
      {/* --- CAPA FONDO: PORTADA Y CONTROLES ACÚSTICOS --- */}
      <div className="relative w-full h-52 flex-shrink-0">
        <Image
          src={coverImageUniformResourceLocator}
          alt={initialPodcastData.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          quality={80}
          className="object-cover z-0 transition-transform duration-[2000ms] group-hover:scale-110 opacity-40"
        />

        {/* Gradiente de Legibilidad de Malla */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent z-10" />

        {/* Indicador de Disponibilidad de Inteligencia */}
        <div className="absolute top-5 left-5 z-20">
          {initialPodcastData.audio_url && isIntelligenceReady && (
            <Badge className="bg-primary/10 text-primary border-primary/20 font-black text-[8px] uppercase tracking-[0.2em] px-3 py-1.5 rounded-lg backdrop-blur-md">
              Resonancia Activa
            </Badge>
          )}
        </div>

        {/* Botón de Reproducción Táctico */}
        <div className="absolute bottom-5 right-5 z-30">
          <Button
            onClick={handlePlaybackToggleAction}
            disabled={!isIntelligenceReady}
            size="icon"
            className={cn(
              "w-14 h-14 rounded-full transition-all duration-500 border-none shadow-2xl",
              isIntelligenceReady
                ? "bg-white text-black hover:bg-primary hover:text-white hover:scale-110"
                : "bg-zinc-900 text-zinc-700 opacity-50 cursor-not-allowed"
            )}
          >
            {isCurrentlyPlaying ? (
              <Pause className="h-6 w-6 fill-current" />
            ) : (
              <Play className="h-6 w-6 fill-current ml-1" />
            )}
          </Button>
        </div>
      </div>

      {/* --- CAPA SUPERFICIAL: DOSSIER NARRATIVO --- */}
      <CardContent className="p-7 flex-grow flex flex-col relative z-20">
        <CardTitle className="text-xl font-black uppercase tracking-tighter text-white leading-tight group-hover:text-primary transition-colors line-clamp-2 italic font-serif">
          {initialPodcastData.title}
        </CardTitle>
        <CardDescription className="text-sm text-zinc-500 mt-3 line-clamp-2 flex-grow leading-relaxed font-medium">
          {initialPodcastData.description}
        </CardDescription>

        <div className="flex items-center text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600 pt-8 mt-auto border-t border-white/5">
          {/* Vínculo de Autoría Soberana */}
          <Link
            href={`/profile/${authorUsernameIdentification}`}
            onClick={handleProfileNavigationAction}
            className="flex items-center gap-3 hover:text-primary transition-colors group/author"
          >
            <div className="h-7 w-7 rounded-full overflow-hidden border border-white/10 group-hover/author:border-primary transition-all shadow-lg">
              <Image 
                src={authorProfileImageUniformResourceLocator} 
                alt={authorDisplayName} 
                width={28} 
                height={28} 
                className="object-cover" 
              />
            </div>
            <span className="truncate max-w-[120px]">{authorDisplayName}</span>
          </Link>

          {/* Telemetría Temporal */}
          <div className="flex items-center gap-2 ml-auto text-zinc-700">
            {isIntelligenceReady ? (
              <>
                <Clock className="h-3 w-3" />
                <span className="tabular-nums tracking-widest">
                  {initialPodcastData.duration_seconds ? formatTime(initialPodcastData.duration_seconds) : '0:00'}
                </span>
              </>
            ) : (
              <span className="text-primary animate-pulse flex items-center gap-1.5 uppercase tracking-widest text-[8px]">
                <Lock size={10} /> PROCESO DE FORJA
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V9.0):
 * 1. Zero Abbreviations Policy: Se purificaron términos como 'props', 'podcast', 'id', 'router' 
 *    e 'isReady' para garantizar el cumplimiento del Dogma Técnico NicePod.
 * 2. Event Isolation: Se implementaron manejadores específicos (handlePlaybackToggleAction) 
 *    que utilizan 'stopPropagation' para asegurar que las acciones internas no disparen 
 *    la navegación de la tarjeta padre.
 * 3. Asset Integrity: La normalización mediante 'getSafeAsset' y el uso de 'useMemo' para 
 *    las URLs de imágenes previene colapsos de renderizado y optimiza el consumo de VRAM.
 */