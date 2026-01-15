// components/full-screen-player.tsx
// VERSIÓN: 21.0 (High-Performance Teleprompter & Event-Driven UI)

"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useAudio } from "@/contexts/audio-context";
import { formatTime, getSafeAsset } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  ChevronDown,
  Heart,
  Share2,
  Loader2
} from "lucide-react";
import { DynamicScriptViewer } from "./dynamic-script-viewer";

export function FullScreenPlayer() {
  const {
    currentPodcast,
    isPlaying,
    isLoading,
    togglePlayPause,
    seekTo,
    skipForward,
    skipBackward,
    collapsePlayer,
  } = useAudio();

  // --- ESTADOS LOCALES DE ALTA FRECUENCIA ---
  // Solo este componente se re-renderiza con el tiempo, no toda la App.
  const [localTime, setLocalTime] = useState(0);
  const [localDuration, setLocalDuration] = useState(0);

  useEffect(() => {
    const handleSync = (e: any) => {
      const { currentTime, duration } = e.detail;
      setLocalTime(currentTime);
      if (duration && duration !== localDuration) setLocalDuration(duration);
    };

    window.addEventListener('nicepod-timeupdate', handleSync);
    return () => window.removeEventListener('nicepod-timeupdate', handleSync);
  }, [localDuration]);

  if (!currentPodcast) return null;

  // --- MANEJADORES ---
  const handleSliderChange = (value: number[]) => {
    const newTime = value[0];
    setLocalTime(newTime); // Feedback visual inmediato
    seekTo(newTime);
  };

  // --- PREPARACIÓN DE ASSETS ---
  const coverImage = getSafeAsset(currentPodcast.cover_image_url, 'cover');
  const authorName = currentPodcast.profiles?.full_name || "NicePod Curator";

  return (
    <div
      className="fixed inset-0 z-[150] bg-slate-950 flex flex-col animate-in fade-in zoom-in-95 duration-500"
      role="dialog"
      aria-modal="true"
      aria-label={`Reproduciendo: ${currentPodcast.title}`}
    >
      {/* FONDO DINÁMICO (AURORA BLUR) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute -top-[25%] -left-[25%] w-[100%] h-[100%] bg-purple-600/30 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute -bottom-[25%] -right-[25%] w-[100%] h-[100%] bg-blue-600/30 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 flex flex-col h-full p-6 md:p-12">

        {/* HEADER: CONTROL DE CIERRE */}
        <header className="flex items-center justify-between flex-shrink-0 mb-8">
          <Button
            onClick={collapsePlayer}
            variant="ghost"
            size="icon"
            className="text-white/70 hover:text-white hover:bg-white/10 rounded-full h-12 w-12"
          >
            <ChevronDown className="h-8 w-8" />
          </Button>
          <div className="text-center min-w-0 px-4">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-1">
              Escuchando Ahora
            </p>
            <h2 className="font-bold text-sm text-white truncate max-w-[200px] md:max-w-md uppercase tracking-tight">
              {currentPodcast.title}
            </h2>
          </div>
          <div className="w-12 h-12" /> {/* Espaciador para equilibrio visual */}
        </header>

        {/* MAIN: ÁREA DE CONTENIDO (SPLIT DESKTOP / STACK MOBILE) */}
        <main className="flex-1 min-h-0 grid md:grid-cols-2 gap-8 items-center">

          {/* COLUMNA 1: ARTE DEL PODCAST */}
          <div className="hidden md:flex justify-center items-center">
            <div className="relative w-full max-w-sm aspect-square group">
              <div className="absolute inset-0 bg-primary/20 blur-3xl group-hover:blur-[60px] transition-all duration-700 opacity-50" />
              <Image
                src={coverImage}
                alt={currentPodcast.title}
                fill
                className="rounded-[2.5rem] object-cover shadow-2xl border border-white/10 relative z-10"
              />
            </div>
          </div>

          {/* COLUMNA 2: TELEPROMPTER (DYNAMIC SCRIPT) */}
          <div className="h-full w-full overflow-hidden rounded-[2rem] bg-white/5 border border-white/5 backdrop-blur-sm relative">
            <DynamicScriptViewer
              scriptText={currentPodcast.script_text}
              currentTime={localTime}
              duration={localDuration}
              isPlaying={isPlaying}
            />
            {/* Gradientes de desvanecimiento para el script */}
            <div className="absolute top-0 inset-x-0 h-12 bg-gradient-to-b from-slate-950 to-transparent z-10" />
            <div className="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-slate-950 to-transparent z-10" />
          </div>
        </main>

        {/* FOOTER: CONTROLES MAESTROS */}
        <footer className="mt-8 flex-shrink-0 w-full max-w-2xl mx-auto space-y-8">

          {/* BARRA DE PROGRESO */}
          <div className="space-y-3">
            <Slider
              value={[localTime]}
              max={localDuration || 100}
              step={0.1}
              onValueChange={handleSliderChange}
              className="cursor-pointer"
            />
            <div className="flex justify-between text-[11px] font-black font-mono text-white/40 tracking-tighter">
              <span>{formatTime(localTime)}</span>
              <span>{formatTime(localDuration)}</span>
            </div>
          </div>

          {/* BOTONERA PRINCIPAL */}
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" className="text-white/40 hover:text-white rounded-full h-12 w-12" disabled>
              <Heart className="h-6 w-6" />
            </Button>

            <div className="flex items-center gap-4 md:gap-8">
              <Button
                onClick={() => skipBackward(15)}
                variant="ghost"
                size="icon"
                className="text-white/60 hover:text-white h-14 w-14 rounded-full"
              >
                <SkipBack className="h-8 w-8" />
              </Button>

              <Button
                onClick={togglePlayPause}
                size="icon"
                disabled={isLoading}
                className="w-20 h-20 rounded-full bg-white text-slate-950 hover:scale-105 transition-all shadow-xl shadow-white/10"
              >
                {isLoading ? (
                  <Loader2 className="h-10 w-10 animate-spin" />
                ) : isPlaying ? (
                  <Pause className="h-10 w-10 fill-current" />
                ) : (
                  <Play className="h-10 w-10 fill-current ml-1" />
                )}
              </Button>

              <Button
                onClick={() => skipForward(15)}
                variant="ghost"
                size="icon"
                className="text-white/60 hover:text-white h-14 w-14 rounded-full"
              >
                <SkipForward className="h-8 w-8" />
              </Button>
            </div>

            <Button variant="ghost" size="icon" className="text-white/40 hover:text-white rounded-full h-12 w-12" disabled>
              <Share2 className="h-6 w-6" />
            </Button>
          </div>

          {/* INFO DEL AUTOR (FOOTER) */}
          <div className="flex items-center justify-center gap-3 pt-4 opacity-60">
            <div className="relative w-5 h-5 rounded-full overflow-hidden border border-white/20">
              <Image src={getSafeAsset(currentPodcast.profiles?.avatar_url, 'avatar')} alt="" fill />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-white/80">
              Curado por {authorName}
            </span>
          </div>

        </footer>
      </div>
    </div>
  );
}