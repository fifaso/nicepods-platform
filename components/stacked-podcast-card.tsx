"use client";

import { PodcastCard } from "@/components/podcast-card";
import { PodcastWithProfile } from "@/types/podcast";
import { MessageCircle } from "lucide-react";

interface StackedPodcastCardProps {
  podcast: PodcastWithProfile;
  replies?: PodcastWithProfile[];
}

export function StackedPodcastCard({ podcast, replies = [] }: StackedPodcastCardProps) {
  const replyCount = replies.length;

  if (replyCount === 0) {
    return <PodcastCard podcast={podcast} />;
  }

  return (
    <div className="relative group cursor-pointer transition-all hover:-translate-y-1">
      {/* CARTA FANTASMA 2 (Fondo) */}
      {replyCount > 1 && (
        <div className="absolute top-2 left-2 w-full h-full bg-slate-800/40 rounded-xl border border-white/5 rotate-2 scale-95 -z-20 transition-transform group-hover:rotate-3" />
      )}

      {/* CARTA FANTASMA 1 (Medio) */}
      <div className="absolute top-1 left-1 w-full h-full bg-slate-800/60 rounded-xl border border-white/5 rotate-1 scale-[0.98] -z-10 transition-transform group-hover:rotate-2">
        {/* Badge de contador */}
        <div className="absolute -top-2 -right-2 z-50 flex items-center justify-center bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg border-2 border-slate-950">
          <MessageCircle className="w-3 h-3 mr-1" />
          +{replyCount}
        </div>
      </div>

      {/* CARTA PRINCIPAL (Frente) */}
      <div className="relative z-0">
        <PodcastCard podcast={podcast} />
      </div>
    </div>
  );
}