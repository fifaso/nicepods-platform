"use client";

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { PodcastWithProfile } from "@/types/podcast";

const CACHE_NAME = "supabase-media-cache";
const METADATA_KEY = "offline_podcasts_metadata";

export function useOfflineAudio(podcast: PodcastWithProfile) {
  const [isOfflineAvailable, setIsOfflineAvailable] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();
  
  const audioUrl = podcast.audio_url;

  // 1. Verificar estado inicial
  useEffect(() => {
    if (!audioUrl) return;
    const checkCache = async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        const match = await cache.match(audioUrl);
        if (match) setIsOfflineAvailable(true);
      } catch (e) {
        console.error("Cache check failed", e);
      }
    };
    checkCache();
  }, [audioUrl]);

  // 2. Descargar (Audio + Metadata)
  const downloadForOffline = useCallback(async () => {
    if (!audioUrl) return;
    setIsDownloading(true);

    try {
      // A. Guardar Audio (Blob)
      const cache = await caches.open(CACHE_NAME);
      const response = await fetch(audioUrl, { mode: 'cors' });
      if (!response.ok) throw new Error("Network error");
      await cache.put(audioUrl, response);

      // B. Guardar Metadata (JSON en LocalStorage)
      const stored = localStorage.getItem(METADATA_KEY);
      const library = stored ? JSON.parse(stored) : {};
      
      // Guardamos solo lo necesario para pintar la tarjeta offline
      library[podcast.id] = {
        id: podcast.id,
        title: podcast.title,
        audio_url: podcast.audio_url,
        cover_image_url: podcast.cover_image_url,
        duration_seconds: podcast.duration_seconds,
        profiles: podcast.profiles, // Autor
        created_at: podcast.created_at
      };
      
      localStorage.setItem(METADATA_KEY, JSON.stringify(library));
      
      setIsOfflineAvailable(true);
      toast({ title: "¡Descargado!", description: "Disponible en Modo Avión." });
    } catch (e) {
      console.error("Download failed:", e);
      toast({ title: "Error", description: "Fallo la descarga.", variant: "destructive" });
    } finally {
      setIsDownloading(false);
    }
  }, [audioUrl, podcast, toast]);

  // 3. Borrar
  const removeFromOffline = useCallback(async () => {
    if (!audioUrl) return;
    
    try {
      // A. Borrar Audio
      const cache = await caches.open(CACHE_NAME);
      await cache.delete(audioUrl);

      // B. Borrar Metadata
      const stored = localStorage.getItem(METADATA_KEY);
      if (stored) {
        const library = JSON.parse(stored);
        delete library[podcast.id];
        localStorage.setItem(METADATA_KEY, JSON.stringify(library));
      }
      
      setIsOfflineAvailable(false);
      toast({ title: "Eliminado", description: "Liberado espacio offline." });
    } catch (e) {
      console.error("Delete failed:", e);
    }
  }, [audioUrl, podcast.id, toast]);

  return { isOfflineAvailable, isDownloading, downloadForOffline, removeFromOffline };
}