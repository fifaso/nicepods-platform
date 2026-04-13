/**
 * ARCHIVO: components/podcast-view.tsx
 * VERSIÓN: 34.0 (NicePod Interactive Stage - Industrial Integrity Edition)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Director de escena que orquesta el ciclo de vida del podcast desde la Forja 
 * hasta la Liberación, garantizando la sintonía entre el hardware y la Bóveda NKV.
 * [REFORMA V34.0]: Resolución de incompatibilidad de tipos en metadatos de IA (TS2322) 
 * y sincronía absoluta de nulabilidad con el perfil del administrador.
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

// --- UTILIDADES Y CONTRATOS SOBERANOS ---
import { nicepodLog, cn, formatTime } from "@/lib/utils";
import { PodcastWithProfile, CreationMetadataPayload } from '@/types/podcast';

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
 * PodcastView: El orquestador de visualización de capital intelectual.
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

  // 1. Sincronía del estado de Forja (WebSocket + Polling en tiempo real)
  const { 
    podcast: livePodcastData, 
    isAudioReady, 
    isImageReady, 
    isConstructing: isIntelligenceConstructing, 
    isFailed: isSynthesisFailed 
  } = usePodcastSync(initialPodcastData);

  // 2. Control de Audio y Telemetría de Hardware
  const { 
    playPodcastAction,
    currentActivePodcast,
    isAudioPlaying,
    isAudioLoading: isAudioPlaybackLoading,
    togglePlayPauseAction
  } = useAudio();

  // 3. Estado de Escucha para Protocolo QA (95% Threshold)
  const [listeningProgressPercentage, setListeningProgressPercentage] = useState<number>(0);

  // 4. Estados de interactividad y resonancia social
  const [isLikedByVoyager, setIsLikedByVoyager] = useState<boolean>(initialIsLikedStatus);
  const [resonanceCount, setResonanceCount] = useState<number>(Number(livePodcastData.like_count || 0));
  const [isPlaybackInteractionActive, setIsPlaybackInteractionActive] = useState<boolean>(false);
  const [isScriptInterfaceExpanded, setIsScriptInterfaceExpanded] = useState<boolean>(false);

  const { isOfflineAvailable, isDownloading, downloadForOffline, removeFromOffline } = useOfflineAudio(livePodcastData);

  const isAdministratorOwner = useMemo(() => 
    authenticatedUser?.id === livePodcastData.user_id, 
    [authenticatedUser?.id, livePodcastData.user_id]
  );
  
  const isCurrentPillActive = useMemo(() => 
    currentActivePodcast?.id === livePodcastData.id,
    [currentActivePodcast?.id, livePodcastData.id]
  );

  /**
   * EFECTO: AudioHardwarePulseSincronization
   * Misión: Escuchar el latido del hardware para actualizar el progreso del Voyager.
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
   * Misión: Sincronizar el perfil del administrador con el contrato del CuratorAside.
   * [FIX V34.0]: Se mantiene la nulabilidad original del Metal para evitar el error TS2322.
   */
  const mappedAdministratorProfile = useMemo(() => {
    if (!livePodcastData.profiles) {
        return null;
    }
    return {
      full_name: livePodcastData.profiles.full_name,
      avatar_url: livePodcastData.profiles.avatar_url,
      username: livePodcastData.profiles.username,
      reputation_score: livePodcastData.profiles.reputation_score,
      is_verified: livePodcastData.profiles.is_verified,
      role: livePodcastData.profiles.role
    };
  }, [livePodcastData.profiles]);

  // --- MANEJADORES DE ACCIÓN SOBERANA ---

  const handlePlaybackControlAction = useCallback(() => {
    const publishedRepliesCollection = replies.filter(replyItem => replyItem.status === 'published');
    if (isCurrentPillActive) {
      togglePlayPauseAction();
    } else {
      playPodcastAction(livePodcastData, publishedRepliesCollection);
    }
  }, [isCurrentPillActive, togglePlayPauseAction, playPodcastAction, livePodcastData, replies]);

  const handleResonanceInteractionAction = useCallback(async () => {
    if (!supabaseClient || !authenticatedUser || isPlaybackInteractionActive) return;
    setIsPlaybackInteractionActive(true);
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
      setIsPlaybackInteractionActive(false);
    }
  }, [supabaseClient, authenticatedUser, isLikedByVoyager, isPlaybackInteractionActive, livePodcastData.id]);

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

  return (
    <main className="container mx-auto max-w-screen-xl py-6 md:py-10 px-4 md:px-8 w-full animate-in fade-in duration-1000 selection:bg-primary/20">

      {/* SHIELD DE INTEGRIDAD Y LIBERACIÓN */}
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
            narrativeScriptContent={livePodcastData.script_text as Record<string, string> | null}
            artificialIntelligenceTags={livePodcastData.ai_tags}
            administratorCuratedTags={livePodcastData.user_tags}
            isAdministratorOwner={isAdministratorOwner}
            isScriptExpanded={isScriptInterfaceExpanded}
            onScriptVisibilityToggle={setIsScriptInterfaceExpanded}
            onTagEditAction={() => {}}
          />
        </div>

        <div className="lg:col-span-1 space-y-10 lg:sticky lg:top-32">
          <AudioConsole
            audioReady={isAudioReady}
            audioLoading={isAudioPlaybackLoading}
            isPlaying={isAudioPlaying}
            isCurrentActive={isCurrentPillActive}
            isConstructing={isIntelligenceConstructing}
            likeCount={resonanceCount}
            isLiked={isLikedByVoyager}
            isLiking={isPlaybackInteractionActive}
            isOfflineAvailable={isOfflineAvailable}
            isDownloading={isDownloading}
            onPlay={handlePlaybackControlAction}
            onLike={handleResonanceInteractionAction}
            onDownload={() => isOfflineAvailable ? removeFromOffline() : downloadForOffline()}
          />

          {/* [FIX V34.0]: Alineación absoluta de contratos nominales para CuratorAside */}
          <CuratorAside
            administratorProfile={mappedAdministratorProfile}
            creationDateString={livePodcastData.created_at}
            playbackDurationSeconds={livePodcastData.duration_seconds || 0}
            geographicPlaceName={livePodcastData.place_name || null}
            // Mapeo directo al tipo soberano CreationMetadataPayload
            artificialIntelligenceCreationData={livePodcastData.creation_data as CreationMetadataPayload | null}
            intelligenceResearchSources={livePodcastData.sources || []}
            isIntelligenceConstructing={isIntelligenceConstructing}
          />
        </div>
      </div>

      <footer className="mt-40 flex flex-col items-center justify-center opacity-10 py-16 border-t border-white/5">
        <Image src="/nicepod-logo.png" alt="NicePod" width={64} height={64} className="grayscale mb-8" />
        <p className="text-[10px] font-black uppercase tracking-[1em] text-white">NicePod Intelligence Terminal</p>
      </footer>
    </main>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V34.0):
 * 1. Contract Sovereignty: Se eliminó el casting genérico 'Record<string, unknown>' sustituyéndolo 
 *    por 'CreationMetadataPayload', resolviendo el error TS2322 en la línea 252.
 * 2. Metal-to-Prop Synchronization: El perfil del administrador mantiene la nulabilidad (null) 
 *    procedente del metal para satisfacer la interfaz del CuratorAside V1.5.
 * 3. Zero Abbreviations Policy: Se purificó la lógica interna del orquestador, asegurando que cada 
 *    proceso táctico sea autodescriptivo.
 */