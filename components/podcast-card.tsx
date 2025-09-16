// components/podcast-card.tsx

"use client";

import Image from "next/image";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Clock, Pause } from "lucide-react";
import { useAudio } from "@/contexts/audio-context";
import { PodcastWithProfile } from "@/types/podcast"; // MODIFICACIÓN: Importamos nuestro tipo centralizado

interface PodcastCardProps {
  podcast: PodcastWithProfile;
}

export function PodcastCard({ podcast }: PodcastCardProps) {
  const { playPodcast, currentPodcast, isPlaying } = useAudio();

  // ================== MODIFICACIÓN #3: ADAPTACIÓN A LA NUEVA LÓGICA ==================
  const handlePlay = () => {
    // Creamos un objeto 'PlayablePodcast' con solo la información necesaria.
    // El 'audioUrl' puede ser null, y nuestro nuevo AudioContext lo manejará.
    playPodcast({
      id: podcast.id.toString(),
      title: podcast.title,
      audioUrl: podcast.audio_url || '', // Pasamos la URL (o un string vacío si es null)
    });
  };
  // =================================================================================

  const isCurrentlyPlaying = currentPodcast?.id === podcast.id.toString() && isPlaying;
  const authorName = podcast.profiles?.full_name || "Creador Anónimo";
  const authorImage = podcast.profiles?.avatar_url || "/images/placeholder.svg"; // Usamos un placeholder genérico

  return (
    <Card className="flex flex-col overflow-hidden transition-transform duration-300 hover:-translate-y-1 bg-card/50 shadow-md hover:shadow-xl border border-border/20">
      <div className="relative w-full h-48">
        <Image
          src={podcast.cover_image_url || "/images/placeholder.svg"}
          alt={podcast.title}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute top-3 left-3">
          {podcast.category && (
            <Badge variant="secondary">{podcast.category}</Badge>
          )}
        </div>
        <div className="absolute bottom-3 right-3">
           <Button onClick={handlePlay} size="icon" className="w-12 h-12 rounded-full bg-primary/80 backdrop-blur-sm hover:bg-primary text-primary-foreground">
            {isCurrentlyPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 fill-current" />}
          </Button>
        </div>
      </div>
      <CardContent className="p-4 flex-grow flex flex-col">
        <CardTitle className="text-lg font-semibold line-clamp-2">{podcast.title}</CardTitle>
        <CardDescription className="text-sm line-clamp-2 mt-1 flex-grow text-muted-foreground">{podcast.description}</CardDescription>
        <div className="flex items-center text-sm text-muted-foreground pt-4 mt-auto border-t border-border/20">
          <div className="flex-shrink-0 mr-2">
            <Image src={authorImage} alt={authorName} width={24} height={24} className="rounded-full" />
          </div>
          <span className="truncate flex-1 font-medium">{authorName}</span>
          <div className="flex items-center flex-shrink-0 ml-2">
            <Clock className="h-4 w-4 mr-1" />
            <span>{podcast.duration_seconds ? `${Math.floor(podcast.duration_seconds / 60)} min` : 'N/A'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}