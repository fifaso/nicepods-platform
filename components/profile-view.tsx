/**
 * ARCHIVO: components/profile-view.tsx
 * VERSIÓN: 12.0 (NicePod Profile Orchestrator - Industrial Integrity Standard)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Orquestar la visualización del podcast dentro del perfil del curador,
 * garantizando la sintonía entre los datos en tiempo real y los componentes de autoridad.
 * [REFORMA V12.0]: Resolución de errores de importación (nicepodLog), mapeo de 
 * nulabilidad para reputación y sincronía de contrato con el Hub de Acción.
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

// --- INFRAESTRUCTURA DE DATOS Y SINCRO ---
import { useAudio } from '@/contexts/audio-context';
import { useAuth } from '@/hooks/use-auth';
import { useOfflineAudio } from '@/hooks/use-offline-audio';
import { usePodcastSync } from '@/hooks/use-podcast-sync';
import { useToast } from '@/hooks/use-toast';
import { PodcastWithProfile, PodcastScript } from '@/types/podcast';

// --- [FIX V12.0]: Importación de utilidades industriales ---
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
 * Misión: Recibir los datos iniciales inyectados desde el servidor (SSR).
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
    isFailed: isSynthesisFailed
  } = usePodcastSync(initialPodcastData);

  // 2. INTEGRACIÓN CON EL MOTOR DE AUDIO GLOBAL
  const {
    playPodcast,
    currentPodcast,
    isPlaying,
    isLoading: isAudioLoading,
    togglePlayPause
  } = useAudio();

  // 3. ESTADOS SOCIALES Y DE RESONANCIA
  const [isLikedByVoyager, setIsLikedByVoyager] = useState<boolean>(initialIsLikedStatus);
  const [resonanceCount, setResonanceCount] = useState<number>(Number(livePodcastData.like_count || 0));
  const [isInteractionProcessActive, setIsInteractionProcessActive] = useState<boolean>(false);

  // 4. LÓGICA DE PERSISTENCIA OFFLINE (Progressive Web App Standard)
  const {
    isOfflineAvailable,
    isDownloading,
    downloadForOffline,
    removeFromOffline
  } = useOfflineAudio(livePodcastData);

  // --- DERIVACIONES TÁCTICAS SOBERANAS ---
  const isAdministratorOwner = useMemo(() => 
    authenticatedUser?.id === livePodcastData.user_id, 
    [authenticatedUser?.id, livePodcastData.user_id]
  );
  
  const isCurrentPillActive = useMemo(() => 
    currentPodcast?.id === livePodcastData.id, 
    [currentPodcast?.id, livePodcastData.id]
  );

  /**
   * mappedAdministratorProfile:
   * Misión: Resolver la incompatibilidad de nulabilidad entre el Metal y la Interfaz.
   * [FIX V12.0]: Transforma null en undefined para satisfacer el Build Shield.
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

  // Sincronización reactiva del contador de resonancias
  useEffect(() => {
    setResonanceCount(Number(livePodcastData.like_count || 0));
  }, [livePodcastData.like_count]);

  // --- 5. MANEJADORES DE ACCIÓN SOBERANA ---

  const handlePlaybackControlAction = useCallback(() => {
    if (isCurrentPillActive) {
      togglePlayPause();
    } else {
      playPodcast(livePodcastData);
    }
  }, [isCurrentPillActive, togglePlayPause, playPodcast, livePodcastData]);

  const handleResonanceInteractionAction = useCallback(async () => {
    if (!supabaseClient || !authenticatedUser || isInteractionProcessActive) return;
    setIsInteractionProcessActive(true);

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
      nicepodLog("🔥 [Profile-Like-Error]:", exception.message, 'error');
    } finally {
      setIsInteractionProcessActive(false);
    }
  }, [supabaseClient, authenticatedUser, isLikedByVoyager, isInteractionProcessActive, livePodcastData.id]);

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
    <div className="container mx-auto max-w-7xl py-4 md:py-8 px-4 w-full animate-in fade-in duration-700 selection:bg-primary/20">

      {/* CAPA I: ESCUDO DE INTEGRIDAD (QA & Liberación) */}
      <IntegrityShield
        isFailed={isSynthesisFailed}
        isConstructing={isIntelligenceConstructing}
        isOwner={isAdministratorOwner}
        status={livePodcastData.status}
        listeningProgress={0}
        hasListenedFully={!!livePodcastData.reviewed_by_user}
        onPublish={handleSovereignPublishAction}
      />

      {/* GRID OPERATIVO: DENSIDAD TÁCTICA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        {/* COLUMNA DE CONOCIMIENTO (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          <ProfileMediaStage
            imageUrl={livePodcastData.cover_image_url}
            imageReady={isImageReady}
            title={livePodcastData.title}
          />

          <ProfileContentVault
            title={livePodcastData.title}
            description={livePodcastData.description}
            // [FIX V12.0]: Casting controlado para satisfacer la firma de índice (TS2322)
            narrativeScriptContent={livePodcastData.script_text as Record<string, string> | null}
            artificialIntelligenceTags={livePodcastData.ai_tags}
            administratorCuratedTags={livePodcastData.user_tags}
            isAdministratorOwner={isAdministratorOwner}
            onTagPersistenceAction={handleTagPersistenceAction}
          />
        </div>

        {/* COLUMNA LATERAL: TERMINAL DE CONTROL (1/3) */}
        <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-24">
          <ProfileAudioConsole
            audioReady={isAudioReady}
            audioLoading={isAudioLoading}
            isPlaying={isPlaying}
            isCurrentActive={isCurrentPillActive}
            likeCount={resonanceCount}
            isLiked={isLikedByVoyager}
            isLiking={isInteractionProcessActive}
            isOfflineAvailable={isOfflineAvailable}
            isDownloading={isDownloading}
            onPlay={handlePlaybackControlAction}
            onLike={handleResonanceInteractionAction}
            onDownload={() => isOfflineAvailable ? removeFromOffline() : downloadForOffline()}
          />

          <ProfileCuratorFiche
            administratorProfile={mappedAdministratorProfile} // [FIX V12.0]: Sincronización nominal y tipado saneado
            creationDateString={livePodcastData.created_at}
            playbackDurationSeconds={livePodcastData.duration_seconds || 0}
            // [FIX V12.0]: Casting para CreationMetadataPayload
            artificialIntelligenceCreationData={livePodcastData.creation_data as Record<string, unknown> | null}
            intelligenceResearchSources={livePodcastData.sources || []}
          />

          <ProfileActionHub
            podcastIdentification={livePodcastData.id}
            publicationStatus={livePodcastData.status}
            isAdministratorOwner={isAdministratorOwner}
            isIntelligenceConstructing={isIntelligenceConstructing}
            // [FIX V12.0]: Propiedad corregida 'isUserAuthenticated' (Neutraliza error TS2322 línea 248)
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
 * NOTA TÉCNICA DEL ARCHITECT (V12.0):
 * 1. Build Shield Neutralization: Se importó 'nicepodLog' y se mapearon los perfiles 
 *    para resolver las incompatibilidades de nulabilidad entre DB y Props.
 * 2. Contract Alignment: Se sincronizó 'isUserAuthenticated' con la interfaz de 
 *    ProfileActionHub V2.0, erradicando el error en la línea 248 del reporte de Vercel.
 * 3. Zero Abbreviations Policy: Se purificó el 100% de la nomenclatura interna del orquestador.
 */