// components/compact-podcast-card.tsx
// Una nueva variante de tarjeta de podcast, optimizada para feeds verticales en móvil.

"use client";

import Link from "next/link";
import Image from "next/image";
import type React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, Clock } from "lucide-react";
import { useAudio } from "@/contexts/audio-context";
import { PodcastWithProfile } from "@/types/podcast";
import { formatTime } from "@/lib/utils";

interface CompactPodcastCardProps {
  podcast: PodcastWithProfile;
}

export function CompactPodcastCard({ podcast }: CompactPodcastCardProps) {
  const { playPodcast, currentPodcast, isPlaying } = useAudio();

  const handlePlay = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.preventDefault();
    playPodcast(podcast);
  };

  const isCurrentlyPlaying = currentPodcast?.id === podcast.id && isPlaying;
  const authorName = podcast.profiles?.full_name || "Creador Anónimo";
  const authorImage = podcast.profiles?.avatar_url || "/images/placeholder-user.jpg";

  return (
    <Link href={`/podcast/${podcast.id}`} className="group block">
      <Card className="overflow-hidden transition-all duration-300 group-hover:bg-primary/5 border border-border/20">
        <div className="flex items-center space-x-4">
          <div className="relative w-20 h-20 flex-shrink-0">
            <Image
              src={podcast.cover_image_url || "/images/placeholder-logo.svg"}
              alt={podcast.title}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1 min-w-0 pr-2 py-2">
            <h3 className="font-semibold truncate group-hover:text-primary transition-colors">{podcast.title}</h3>
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <Image src={authorImage} alt={authorName} width={16} height={16} className="rounded-full mr-2" />
              <span className="truncate flex-1">{authorName}</span>
              <div className="flex items-center flex-shrink-0 ml-2">
                <Clock className="h-3 w-3 mr-1" />
                <span>{podcast.duration_seconds ? formatTime(podcast.duration_seconds) : 'N/A'}</span>
              </div>
            </div>
          </div>
          <div className="pr-4">
            <Button onClick={handlePlay} size="icon" className="w-12 h-12 rounded-full bg-primary/80 backdrop-blur-sm hover:bg-primary text-primary-foreground">
              {isCurrentlyPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 fill-current" />}
            </Button>
          </div>
        </div>
      </Card>
    </Link>
  );
}