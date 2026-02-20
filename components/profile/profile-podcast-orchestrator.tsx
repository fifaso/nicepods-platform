// components/profile/profile-podcast-orchestrator.tsx
// VERSIÓN: 1.0 (NicePod Profile Orchestrator - Atomic Sync Standard)
// Misión: Gestionar el estado soberano, la sincronía Realtime y la distribución de acciones para la vista de perfil.
// [ESTABILIZACIÓN]: Integración del hook usePodcastSync y arquitectura de componentes desacoplados.

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

// --- IMPORTACIÓN DE COMPONENTES ESPECIALIZADOS (FASE 2) ---
// Nota: Estos componentes se desarrollarán en las siguientes ráfagas tácticas.
import { IntegrityShield } from '../podcast/integrity-shield';
import { ProfileActionHub } from './profile-action-hub';
import { ProfileAudioConsole } from './profile-audio-console';
import { ProfileContentVault } from './profile-content-vault';
import { ProfileCuratorFiche } from './profile-curator-fiche';
import { ProfileMediaStage } from './profile-media-stage';

/**
 * INTERFAZ: ProfilePodcastOrchestratorProps
 */
interface ProfilePodcastOrchestratorProps {
  podcastData: PodcastWithProfile;
  user: User | null;
  initialIsLiked: boolean;
}

/**
 * ProfilePodcastOrchestrator: El gestor inteligente de la vista de perfil.
 */
export function ProfilePodcastOrchestrator({
  podcastData,
  user,
  initialIsLiked
}: ProfilePodcastOrchestratorProps) {

  const { supabase } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  // 1. ACTIVACIÓN DEL SISTEMA NERVIOSO (Realtime Sync)
  // Utilizamos el hook soberano para capturar actualizaciones de audio e imagen.
  const {
    podcast,
    isAudioReady,
    isImageReady,
    isConstructing,
    isFailed
  } = usePodcastSync(podcastData);

  // 2. INTEGRACIÓN CON EL MOTOR DE AUDIO
  const {
    playPodcast,
    currentPodcast,
    isPlaying,
    isLoading: audioLoading,
    togglePlayPause
  } = useAudio();

  // 3. ESTADOS SOCIALES LOCALES
  const [isLiked, setIsLiked] = useState<boolean>(initialIsLiked);
  const [likeCount, setLikeCount] = useState<number>(Number(podcast.like_count || 0));
  const [isLiking, setIsLiking] = useState<boolean>(false);
  const [isEditingTags, setIsEditingTags] = useState<boolean>(false);

  // 4. LÓGICA OFFLINE (PWA Integration)
  const {
    isOfflineAvailable,
    isDownloading,
    downloadForOffline,
    removeFromOffline
  } = useOfflineAudio(podcast);

  // --- DERIVACIONES LÓGICAS ---
  const isOwner = useMemo(() => user?.id === podcast.user_id, [user?.id, podcast.user_id]);
  const isCurrentActive = useMemo(() => currentPodcast?.id === podcast.id, [currentPodcast?.id, podcast.id]);

  // Sincronizamos el contador de likes si la base de datos se actualiza externamente.
  useEffect(() => {
    setLikeCount(Number(podcast.like_count || 0));
  }, [podcast.like_count]);

  // --- MANEJADORES DE ACCIÓN (BUSINESS LOGIC) ---

  /**
   * handlePlayAction: Orquestación inteligente de reproducción.
   */
  const handlePlayAction = useCallback(() => {
    if (isCurrentActive) {
      togglePlayPause();
    } else {
      playPodcast(podcast); // En el perfil, solemos reproducir piezas individuales.
    }
  }, [isCurrentActive, togglePlayPause, playPodcast, podcast]);

  /**
   * handleLikeAction: Gestión de resonancia social.
   */
  const handleLikeAction = useCallback(async () => {
    if (!supabase || !user || isLiking) return;
    setIsLiking(true);

    try {
      if (isLiked) {
        setIsLiked(false);
        setLikeCount(prev => Math.max(0, prev - 1));
        await supabase.from('likes').delete().match({ user_id: user.id, podcast_id: podcast.id });
      } else {
        setIsLiked(true);
        setLikeCount(prev => prev + 1);
        await supabase.from('likes').insert({ user_id: user.id, podcast_id: podcast.id });
      }
    } catch (err) {
      console.error("🔥 [Profile-Orchestrator-Like]:", err);
    } finally {
      setIsLiking(false);
    }
  }, [supabase, user, isLiked, isLiking, podcast.id]);

  /**
   * handleSaveTags: Persistencia de etiquetas curadas por el dueño.
   */
  const handleSaveTags = useCallback(async (newTags: string[]) => {
    if (!supabase) return;
    const { error } = await supabase
      .from('micro_pods')
      .update({ user_tags: newTags })
      .eq('id', podcast.id);

    if (!error) {
      toast({ title: "Mapa Semántico Actualizado" });
    }
  }, [supabase, podcast.id, toast]);

  /**
   * handleDownloadAction: Gestión binaria de la Bóveda Local.
   */
  const handleDownloadAction = useCallback(() => {
    if (isOfflineAvailable) {
      if (confirm("¿Eliminar de la bóveda local?")) removeFromOffline();
    } else {
      downloadForOffline();
    }
  }, [isOfflineAvailable, removeFromOffline, downloadForOffline]);

  return (
    <div className="container mx-auto max-w-7xl py-4 md:py-8 px-4 w-full animate-in fade-in duration-700">

      {/* 1. NIVEL DE INTEGRIDAD: ALERTAS Y QA FLOW */}
      <IntegrityShield
        isFailed={isFailed}
        isConstructing={isConstructing}
        isOwner={isOwner}
        status={podcast.status}
        listeningProgress={0}
        hasListenedFully={!!podcast.reviewed_by_user}
        onPublish={async () => {
          // Lógica de publicación rápida desde el perfil
          await supabase?.from('micro_pods').update({ status: 'published' }).eq('id', podcast.id);
          router.refresh();
        }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        {/* COLUMNA DE SABIDURÍA (2/3) */}
        <div className="lg:col-span-2 space-y-6">

          {/* MÓDULO: ESCENARIO MULTIMEDIA
              Se actualiza automáticamente gracias a 'isImageReady'.
          */}
          <ProfileMediaStage
            imageUrl={podcast.cover_image_url}
            imageReady={isImageReady}
            title={podcast.title}
          />

          {/* MÓDULO: BÓVEDA DE CONTENIDO
              Maneja el texto, guion y edición de etiquetas.
          */}
          <ProfileContentVault
            title={podcast.title}
            description={podcast.description}
            scriptText={podcast.script_text}
            aiTags={podcast.ai_tags}
            userTags={podcast.user_tags}
            isOwner={isOwner}
            onSaveTags={handleSaveTags}
          />
        </div>

        {/* COLUMNA TÁCTICA: LATERAL (1/3) */}
        <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-24">

          {/* MÓDULO: CONSOLA DE AUDIO
              Sincronía total con el estado 'audio_ready'.
          */}
          <ProfileAudioConsole
            audioReady={isAudioReady}
            audioLoading={audioLoading}
            isPlaying={isPlaying}
            isCurrentActive={isCurrentActive}
            likeCount={likeCount}
            isLiked={isLiked}
            isLiking={isLiking}
            isOfflineAvailable={isOfflineAvailable}
            isDownloading={isDownloading}
            onPlay={handlePlayAction}
            onLike={handleLikeAction}
            onDownload={handleDownloadAction}
          />

          {/* MÓDULO: FICHA DEL CURADOR
              Identidad, telemetría de creación y especificaciones de IA.
          */}
          <ProfileCuratorFiche
            profile={podcast.profiles as any}
            createdAt={podcast.created_at}
            duration={podcast.duration_seconds || 0}
            creationData={podcast.creation_data}
            sources={podcast.sources || []}
          />

          {/* MÓDULO: CENTRO DE ACCIÓN
              Botones de navegación y Remix.
          */}
          <ProfileActionHub
            podcastId={podcast.id}
            status={podcast.status}
            isOwner={isOwner}
            isConstructing={isConstructing}
            isAuthenticated={!!user}
          />
        </div>

      </div>
    </div>
  );
}