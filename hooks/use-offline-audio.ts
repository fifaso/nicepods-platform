/**
 * ARCHIVO: hooks/use-offline-audio.ts
 * VERSIÓN: 6.0 (Madrid Resonance - Sovereign Edition)
 * PROTOCOLO: MADRID RESONANCE V7.0
 *
 * Misión: Gestionar la persistencia de activos acústicos para consumo offline.
 * [REFORMA V6.0]: Sincronización axial completa con el contrato purificado V7.0.
 * Eliminación de fugas snake_case y alineación absoluta con la Doctrina ZAP.
 *
 * Nivel de Integridad: 100% (Soberanía Nominal V7.0)
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { PodcastWithProfile } from "@/types/podcast";

const CACHE_NAME_IDENTIFICATION = "supabase-media-cache";
const METADATA_STORAGE_KEY = "offline_podcasts_metadata";

/**
 * useOfflineAudio: Hook de gestión de activos persistentes.
 */
export function useOfflineAudio(podcastSnapshot: PodcastWithProfile) {
  const [isOfflineAvailableStatus, setIsOfflineAvailableStatus] = useState<boolean>(false);
  const [isDownloadProcessActive, setIsDownloadProcessActive] = useState<boolean>(false);
  const { toast } = useToast();
  
  const audioUniformResourceLocator = podcastSnapshot.audioUniformResourceLocator;

  /**
   * 1. PROTOCOLO DE VERIFICACIÓN DE CACHÉ
   */
  useEffect(() => {
    if (!audioUniformResourceLocator) return;
    const validateCacheStatusAction = async () => {
      try {
        const nativeCacheInstance = await caches.open(CACHE_NAME_IDENTIFICATION);
        const matchedResponse = await nativeCacheInstance.match(audioUniformResourceLocator);
        if (matchedResponse) setIsOfflineAvailableStatus(true);
      } catch (hardwareException) {
        console.error("🔥 [OfflineAudio] Cache validation failed", hardwareException);
      }
    };
    validateCacheStatusAction();
  }, [audioUniformResourceLocator]);

  /**
   * 2. PROTOCOLO DE DESCARGA (Audio + Metadata)
   */
  const downloadForOfflineAction = useCallback(async () => {
    if (!audioUniformResourceLocator) return;
    setIsDownloadProcessActive(true);

    try {
      // A. PERSISTENCIA DE FLUJO ACÚSTICO
      const nativeCacheInstance = await caches.open(CACHE_NAME_IDENTIFICATION);
      const networkResponse = await fetch(audioUniformResourceLocator, { mode: 'cors' });
      if (!networkResponse.ok) throw new Error("Network exception");
      await nativeCacheInstance.put(audioUniformResourceLocator, networkResponse);

      // B. PERSISTENCIA DE METADATA SOBERANA
      const storedMetadataCollection = localStorage.getItem(METADATA_STORAGE_KEY);
      const offlineLibraryObject = storedMetadataCollection ? JSON.parse(storedMetadataCollection) : {};
      
      offlineLibraryObject[podcastSnapshot.identification] = {
        identification: podcastSnapshot.identification,
        titleTextContent: podcastSnapshot.titleTextContent,
        audioUniformResourceLocator: podcastSnapshot.audioUniformResourceLocator,
        coverImageUniformResourceLocator: podcastSnapshot.coverImageUniformResourceLocator,
        playbackDurationSecondsTotal: podcastSnapshot.playbackDurationSecondsTotal,
        profiles: podcastSnapshot.profiles,
        creationTimestamp: podcastSnapshot.creationTimestamp
      };
      
      localStorage.setItem(METADATA_STORAGE_KEY, JSON.stringify(offlineLibraryObject));
      
      setIsOfflineAvailableStatus(true);
      toast({ title: "¡Descargado!", description: "Disponible en Modo Avión." });
    } catch (hardwareException) {
      console.error("🔥 [OfflineAudio] Download process failed:", hardwareException);
      toast({ title: "Error", description: "Fallo la descarga.", variant: "destructive" });
    } finally {
      setIsDownloadProcessActive(false);
    }
  }, [audioUniformResourceLocator, podcastSnapshot, toast]);

  /**
   * 3. PROTOCOLO DE PURGA
   */
  const removeFromOfflineAction = useCallback(async () => {
    if (!audioUniformResourceLocator) return;
    
    try {
      // A. ANIQUILACIÓN DE FLUJO ACÚSTICO
      const nativeCacheInstance = await caches.open(CACHE_NAME_IDENTIFICATION);
      await nativeCacheInstance.delete(audioUniformResourceLocator);

      // B. ANIQUILACIÓN DE METADATA
      const storedMetadataCollection = localStorage.getItem(METADATA_STORAGE_KEY);
      if (storedMetadataCollection) {
        const offlineLibraryObject = JSON.parse(storedMetadataCollection);
        delete offlineLibraryObject[podcastSnapshot.identification];
        localStorage.setItem(METADATA_STORAGE_KEY, JSON.stringify(offlineLibraryObject));
      }
      
      setIsOfflineAvailableStatus(false);
      toast({ title: "Eliminado", description: "Liberado espacio offline." });
    } catch (hardwareException) {
      console.error("🔥 [OfflineAudio] Deletion failed:", hardwareException);
    }
  }, [audioUniformResourceLocator, podcastSnapshot.identification, toast]);

  return {
    isOfflineAvailable: isOfflineAvailableStatus,
    isDownloading: isDownloadProcessActive,
    downloadForOffline: downloadForOfflineAction,
    removeFromOffline: removeFromOfflineAction
  };
}
