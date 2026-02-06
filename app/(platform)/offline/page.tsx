// app/offline/page.tsx
// VERSIÓN: 4.0 (Fix: Use standard <img> tag to bypass server optimization in offline mode)

"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WifiOff, PlayCircle, Clock, Headphones, Trash2 } from "lucide-react";
import { useAudio } from "@/contexts/audio-context";

// Forzar estático puro
export const dynamic = 'force-static';

const METADATA_KEY = "offline_podcasts_metadata";
const CACHE_NAME = "supabase-media-cache";

export default function OfflinePage() {
  const [downloads, setDownloads] = useState<any[]>([]);
  const { playPodcast } = useAudio();
  // Estado de montaje para evitar errores de hidratación
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const stored = localStorage.getItem(METADATA_KEY);
    if (stored) {
        try {
            const library = JSON.parse(stored);
            setDownloads(Object.values(library));
        } catch (e) {
            console.error("Error reading offline metadata", e);
        }
    }
  }, []);

  const handleDelete = async (id: number, url: string) => {
    if(!confirm("¿Borrar descarga?")) return;
    
    try {
        const cache = await caches.open(CACHE_NAME);
        await cache.delete(url);
    } catch(e) {}

    const stored = localStorage.getItem(METADATA_KEY);
    if (stored) {
        const library = JSON.parse(stored);
        delete library[id];
        localStorage.setItem(METADATA_KEY, JSON.stringify(library));
        setDownloads(Object.values(library));
    }
  };

  // Evitar renderizado en servidor para prevenir mismatch
  if (!isMounted) return null;

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen flex flex-col">
      
      {/* HEADER */}
      <div className="flex flex-col items-center justify-center mb-8 pt-4">
        <div className="bg-red-500/10 p-4 rounded-full mb-4 animate-pulse">
            <WifiOff className="h-10 w-10 text-red-500" />
        </div>
        <h1 className="text-3xl font-bold text-white text-center">Modo Desconectado</h1>
        <p className="text-slate-400 mt-2 text-center max-w-xs">
            Tu biblioteca local está lista.
        </p>
      </div>

      {/* LISTA */}
      <div className="flex-1">
        {downloads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
                <Headphones className="h-12 w-12 text-slate-700 mb-4" />
                <h3 className="text-lg font-semibold text-slate-400">Mochila vacía</h3>
                <p className="text-slate-600 text-sm mt-1 px-6 text-center">
                    Descarga episodios cuando tengas internet.
                </p>
            </div>
        ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <h2 className="text-lg font-bold text-white mb-2 col-span-full flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Disponibles ({downloads.length})
                </h2>
                
                {downloads.map((pod) => (
                    <Card key={pod.id} className="bg-slate-900/80 border-slate-700 overflow-hidden hover:border-purple-500/50 transition-all cursor-pointer group">
                        <CardContent className="p-3 flex gap-4 items-center">
                            
                            {/* COVER IMAGEN [CORRECCIÓN]: Usamos <img> estándar */}
                            <div className="relative h-20 w-20 bg-black/40 rounded-lg flex-shrink-0 overflow-hidden shadow-lg border border-slate-700">
                                 {pod.cover_image_url ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img 
                                        src={pod.cover_image_url} 
                                        alt={pod.title} 
                                        className="object-cover w-full h-full"
                                        loading="eager" // Importante para cargar rápido desde caché
                                    />
                                 ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-slate-800"><Headphones className="h-6 w-6 text-slate-600" /></div>
                                 )}
                                 
                                 {/* Overlay Play */}
                                 <div 
                                    className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => playPodcast(pod)}
                                 >
                                    <PlayCircle className="h-8 w-8 text-white drop-shadow-md" />
                                 </div>
                            </div>
                            
                            {/* Info */}
                            <div className="flex-1 min-w-0 py-1" onClick={() => playPodcast(pod)}>
                                <h3 className="font-bold text-slate-100 truncate text-sm mb-1 leading-tight">{pod.title}</h3>
                                <p className="text-xs text-slate-400 truncate mb-2">{pod.profiles?.full_name || 'Autor'}</p>
                                <span className="inline-flex items-center gap-1 text-[10px] text-green-400 bg-green-950/30 px-2 py-0.5 rounded border border-green-900/50">
                                    <Clock className="h-3 w-3" /> {Math.floor((pod.duration_seconds || 0)/60)} min
                                </span>
                            </div>
                            
                            {/* Delete Button */}
                            <div className="flex flex-col justify-center border-l border-slate-800 pl-2 ml-1">
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-500 hover:text-red-400 hover:bg-red-950/20" onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(pod.id, pod.audio_url);
                                }}>
                                    <Trash2 className="h-4 w-4" />
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