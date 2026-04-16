/**
 * ARCHIVO: components/profile-view.tsx
 * VERSIÓN: 13.0 (NicePod Profile Orchestrator - Industrial Integrity Edition)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Orquestar la visualización del podcast dentro del perfil del curador,
 * garantizando la sintonía entre los datos en tiempo real y los componentes de autoridad.
 * [REFORMA V13.0]: Sincronización nominal total con ProfileCuratorFiche V3.0, 
 * resolución de conflictos de nulabilidad (null vs undefined) y blindaje de tipos.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

// --- INFRAESTRUCTURA DE DATOS Y SINCRONIZACIÓN ---
import { useAudio } from '@/contexts/audio-context';
import { useAuth } from '@/hooks/use-auth';
import { useOfflineAudio } from '@/hooks/use-offline-audio';
import { usePodcastSync } from '@/hooks/use-podcast-sync';
import { useToast } from '@/hooks/use-toast';
import { PodcastWithProfile, CreationMetadataPayload } from '@/types/podcast';

// --- UTILIDADES INDUSTRIALES ---
import { nicepodLog, cn, formatTime } from "@/lib/utils";

// --- COMPONENTES SATÉLITE (Arquitectura Atómica V4.0) ---
import { IntegrityShield } from './podcast/integrity-shield';
import { ProfileActionHub } from './profile/profile-action-hub';
import { ProfileAudioConsole } from './profile/profile-audio-console';
import { ProfileContentVault } from './profile/profile-content-vault';
import { ProfileCuratorFiche } from './profile/profile-curator-fiche';
import { ProfileMediaStage } from './profile/profile-media-stage';

/**
 * INTERFAZ: ProfilePodcastViewProperties
 */
interface ProfilePodcastViewProperties {
  initialPodcastData: PodcastWithProfile;
  authenticatedUser: User | null;
  initialIsLikedStatus: boolean;
}

/**
 * PodcastView: El director de orquesta de la vista de perfil de la Workstation.
 */
export function PodcastView({
  initialPodcastData,
  authenticatedUser,
  initialIsLikedStatus
}: ProfilePodcastViewProperties) {

  const { supabase: supabaseClient } = useAuth();
  const navigationRouter = useRouter();
  const { toast } = useToast();

  // 1. ACTIVACIÓN DEL SISTEMA NERVIOSO (Realtime Sync V4.0)
  const {
    podcast: livePodcastData,
    isAudioReady,
    isImageReady,
    isConstructing: isIntelligenceConstructing,
    isFailed: isIntelligenceSynthesisFailed
  } = usePodcastSync(initialPodcastData);

  // 2. INTEGRACIÓN CON EL MOTOR DE AUDIO GLOBAL
  const {
    playPodcastAction,
    currentActivePodcast,
    isAudioPlaying,
    isAudioLoading: isAudioPlaybackLoading,
    togglePlayPauseAction
  } = useAudio();

  // 3. ESTADOS SOCIALES Y DE RESONANCIA
  const [isLikedByVoyager, setIsLikedByVoyager] = useState<boolean>(initialIsLikedStatus);
  const [resonanceCount, setResonanceCount] = useState<number>(Number(livePodcastData.like_count || 0));
  const [isPlaybackProcessActive, setIsPlaybackProcessActive] = useState<boolean>(false);

  // 4. LÓGICA DE PERSISTENCIA OFFLINE (Progressive Web App Standard)
  const {
    isOfflineAvailable,
    isDownloading: isOfflineDownloading,
    downloadForOffline,
    removeFromOffline
  } = useOfflineAudio(livePodcastData);

  // --- DERIVACIONES TÁCTICAS SOBERANAS ---
  const isAdministratorOwner = useMemo(() => 
    authenticatedUser?.id === livePodcastData.authorUserIdentification,
    [authenticatedUser?.id, livePodcastData.authorUserIdentification]
  );
  
  const isCurrentPillActive = useMemo(() => 
    currentActivePodcast?.id === livePodcastData.id,
    [currentActivePodcast?.id, livePodcastData.id]
  );

  /**
   * mappedAdministratorProfile:
   * Misión: Sincronizar el perfil con el contrato de ProfileCuratorFiche.
   * [FIX V13.0]: Se mantienen los valores 'null' originales para coincidir con el Metal.
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

  // Sincronización reactiva del contador de resonancias
  useEffect(() => {
    setResonanceCount(Number(livePodcastData.like_count || 0));
  }, [livePodcastData.like_count]);

  // --- 5. MANEJADORES DE ACCIÓN SOBERANA ---

  const handlePlaybackControlAction = useCallback(() => {
    if (isCurrentPillActive) {
      togglePlayPauseAction();
    } else {
      playPodcastAction(livePodcastData);
    }
  }, [isCurrentPillActive, togglePlayPauseAction, playPodcastAction, livePodcastData]);

  const handleResonanceInteractionAction = useCallback(async () => {
    if (!supabaseClient || !authenticatedUser || isPlaybackProcessActive) return;
    setIsPlaybackProcessActive(true);

    const podcastIdentification = livePodcastData.id;
    try {
      if (isLikedByVoyager) {
        setIsLikedByVoyager(false);
        setResonanceCount(previousCount => Math.max(0, previousCount - 1));
        await supabaseClient.from('likes').delete().match({ user_id: authenticatedUser.id, podcast_id: podcastIdentification });
      } else {
        setIsLikedByVoyager(true);
        setResonanceCount(previousCount => previousCount + 1);
        await supabaseClient.from('likes').insert({ user_id: authenticatedUser.id, podcast_id: podcastIdentification });
      }
    } catch (exception: any) {
      nicepodLog("🔥 [Profile-Like-Fatal]:", exception.message, 'error');
    } finally {
      setIsPlaybackProcessActive(false);
    }
  }, [supabaseClient, authenticatedUser, isLikedByVoyager, isPlaybackProcessActive, livePodcastData.id]);

  const handleTagPersistenceAction = useCallback(async (updatedTaxonomyTags: string[]) => {
    if (!supabaseClient) return;
    const { error: databaseUpdateError } = await supabaseClient
      .from('micro_pods')
      .update({ user_tags: updatedTaxonomyTags })
      .eq('id', livePodcastData.id);

    if (!databaseUpdateError) {
      toast({ title: "Mapa Semántico Actualizado" });
    }
  }, [supabaseClient, livePodcastData.id, toast]);

  const handleSovereignPublishAction = useCallback(async () => {
    if (!supabaseClient) return;
    nicepodLog(`🚀 [Orchestrator] Liberando Pod #${livePodcastData.id} a la red pública.`);

    const { error: databaseUpdateError } = await supabaseClient
      .from('micro_pods')
      .update({ status: 'published', published_at: new Date().toISOString() })
      .eq('id', livePodcastData.id);

    if (!databaseUpdateError) {
      toast({ title: "Portal Abierto", description: "Conocimiento liberado con éxito." });
      navigationRouter.refresh();
    }
  }, [supabaseClient, livePodcastData.id, toast, navigationRouter]);

  return (
    <div className="container mx-auto max-w-7xl py-4 md:py-8 px-4 w-full animate-in fade-in duration-1000 selection:bg-primary/20">

      {/* CAPA I: ESCUDO DE INTEGRIDAD (QA & Liberación) */}
      <IntegrityShield
        isFailed={isIntelligenceSynthesisFailed}
        isConstructing={isIntelligenceConstructing}
        isOwner={isAdministratorOwner}
        status={livePodcastData.status}
        listeningProgress={0}
        hasListenedFully={!!livePodcastData.reviewed_by_user}
        onPublish={handleSovereignPublishAction}
      />

      {/* GRID OPERATIVO: DENSIDAD TÁCTICA INDUSTRIAL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

        {/* COLUMNA DE CONOCIMIENTO (2/3) */}
        <div className="lg:col-span-2 space-y-8">
          <ProfileMediaStage
            imageUrl={livePodcastData.cover_image_url}
            imageReady={isImageReady}
            title={livePodcastData.title}
          />

          <ProfileContentVault
            title={livePodcastData.title}
            description={livePodcastData.description}
            narrativeScriptContent={livePodcastData.script_text as Record<string, string> | null}
            artificialIntelligenceTags={livePodcastData.ai_tags}
            administratorCuratedTags={livePodcastData.user_tags}
            isAdministratorOwner={isAdministratorOwner}
            onTagPersistenceAction={handleTagPersistenceAction}
          />
        </div>

        {/* COLUMNA LATERAL: TERMINAL DE CONTROL (1/3) */}
        <div className="lg:col-span-1 space-y-8 lg:sticky lg:top-24">
          <ProfileAudioConsole
            audioReady={isAudioReady}
            audioLoading={isAudioPlaybackLoading}
            isPlaying={isAudioPlaying}
            isCurrentActive={isCurrentPillActive}
            likeCount={resonanceCount}
            isLiked={isLikedByVoyager}
            isLiking={isPlaybackProcessActive}
            isOfflineAvailable={isOfflineAvailable}
            isDownloading={isOfflineDownloading}
            onPlay={handlePlaybackControlAction}
            onLike={handleResonanceInteractionAction}
            onDownload={() => isOfflineAvailable ? removeFromOffline() : downloadForOffline()}
          />

          <ProfileCuratorFiche
            administratorProfile={mappedAdministratorProfile} 
            creationDateString={livePodcastData.created_at}
            playbackDurationSeconds={livePodcastData.duration_seconds || 0}
            // [FIX V13.0]: Sincronización absoluta con CreationMetadataPayload
            artificialIntelligenceCreationData={livePodcastData.creation_data as CreationMetadataPayload | null}
            intelligenceResearchSources={livePodcastData.sources || []}
          />

          <ProfileActionHub
            podcastIdentification={livePodcastData.id}
            publicationStatus={livePodcastData.status}
            isAdministratorOwner={isAdministratorOwner}
            isIntelligenceConstructing={isIntelligenceConstructing}
            // [FIX V13.0]: Sincronización con el contrato de ProfileActionHub V2.0
            isUserAuthenticated={!!authenticatedUser}
            podcastTitle={livePodcastData.title}
            authorDisplayName={livePodcastData.profiles?.full_name || 'Curador Anónimo'}
            authorAvatarUniformResourceLocator={livePodcastData.profiles?.avatar_url}
            narrativeScriptPlain={(livePodcastData.script_text as any)?.script_plain || ""}
          />
        </div>

      </div>
    </div>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (V13.0):
 * 1. Contract Synchronization: Se neutralizaron los errores TS2322 en las líneas 237, 241 y 248 
 *    mediante el ajuste de nulabilidad del perfil y el casting estricto a CreationMetadataPayload.
 * 2. Zero Abbreviations Policy: Purificación absoluta de la nomenclatura interna del orquestador, 
 *    asegurando que cada proceso táctico sea autodescriptivo.
 * 3. Metal-to-UI Harmony: El orquestador ahora actúa como un puente perfecto entre la base de 
 *    datos (PostgreSQL) y las interfaces periciales de NicePod.
 */