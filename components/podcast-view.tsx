/**
 * ARCHIVO: components/podcast-view.tsx
 * VERSIÓN: 32.0 (NicePod Interactive Stage - Absolute Contract Sync)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Director de escena que orquesta el ciclo de vida del podcast desde la Forja hasta la Liberación.
 * [REFORMA V32.0]: Sincronización nominal estricta con ContentVault V2.1 y CuratorAside V1.4
 * para neutralizar los errores de propagación de contrato (Build Shield TS2322).
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { User } from '@supabase/supabase-js';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

// --- INFRAESTRUCTURA DE COMPONENTES UI ---
import { useToast } from '@/hooks/use-toast';

// --- INFRAESTRUCTURA DE DATOS Y SINCRO ---
import { useAudio } from '@/contexts/audio-context';
import { useAuth } from '@/hooks/use-auth';
import { useOfflineAudio } from '@/hooks/use-offline-audio';
import { usePodcastSync } from '@/hooks/use-podcast-sync';

// --- UTILIDADES ---
import { nicepodLog } from "@/lib/utils";
import { PodcastWithProfile } from '@/types/podcast';

// --- COMPONENTES SATÉLITE ---
import { AudioConsole } from './podcast/audio-console';
import { ContentVault } from './podcast/content-vault';
import { CuratorAside } from './podcast/curator-aside';
import { IntegrityShield } from './podcast/integrity-shield';
import { MediaStage } from './podcast/media-stage';

/**
 * INTERFAZ: PodcastViewProperties
 * [FIX V32.0]: Sincronía con el punto de entrada SSR (app/(platform)/podcast/[id]/page.tsx)
 */
interface PodcastViewProperties {
  initialPodcastData: PodcastWithProfile;
  authenticatedUser: User | null;
  initialIsLikedStatus: boolean;
  replies?: PodcastWithProfile[];
}

export function PodcastView({
  initialPodcastData,
  authenticatedUser,
  initialIsLikedStatus,
  replies = []
}: PodcastViewProperties) {

  const { supabase: supabaseClient } = useAuth();
  const navigationRouter = useRouter();
  const { toast } = useToast();

  // 1. Sincronía del estado de Forja (WebSocket + Polling)
  const { 
    podcast: livePodcastData, 
    isAudioReady, 
    isImageReady, 
    isConstructing: isIntelligenceConstructing, 
    isFailed: isSynthesisFailed 
  } = usePodcastSync(initialPodcastData);

  // 2. Control de Audio
  const { playPodcast, currentPodcast, isPlaying, isLoading: isAudioLoading, togglePlayPause } = useAudio();

  // 3. Estado de Escucha para QA (95%)
  const [listeningProgressPercentage, setListeningProgressPercentage] = useState<number>(0);

  // 4. Estados de interactividad y resonancia
  const [isLikedByVoyager, setIsLikedByVoyager] = useState<boolean>(initialIsLikedStatus);
  const [resonanceCount, setResonanceCount] = useState<number>(Number(livePodcastData.like_count || 0));
  const [isInteractionProcessActive, setIsInteractionProcessActive] = useState<boolean>(false);
  const [isScriptInterfaceExpanded, setIsScriptInterfaceExpanded] = useState<boolean>(false);
  const [isRemixConsoleOpen, setIsRemixConsoleOpen] = useState<boolean>(false);

  const { isOfflineAvailable, isDownloading, downloadForOffline, removeFromOffline } = useOfflineAudio(livePodcastData);

  const isAdministratorOwner = useMemo(() => 
    authenticatedUser?.id === livePodcastData.user_id, 
    [authenticatedUser?.id, livePodcastData.user_id]
  );
  
  const isCurrentPillActive = useMemo(() => 
    currentPodcast?.id === livePodcastData.id, 
    [currentPodcast?.id, livePodcastData.id]
  );

  /**
   * [SINCRO DE PROGRESO QA]:
   * Escuchamos el evento global del AudioProvider para actualizar el escudo.
   */
  useEffect(() => {
    const handleHardwarePlaybackTimeUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<{ currentTime: number; duration: number }>;
      const { currentTime, duration } = customEvent.detail;
      if (duration > 0) {
        const progressPercentage = (currentTime / duration) * 100;
        setListeningProgressPercentage(progressPercentage);
      }
    };
    window.addEventListener('nicepod-timeupdate', handleHardwarePlaybackTimeUpdate as EventListener);
    return () => window.removeEventListener('nicepod-timeupdate', handleHardwarePlaybackTimeUpdate as EventListener);
  }, []);

  const hasVoyagerListenedFully = useMemo(() => listeningProgressPercentage >= 95, [listeningProgressPercentage]);

  // --- MANEJADORES DE ACCIÓN ---

  const handlePlaybackControlAction = useCallback(() => {
    const publishedRepliesCollection = replies.filter(replyItem => replyItem.status === 'published');
    if (isCurrentPillActive) {
      togglePlayPause();
    } else {
      playPodcast(livePodcastData, publishedRepliesCollection);
    }
  }, [isCurrentPillActive, togglePlayPause, playPodcast, livePodcastData, replies]);

  const handleResonanceInteractionAction = useCallback(async () => {
    if (!supabaseClient || !authenticatedUser || isInteractionProcessActive) return;
    setIsInteractionProcessActive(true);
    try {
      if (isLikedByVoyager) {
        setIsLikedByVoyager(false);
        setResonanceCount(previousCount => Math.max(0, previousCount - 1));
        await supabaseClient.from('likes').delete().match({ user_id: authenticatedUser.id, podcast_id: livePodcastData.id });
      } else {
        setIsLikedByVoyager(true);
        setResonanceCount(previousCount => previousCount + 1);
        await supabaseClient.from('likes').insert({ user_id: authenticatedUser.id, podcast_id: livePodcastData.id });
      }
    } catch (exception: any) {
      nicepodLog("🔥 [Social-Action] Error en resonancia:", exception.message, 'error');
    } finally {
      setIsInteractionProcessActive(false);
    }
  }, [supabaseClient, authenticatedUser, isLikedByVoyager, isInteractionProcessActive, livePodcastData.id]);

  const handleSovereignPublishAction = useCallback(async () => {
    if (!supabaseClient) return;
    nicepodLog(`🚀 [Orchestrator] Liberando Pod #${livePodcastData.id} a la red pública.`);

    const { error: databaseUpdateError } = await supabaseClient
      .from('micro_pods')
      .update({ status: 'published', published_at: new Date().toISOString() })
      .eq('id', livePodcastData.id);

    if (!databaseUpdateError) {
      toast({ title: "Bóveda Actualizada", description: "La crónica ha sido integrada en la red global." });
      navigationRouter.refresh();
    }
  }, [supabaseClient, livePodcastData.id, toast, navigationRouter]);

  const handleOfflineAvailabilityAction = useCallback(() => {
    isOfflineAvailable ? removeFromOffline() : downloadForOffline();
  }, [isOfflineAvailable, removeFromOffline, downloadForOffline]);

  return (
    <main className="container mx-auto max-w-screen-xl py-6 md:py-10 px-4 md:px-8 w-full animate-in fade-in duration-700 selection:bg-primary/20">

      {/* SHIELD DE CALIDAD Y LIBERACIÓN */}
      <div className="w-full mb-8">
        <IntegrityShield
          isFailed={isSynthesisFailed}
          isConstructing={isIntelligenceConstructing}
          isOwner={isAdministratorOwner}
          status={livePodcastData.status}
          listeningProgress={listeningProgressPercentage}
          hasListenedFully={hasVoyagerListenedFully}
          onPublish={handleSovereignPublishAction}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        
        {/* COLUMNA PRINCIPAL (MEDIA & CONTENIDO) */}
        <div className="lg:col-span-2 space-y-10">
          <MediaStage
            imageUrl={livePodcastData.cover_image_url}
            imageReady={isImageReady}
            title={livePodcastData.title}
            isConstructing={isIntelligenceConstructing}
          />
          
          {/* [FIX V32.0]: Sincronización de Contrato con ContentVaultProperties V2.1 */}
          <ContentVault
            title={livePodcastData.title}
            description={livePodcastData.description}
            status={livePodcastData.status}
            isIntelligenceConstructing={isIntelligenceConstructing}
            narrativeScriptContent={livePodcastData.script_text}
            artificialIntelligenceTags={livePodcastData.ai_tags}
            administratorCuratedTags={livePodcastData.user_tags}
            isAdministratorOwner={isAdministratorOwner}
            isScriptExpanded={isScriptInterfaceExpanded}
            onScriptVisibilityToggle={setIsScriptInterfaceExpanded}
            onTagEditAction={() => { nicepodLog("📝 [Orchestrator] Edición de etiquetas solicitada."); }}
          />
        </div>

        {/* COLUMNA LATERAL (CONSOLA & METADATOS) */}
        <div className="lg:col-span-1 space-y-10 lg:sticky lg:top-32">
          <AudioConsole
            audioReady={isAudioReady}
            audioLoading={isAudioLoading}
            isPlaying={isPlaying}
            isCurrentActive={isCurrentPillActive}
            isConstructing={isIntelligenceConstructing}
            likeCount={resonanceCount}
            isLiked={isLikedByVoyager}
            isLiking={isInteractionProcessActive}
            isOfflineAvailable={isOfflineAvailable}
            isDownloading={isDownloading}
            onPlay={handlePlaybackControlAction}
            onLike={handleResonanceInteractionAction}
            onDownload={handleOfflineAvailabilityAction}
          />

          {/* [FIX V32.0]: Sincronización de Contrato con CuratorAsideProperties V1.4 */}
          <CuratorAside
            administratorProfile={livePodcastData.profiles}
            creationDateString={livePodcastData.created_at}
            playbackDurationSeconds={livePodcastData.duration_seconds || 0}
            geographicPlaceName={livePodcastData.place_name || null}
            artificialIntelligenceCreationData={livePodcastData.creation_data}
            intelligenceResearchSources={livePodcastData.sources || []}
            isIntelligenceConstructing={isIntelligenceConstructing}
          />
        </div>
      </div>

      <footer className="mt-32 flex flex-col items-center justify-center opacity-10 py-16 border-t border-white/5">
        <Image src="/nicepod-logo.png" alt="NicePod" width={56} height={56} className="grayscale mb-6" />
        <p className="text-[10px] font-black uppercase tracking-[0.8em]">NicePod Intelligence Terminal</p>
      </footer>
    </main>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V32.0):
 * 1. Contract Synchronization: Se han inyectado las propiedades exactas exigidas 
 *    por ContentVault (narrativeScriptContent, isIntelligenceConstructing, etc.) y 
 *    CuratorAside (administratorProfile, creationDateString), erradicando TS2322.
 * 2. Zero Abbreviations Policy: Purificación de variables de estado y referencias, 
 *    como 'isFailed' a 'isSynthesisFailed' y 'e' a 'event'.
 * 3. Type Safety: Se eliminó el uso de 'as any' en la inyección del perfil, 
 *    confiando en la estructura blindada del tipo 'PodcastWithProfile' (V11.0).
 */