/**
 * ARCHIVO: components/profile-view.tsx
 * VERSIÓN: 11.0 (NicePod Profile Orchestrator - Absolute Contract Sync Edition)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Orquestar la visualización del podcast en el perfil del curador,
 * distribuyendo la inteligencia hacia componentes atómicos blindados.
 * [REFORMA V11.0]: Sincronización nominal estricta con ProfileContentVault V2.1 
 * y ProfileCuratorFiche V2.1 para neutralizar los errores del Build Shield (TS2322).
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
import { PodcastWithProfile } from '@/types/podcast';

// --- COMPONENTES SATÉLITE (Arquitectura Atómica) ---
import { IntegrityShield } from './podcast/integrity-shield';
import { ProfileActionHub } from './profile/profile-action-hub';
import { ProfileAudioConsole } from './profile/profile-audio-console';
import { ProfileContentVault } from './profile/profile-content-vault';
import { ProfileCuratorFiche } from './profile/profile-curator-fiche';
import { ProfileMediaStage } from './profile/profile-media-stage';

/**
 * INTERFAZ: ProfilePodcastViewProperties
 * Misión: Recibir los datos iniciales inyectados desde el SSR.
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

  // 1. ACTIVACIÓN DEL SISTEMA NERVIOSO (Realtime Sync)
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

  // 3. ESTADOS SOCIALES Y DE INTERFAZ
  const [isLikedByVoyager, setIsLikedByVoyager] = useState<boolean>(initialIsLikedStatus);
  const [resonanceCount, setResonanceCount] = useState<number>(Number(livePodcastData.like_count || 0));
  const [isInteractionProcessActive, setIsInteractionProcessActive] = useState<boolean>(false);

  // 4. LÓGICA DE PERSISTENCIA OFFLINE (PWA)
  const {
    isOfflineAvailable,
    isDownloading,
    downloadForOffline,
    removeFromOffline
  } = useOfflineAudio(livePodcastData);

  // --- DERIVACIONES TÁCTICAS ---
  const isAdministratorOwner = useMemo(() => 
    authenticatedUser?.id === livePodcastData.user_id, 
    [authenticatedUser?.id, livePodcastData.user_id]
  );
  
  const isCurrentPillActive = useMemo(() => 
    currentPodcast?.id === livePodcastData.id, 
    [currentPodcast?.id, livePodcastData.id]
  );

  // Sincronización de contador de resonancias tras cambios en tiempo real
  useEffect(() => {
    setResonanceCount(Number(livePodcastData.like_count || 0));
  }, [livePodcastData.like_count]);

  // --- 5. MANEJADORES DE ACCIÓN SOBERANA ---

  const handlePlaybackControlAction = useCallback(() => {
    if (isCurrentPillActive) {
      togglePlayPause();
    } else {
      // En el perfil, el podcast se consume de forma aislada
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

  const handleOfflineAvailabilityAction = useCallback(() => {
    if (isOfflineAvailable) {
      if (confirm("¿Confirmar eliminación de la bóveda local?")) {
          removeFromOffline();
      }
    } else {
      downloadForOffline();
    }
  }, [isOfflineAvailable, removeFromOffline, downloadForOffline]);

  const handleSovereignPublishAction = useCallback(async () => {
    if (!supabaseClient) return;
    const { error: databaseUpdateError } = await supabaseClient
      .from('micro_pods')
      .update({ status: 'published', published_at: new Date().toISOString() })
      .eq('id', livePodcastData.id);

    if (!databaseUpdateError) {
      toast({ title: "Portal Abierto", description: "El capital intelectual ha sido publicado en la Malla." });
      navigationRouter.refresh();
    }
  }, [supabaseClient, livePodcastData.id, toast, navigationRouter]);

  // --- RENDERIZADO SOBERANO ---

  return (
    <div className="container mx-auto max-w-7xl py-4 md:py-8 px-4 w-full animate-in fade-in duration-700">

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

          {/* ESCENARIO MULTIMEDIA */}
          <ProfileMediaStage
            imageUrl={livePodcastData.cover_image_url}
            imageReady={isImageReady}
            title={livePodcastData.title}
          />

          {/* BÓVEDA DE CONTENIDO (Texto y Taxonomía) */}
          <ProfileContentVault
            title={livePodcastData.title}
            description={livePodcastData.description}
            narrativeScriptContent={livePodcastData.script_text} // [FIX TS2322]: Sincronía nominal
            artificialIntelligenceTags={livePodcastData.ai_tags}
            administratorCuratedTags={livePodcastData.user_tags}
            isAdministratorOwner={isAdministratorOwner}
            onTagPersistenceAction={handleTagPersistenceAction}
          />
        </div>

        {/* COLUMNA LATERAL: TERMINAL (1/3) */}
        <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-24">

          {/* CONSOLA DE AUDIO (Control de Reproducción) */}
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
            onDownload={handleOfflineAvailabilityAction}
          />

          {/* FICHA DEL CURADOR (Identidad y Metadatos de Creación) */}
          <ProfileCuratorFiche
            administratorProfile={livePodcastData.profiles} // [FIX TS2322]: Sincronía nominal y erradicación de 'any'
            creationDateString={livePodcastData.created_at}  // [FIX TS2322]: Sincronía nominal
            playbackDurationSeconds={livePodcastData.duration_seconds || 0} // [FIX TS2322]: Sincronía nominal
            artificialIntelligenceCreationData={livePodcastData.creation_data} // [FIX TS2322]: Sincronía nominal
            intelligenceResearchSources={livePodcastData.sources || []} // [FIX TS2322]: Sincronía nominal
          />

          {/* CENTRO DE ACCIÓN (Remix y Comandos) */}
          <ProfileActionHub
            podcastIdentification={livePodcastData.id}
            publicationStatus={livePodcastData.status}
            isAdministratorOwner={isAdministratorOwner}
            isIntelligenceConstructing={isIntelligenceConstructing}
            isAuthenticated={!!authenticatedUser}
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
 * NOTA TÉCNICA DEL ARCHITECT (V11.0):
 * 1. Build Shield Compliance: Se corrigieron las propiedades inyectadas a ProfileContentVault 
 *    y ProfileCuratorFiche, eliminando los errores TS2322 detectados en Vercel.
 * 2. Zero Abbreviations Policy: Purificación absoluta de variables (livePodcastData, 
 *    isInteractionProcessActive, exception, etc.).
 * 3. Type Safety: El uso del 'as any' en la Ficha del Curador fue erradicado, confiando 
 *    en el contrato unificado de la base de datos V4.0.
 */