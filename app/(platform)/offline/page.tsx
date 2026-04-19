/**
 * ARCHIVO: app/(platform)/offline/page.tsx
 * VERSIÓN: 8.3 (Madrid Resonance - Sovereign Edition)
 * PROTOCOLO: Madrid Resonance Protocol V8.3
 * MISIÓN: Proveer acceso a la biblioteca de sabiduría local en ausencia de conectividad.
 * NIVEL DE INTEGRIDAD: 100% (Strategist Verified)
 */

"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WifiOff, PlayCircle, Clock, Headphones, Trash2 } from "lucide-react";
import { useAudio } from "@/contexts/audio-context";
import { PodcastWithProfile } from "@/types/podcast";

// Forzar estático puro
export const dynamic = 'force-static';

const OFFLINE_METADATA_STORAGE_KEY = "offline_podcasts_metadata";
const MEDIA_CACHE_INSTANCE_NAME = "supabase-media-cache";

export default function OfflinePage() {
  const [downloadedPodcastsCollection, setDownloadedPodcastsCollection] = useState<PodcastWithProfile[]>([]);
  const { playPodcastAction } = useAudio();
  // Estado de montaje para evitar errores de hidratación
  const [isComponentMountedStatus, setIsComponentMountedStatus] = useState(false);

  useEffect(() => {
    setIsComponentMountedStatus(true);
    const storedMetadataSnapshot = localStorage.getItem(OFFLINE_METADATA_STORAGE_KEY);
    if (storedMetadataSnapshot) {
        try {
            const libraryMetadataDossier = JSON.parse(storedMetadataSnapshot);
            setDownloadedPodcastsCollection(Object.values(libraryMetadataDossier) as PodcastWithProfile[]);
        } catch (exceptionInformation) {
            console.error("Error reading offline metadata", exceptionInformation);
        }
    }
  }, []);

  const handleDeleteAction = async (podcastIdentification: number, audioUniformResourceLocator: string) => {
    if(!confirm("¿Borrar descarga?")) return;
    
    try {
        const mediaCacheSnapshot = await caches.open(MEDIA_CACHE_INSTANCE_NAME);
        await mediaCacheSnapshot.delete(audioUniformResourceLocator);
    } catch(exceptionInformation) {
        console.error("Error deleting from cache", exceptionInformation);
    }

    const storedMetadataSnapshot = localStorage.getItem(OFFLINE_METADATA_STORAGE_KEY);
    if (storedMetadataSnapshot) {
        const libraryMetadataDossier = JSON.parse(storedMetadataSnapshot);
        delete libraryMetadataDossier[podcastIdentification];
        localStorage.setItem(OFFLINE_METADATA_STORAGE_KEY, JSON.stringify(libraryMetadataDossier));
        setDownloadedPodcastsCollection(Object.values(libraryMetadataDossier));
    }
  };

  // Evitar renderizado en servidor para prevenir mismatch
  if (!isComponentMountedStatus) return null;

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
        {downloadedPodcastsCollection.length === 0 ? (
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
                    Disponibles ({downloadedPodcastsCollection.length})
                </h2>
                
                {downloadedPodcastsCollection.map((podcastItemSnapshot) => (
                    <Card key={podcastItemSnapshot.identification} className="bg-slate-900/80 border-slate-700 overflow-hidden hover:border-purple-500/50 transition-all cursor-pointer group">
                        <CardContent className="p-3 flex gap-4 items-center">
                            
                            {/* COVER IMAGEN [CORRECCIÓN]: Usamos <img> estándar */}
                            <div className="relative h-20 w-20 bg-black/40 rounded-lg flex-shrink-0 overflow-hidden shadow-lg border border-slate-700">
                                 {podcastItemSnapshot.coverImageUniformResourceLocator ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img 
                                        src={podcastItemSnapshot.coverImageUniformResourceLocator}
                                        alt={podcastItemSnapshot.titleTextContent}
                                        className="object-cover w-full h-full"
                                        loading="eager" // Importante para cargar rápido desde caché
                                    />
                                 ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-slate-800"><Headphones className="h-6 w-6 text-slate-600" /></div>
                                 )}
                                 
                                 {/* Overlay Play */}
                                 <div 
                                    className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => playPodcastAction(podcastItemSnapshot)}
                                 >
                                    <PlayCircle className="h-8 w-8 text-white drop-shadow-md" />
                                 </div>
                            </div>
                            
                            {/* Info */}
                            <div className="flex-1 min-w-0 py-1" onClick={() => playPodcastAction(podcastItemSnapshot)}>
                                <h3 className="font-bold text-slate-100 truncate text-sm mb-1 leading-tight">{podcastItemSnapshot.titleTextContent}</h3>
                                <p className="text-xs text-slate-400 truncate mb-2">{podcastItemSnapshot.profiles?.fullName || 'Autor'}</p>
                                <span className="inline-flex items-center gap-1 text-[10px] text-green-400 bg-green-950/30 px-2 py-0.5 rounded border border-green-900/50">
                                    <Clock className="h-3 w-3" /> {Math.floor((podcastItemSnapshot.playbackDurationSecondsTotal || 0)/60)} min
                                </span>
                            </div>
                            
                            {/* Delete Button */}
                            <div className="flex flex-col justify-center border-l border-slate-800 pl-2 ml-1">
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-500 hover:text-red-400 hover:bg-red-950/20" onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteAction(podcastItemSnapshot.identification, podcastItemSnapshot.audioUniformResourceLocator || "");
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
