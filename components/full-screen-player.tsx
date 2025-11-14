//components/full-screen-player.tsx
"use client";

import Image from "next/image";
import { useAudio } from "@/contexts/audio-context";
import { formatTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, SkipForward, SkipBack, ChevronDown, Heart, Share2 } from "lucide-react";

// ================== INTERVENCIÓN QUIRÚRGICA: INTEGRACIÓN DEL TELEPROMPTER ==================
import { DynamicScriptViewer } from "./dynamic-script-viewer"; 
// ========================================================================================

export function FullScreenPlayer() {
  const {
    currentPodcast,
    isPlaying,
    currentTime,
    duration,
    togglePlayPause,
    seekTo,
    skipForward,
    skipBackward,
    collapsePlayer,
  } = useAudio();

  if (!currentPodcast) return null;

  const handleProgressChange = (value: number[]) => {
    if (typeof value[0] === 'number') seekTo(value[0]);
  };

  const authorName = currentPodcast.profiles?.full_name || "Creador Anónimo";
  const authorImage = currentPodcast.profiles?.avatar_url || "/images/placeholder.svg";

  return (
    <div 
      className="fixed inset-0 z-50 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 backdrop-blur-2xl animate-in fade-in-0 duration-500 flex flex-col p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Reproductor de audio a pantalla completa"
    >
      <header className="flex items-center justify-between flex-shrink-0">
        <Button onClick={collapsePlayer} variant="ghost" size="icon" className="text-white/70 hover:text-white">
          <ChevronDown className="h-6 w-6" />
        </Button>
        <div className="text-center">
          <p className="text-xs uppercase tracking-wider text-white/60">Reproduciendo Podcast</p>
          <p className="font-semibold text-sm truncate text-white">{currentPodcast.title}</p>
        </div>
        {/* Espaciador invisible para mantener el título centrado */}
        <div className="w-10 h-10"></div>
      </header>

      <main className="flex-1 min-h-0 py-6 md:grid md:grid-cols-2 md:gap-8 md:items-center">
        {/* Columna de la Imagen (visible en escritorio) */}
        <div className="hidden md:flex justify-center items-center">
          <div className="relative w-full max-w-sm aspect-square">
            <Image src={currentPodcast.cover_image_url || authorImage} alt={currentPodcast.title} fill className="rounded-lg object-cover shadow-2xl"/>
          </div>
        </div>

        {/* Columna del Guion (Teleprompter) */}
        <div className="h-full w-full overflow-hidden rounded-lg bg-black/10">
          <DynamicScriptViewer
            scriptText={currentPodcast.script_text}
            currentTime={currentTime}
            duration={duration}
            isPlaying={isPlaying}
          />
        </div>
      </main>

      <footer className="flex-shrink-0 space-y-4 max-w-xl mx-auto w-full">
        <div className="space-y-1.5">
            <Slider value={[currentTime]} max={duration || 100} step={1} onValueChange={handleProgressChange} />
            <div className="flex justify-between text-xs text-white/60 font-mono">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
            </div>
        </div>

        <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" className="text-white/70 hover:text-white" disabled><Heart className="h-5 w-5" /></Button>
            <div className="flex items-center gap-2">
                <Button onClick={() => skipBackward()} variant="ghost" size="icon" className="w-12 h-12 text-white/70 hover:text-white"><SkipBack className="h-7 w-7" /></Button>
                <Button onClick={togglePlayPause} size="icon" className="w-16 h-16 rounded-full bg-white text-blue-800 hover:bg-white/90">
                    {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8 fill-current" />}
                </Button>
                <Button onClick={() => skipForward()} variant="ghost" size="icon" className="w-12 h-12 text-white/70 hover:text-white"><SkipForward className="h-7 w-7" /></Button>
            </div>
            <Button variant="ghost" size="icon" className="text-white/70 hover:text-white" disabled><Share2 className="h-5 w-5" /></Button>
        </div>
      </footer>
    </div>
  );
}