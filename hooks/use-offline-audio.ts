"use client";

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

// Debe coincidir con el nombre en next.config.mjs
const CACHE_NAME = "supabase-media-cache";

export function useOfflineAudio(audioUrl: string | null) {
  const [isOfflineAvailable, setIsOfflineAvailable] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  // 1. Verificar si ya existe en caché al cargar
  useEffect(() => {
    if (!audioUrl) return;
    
    const checkCache = async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        const match = await cache.match(audioUrl);
        if (match) setIsOfflineAvailable(true);
      } catch (e) {
        console.error("Error checking cache:", e);
      }
    };

    checkCache();
  }, [audioUrl]);

  // 2. Acción de Descargar (Guardar en Cache API)
  const downloadForOffline = useCallback(async () => {
    if (!audioUrl) return;
    setIsDownloading(true);

    try {
      const cache = await caches.open(CACHE_NAME);
      
      // Hacemos el fetch manual
      const response = await fetch(audioUrl, { mode: 'cors' });
      if (!response.ok) throw new Error("Network error");

      // Guardamos la respuesta en la caché
      await cache.put(audioUrl, response);
      
      setIsOfflineAvailable(true);
      toast({ title: "¡Descargado!", description: "Disponible sin conexión." });
    } catch (e) {
      console.error("Download failed:", e);
      toast({ title: "Error", description: "No se pudo descargar. Verifica tu espacio.", variant: "destructive" });
    } finally {
      setIsDownloading(false);
    }
  }, [audioUrl, toast]);

  // 3. Acción de Borrar (Liberar espacio)
  const removeFromOffline = useCallback(async () => {
    if (!audioUrl) return;
    
    try {
      const cache = await caches.open(CACHE_NAME);
      await cache.delete(audioUrl);
      
      setIsOfflineAvailable(false);
      toast({ title: "Eliminado", description: "Ya no está disponible offline." });
    } catch (e) {
      console.error("Delete failed:", e);
    }
  }, [audioUrl, toast]);

  return {
    isOfflineAvailable,
    isDownloading,
    downloadForOffline,
    removeFromOffline
  };
}