"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WifiOff, PlayCircle, Clock, Trash2 } from "lucide-react";
import { useAudio } from "@/contexts/audio-context";
import Image from "next/image";

const METADATA_KEY = "offline_podcasts_metadata";
const CACHE_NAME = "supabase-media-cache";

export default function OfflinePage() {
  const [downloads, setDownloads] = useState<any[]>([]);
  const { playPodcast } = useAudio();

  useEffect(() => {
    // Cargar metadatos del LocalStorage
    const stored = localStorage.getItem(METADATA_KEY);
    if (stored) {
        const library = JSON.parse(stored);
        setDownloads(Object.values(library));
    }
  }, []);

  const handleDelete = async (id: number, url: string) => {
    if(!confirm("¿Borrar descarga?")) return;
    
    // Borrar Cache
    try {
        const cache = await caches.open(CACHE_NAME);
        await cache.delete(url);
    } catch(e) {}

    // Borrar Storage
    const stored = localStorage.getItem(METADATA_KEY);
    if (stored) {
        const library = JSON.parse(stored);
        delete library[id];
        localStorage.setItem(METADATA_KEY, JSON.stringify(library));
        setDownloads(Object.values(library));
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center p-4 bg-slate-800/50 rounded-full mb-4">
            <WifiOff className="h-8 w-8 text-slate-400" />
        </div>
        <h1 className="text-2xl font-bold text-white">Modo Sin Conexión</h1>
        <p className="text-slate-400 mt-2">No tienes internet, pero tienes tu biblioteca local.</p>
      </div>

      <div className="space-y-4">
        {downloads.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-slate-800 rounded-xl">
                <p className="text-slate-500">No tienes podcasts descargados.</p>
            </div>
        ) : (
            downloads.map((pod) => (
                <Card key={pod.id} className="bg-slate-900 border-slate-800 overflow-hidden">
                    <CardContent className="p-4 flex gap-4 items-center">
                        <div className="relative h-16 w-16 bg-black/40 rounded-lg flex-shrink-0 overflow-hidden">
                             {pod.cover_image_url && <Image src={pod.cover_image_url} alt={pod.title} fill className="object-cover" />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-slate-200 truncate">{pod.title}</h3>
                            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                <span>{pod.profiles?.full_name}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {Math.floor(pod.duration_seconds/60)}m</span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                             <Button size="icon" className="rounded-full" onClick={() => playPodcast(pod)}>
                                <PlayCircle className="h-6 w-6" />
                             </Button>
                             <Button size="icon" variant="ghost" onClick={() => handleDelete(pod.id, pod.audio_url)}>
                                <Trash2 className="h-5 w-5 text-slate-600 hover:text-red-500" />
                             </Button>
                        </div>
                    </CardContent>
                </Card>
            ))
        )}
      </div>
    </div>
  );
}