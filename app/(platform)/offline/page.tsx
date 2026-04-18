/**
 * ARCHIVO: app/(platform)/offline/page.tsx
 * VERSIÓN: 5.1 (Madrid Resonance)
 * PROTOCOLO: Intellectual Capital & Traceability
 * MISIÓN: Terminal de acceso resiliente para la reproducción de crónicas en modo desconectado.
 * NIVEL DE INTEGRIDAD: 100%
 */

"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WifiOff, PlayCircle, Clock, Headphones, Trash2 } from "lucide-react";
import { useAudio } from "@/contexts/audio-context";
import { nicepodLog } from "@/lib/utils";

// Forzar estático puro para garantizar disponibilidad sin red.
export const dynamic = 'force-static';

const OFFLINE_PODCASTS_METADATA_STORAGE_KEY = "offline_podcasts_metadata";
const SUPABASE_MEDIA_CACHE_NAME = "supabase-media-cache";

/**
 * OfflinePage: La interfaz de supervivencia de NicePod.
 * Permite al Voyager acceder a su Capital Intelectual incluso sin enlace a la Malla.
 */
export default function OfflinePage() {
  const [offlineDownloadsCollection, setOfflineDownloadsCollection] = useState<any[]>([]);
  const { playPodcastAction } = useAudio();

  // Estado de montaje para evitar excepciones de hidratación en el reactor React.
  const [isComponentMountedStatus, setIsComponentMountedStatus] = useState<boolean>(false);

  useEffect(() => {
    setIsComponentMountedStatus(true);
    const storedMetadataRawContent = localStorage.getItem(OFFLINE_PODCASTS_METADATA_STORAGE_KEY);

    if (storedMetadataRawContent) {
        try {
            const parsedOfflineLibraryDictionary = JSON.parse(storedMetadataRawContent);
            setOfflineDownloadsCollection(Object.values(parsedOfflineLibraryDictionary));
            nicepodLog(`📡 [Offline] Sincronización local exitosa: ${Object.keys(parsedOfflineLibraryDictionary).length} crónicas detectadas.`);
        } catch (parseException: unknown) {
            nicepodLog("🔥 [Offline] Fallo en des-serialización de metadatos locales.", parseException, "error");
        }
    }
  }, []);

  /**
   * handleDeletePodcastAction:
   * Misión: Purgar físicamente el binario del Caché de Medios y actualizar la Bóveda Local.
   */
  const handleDeletePodcastAction = async (podcastIdentification: number, audioUniformResourceLocator: string) => {
    if(!confirm("¿Desea purgar esta crónica de la memoria local?")) return;
    
    try {
        const mediaCacheInstance = await caches.open(SUPABASE_MEDIA_CACHE_NAME);
        await mediaCacheInstance.delete(audioUniformResourceLocator);
    } catch(cacheException: unknown) {
        nicepodLog("⚠️ [Offline] Error al purgar binario del Caché de Medios.", cacheException, "warn");
    }

    const storedMetadataRawContent = localStorage.getItem(OFFLINE_PODCASTS_METADATA_STORAGE_KEY);
    if (storedMetadataRawContent) {
        const parsedOfflineLibraryDictionary = JSON.parse(storedMetadataRawContent);
        delete parsedOfflineLibraryDictionary[podcastIdentification];
        localStorage.setItem(OFFLINE_PODCASTS_METADATA_STORAGE_KEY, JSON.stringify(parsedOfflineLibraryDictionary));
        setOfflineDownloadsCollection(Object.values(parsedOfflineLibraryDictionary));
        nicepodLog(`🗑️ [Offline] Crónica #${podcastIdentification} purgada con éxito.`);
    }
  };

  // Evitar renderizado prematuro para prevenir desajustes de hidratación (Hydration Mismatch).
  if (!isComponentMountedStatus) return null;

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen flex flex-col isolate">
      
      {/* SECCIÓN I: INDICADOR DE ESTADO ATMOSFÉRICO */}
      <div className="flex flex-col items-center justify-center mb-8 pt-4">
        <div className="bg-red-500/10 p-4 rounded-full mb-4 animate-pulse border border-red-500/20">
            <WifiOff className="h-10 w-10 text-red-500" />
        </div>
        <h1 className="text-3xl font-black text-white text-center uppercase tracking-tighter italic">Modo Desconectado</h1>
        <p className="text-zinc-500 mt-2 text-center max-w-xs font-bold uppercase text-[10px] tracking-[0.2em]">
            La Malla está inactiva. Tu biblioteca local está operativa.
        </p>
      </div>

      {/* SECCIÓN II: INVENTARIO DE SUPERVIVENCIA */}
      <div className="flex-1">
        {offlineDownloadsCollection.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-zinc-800 rounded-[2.5rem] bg-zinc-900/30">
                <Headphones className="h-12 w-12 text-zinc-700 mb-4" />
                <h3 className="text-lg font-black text-zinc-400 uppercase tracking-tight">Mochila vacía</h3>
                <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest mt-1 px-6 text-center">
                    Sincroniza episodios cuando el enlace de red sea estable.
                </p>
            </div>
        ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <h2 className="text-[10px] font-black text-white mb-2 col-span-full flex items-center gap-2 uppercase tracking-[0.3em]">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Activos Disponibles ({offlineDownloadsCollection.length})
                </h2>
                
                {offlineDownloadsCollection.map((podcastItem) => (
                    <Card key={podcastItem.id} className="bg-zinc-900/80 border-white/5 overflow-hidden hover:border-primary/50 transition-all cursor-pointer group rounded-2xl">
                        <CardContent className="p-3 flex gap-4 items-center">
                            
                            {/* Visualización de Portada (Metal-to-Crystal) */}
                            <div className="relative h-20 w-20 bg-black/40 rounded-xl flex-shrink-0 overflow-hidden shadow-lg border border-white/5">
                                 {podcastItem.cover_image_url ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img 
                                        src={podcastItem.cover_image_url}
                                        alt={podcastItem.title}
                                        className="object-cover w-full h-full"
                                        loading="eager"
                                    />
                                 ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-zinc-800"><Headphones className="h-6 w-6 text-zinc-600" /></div>
                                 )}
                                 
                                 {/* Protocolo de Activación Inmediata */}
                                 <div 
                                    className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => playPodcastAction(podcastItem)}
                                 >
                                    <PlayCircle className="h-8 w-8 text-white drop-shadow-md" />
                                 </div>
                            </div>
                            
                            {/* Metadatos de Identidad */}
                            <div className="flex-1 min-w-0 py-1" onClick={() => playPodcastAction(podcastItem)}>
                                <h3 className="font-black text-white truncate text-sm mb-1 leading-tight uppercase tracking-tighter italic">{podcastItem.title}</h3>
                                <p className="text-[10px] text-zinc-500 truncate mb-2 font-bold uppercase tracking-widest">{podcastItem.profiles?.full_name || 'Curador Anónimo'}</p>
                                <span className="inline-flex items-center gap-1 text-[9px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-black uppercase tracking-widest">
                                    <Clock className="h-3 w-3" /> {Math.floor((podcastItem.duration_seconds || 0)/60)} min
                                </span>
                            </div>
                            
                            {/* Comando de Purga */}
                            <div className="flex flex-col justify-center border-l border-white/5 pl-2 ml-1">
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-500 hover:text-red-400 hover:bg-red-500/10" onClick={(event) => {
                                    event.stopPropagation();
                                    handleDeletePodcastAction(podcastItem.id, podcastItem.audio_url);
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
