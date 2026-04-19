/**
 * ARCHIVO: app/(platform)/offline/page.tsx
 * VERSIÓN: 5.0 (Madrid Resonance - Sovereign Edition)
 * PROTOCOLO: MADRID RESONANCE V7.0
 *
 * Misión: Proyectar la biblioteca de crónicas persistentes en modo desconectado.
 * [REFORMA V5.0]: Sincronización axial completa con el contrato purificado V7.0.
 * Eliminación de fugas snake_case y alineación absoluta con la Doctrina ZAP.
 *
 * Nivel de Integridad: 100% (Soberanía Nominal V7.0)
 */

"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WifiOff, PlayCircle, Clock, Headphones, Trash2 } from "lucide-react";
import { useAudio } from "@/contexts/audio-context";
import { PodcastWithProfile } from "@/types/podcast";
import { formatTime } from "@/lib/utils";

const METADATA_STORAGE_KEY = "offline_podcasts_metadata";
const CACHE_NAME_IDENTIFICATION = "supabase-media-cache";

export default function OfflinePage() {
  const [downloadsCollection, setDownloadsCollection] = useState<PodcastWithProfile[]>([]);
  const { playPodcastAction } = useAudio();
  const [isComponentMountedStatus, setIsComponentMountedStatus] = useState<boolean>(false);

  useEffect(() => {
    setIsComponentMountedStatus(true);
    const storedMetadataText = localStorage.getItem(METADATA_STORAGE_KEY);
    if (storedMetadataText) {
        try {
            const offlineLibraryObject = JSON.parse(storedMetadataText);
            setDownloadsCollection(Object.values(offlineLibraryObject));
        } catch (hardwareException) {
            console.error("🔥 [OfflinePage] Error reading metadata", hardwareException);
        }
    }
  }, []);

  const handleDeletionAction = async (podcastIdentification: number, audioUniformResourceLocator: string) => {
    if(!confirm("¿Borrar descarga?")) return;
    
    try {
        const nativeCacheInstance = await caches.open(CACHE_NAME_IDENTIFICATION);
        await nativeCacheInstance.delete(audioUniformResourceLocator);
    } catch(hardwareException) {
        console.error("🔥 [OfflinePage] Cache deletion failed", hardwareException);
    }

    const storedMetadataText = localStorage.getItem(METADATA_STORAGE_KEY);
    if (storedMetadataText) {
        const offlineLibraryObject = JSON.parse(storedMetadataText);
        delete offlineLibraryObject[podcastIdentification];
        localStorage.setItem(METADATA_STORAGE_KEY, JSON.stringify(offlineLibraryObject));
        setDownloadsCollection(Object.values(offlineLibraryObject));
    }
  };

  if (!isComponentMountedStatus) return null;

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen flex flex-col">
      
      <div className="flex flex-col items-center justify-center mb-8 pt-4">
        <div className="bg-red-500/10 p-4 rounded-full mb-4 animate-pulse">
            <WifiOff className="h-10 w-10 text-red-500" />
        </div>
        <h1 className="text-3xl font-bold text-white text-center uppercase tracking-tighter italic">Modo Desconectado</h1>
        <p className="text-zinc-500 mt-2 text-center max-w-xs font-black uppercase text-[10px] tracking-widest">
            Tu biblioteca local está lista en la Workstation.
        </p>
      </div>

      <div className="flex-1">
        {downloadsCollection.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-zinc-800 rounded-[2.5rem] bg-zinc-950/30">
                <Headphones className="h-12 w-12 text-zinc-700 mb-4" />
                <h3 className="text-lg font-black text-zinc-500 uppercase tracking-widest">Mochila vacía</h3>
                <p className="text-zinc-600 text-[10px] font-bold mt-2 px-6 text-center uppercase tracking-widest">
                    Descarga episodios cuando la sintonía sea estable.
                </p>
            </div>
        ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <h2 className="text-sm font-black text-white mb-2 col-span-full flex items-center gap-3 uppercase tracking-[0.3em]">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Nodos Disponibles ({downloadsCollection.length})
                </h2>
                
                {downloadsCollection.map((podcastItem) => (
                    <Card key={podcastItem.identification} className="bg-zinc-900/40 border-white/5 overflow-hidden hover:border-primary/40 transition-all cursor-pointer group rounded-[2rem] shadow-2xl">
                        <CardContent className="p-4 flex gap-5 items-center">
                            
                            <div className="relative h-20 w-20 bg-black/40 rounded-2xl flex-shrink-0 overflow-hidden shadow-lg border border-white/5">
                                 {podcastItem.coverImageUniformResourceLocator ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img 
                                        src={podcastItem.coverImageUniformResourceLocator}
                                        alt={podcastItem.titleTextContent}
                                        className="object-cover w-full h-full opacity-60 group-hover:opacity-100 transition-opacity"
                                        loading="eager"
                                    />
                                 ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-zinc-800"><Headphones className="h-6 w-6 text-zinc-600" /></div>
                                 )}
                                 
                                 <div 
                                    className="absolute inset-0 bg-primary/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => playPodcastAction(podcastItem)}
                                 >
                                    <PlayCircle className="h-10 w-10 text-white drop-shadow-2xl" />
                                 </div>
                            </div>
                            
                            <div className="flex-1 min-w-0 py-1" onClick={() => playPodcastAction(podcastItem)}>
                                <h3 className="font-black text-white truncate text-sm mb-1 leading-tight uppercase tracking-tight italic">{podcastItem.titleTextContent}</h3>
                                <p className="text-[10px] text-zinc-500 truncate mb-2 font-bold uppercase tracking-widest">{podcastItem.profiles?.fullName || 'Voyager'}</p>
                                <span className="inline-flex items-center gap-1.5 text-[9px] font-black text-primary bg-primary/5 px-2.5 py-1 rounded-full border border-primary/10 uppercase tracking-widest">
                                    <Clock className="h-3 w-3" /> {formatTime(podcastItem.playbackDurationSecondsTotal)}
                                </span>
                            </div>
                            
                            <div className="flex flex-col justify-center border-l border-white/5 pl-3">
                                <Button size="icon" variant="ghost" className="h-10 w-10 text-zinc-600 hover:text-red-500 hover:bg-red-500/5 transition-all" onClick={(interactionEvent) => {
                                    interactionEvent.stopPropagation();
                                    handleDeletionAction(podcastItem.identification, podcastItem.audioUniformResourceLocator);
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
