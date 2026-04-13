// components/player/downloads-manager.tsx
// VERSIÓN: 3.0 (NicePod Offline Engine - Atomic Consistency Edition)
// Misión: Gestión de activos offline con validación cruzada entre Caché y Metadatos.
// [ESTABILIZACIÓN]: Implementación de validación de integridad física (Cross-check) en montaje.

"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAudio } from "@/contexts/audio-context";
import { useToast } from "@/hooks/use-toast";
import { HardDrive, Loader2, Mic, PlayCircle, Smartphone, Trash2 } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

const CACHE_NAME = "supabase-media-cache";
const METADATA_KEY = "offline_podcasts_metadata";

export function DownloadsManager() {
  const [downloads, setDownloads] = useState<any[]>([]);
  const [usedSpace, setUsedSpace] = useState(0);
  const [totalQuota, setTotalQuota] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const { toast } = useToast();
  const { playPodcastAction } = useAudio();

  /**
   * [PROTOCOLO DE SINCRONÍA]:
   * Valida la existencia física del archivo en caché. Si el metadato existe pero 
   * el archivo fue purgado por el navegador (o borrado), lo eliminamos del registro.
   */
  const loadData = useCallback(async () => {
    setIsLoading(true);

    try {
      const cache = await caches.open(CACHE_NAME);
      const stored = localStorage.getItem(METADATA_KEY);
      const library = stored ? JSON.parse(stored) : {};

      const activeDownloads = [];
      let totalSize = 0;

      // Validación cruzada
      for (const [id, pod] of Object.entries(library) as any) {
        const response = await cache.match(pod.audio_url);
        if (response) {
          const blob = await response.blob();
          totalSize += blob.size;
          activeDownloads.push(pod);
        } else {
          // Si el archivo ya no existe físicamente, eliminamos la referencia corrupta
          delete library[id];
        }
      }

      // Sincronizar estado real con localStorage
      localStorage.setItem(METADATA_KEY, JSON.stringify(library));
      setDownloads(activeDownloads);
      setUsedSpace(totalSize);

      // Estimación de cuota
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        setTotalQuota(estimate.quota || 0);
      }
    } catch (e) {
      console.error("[NicePod-Downloads] Error en validación de integridad:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 MB";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleDelete = async (id: number, url: string) => {
    try {
      const cache = await caches.open(CACHE_NAME);
      await cache.delete(url);

      const stored = localStorage.getItem(METADATA_KEY);
      if (stored) {
        const library = JSON.parse(stored);
        delete library[id];
        localStorage.setItem(METADATA_KEY, JSON.stringify(library));
      }

      await loadData();
      toast({ title: "Eliminado", description: "Audio purgado del almacenamiento local." });
    } catch (e) {
      toast({ title: "Error al purgar", variant: "destructive" });
    }
  };

  const handleClearAll = async () => {
    if (!confirm("¿Confirmar purga total de activos offline?")) return;

    try {
      const cache = await caches.open(CACHE_NAME);
      const keys = await cache.keys();
      for (const request of keys) { await cache.delete(request); }
      localStorage.removeItem(METADATA_KEY);

      await loadData();
      toast({ title: "Limpieza Completada", description: "Espacio liberado con éxito." });
    } catch (e) {
      toast({ title: "Error en purga", variant: "destructive" });
    }
  };

  const percentage = totalQuota > 0 ? Math.min(100, (usedSpace / totalQuota) * 100) : 0;

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-700">

      {/* TARJETA DE GOBERNANZA DE ESPACIO */}
      <Card className="bg-zinc-950/60 border-white/5 rounded-[2rem] overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 flex items-center gap-2">
            <HardDrive className="h-4 w-4" /> Almacenamiento Local
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-black text-white">{formatBytes(usedSpace)}</span>
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Capacidad Total</span>
          </div>
          <Progress value={percentage} className="h-2 bg-zinc-800" />

          {downloads.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="mt-6 w-full text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-400 hover:bg-red-950/20 border border-red-900/20 rounded-xl"
            >
              <Trash2 className="h-3 w-3 mr-2" /> Purgar todo el almacenamiento
            </Button>
          )}
        </CardContent>
      </Card>

      {/* LISTA DE ACTIVOS */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] pl-1 mb-2">
          Activos en Resonancia ({downloads.length})
        </h3>

        {isLoading ? (
          <div className="flex justify-center py-10 opacity-30"><Loader2 className="animate-spin" /></div>
        ) : downloads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-zinc-800 rounded-[2rem] bg-zinc-900/10 text-center">
            <Smartphone className="h-8 w-8 text-zinc-700 mb-3" />
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Mochila vacía</p>
          </div>
        ) : (
          downloads.map((pod) => (
            <div key={pod.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-primary/40 transition-all group">
              <div className="relative h-12 w-12 rounded-xl overflow-hidden bg-zinc-900 flex-shrink-0 border border-white/5">
                {pod.cover_image_url ? (
                  <Image src={pod.cover_image_url} alt="" fill className="object-cover" />
                ) : (
                  <Mic className="h-4 w-4 text-zinc-600 m-auto" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="font-black text-xs text-white truncate uppercase tracking-tight group-hover:text-primary">{pod.title}</h4>
                <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest truncate">{pod.profiles?.full_name || 'Curador'}</p>
              </div>

              <div className="flex items-center gap-1">
                <Button size="icon" variant="ghost" className="h-9 w-9 text-primary hover:bg-primary/10" onClick={() => playPodcastAction(pod)}>
                  <PlayCircle className="h-5 w-5" />
                </Button>
                <Button size="icon" variant="ghost" className="h-9 w-9 text-zinc-600 hover:text-red-400 hover:bg-red-900/10" onClick={() => handleDelete(pod.id, pod.audio_url)}>
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

/**
 * NOTA TÉCNICA DEL ARCHITECT (V3.0):
 * 1. Validación de Integridad Físico-Digital: Se añadió un ciclo de verificación 
 *    (Cache.match) en el montaje. Esto asegura que si el navegador eliminó un archivo 
 *    por falta de espacio, el metadato en LocalStorage se sincroniza y se elimina, 
 *    evitando errores de "fantasmas" en la lista de descargas.
 * 2. Integridad de Interfaz: Se han estandarizado los radios de borde a [2.5rem] 
 *    y [2rem] para total cohesión con la Workstation.
 * 3. Gestión de Memoria: El uso de 'useCallback' en 'loadData' previene múltiples 
 *    ejecuciones del cálculo de espacio en disco durante el ciclo de renderizado.
 */