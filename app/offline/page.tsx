// app/offline/page.tsx
// VERSIÓN: 3.0 (Functional Offline Library)

"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WifiOff, PlayCircle, Clock, Headphones } from "lucide-react";
import { useAudio } from "@/contexts/audio-context";
import Image from "next/image";

// Forzar generación estática para que el SW pueda cachearlo como HTML puro
export const dynamic = 'force-static';

const METADATA_KEY = "offline_podcasts_metadata";

export default function OfflinePage() {
  const [downloads, setDownloads] = useState<any[]>([]);
  const { playPodcast } = useAudio();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Leemos el LocalStorage donde guardamos los datos al descargar
    const stored = localStorage.getItem(METADATA_KEY);
    if (stored) {
        try {
            const library = JSON.parse(stored);
            setDownloads(Object.values(library));
        } catch (e) {
            console.error("Error reading offline metadata", e);
        }
    }
    setIsReady(true);
  }, []);

  if (!isReady) return null;

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen flex flex-col">
      
      {/* HEADER OFFLINE */}
      <div className="flex flex-col items-center justify-center mb-8 pt-4">
        <div className="bg-red-500/10 p-4 rounded-full mb-4 animate-pulse">
            <WifiOff className="h-10 w-10 text-red-500" />
        </div>
        <h1 className="text-3xl font-bold text-white text-center">Modo Desconectado</h1>
        <p className="text-slate-400 mt-2 text-center max-w-xs">
            No tienes internet, pero tu biblioteca local está lista.
        </p>
      </div>

      {/* LISTA DE REPRODUCCIÓN */}
      <div className="flex-1">
        {downloads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
                <Headphones className="h-12 w-12 text-slate-700 mb-4" />
                <h3 className="text-lg font-semibold text-slate-400">Tu mochila está vacía</h3>
                <p className="text-slate-600 text-sm mt-1 px-6 text-center">
                    Cuando tengas internet, usa el botón de descarga en los episodios para escucharlos aquí.
                </p>
            </div>
        ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <h2 className="text-lg font-bold text-white mb-2 col-span-full flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Disponibles para escuchar ({downloads.length})
                </h2>
                
                {downloads.map((pod) => (
                    <Card key={pod.id} className="bg-slate-900/80 border-slate-700 overflow-hidden hover:border-purple-500/50 transition-all cursor-pointer group" onClick={() => playPodcast(pod)}>
                        <CardContent className="p-3 flex gap-4 items-center">
                            {/* Cover */}
                            <div className="relative h-20 w-20 bg-black/40 rounded-lg flex-shrink-0 overflow-hidden shadow-lg">
                                 {pod.cover_image_url ? (
                                    <Image src={pod.cover_image_url} alt={pod.title} fill className="object-cover group-hover:scale-105 transition-transform" />
                                 ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-slate-800"><Headphones className="h-6 w-6 text-slate-600" /></div>
                                 )}
                                 {/* Play Overlay */}
                                 <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <PlayCircle className="h-8 w-8 text-white drop-shadow-md" />
                                 </div>
                            </div>
                            
                            {/* Info */}
                            <div className="flex-1 min-w-0 py-1">
                                <h3 className="font-bold text-slate-100 truncate text-base mb-1 leading-tight">{pod.title}</h3>
                                <p className="text-xs text-slate-400 truncate mb-2">{pod.profiles?.full_name || 'Autor Desconocido'}</p>
                                
                                <div className="flex items-center gap-3">
                                    <BadgeOffline />
                                    <span className="flex items-center gap-1 text-[10px] text-slate-500">
                                        <Clock className="h-3 w-3" /> {Math.floor((pod.duration_seconds || 0)/60)} min
                                    </span>
                                </div>
                            </div>
                            
                            {/* Botón Play Móvil */}
                            <div className="md:hidden">
                                <Button size="icon" variant="ghost" className="text-slate-300">
                                    <PlayCircle className="h-8 w-8" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        )}
      </div>
    </div>
  );
}

function BadgeOffline() {
    return (
        <span className="inline-flex items-center rounded-full border border-green-500/30 bg-green-500/10 px-2 py-0.5 text-[10px] font-medium text-green-400">
            Offline
        </span>
    );
}