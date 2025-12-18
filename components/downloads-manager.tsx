"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Trash2, HardDrive, Smartphone, PlayCircle, AlertCircle, Mic } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { useAudio } from "@/contexts/audio-context";

const CACHE_NAME = "supabase-media-cache";
const METADATA_KEY = "offline_podcasts_metadata";

export function DownloadsManager() {
  const [downloads, setDownloads] = useState<any[]>([]);
  const [usedSpace, setUsedSpace] = useState(0); 
  const [totalQuota, setTotalQuota] = useState(0); 
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { playPodcast } = useAudio();

  // 1. Cargar datos y calcular espacio al montar
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    
    // A. Cargar lista desde LocalStorage
    const stored = localStorage.getItem(METADATA_KEY);
    if (stored) {
      setDownloads(Object.values(JSON.parse(stored)));
    } else {
      setDownloads([]);
    }

    // B. Calcular espacio real ocupado en Caché API
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        // Método moderno
        const estimate = await navigator.storage.estimate();
        setUsedSpace(estimate.usage || 0);
        setTotalQuota(estimate.quota || 0);
      } else {
        // Fallback: Contar bytes manualmente en la caché específica
        const cache = await caches.open(CACHE_NAME);
        const keys = await cache.keys();
        let size = 0;
        for (const request of keys) {
            const response = await cache.match(request);
            if (response) {
                const blob = await response.blob();
                size += blob.size;
            }
        }
        setUsedSpace(size);
      }
    } catch (e) {
      console.error("Error calculando espacio:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 MB";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleDelete = async (id: number, url: string) => {
    try {
      // 1. Borrar de Caché (Archivo físico)
      const cache = await caches.open(CACHE_NAME);
      await cache.delete(url);

      // 2. Borrar de Metadata (Lista visual)
      const stored = localStorage.getItem(METADATA_KEY);
      if (stored) {
        const library = JSON.parse(stored);
        delete library[id];
        localStorage.setItem(METADATA_KEY, JSON.stringify(library));
      }
      
      // 3. Actualizar UI
      await loadData(); // Recalcular espacio
      toast({ title: "Eliminado", description: "Audio borrado del almacenamiento." });
    } catch (e) {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  const handleClearAll = async () => {
    if(!confirm("¿Estás seguro de borrar TODAS las descargas? Esta acción no se puede deshacer.")) return;
    
    try {
      const cache = await caches.open(CACHE_NAME);
      const keys = await cache.keys();
      for (const request of keys) {
        await cache.delete(request);
      }
      localStorage.removeItem(METADATA_KEY);
      
      await loadData();
      toast({ title: "Limpieza Completa", description: "Has liberado todo el espacio." });
    } catch (e) {
      toast({ title: "Error al limpiar", variant: "destructive" });
    }
  };

  // Cálculo visual para la barra de progreso
  // Si el navegador no da cuota (pasa a veces), asumimos un tope visual de 500MB para referencia
  const visualTotal = totalQuota > 0 ? totalQuota : 500 * 1024 * 1024; 
  const percentage = Math.min(100, (usedSpace / visualTotal) * 100);

  return (
    <div className="space-y-6">
      {/* TARJETA DE ESTADO DE ALMACENAMIENTO */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
                <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                    <Smartphone className="h-4 w-4" /> Almacenamiento Local
                </CardTitle>
                <span className="text-xs text-white font-mono">{formatBytes(usedSpace)} usados</span>
            </div>
        </CardHeader>
        <CardContent>
            <Progress value={percentage} className="h-2 bg-slate-800" />
            <div className="mt-2 flex justify-between items-center text-[10px] text-muted-foreground uppercase tracking-wider">
                <span>NicePod Offline</span>
                {totalQuota > 0 && <span>Total Disp: {formatBytes(totalQuota)}</span>}
            </div>
            
            {downloads.length > 0 && (
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleClearAll}
                    className="mt-4 w-full text-red-400 hover:text-red-300 hover:bg-red-950/30 border border-red-900/30"
                >
                    <Trash2 className="h-3 w-3 mr-2" /> Liberar espacio
                </Button>
            )}
        </CardContent>
      </Card>

      {/* LISTA DE EPISODIOS */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider pl-1 mb-2">
            Episodios ({downloads.length})
        </h3>
        
        {downloads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-800 rounded-xl bg-slate-900/20">
                <HardDrive className="h-8 w-8 text-slate-600 mb-3" />
                <p className="text-slate-500 text-sm">Tu mochila está vacía.</p>
                <p className="text-xs text-slate-600 mt-1">Descarga episodios para escuchar sin conexión.</p>
            </div>
        ) : (
            downloads.map((pod) => (
                <div key={pod.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-colors group">
                    {/* Cover */}
                    <div className="relative h-12 w-12 rounded-lg bg-black/40 flex-shrink-0 overflow-hidden border border-slate-700">
                        {pod.cover_image_url ? (
                            <Image src={pod.cover_image_url} alt="" fill className="object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-800"><Mic className="h-4 w-4 text-slate-600" /></div>
                        )}
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-slate-200 truncate pr-2">{pod.title}</h4>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                            <span className="truncate max-w-[100px]">{pod.profiles?.full_name || 'Autor'}</span>
                            <span>•</span>
                            <span>{Math.floor((pod.duration_seconds || 0)/60)} min</span>
                        </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center gap-1">
                         <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20" onClick={() => playPodcast(pod)}>
                            <PlayCircle className="h-5 w-5" />
                         </Button>
                         <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-600 hover:text-red-400 hover:bg-red-900/20" onClick={() => handleDelete(pod.id, pod.audio_url)}>
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