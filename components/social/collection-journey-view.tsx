// components/social/collection-journey-view.tsx
// VERSIÓN: 1.1 (Aurora System: Production Ready Journey UI)

"use client";

import { useAudio } from "@/contexts/audio-context";
import { Button } from "@/components/ui/button";
import { PlayCircle, Sparkles, Layers, Clock, Users } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface CollectionJourneyProps {
  collection: any;
  podcasts: any[];
}

export function CollectionJourneyView({ collection, podcasts }: CollectionJourneyProps) {
  const { playPodcast, currentPodcast, isPlaying } = useAudio();

  const handleStartJourney = () => {
    if (podcasts.length > 0) {
      // Inicia con el primer podcast y carga todos en la cola (Queue)
      playPodcast(podcasts[0], podcasts);
    }
  };

  const totalDuration = podcasts.reduce((acc, p) => acc + (p.duration_seconds || 0), 0);
  const formatTime = (s: number) => Math.floor(s / 60) + " min";

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-1000">
      
      {/* HEADER DE VIAJE */}
      <div className="text-center space-y-6">
        <div className="flex justify-center mb-8">
            <div className="relative h-48 w-48 group">
                <div className="absolute -inset-4 bg-primary/20 rounded-[3rem] blur-3xl group-hover:bg-primary/30 transition duration-1000"></div>
                <div className="relative h-full w-full bg-zinc-900 rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl">
                    {collection.cover_image_url ? (
                        <Image src={collection.cover_image_url} alt="" fill className="object-cover"/>
                    ) : (
                        <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-zinc-900">
                            <Layers size={48} className="text-primary/40" />
                        </div>
                    )}
                </div>
            </div>
        </div>

        <div className="space-y-3">
            <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter text-white leading-none">
              {collection.title}
            </h1>
            <div className="flex items-center justify-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                <span className="flex items-center gap-1"><Users size={12}/> {collection.profiles?.username}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Clock size={12}/> {formatTime(totalDuration)} TOTAL</span>
            </div>
        </div>

        <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed italic">
          "{collection.description}"
        </p>

        <div className="pt-6">
            <Button 
                onClick={handleStartJourney}
                size="lg" 
                className="h-20 px-12 rounded-[2rem] bg-primary text-white font-black text-2xl hover:scale-105 transition-transform shadow-[0_0_50px_rgba(var(--primary),0.3)] group"
            >
              <PlayCircle className="mr-4 h-8 w-8 group-hover:animate-pulse" /> 
              INICIAR VIAJE
            </Button>
        </div>
      </div>

      {/* LISTA DE PIEZAS */}
      <div className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary/60 text-center mb-8">Composición del Hilo</h3>
        <div className="grid gap-3">
            {podcasts.map((pod, idx) => {
              const isActive = currentPodcast?.id === pod.id;
              return (
                <div 
                    key={pod.id} 
                    onClick={() => playPodcast(pod, podcasts)}
                    className={cn(
                        "group p-6 bg-white/5 border transition-all cursor-pointer rounded-[2rem] flex items-center gap-6",
                        isActive ? "border-primary bg-primary/10 shadow-lg" : "border-white/5 hover:border-white/20 hover:bg-white/10"
                    )}
                >
                    <span className={cn("text-3xl font-black opacity-10 transition-opacity group-hover:opacity-30", isActive && "text-primary opacity-100")}>
                        {String(idx + 1).padStart(2, '0')}
                    </span>
                    <div className="relative h-16 w-16 rounded-2xl overflow-hidden shadow-xl flex-shrink-0">
                        {pod.cover_image_url ? <Image src={pod.cover_image_url} alt="" fill className="object-cover"/> : <Mic size={24}/>}
                        {isActive && isPlaying && (
                            <div className="absolute inset-0 bg-primary/40 flex items-center justify-center">
                                <div className="flex gap-1">
                                    <div className="w-1 h-4 bg-white animate-bounce" style={{animationDelay: '0ms'}}/>
                                    <div className="w-1 h-4 bg-white animate-bounce" style={{animationDelay: '150ms'}}/>
                                    <div className="w-1 h-4 bg-white animate-bounce" style={{animationDelay: '300ms'}}/>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className={cn("font-bold text-lg uppercase tracking-tight truncate", isActive && "text-primary")}>{pod.title}</h3>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1 opacity-60">
                           {pod.profiles?.full_name} • {formatTime(pod.duration_seconds || 0)}
                        </p>
                    </div>
                    <div className="hidden sm:block">
                        <PlayCircle size={32} className={cn("text-white/10 transition-colors", isActive ? "text-primary" : "group-hover:text-white/40")}/>
                    </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}