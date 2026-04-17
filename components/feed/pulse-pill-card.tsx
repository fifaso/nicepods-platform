/**
 * ARCHIVO: components/feed/pulse-pill-card.tsx
 * VERSIÓN: 2.0 (Madrid Resonance - Sovereign Edition)
 * PROTOCOLO: MADRID RESONANCE V7.0
 *
 * Misión: Renderizar la unidad mínima de inteligencia estratégica (Pulse).
 * [REFORMA V2.0]: Sincronización axial completa con el contrato purificado V7.0.
 * Eliminación de fugas snake_case y alineación absoluta con la Doctrina ZAP.
 *
 * Nivel de Integridad: 100% (Soberanía Nominal V7.0)
 */

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAudio } from "@/contexts/audio-context";
import { cn, formatTime } from "@/lib/utils";
import { PodcastWithProfile } from "@/types/podcast";
import {
  BookOpen,
  BrainCircuit,
  Clock,
  Globe,
  Loader2,
  Pause,
  Play
} from "lucide-react";
import Link from "next/link";
import React, { useMemo } from "react";

/**
 * INTERFAZ: PulsePillCardComponentProperties
 */
interface PulsePillCardComponentProperties {
  podcastSnapshot: PodcastWithProfile;
}

/**
 * getAuthorityStyleAction:
 * Sincroniza el color de la señal con el estándar de veracidad NicePod.
 */
const getAuthorityStyleAction = (authorityScoreMagnitude: number) => {
  if (authorityScoreMagnitude >= 9.0) return "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]";
  if (authorityScoreMagnitude >= 7.0) return "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]";
  return "bg-primary shadow-[0_0_10px_rgba(var(--primary),0.4)]";
};

export function PulsePillCard({ podcastSnapshot }: PulsePillCardComponentProperties) {
  const { playPodcastAction, currentActivePodcast, isAudioPlayingStatus } = useAudio();

  // --- I. EVALUACIÓN DE ESTADO ---
  const isIntelligenceReadyStatus = podcastSnapshot.intelligenceProcessingStatus === 'completed';
  const isCurrentlyPlayingStatus = currentActivePodcast?.identification === podcastSnapshot.identification && isAudioPlayingStatus;

  const intelligenceSourcesCollection = useMemo(() => {
    return podcastSnapshot.intelligenceSourcesCollection || [];
  }, [podcastSnapshot.intelligenceSourcesCollection]);

  // Calculamos la magnitud promedio de autoridad para la gema de la tarjeta.
  const averageAuthorityMagnitude = useMemo(() => {
    if (intelligenceSourcesCollection.length === 0) return 5.0;
    const scoreSumMagnitude = intelligenceSourcesCollection.reduce((accumulatorValue, sourceItem) => accumulatorValue + (sourceItem.authorityScoreValue || 7.0), 0);
    return scoreSumMagnitude / intelligenceSourcesCollection.length;
  }, [intelligenceSourcesCollection]);

  const handlePlaybackToggleAction = (mouseEvent: React.MouseEvent) => {
    mouseEvent.preventDefault();
    mouseEvent.stopPropagation();
    if (isIntelligenceReadyStatus) playPodcastAction(podcastSnapshot);
  };

  return (
    <Link
      href={`/podcast/${podcastSnapshot.identification}`}
      className={cn(
        "group block transition-all duration-500",
        !isIntelligenceReadyStatus && "cursor-wait"
      )}
    >
      <Card className="relative overflow-hidden aspect-[4/5] bg-slate-900 border-white/5 hover:border-primary/40 transition-all rounded-[2.5rem] shadow-2xl">

        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-black z-0" />

        <div className="absolute top-0 right-0 p-6 opacity-[0.03] text-white group-hover:scale-110 transition-transform duration-1000 z-0">
          <BrainCircuit size={100} />
        </div>

        <CardContent className="relative h-full flex flex-col p-6 justify-between z-10">

          <div className="flex justify-between items-start">
            <div className="flex flex-wrap gap-1.5 max-w-[70%]">
              {intelligenceSourcesCollection.slice(0, 3).map((sourceItem, sourceIndexMagnitude) => (
                <div key={sourceIndexMagnitude} className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[7px] font-black text-white/60 uppercase tracking-tighter">
                  {sourceItem.sourceAuthorityName?.substring(0, 3) || 'SRC'}
                </div>
              ))}
              {intelligenceSourcesCollection.length > 3 && <span className="text-[7px] text-white/20 font-bold">+{intelligenceSourcesCollection.length - 3}</span>}
            </div>

            <div className="flex items-center gap-2">
              <div className={cn("w-2 h-2 rounded-full", getAuthorityStyleAction(averageAuthorityMagnitude))} />
              <Badge className="bg-aurora animate-aurora text-white border-none text-[8px] font-black px-2 py-0">PULSE</Badge>
            </div>
          </div>

          <div className="space-y-3 mt-4">
            <div className="flex items-center gap-2 text-primary opacity-60">
              <BookOpen size={12} />
              <span className="text-[8px] font-black uppercase tracking-[0.2em]">Strategic Briefing</span>
            </div>
            <h3 className="text-lg md:text-xl font-black uppercase tracking-tighter leading-[1.1] text-white group-hover:text-primary transition-colors line-clamp-3">
              {podcastSnapshot.titleTextContent}
            </h3>
            <p className="text-[10px] text-muted-foreground font-medium line-clamp-3 leading-relaxed italic opacity-80">
              {podcastSnapshot.descriptionTextContent || "Analizando señales de mercado y avances de frontera..."}
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-[9px] font-black text-white/30 uppercase">
                <Clock size={12} /> {podcastSnapshot.playbackDurationSecondsTotal ? formatTime(podcastSnapshot.playbackDurationSecondsTotal) : '2:00'}
              </div>
              <div className="flex items-center gap-1 text-[9px] font-black text-blue-400/60 uppercase">
                <Globe size={12} /> {intelligenceSourcesCollection.length} FUENTES
              </div>
            </div>

            <Button
              onClick={handlePlaybackToggleAction}
              disabled={!isIntelligenceReadyStatus}
              size="icon"
              className={cn(
                "h-10 w-10 rounded-full transition-all border-none shadow-xl",
                isIntelligenceReadyStatus
                  ? "bg-white text-black hover:bg-primary hover:text-white"
                  : "bg-white/5 text-white/10 opacity-20"
              )}
            >
              {isCurrentlyPlayingStatus ? <Pause size={16} /> : <Play size={16} className="ml-0.5 fill-current" />}
            </Button>
          </div>

        </CardContent>

        {!isIntelligenceReadyStatus && (
          <div className="absolute inset-0 z-50 bg-black/40 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
            <div className="p-3 bg-zinc-950/80 rounded-2xl border border-white/10 shadow-2xl">
              <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto mb-2" />
              <p className="text-[9px] font-black uppercase tracking-widest text-white">Sintetizando Inteligencia</p>
            </div>
          </div>
        )}
      </Card>
    </Link>
  );
}
