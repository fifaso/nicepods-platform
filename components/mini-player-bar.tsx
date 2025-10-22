// app/components/mini-player-bar.tsx
// VERSIÓN DE PRODUCCIÓN - HITO 2

"use client";

import Image from "next/image";
import { useAudio } from "@/contexts/audio-context";
import { Button } from "@/components/ui/button";
import { Play, Pause, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export function MiniPlayerBar() {
  const {
    currentPodcast,
    isPlaying,
    togglePlayPause,
    closePodcast,
    expandPlayer,
    currentTime,
    duration,
  } = useAudio();

  if (!currentPodcast) return null;

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;
  const authorImage = currentPodcast.profiles?.avatar_url || "/images/placeholder.svg";

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom-2 duration-300">
      <Progress value={progressPercentage} className="h-1 w-full rounded-none" />
      <div 
        className="h-16 bg-card/80 backdrop-blur-xl border-t border-border/20 flex items-center justify-between px-4"
      >
        <div 
          className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
          onClick={expandPlayer} // Al hacer clic en el área de información, se expande.
        >
          <div className="relative w-10 h-10 flex-shrink-0">
            <Image
              src={currentPodcast.cover_image_url || authorImage}
              alt={currentPodcast.title}
              fill
              className="rounded-md object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{currentPodcast.title}</p>
            <p className="text-xs text-muted-foreground truncate">{currentPodcast.profiles?.full_name || "Creador Anónimo"}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 ml-4">
          <Button onClick={togglePlayPause} variant="ghost" size="icon" className="h-10 w-10">
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </Button>
          <Button onClick={closePodcast} variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground">
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}