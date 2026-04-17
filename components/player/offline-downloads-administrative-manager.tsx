/**
 * ARCHIVO: components/player/offline-downloads-administrative-manager.tsx
 * VERSIÓN: 4.0 (Madrid Resonance - Sovereign Edition)
 * PROTOCOLO: MADRID RESONANCE V7.0
 *
 * Misión: Gestión de activos offline con validación cruzada.
 * [REFORMA V4.0]: Sincronización axial completa con el contrato purificado V7.0.
 * Eliminación de fugas snake_case y alineación absoluta con la Doctrina ZAP.
 *
 * Nivel de Integridad: 100% (Soberanía Nominal V7.0)
 */

"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAudio } from "@/contexts/audio-context";
import { useToast } from "@/hooks/use-toast";
import { HardDrive, Loader2, Mic, PlayCircle, Smartphone, Trash2 } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { PodcastWithProfile } from "@/types/podcast";

const CACHE_NAME_IDENTIFICATION = "supabase-media-cache";
const METADATA_STORAGE_KEY = "offline_podcasts_metadata";

/**
 * OfflineDownloadsAdministrativeManager: El panel de control para el almacenamiento local.
 */
export function OfflineDownloadsAdministrativeManager() {
  const [downloadsCollection, setDownloadsCollection] = useState<PodcastWithProfile[]>([]);
  const [usedSpaceBytesMagnitude, setUsedSpaceBytesMagnitude] = useState(0);
  const [totalQuotaBytesMagnitude, setTotalQuotaBytesMagnitude] = useState(0);
  const [isDataLoadingStatus, setIsDataLoadingStatus] = useState(true);

  const { toast } = useToast();
  const { playPodcastAction } = useAudio();

  const loadOfflineDataAction = useCallback(async () => {
    setIsDataLoadingStatus(true);

    try {
      const nativeCacheInstance = await caches.open(CACHE_NAME_IDENTIFICATION);
      const storedMetadataText = localStorage.getItem(METADATA_STORAGE_KEY);
      const offlineLibraryObject = storedMetadataText ? JSON.parse(storedMetadataText) : {};

      const activeDownloadsArray = [];
      let totalSizeAccumulator = 0;

      for (const [identification, podcastItem] of Object.entries(offlineLibraryObject) as any) {
        const matchedResponse = await nativeCacheInstance.match(podcastItem.audioUniformResourceLocator);
        if (matchedResponse) {
          const binaryDataBlob = await matchedResponse.blob();
          totalSizeAccumulator += binaryDataBlob.size;
          activeDownloadsArray.push(podcastItem);
        } else {
          delete offlineLibraryObject[identification];
        }
      }

      localStorage.setItem(METADATA_STORAGE_KEY, JSON.stringify(offlineLibraryObject));
      setDownloadsCollection(activeDownloadsArray);
      setUsedSpaceBytesMagnitude(totalSizeAccumulator);

      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const storageEstimate = await navigator.storage.estimate();
        setTotalQuotaBytesMagnitude(storageEstimate.quota || 0);
      }
    } catch (hardwareException) {
      console.error("🔥 [OfflineManager] Data sync failed:", hardwareException);
    } finally {
      setIsDataLoadingStatus(false);
    }
  }, []);

  useEffect(() => {
    loadOfflineDataAction();
  }, [loadOfflineDataAction]);

  const formatBytesAction = (bytesMagnitude: number) => {
    if (bytesMagnitude === 0) return "0 MB";
    const conversionFactor = 1024;
    const sizeLabels = ["Bytes", "KB", "MB", "GB"];
    const unitIndex = Math.floor(Math.log(bytesMagnitude) / Math.log(conversionFactor));
    return parseFloat((bytesMagnitude / Math.pow(conversionFactor, unitIndex)).toFixed(2)) + " " + sizeLabels[unitIndex];
  };

  const handleDeletionAction = async (podcastIdentification: number, audioUrl: string) => {
    try {
      const nativeCacheInstance = await caches.open(CACHE_NAME_IDENTIFICATION);
      await nativeCacheInstance.delete(audioUrl);

      const storedMetadataText = localStorage.getItem(METADATA_STORAGE_KEY);
      if (storedMetadataText) {
        const offlineLibraryObject = JSON.parse(storedMetadataText);
        delete offlineLibraryObject[podcastIdentification];
        localStorage.setItem(METADATA_STORAGE_KEY, JSON.stringify(offlineLibraryObject));
      }

      await loadOfflineDataAction();
      toast({ title: "Eliminado", description: "Audio purgado del almacenamiento local." });
    } catch (hardwareException) {
      toast({ title: "Error al purgar", variant: "destructive" });
    }
  };

  const handleClearAllAction = async () => {
    if (!confirm("¿Confirmar purga total de activos offline?")) return;

    try {
      const nativeCacheInstance = await caches.open(CACHE_NAME_IDENTIFICATION);
      const cachedKeysCollection = await nativeCacheInstance.keys();
      for (const requestInstance of cachedKeysCollection) { await nativeCacheInstance.delete(requestInstance); }
      localStorage.removeItem(METADATA_STORAGE_KEY);

      await loadOfflineDataAction();
      toast({ title: "Limpieza Completada", description: "Espacio liberado con éxito." });
    } catch (hardwareException) {
      toast({ title: "Error en purga", variant: "destructive" });
    }
  };

  const consumptionPercentageMagnitude = totalQuotaBytesMagnitude > 0 ? Math.min(100, (usedSpaceBytesMagnitude / totalQuotaBytesMagnitude) * 100) : 0;

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-700">

      <Card className="bg-zinc-950/60 border-white/5 rounded-[2rem] overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 flex items-center gap-2">
            <HardDrive className="h-4 w-4" /> Almacenamiento Local
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-black text-white">{formatBytesAction(usedSpaceBytesMagnitude)}</span>
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Capacidad Total</span>
          </div>
          <Progress value={consumptionPercentageMagnitude} className="h-2 bg-zinc-800" />

          {downloadsCollection.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAllAction}
              className="mt-6 w-full text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-400 hover:bg-red-950/20 border border-red-900/20 rounded-xl"
            >
              <Trash2 className="h-3 w-3 mr-2" /> Purgar todo el almacenamiento
            </Button>
          )}
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] pl-1 mb-2">
          Activos en Resonancia ({downloadsCollection.length})
        </h3>

        {isDataLoadingStatus ? (
          <div className="flex justify-center py-10 opacity-30"><Loader2 className="animate-spin" /></div>
        ) : downloadsCollection.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-zinc-800 rounded-[2rem] bg-zinc-900/10 text-center">
            <Smartphone className="h-8 w-8 text-zinc-700 mb-3" />
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Mochila vacía</p>
          </div>
        ) : (
          downloadsCollection.map((podcastItem) => (
            <div key={podcastItem.identification} className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-primary/40 transition-all group">
              <div className="relative h-12 w-12 rounded-xl overflow-hidden bg-zinc-900 flex-shrink-0 border border-white/5">
                {podcastItem.coverImageUniformResourceLocator ? (
                  <Image src={podcastItem.coverImageUniformResourceLocator} alt="" fill className="object-cover" />
                ) : (
                  <Mic className="h-4 w-4 text-zinc-600 m-auto" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="font-black text-xs text-white truncate uppercase tracking-tight group-hover:text-primary">{podcastItem.titleTextContent}</h4>
                <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest truncate">{podcastItem.profiles?.fullName || 'Curador'}</p>
              </div>

              <div className="flex items-center gap-1">
                <Button size="icon" variant="ghost" className="h-9 w-9 text-primary hover:bg-primary/10" onClick={() => playPodcastAction(podcastItem)}>
                  <PlayCircle className="h-5 w-5" />
                </Button>
                <Button size="icon" variant="ghost" className="h-9 w-9 text-zinc-600 hover:text-red-400 hover:bg-red-900/10" onClick={() => handleDeletionAction(podcastItem.identification, podcastItem.audioUniformResourceLocator || '')}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
