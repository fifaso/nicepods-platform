// components/podcast-view.tsx
// VERSIÓN: 31.0 (NicePod Interactive Stage - QA Flow & Realtime Sync)
// Misión: Director de escena que orquesta el ciclo de vida del podcast desde la Forja hasta la Liberación.
// [ESTABILIZACIÓN]: Implementación de sincronización de progreso de escucha para QA Flow (95%).

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

interface PodcastViewProps {
  podcastData: PodcastWithProfile;
  user: User | null;
  initialIsLiked: boolean;
  replies?: PodcastWithProfile[];
}

export function PodcastView({
  podcastData,
  user,
  initialIsLiked,
  replies = []
}: PodcastViewProps) {

  const { supabase } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  // 1. Sincronía del estado de Forja (WebSocket + Polling)
  const { podcast, isAudioReady, isImageReady, isConstructing, isFailed } = usePodcastSync(podcastData);

  // 2. Control de Audio
  const { playPodcast, currentPodcast, isPlaying, isLoading: audioLoading, togglePlayPause } = useAudio();

  // 3. Estado de Escucha para QA (95%)
  const [listeningProgress, setListeningProgress] = useState<number>(0);

  // 4. Estados de interactividad
  const [isLiked, setIsLiked] = useState<boolean>(initialIsLiked);
  const [likeCount, setLikeCount] = useState<number>(Number(podcast.like_count || 0));
  const [isLiking, setIsLiking] = useState<boolean>(false);
  const [isScriptExpanded, setIsScriptExpanded] = useState<boolean>(false);
  const [isRemixOpen, setIsRemixOpen] = useState<boolean>(false);

  const { isOfflineAvailable, isDownloading, downloadForOffline, removeFromOffline } = useOfflineAudio(podcast);

  const isOwner = useMemo(() => user?.id === podcast.user_id, [user?.id, podcast.user_id]);
  const isCurrentActive = useMemo(() => currentPodcast?.id === podcast.id, [currentPodcast?.id, podcast.id]);

  /**
   * [SINCRO DE PROGRESO QA]:
   * Escuchamos el evento global del AudioProvider para actualizar el escudo.
   */
  useEffect(() => {
    const handleTimeUpdate = (e: any) => {
      const { currentTime, duration } = e.detail;
      if (duration > 0) {
        const progress = (currentTime / duration) * 100;
        setListeningProgress(progress);
      }
    };
    window.addEventListener('nicepod-timeupdate', handleTimeUpdate);
    return () => window.removeEventListener('nicepod-timeupdate', handleTimeUpdate);
  }, []);

  const hasListenedFully = useMemo(() => listeningProgress >= 95, [listeningProgress]);

  // --- MANEJADORES DE ACCIÓN ---

  const handlePlayAction = useCallback(() => {
    const publishedReplies = replies.filter(r => r.status === 'published');
    if (isCurrentActive) {
      togglePlayPause();
    } else {
      playPodcast(podcast, publishedReplies);
    }
  }, [isCurrentActive, togglePlayPause, playPodcast, podcast, replies]);

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
    } catch (error: any) {
      nicepodLog("🔥 [Social-Action] Error en resonancia:", error.message, 'error');
    } finally {
      setIsLiking(false);
    }
  }, [supabase, user, isLiked, isLiking, podcast.id]);

  const handlePublishAction = useCallback(async () => {
    if (!supabase) return;
    nicepodLog(`🚀 [Orchestrator] Liberando Pod #${podcast.id} a la red pública.`);

    const { error } = await supabase
      .from('micro_pods')
      .update({ status: 'published', published_at: new Date().toISOString() })
      .eq('id', podcast.id);

    if (!error) {
      toast({ title: "Bóveda Actualizada", description: "La crónica ha sido integrada en la red global." });
      router.refresh();
    }
  }, [supabase, podcast.id, toast, router]);

  const handleDownloadAction = useCallback(() => {
    isOfflineAvailable ? removeFromOffline() : downloadForOffline();
  }, [isOfflineAvailable, removeFromOffline, downloadForOffline]);

  return (
    <main className="container mx-auto max-w-screen-xl py-6 md:py-10 px-4 md:px-8 w-full animate-in fade-in duration-700 selection:bg-primary/20">

      <div className="w-full mb-8">
        <IntegrityShield
          isFailed={isFailed}
          isConstructing={isConstructing}
          isOwner={isOwner}
          status={podcast.status}
          listeningProgress={listeningProgress}
          hasListenedFully={hasListenedFully}
          onPublish={handlePublishAction}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        <div className="lg:col-span-2 space-y-10">
          <MediaStage
            imageUrl={podcast.cover_image_url}
            imageReady={isImageReady}
            title={podcast.title}
            isConstructing={isConstructing}
          />
          <ContentVault
            title={podcast.title}
            description={podcast.description}
            status={podcast.status}
            isConstructing={isConstructing}
            scriptText={podcast.script_text}
            aiTags={podcast.ai_tags}
            userTags={podcast.user_tags}
            isOwner={isOwner}
            isScriptExpanded={isScriptExpanded}
            onScriptToggle={setIsScriptExpanded}
            onEditTags={() => { }}
          />
        </div>

        <div className="lg:col-span-1 space-y-10 lg:sticky lg:top-32">
          <AudioConsole
            audioReady={isAudioReady}
            audioLoading={audioLoading}
            isPlaying={isPlaying}
            isCurrentActive={isCurrentActive}
            isConstructing={isConstructing}
            likeCount={likeCount}
            isLiked={isLiked}
            isLiking={isLiking}
            isOfflineAvailable={isOfflineAvailable}
            isDownloading={isDownloading}
            onPlay={handlePlayAction}
            onLike={handleLikeAction}
            onDownload={handleDownloadAction}
          />

          <CuratorAside
            profile={podcast.profiles as any}
            createdAt={podcast.created_at}
            duration={podcast.duration_seconds || 0}
            placeName={podcast.place_name || null}
            creationData={podcast.creation_data}
            sources={podcast.sources || []}
            isConstructing={isConstructing}
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