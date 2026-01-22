// components/compact-podcast-card.tsx
// VERSIÓN: 4.0 (Shielded Compact - High Performance & Access Control)

"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAudio } from "@/contexts/audio-context";
import { cn, formatTime, getSafeAsset } from "@/lib/utils";
import { PodcastWithProfile } from "@/types/podcast";
import { Clock, Loader2, Lock, Pause, Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type React from "react";

interface CompactPodcastCardProps {
  podcast: PodcastWithProfile;
}

export function CompactPodcastCard({ podcast }: CompactPodcastCardProps) {
  const { playPodcast, currentPodcast, isPlaying } = useAudio();

  // Control de Integridad
  const isReady = podcast.processing_status === 'completed';

  const handlePlay = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.preventDefault();
    if (!isReady) return;
    playPodcast(podcast);
  };

  const isCurrentlyPlaying = currentPodcast?.id === podcast.id && isPlaying;
  const authorName = podcast.profiles?.full_name || "Creador NicePod";
  const authorImage = getSafeAsset(podcast.profiles?.avatar_url, 'avatar');

  return (
    <Link
      href={`/podcast/${podcast.id}`}
      className={cn(
        "group block transition-all",
        !isReady && "cursor-wait opacity-70 grayscale-[0.5]"
      )}
      onClick={(e) => { if (!isReady) { e.preventDefault(); } }}
    >
      <Card className="relative overflow-hidden h-20 transition-all duration-500 group-hover:scale-[1.01] border border-border/20 shadow-lg bg-zinc-950/40 backdrop-blur-md">

        {/* FONDO: Portada con overlay */}
        <Image
          src={getSafeAsset(podcast.cover_image_url, 'cover')}
          alt={podcast.title}
          fill
          className="object-cover z-0 transition-transform duration-700 group-hover:scale-110 opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent z-10" />

        {/* CONTENIDO SUPERIOR */}
        <div className="relative z-20 flex items-center justify-between h-full px-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="relative h-12 w-12 rounded-xl overflow-hidden border border-white/10 flex-shrink-0">
              <Image src={authorImage} alt={authorName} fill className="object-cover" />
              {!isReady && (
                <div className="absolute inset-0 bg-primary/40 backdrop-blur-sm flex items-center justify-center">
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="font-black text-sm md:text-base truncate text-white uppercase tracking-tight group-hover:text-primary transition-colors">
                {podcast.title}
              </h3>
              <div className="flex items-center gap-3 text-[10px] font-bold text-zinc-400 mt-0.5">
                <span className="truncate">{authorName}</span>
                <span className="flex items-center gap-1.5 border-l border-white/10 pl-3">
                  {isReady ? (
                    <>
                      <Clock className="h-3 w-3" />
                      {podcast.duration_seconds ? formatTime(podcast.duration_seconds) : 'N/A'}
                    </>
                  ) : (
                    <span className="text-primary animate-pulse flex items-center gap-1">
                      <Lock size={10} /> EN FORJA
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="pl-4">
            <Button
              onClick={handlePlay}
              disabled={!isReady}
              size="icon"
              className={cn(
                "w-12 h-12 rounded-full transition-all border-none",
                isReady
                  ? "bg-white text-primary hover:bg-primary hover:text-white shadow-xl"
                  : "bg-zinc-800 text-zinc-600 opacity-20"
              )}
            >
              {isCurrentlyPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 fill-current" />}
            </Button>
          </div>
        </div>
      </Card>
    </Link>
  );
}