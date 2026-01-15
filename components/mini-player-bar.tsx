// components/mini-player-bar.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useAudio } from "@/contexts/audio-context";
import { Button } from "@/components/ui/button";
import { Play, Pause, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { getSafeAsset } from "@/lib/utils";

export function MiniPlayerBar() {
  const { currentPodcast, isPlaying, togglePlayPause, closePodcast, expandPlayer } = useAudio();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onUpdate = (e: any) => {
      const { currentTime, duration } = e.detail;
      if (duration > 0) setProgress((currentTime / duration) * 100);
    };
    window.addEventListener('nicepod-timeupdate', onUpdate);
    return () => window.removeEventListener('nicepod-timeupdate', onUpdate);
  }, []);

  if (!currentPodcast) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] animate-in slide-in-from-bottom-2 duration-500">
      <Progress value={progress} className="h-1 w-full rounded-none bg-primary/20" />
      <div className="h-16 bg-background/90 backdrop-blur-2xl border-t border-border/40 flex items-center justify-between px-4 shadow-2xl">
        <div className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer group" onClick={expandPlayer}>
          <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-white/5 shadow-inner">
            <Image
              src={getSafeAsset(currentPodcast.cover_image_url, 'cover')}
              alt={currentPodcast.title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm truncate uppercase tracking-tight text-foreground">{currentPodcast.title}</p>
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest truncate">
              {currentPodcast.profiles?.full_name || "NicePod Curator"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            onClick={(e) => { e.stopPropagation(); togglePlayPause(); }}
            variant="ghost"
            size="icon"
            className="h-12 w-12 rounded-full hover:bg-primary/10 transition-colors"
          >
            {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current" />}
          </Button>
          <Button
            onClick={(e) => { e.stopPropagation(); closePodcast(); }}
            variant="ghost"
            size="icon"
            className="h-10 w-10 text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-all"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}