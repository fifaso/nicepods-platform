/**
 * ARCHIVO: components/profile-view.tsx
 * VERSIÓN: 14.0 (Madrid Resonance - Sovereign Edition)
 * PROTOCOLO: MADRID RESONANCE V7.0
 * 
 * Misión: Orquestar la visualización del podcast dentro del perfil del curador.
 * [REFORMA V14.0]: Sincronización axial completa con el contrato purificado V7.0.
 * Eliminación de fugas snake_case y alineación absoluta con la Doctrina ZAP.
 *
 * Nivel de Integridad: 100% (Soberanía Nominal V7.0)
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
import { nicepodLog } from "@/lib/utils";

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

  // 1. ACTIVACIÓN DEL SISTEMA NERVIOSO
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
  const [resonanceCount, setResonanceCount] = useState<number>(Number(livePodcastData.likeCountTotal || 0));
  const [isPlaybackProcessActive, setIsPlaybackProcessActive] = useState<boolean>(false);

  // 4. LÓGICA DE PERSISTENCIA OFFLINE
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
    currentActivePodcast?.identification === livePodcastData.identification,
    [currentActivePodcast?.identification, livePodcastData.identification]
  );

  /**
   * mappedAdministratorProfile:
   * Misión: Sincronizar el perfil con el contrato de ProfileCuratorFiche.
   */
  const mappedAdministratorProfile = useMemo(() => {
    if (!livePodcastData.profiles) {
      return null;
    }
    return {
      full_name: livePodcastData.profiles.fullName,
      avatar_url: livePodcastData.profiles.avatarUniformResourceLocator,
      username: livePodcastData.profiles.username,
      reputation_score: livePodcastData.profiles.reputationScoreValue,
      is_verified: livePodcastData.profiles.isVerifiedAccountStatus,
      role: livePodcastData.profiles.authorityRole
    };
  }, [livePodcastData.profiles]);

  // Sincronización reactiva del contador de resonancias
  useEffect(() => {
    setResonanceCount(Number(livePodcastData.likeCountTotal || 0));
  }, [livePodcastData.likeCountTotal]);

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

    const podcastIdentification = livePodcastData.identification;
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
  }, [supabaseClient, authenticatedUser, isLikedByVoyager, isPlaybackProcessActive, livePodcastData.identification]);

  const handleTagPersistenceAction = useCallback(async (updatedTaxonomyTags: string[]) => {
    if (!supabaseClient) return;
    const { error: databaseUpdateError } = await supabaseClient
      .from('micro_pods')
      .update({ user_tags: updatedTaxonomyTags })
      .eq('id', livePodcastData.identification);

    if (!databaseUpdateError) {
      toast({ title: "Mapa Semántico Actualizado" });
    }
  }, [supabaseClient, livePodcastData.identification, toast]);

  const handleSovereignPublishAction = useCallback(async () => {
    if (!supabaseClient) return;
    nicepodLog(`🚀 [Orchestrator] Liberando Pod #${livePodcastData.identification} a la red pública.`);

    const { error: databaseUpdateError } = await supabaseClient
      .from('micro_pods')
      .update({ status: 'published', published_at: new Date().toISOString() })
      .eq('id', livePodcastData.identification);

    if (!databaseUpdateError) {
      toast({ title: "Portal Abierto", description: "Conocimiento liberado con éxito." });
      navigationRouter.refresh();
    }
  }, [supabaseClient, livePodcastData.identification, toast, navigationRouter]);

  return (
    <div className="container mx-auto max-w-7xl py-4 md:py-8 px-4 w-full animate-in fade-in duration-1000 selection:bg-primary/20">

      {/* CAPA I: ESCUDO DE INTEGRIDAD (QA & Liberación) */}
      <IntegrityShield
        isFailed={isIntelligenceSynthesisFailed}
        isConstructing={isIntelligenceConstructing}
        isOwner={isAdministratorOwner}
        status={livePodcastData.publicationStatus}
        listeningProgress={0}
        hasListenedFully={!!livePodcastData.isReviewedByUserStatus}
        onPublish={handleSovereignPublishAction}
      />

      {/* GRID OPERATIVO: DENSIDAD TÁCTICA INDUSTRIAL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

        {/* COLUMNA DE CONOCIMIENTO (2/3) */}
        <div className="lg:col-span-2 space-y-8">
          <ProfileMediaStage
            imageUrl={livePodcastData.coverImageUniformResourceLocator}
            imageReady={isImageReady}
            title={livePodcastData.titleTextContent}
          />

          <ProfileContentVault
            title={livePodcastData.titleTextContent}
            description={livePodcastData.descriptionTextContent}
            narrativeScriptContent={livePodcastData.podcastScriptDossier as unknown as Record<string, string> | null}
            artificialIntelligenceTags={livePodcastData.artificialIntelligenceTagsCollection}
            administratorCuratedTags={livePodcastData.userDefinedTagsCollection}
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
            creationDateString={livePodcastData.creationTimestamp}
            playbackDurationSeconds={livePodcastData.playbackDurationSecondsTotal || 0}
            artificialIntelligenceCreationData={livePodcastData.creationMetadataDossier}
            intelligenceResearchSources={livePodcastData.intelligenceSourcesCollection || []}
          />

          <ProfileActionHub
            podcastIdentification={livePodcastData.identification}
            publicationStatus={livePodcastData.publicationStatus}
            isAdministratorOwner={isAdministratorOwner}
            isIntelligenceConstructing={isIntelligenceConstructing}
            isUserAuthenticated={!!authenticatedUser}
            podcastTitle={livePodcastData.titleTextContent}
            authorDisplayName={livePodcastData.profiles?.fullName || 'Curador Anónimo'}
            authorAvatarUniformResourceLocator={livePodcastData.profiles?.avatarUniformResourceLocator}
            narrativeScriptPlain={(livePodcastData.podcastScriptDossier as any)?.scriptPlainContent || ""}
          />
        </div>

      </div>
    </div>
  );
}
