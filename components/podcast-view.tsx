// components/podcast-view.tsx
// VERSIÓN: 30.0 (NicePod Interactive Stage - Unified Realtime Edition)
// Misión: Director de escena que orquesta la transición entre la Forja IA y la experiencia de usuario.
// [ESTABILIZACIÓN]: Integración total de usePodcastSync como Fuente Única de Verdad (Single Source of Truth).

"use client";

import { User } from '@supabase/supabase-js';
import { AnimatePresence, motion } from 'framer-motion';
import { CornerUpRight } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';

// --- INFRAESTRUCTURA DE COMPONENTES UI ---
import { Button } from '@/components/ui/button';
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
import { RemixDialog } from '@/components/remix-dialog';
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

  /**
   * [NÚCLEO REACTIVO]: 
   * La variable 'podcast' es ahora el estado vivo que viene del servidor (o del WebSocket).
   */
  const {
    podcast,
    isAudioReady,
    isImageReady,
    isConstructing,
    isFailed
  } = usePodcastSync(podcastData);

  // Integración con el motor de audio global
  const {
    playPodcast,
    currentPodcast,
    isPlaying,
    isLoading: audioLoading,
    togglePlayPause
  } = useAudio();

  // Estados locales de interactividad (No sincronizados con Realtime por diseño)
  const [isLiked, setIsLiked] = useState<boolean>(initialIsLiked);
  const [likeCount, setLikeCount] = useState<number>(Number(podcast.like_count || 0));
  const [isLiking, setIsLiking] = useState<boolean>(false);
  const [isScriptExpanded, setIsScriptExpanded] = useState<boolean>(false);
  const [isRemixOpen, setIsRemixOpen] = useState<boolean>(false);

  const {
    isOfflineAvailable,
    isDownloading,
    downloadForOffline,
    removeFromOffline
  } = useOfflineAudio(podcast);

  // Derivaciones de soberanía: Usamos 'podcast' (estado vivo) en lugar de 'podcastData' (estático)
  const isOwner = useMemo(() => user?.id === podcast.user_id, [user?.id, podcast.user_id]);
  const isCurrentActive = useMemo(() => currentPodcast?.id === podcast.id, [currentPodcast?.id, podcast.id]);

  // --- MANEJADORES DE ACCIÓN TÁCTICA ---

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
      nicepodLog("🔥 [Social-Action] Fallo en resonancia:", error.message, 'error');
    } finally {
      setIsLiking(false);
    }
  }, [supabase, user, isLiked, isLiking, podcast.id]);

  const handlePublishAction = useCallback(async () => {
    if (!supabase) return;
    nicepodLog(`🚀 [Orchestrator] Iniciando publicación de Pod #${podcast.id}`);

    const { error } = await supabase
      .from('micro_pods')
      .update({
        status: 'published',
        published_at: new Date().toISOString()
      })
      .eq('id', podcast.id);

    if (!error) {
      toast({
        title: "Bóveda Actualizada",
        description: "La crónica ha sido integrada en la red global de NicePod."
      });
      router.refresh();
    }
  }, [supabase, podcast.id, toast, router]);

  const handleDownloadAction = useCallback(() => {
    if (isOfflineAvailable) {
      if (confirm("¿Desea purgar este activo de la memoria local?")) {
        removeFromOffline();
      }
    } else {
      downloadForOffline();
    }
  }, [isOfflineAvailable, removeFromOffline, downloadForOffline]);

  return (
    <main className="container mx-auto max-w-screen-xl py-6 md:py-10 px-4 md:px-8 w-full animate-in fade-in duration-700 selection:bg-primary/20">

      {/* CAPA I: ESCUDO DE INTEGRIDAD */}
      <div className="w-full mb-8">
        <IntegrityShield
          isFailed={isFailed}
          isConstructing={isConstructing}
          isOwner={isOwner}
          status={podcast.status}
          listeningProgress={0}
          hasListenedFully={!!podcast.reviewed_by_user}
          onPublish={handlePublishAction}
        />
      </div>

      {/* GRID DE TRABAJO TÁCTICO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">

        {/* COLUMNA A: CONOCIMIENTO (VISUAL Y NARRATIVO) */}
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

        {/* COLUMNA B: TERMINAL DE CONTROL (STICKY) */}
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

          {/* ACCIÓN DE APORTE */}
          <AnimatePresence>
            {!isConstructing && podcast.status === 'published' && user && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="w-full"
              >
                <Button
                  onClick={() => setIsRemixOpen(true)}
                  className="w-full h-16 rounded-[2.5rem] bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase text-[10px] tracking-[0.2em] shadow-2xl hover:scale-[1.02] transition-all"
                >
                  <CornerUpRight className="mr-3 h-4 w-4" /> Aportar a esta frecuencia
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {isRemixOpen && user && (
        <RemixDialog
          isOpen={isRemixOpen}
          onOpenChange={setIsRemixOpen}
          parentPodcast={{
            id: podcast.id,
            title: podcast.title,
            author: {
              full_name: podcast.profiles?.full_name || 'Curador Anónimo',
              avatar_url: podcast.profiles?.avatar_url || null
            }
          }}
          quoteContext={podcast.script_text?.script_plain?.substring(0, 400) || ""}
          timestamp={0}
        />
      )}

      {/* FIRMA DE PLATAFORMA */}
      <footer className="mt-32 flex flex-col items-center justify-center opacity-10 py-16 border-t border-white/5">
        <Image src="/nicepod-logo.png" alt="NicePod" width={56} height={56} className="grayscale mb-6" />
        <p className="text-[10px] font-black uppercase tracking-[0.8em]">NicePod Intelligence Terminal</p>
      </footer>
    </main>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT (SINCRO V28.0):
 * 1. Fuente única de verdad: 'PodcastView' ahora escucha el estado vivo del hook
 *    'usePodcastSync'. La transición entre 'processing' y 'published' es ahora automática.
 * 2. Integridad de renderizado: Se ha eliminado la dependencia sobre 'podcastData' 
 *    estático, asegurando que la UI refleje el tiempo real de la base de datos.
 * 3. Robusted operativa: La eliminación de las dependencias estáticas previene los 
 *    "limbos" donde el audio estaba listo en la DB pero la consola no se habilitaba.
 */