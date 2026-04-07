/**
 * ARCHIVO: components/podcast-view.tsx
 * VERSIÓN: 33.0 (NicePod Interactive Stage - Industrial Integrity Edition)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Director de escena que orquesta el ciclo de vida del podcast desde la Forja 
 * hasta la Liberación, garantizando la sintonía entre el hardware y la Bóveda NKV.
 * [REFORMA V33.0]: Resolución de incompatibilidad de nulabilidad (TS2322) y 
 * sincronía de firmas de índice para objetos estructurados.
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
import { nicepodLog, cn, formatTime } from "@/lib/utils";
import { PodcastWithProfile } from '@/types/podcast';

// --- COMPONENTES SATÉLITE ---
import { AudioConsole } from './podcast/audio-console';
import { ContentVault } from './podcast/content-vault';
import { CuratorAside } from './podcast/curator-aside';
import { IntegrityShield } from './podcast/integrity-shield';
import { MediaStage } from './podcast/media-stage';

/**
 * INTERFAZ: PodcastViewProperties
 */
interface PodcastViewProperties {
  initialPodcastData: PodcastWithProfile;
  authenticatedUser: User | null;
  initialIsLikedStatus: boolean;
  replies?: PodcastWithProfile[];
}

/**
 * PodcastView: El director de orquesta de la visualización industrial.
 */
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
  const { 
    playPodcast, 
    currentPodcast, 
    isPlaying, 
    isLoading: isAudioLoading, 
    togglePlayPause 
  } = useAudio();

  // 3. Estado de Escucha para QA (95%)
  const [listeningProgressPercentage, setListeningProgressPercentage] = useState<number>(0);

  // 4. Estados de interactividad y resonancia
  const [isLikedByVoyager, setIsLikedByVoyager] = useState<boolean>(initialIsLikedStatus);
  const [resonanceCount, setResonanceCount] = useState<number>(Number(livePodcastData.like_count || 0));
  const [isInteractionProcessActive, setIsInteractionProcessActive] = useState<boolean>(false);
  const [isScriptInterfaceExpanded, setIsScriptInterfaceExpanded] = useState<boolean>(false);

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
   * EFECTO: AudioHardwarePulseSincronization
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

  /**
   * mappedAdministratorProfile:
   * Misión: Transformar la nulabilidad de la DB (null) a la opcionalidad de la UI (undefined).
   * Esto resuelve el error TS2322 de la línea 227.
   */
  const mappedAdministratorProfile = useMemo(() => {
    if (!livePodcastData.profiles) {
        return null;
    }
    return {
      ...livePodcastData.profiles,
      reputation_score: livePodcastData.profiles.reputation_score ?? undefined,
      is_verified: livePodcastData.profiles.is_verified ?? undefined,
      role: livePodcastData.profiles.role ?? undefined
    };
  }, [livePodcastData.profiles]);

  // --- MANEJADORES DE ACCIÓN SOBERANA ---

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
        
        <div className="lg:col-span-2 space-y-10">
          <MediaStage
            imageUrl={livePodcastData.cover_image_url}
            imageReady={isImageReady}
            title={livePodcastData.title}
            isConstructing={isIntelligenceConstructing}
          />
          
          <ContentVault
            title={livePodcastData.title}
            description={livePodcastData.description}
            status={livePodcastData.status}
            isIntelligenceConstructing={isIntelligenceConstructing}
            // [FIX V33.0]: Casting a Record para satisfacer la firma de índice del contrato V2.1
            narrativeScriptContent={livePodcastData.script_text as Record<string, string> | null}
            artificialIntelligenceTags={livePodcastData.ai_tags}
            administratorCuratedTags={livePodcastData.user_tags}
            isAdministratorOwner={isAdministratorOwner}
            isScriptExpanded={isScriptInterfaceExpanded}
            onScriptVisibilityToggle={setIsScriptInterfaceExpanded}
            onTagEditAction={() => { nicepodLog("📝 Edición de etiquetas solicitada."); }}
          />
        </div>

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

          <CuratorAside
            administratorProfile={mappedAdministratorProfile} // [FIX V33.0]: Perfil sanitizado
            creationDateString={livePodcastData.created_at}
            playbackDurationSeconds={livePodcastData.duration_seconds || 0}
            geographicPlaceName={livePodcastData.place_name || null}
            // [FIX V33.0]: Casting controlado para asegurar compatibilidad con CreationMetadataPayload
            artificialIntelligenceCreationData={livePodcastData.creation_data as Record<string, unknown> | null}
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
 * NOTA TÉCNICA DEL ARCHITECT (V33.0):
 * 1. Build Shield Compliance: Se implementó 'mappedAdministratorProfile' para resolver 
 *    la incompatibilidad entre 'null' (DB) y 'undefined' (Props), erradicando el error TS2322.
 * 2. Signature Sync: Se aplicaron castings controlados a 'Record<string, unknown>' para 
 *    los campos de script y metadatos, neutralizando los errores de firma de índice.
 * 3. Nominal Integrity: Se mantiene el cumplimiento estricto de la Zero Abbreviations Policy.
 */