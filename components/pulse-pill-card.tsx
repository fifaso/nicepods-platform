// components/pulse-pill-card.tsx
// VERSIÓN: 1.0 (Pulse Identity Card - Strategic Intelligence UI)

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

interface PulsePillCardProps {
  podcast: PodcastWithProfile;
}

/**
 * getAuthorityStyle
 * Sincroniza el color de la señal con el estándar de veracidad NicePod.
 */
const getAuthorityStyle = (score: number) => {
  if (score >= 9.0) return "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]";
  if (score >= 7.0) return "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]";
  return "bg-primary shadow-[0_0_10px_rgba(var(--primary),0.4)]";
};

export function PulsePillCard({ podcast }: PulsePillCardProps) {
  const { playPodcast, currentPodcast, isPlaying } = useAudio();

  // --- LÓGICA DE ESTADO ---
  const isReady = podcast.processing_status === 'completed';
  const isCurrentlyPlaying = currentPodcast?.id === podcast.id && isPlaying;

  const sources = useMemo(() => {
    return (podcast.sources as any[]) || [];
  }, [podcast.sources]);

  // Calculamos el score promedio de autoridad para la gema de la tarjeta
  const avgAuthority = useMemo(() => {
    if (sources.length === 0) return 5.0;
    const sum = sources.reduce((acc, s) => acc + (s.authority_score || 7.0), 0);
    return sum / sources.length;
  }, [sources]);

  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isReady) playPodcast(podcast);
  };

  return (
    <Link
      href={`/podcast/${podcast.id}`}
      className={cn(
        "group block transition-all duration-500",
        !isReady && "cursor-wait"
      )}
    >
      <Card className="relative overflow-hidden aspect-[4/5] bg-slate-950 border-white/5 hover:border-primary/40 transition-all rounded-[2.5rem] shadow-2xl">

        {/* 1. CAPA DE FONDO: Gradiente Atmosférico */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-black z-0" />

        {/* Decoración técnica */}
        <div className="absolute top-0 right-0 p-6 opacity-[0.03] text-white group-hover:scale-110 transition-transform duration-1000 z-0">
          <BrainCircuit size={100} />
        </div>

        {/* 2. CONTENIDO PRINCIPAL */}
        <CardContent className="relative h-full flex flex-col p-6 justify-between z-10">

          {/* HEADER: Siglas de Fuentes y Gema */}
          <div className="flex justify-between items-start">
            <div className="flex flex-wrap gap-1.5 max-w-[70%]">
              {sources.slice(0, 3).map((s, i) => (
                <div key={i} className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[7px] font-black text-white/60 uppercase tracking-tighter">
                  {s.source_name?.substring(0, 3) || 'SRC'}
                </div>
              ))}
              {sources.length > 3 && <span className="text-[7px] text-white/20 font-bold">+{sources.length - 3}</span>}
            </div>

            <div className="flex items-center gap-2">
              <div className={cn("w-2 h-2 rounded-full", getAuthorityStyle(avgAuthority))} />
              <Badge className="bg-aurora animate-aurora text-white border-none text-[8px] font-black px-2 py-0">PULSE</Badge>
            </div>
          </div>

          {/* CUERPO: Título e Insight */}
          <div className="space-y-3 mt-4">
            <div className="flex items-center gap-2 text-primary opacity-60">
              <BookOpen size={12} />
              <span className="text-[8px] font-black uppercase tracking-[0.2em]">Strategic Briefing</span>
            </div>
            <h3 className="text-lg md:text-xl font-black uppercase tracking-tighter leading-[1.1] text-white group-hover:text-primary transition-colors line-clamp-3">
              {podcast.title}
            </h3>
            <p className="text-[10px] text-muted-foreground font-medium line-clamp-3 leading-relaxed italic opacity-80">
              {podcast.description || "Analizando señales de mercado y avances de frontera..."}
            </p>
          </div>

          {/* FOOTER: Métricas y Play */}
          <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-[9px] font-black text-white/30 uppercase">
                <Clock size={12} /> {podcast.duration_seconds ? formatTime(podcast.duration_seconds) : '2:00'}
              </div>
              <div className="flex items-center gap-1 text-[9px] font-black text-blue-400/60 uppercase">
                <Globe size={12} /> {sources.length} FUENTES
              </div>
            </div>

            <Button
              onClick={handlePlay}
              disabled={!isReady}
              size="icon"
              className={cn(
                "h-10 w-10 rounded-full transition-all border-none shadow-xl",
                isReady
                  ? "bg-white text-black hover:bg-primary hover:text-white"
                  : "bg-white/5 text-white/10 opacity-20"
              )}
            >
              {isCurrentlyPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5 fill-current" />}
            </Button>
          </div>

        </CardContent>

        {/* 3. SHIELD: BLOQUEO DE CONSTRUCCIÓN */}
        {!isReady && (
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