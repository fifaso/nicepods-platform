"use client";

import Link from "next/link";
import Image from "next/image";
import type React from "react";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Clock, Pause } from "lucide-react";
import { useAudio } from "@/contexts/audio-context";
import { PodcastWithProfile } from "@/types/podcast";
import { formatTime } from "@/lib/utils";

interface PodcastCardProps {
  podcast: PodcastWithProfile;
}

export function PodcastCard({ podcast }: PodcastCardProps) {
  const { playPodcast, currentPodcast, isPlaying } = useAudio();

  // ================== INTERVENCIÓN QUIRÚRGICA: MANEJO DE EVENTOS PROFESIONAL ==================
  const handlePlay = (event: React.MouseEvent<HTMLButtonElement>) => {
    // 1. Detiene la propagación del evento para que no active el <Link> padre.
    event.stopPropagation();
    event.preventDefault(); // Añadimos preventDefault para máxima seguridad.
    
    // 2. Llama a `playPodcast` con el objeto `podcast` completo.
    playPodcast(podcast);
  };
  // ==============================================================================================

  const isCurrentlyPlaying = currentPodcast?.id === podcast.id && isPlaying;
  const authorName = podcast.profiles?.full_name || "Creador Anónimo";
  const authorImage = podcast.profiles?.avatar_url || "/images/placeholder.svg";

  return (
    <Link href={`/podcast/${podcast.id}`} className="group block">
      <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 group-hover:-translate-y-1 bg-card/50 shadow-md group-hover:shadow-xl border border-border/20">
        <div className="relative w-full h-48">
          <Image
            src={podcast.cover_image_url || "/images/placeholder.svg"}
            alt={podcast.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute top-3 left-3 flex gap-2">
            {podcast.audio_url ? (
              <Badge className="bg-green-500/20 text-green-300 border-green-500/30">Audio Disponible</Badge>
            ) : (
              <Badge variant="secondary">Solo Guion</Badge>
            )}
          </div>
          <div className="absolute bottom-3 right-3">
             <Button onClick={handlePlay} size="icon" className="w-12 h-12 rounded-full bg-primary/80 backdrop-blur-sm hover:bg-primary text-primary-foreground transition-transform duration-300 group-hover:scale-110">
              {isCurrentlyPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 fill-current" />}
            </Button>
          </div>
        </div>
        <CardContent className="p-4 flex-grow flex flex-col">
          <CardTitle className="text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors">{podcast.title}</CardTitle>
          <CardDescription className="text-sm line-clamp-2 mt-1 flex-grow text-muted-foreground">{podcast.description}</CardDescription>
          <div className="flex items-center text-sm text-muted-foreground pt-4 mt-auto border-t border-border/20">
            <div className="flex-shrink-0 mr-2">
              <Image src={authorImage} alt={authorName} width={24} height={24} className="rounded-full" />
            </div>
            <span className="truncate flex-1 font-medium">{authorName}</span>
            <div className="flex items-center flex-shrink-0 ml-2">
              <Clock className="h-4 w-4 mr-1" />
              <span>{podcast.duration_seconds ? formatTime(podcast.duration_seconds) : 'N/A'}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}