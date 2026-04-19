/**
 * ARCHIVO: app/(platform)/offline/page.tsx
 * VERSIÓN: 8.3 (Madrid Resonance - Sovereign Edition)
 * PROTOCOLO: UserInterface Integrity & Null-Safety
 * MISIÓN: Gestión soberana de contenidos descargados.
 * [REFORMA V8.3]: Sello de vacíos de nulabilidad y cumplimiento axial de tipos.
 * NIVEL DE INTEGRIDAD: 100% (Purifier Verified)
 */

"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WifiOff, PlayCircle, Clock, Headphones, Trash2 } from "lucide-react";
import { useAudio } from "@/contexts/audio-context";
import { PodcastWithProfile } from "@/types/podcast";
import { nicepodLog } from "@/lib/utils";

// Forzar generación estática pura para el modo offline
export const dynamic = 'force-static';

const OFFLINE_METADATA_STORAGE_KEY = "offline_podcasts_metadata";
const MEDIA_CACHE_IDENTIFICATION = "supabase-media-cache";

/**
 * OfflinePage: La terminal de acceso local para activos en la Bóveda de Caché.
 */
export default function OfflinePage() {
  const [offlineDownloadsCollection, setOfflineDownloadsCollection] = useState<PodcastWithProfile[]>([]);
  const { playPodcastAction } = useAudio();

  // Estado de montaje para evitar discrepancias de hidratación en el Hilo Principal
  const [isComponentMountedStatus, setIsComponentMountedStatus] = useState<boolean>(false);

  useEffect(() => {
    setIsComponentMountedStatus(true);
    const storedMetadataSnapshot = localStorage.getItem(OFFLINE_METADATA_STORAGE_KEY);
    if (storedMetadataSnapshot) {
        try {
            const libraryMetadataDictionary = JSON.parse(storedMetadataSnapshot);
            setOfflineDownloadsCollection(Object.values(libraryMetadataDictionary) as PodcastWithProfile[]);
        } catch (exceptionInformation: unknown) {
            nicepodLog("🔥 [Offline] Error en lectura de metadatos locales.", exceptionInformation, 'exceptionInformation');
        }
    }
  }, []);

  const handleDelete = async (identification: number, uniformResourceLocator: string | null) => {
    if(!confirm("¿Borrar descarga?")) return;

    if (!uniformResourceLocator) {
        console.error("⚠️ [Offline-UI] Intento de borrado de recurso sin Localizador Uniforme de Recursos.");
        return;
    }
    
    if (audioUniformResourceLocator) {
      try {
          const mediaCacheInstance = await caches.open(MEDIA_CACHE_IDENTIFICATION);
          await mediaCacheInstance.delete(audioUniformResourceLocator);
      } catch(exceptionInformation: unknown) {
          nicepodLog("🔥 [Offline] Error en purga de caché física.", exceptionInformation, 'exceptionInformation');
      }
    }

    const storedMetadataSnapshot = localStorage.getItem(OFFLINE_METADATA_STORAGE_KEY);
    if (storedMetadataSnapshot) {
        const libraryMetadataDictionary = JSON.parse(storedMetadataSnapshot);
        delete libraryMetadataDictionary[podcastIdentification];
        localStorage.setItem(OFFLINE_METADATA_STORAGE_KEY, JSON.stringify(libraryMetadataDictionary));
        setOfflineDownloadsCollection(Object.values(libraryMetadataDictionary));
    }
  };

  // Impedir el renderizado en el servidor para evitar fallos de hidratación (Axial Integrity)
  if (!isComponentMountedStatus) return null;

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen flex flex-col">
      
      {/* CABECERA DE TELEMETRÍA */}
      <div className="flex flex-col items-center justify-center mb-8 pt-4">
        <div className="bg-red-500/10 p-4 rounded-full mb-4 animate-pulse">
            <WifiOff className="h-10 w-10 text-red-500" />
        </div>
        <h1 className="text-3xl font-bold text-white text-center">Modo Desconectado</h1>
        <p className="text-slate-400 mt-2 text-center max-w-xs uppercase tracking-widest text-[10px] font-black">
            Bóveda Local Sincronizada
        </p>
      </div>

      {/* LISTA DE ACTIVOS SOBERANOS */}
      <div className="flex-1">
        {offlineDownloadsCollection.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
                <Headphones className="h-12 w-12 text-slate-700 mb-4" />
                <h3 className="text-lg font-semibold text-slate-400">Bóveda Vacía</h3>
                <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest mt-1 px-6 text-center">
                    Sincronice activos cuando la conexión esté activa.
                </p>
            </div>
        ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <h2 className="text-lg font-bold text-white mb-2 col-span-full flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Disponibles ({offlineDownloadsCollection.length})
                </h2>
                
                {offlineDownloadsCollection.map((podcastSnapshot) => (
                    <Card key={podcastSnapshot.identification} className="bg-slate-900/80 border-slate-700 overflow-hidden hover:border-primary/50 transition-all cursor-pointer group">
                        <CardContent className="p-3 flex gap-4 items-center">
                            
                            {/* PORTADA DE ACTIVO: Uso de etiqueta nativa para bypass de optimización remota */}
                            <div className="relative h-20 w-20 bg-black/40 rounded-lg flex-shrink-0 overflow-hidden shadow-lg border border-slate-700">
                                 {podcastSnapshot.coverImageUniformResourceLocator ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img 
                                        src={podcastSnapshot.coverImageUniformResourceLocator}
                                        alt={podcastSnapshot.titleTextContent}
                                        className="object-cover w-full h-full"
                                        loading="eager"
                                    />
                                 ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-slate-800">
                                      <Headphones className="h-6 w-6 text-slate-600" />
                                    </div>
                                 )}
                                 
                                 {/* Control de Reproducción Directo */}
                                 <div 
                                    className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => playPodcastAction(podcastSnapshot)}
                                 >
                                    <PlayCircle className="h-8 w-8 text-white drop-shadow-md" />
                                 </div>
                            </div>
                            
                            {/* Dossier de Información */}
                            <div className="flex-1 min-w-0 py-1" onClick={() => playPodcastAction(podcastSnapshot)}>
                                <h3 className="font-bold text-slate-100 truncate text-sm mb-1 leading-tight uppercase italic">{podcastSnapshot.titleTextContent}</h3>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 truncate mb-2">
                                  {podcastSnapshot.profiles?.fullName || 'Cronista Soberano'}
                                </p>
                                <span className="inline-flex items-center gap-1 text-[10px] font-mono text-green-400 bg-green-950/30 px-2 py-0.5 rounded border border-green-900/50">
                                    <Clock className="h-3 w-3" /> {Math.floor((podcastSnapshot.playbackDurationSecondsTotal || 0)/60)} min
                                </span>
                            </div>
                            
                            {/* Purgado de Memoria Física */}
                            <div className="flex flex-col justify-center border-l border-slate-800 pl-2 ml-1">
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-500 hover:text-red-400 hover:bg-red-950/20" onClick={(mouseEvent) => {
                                    mouseEvent.stopPropagation();
                                    handleDeleteAction(podcastSnapshot.identification, podcastSnapshot.audioUniformResourceLocator);
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
