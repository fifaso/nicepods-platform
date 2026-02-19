// components/podcast-view.tsx
// VERSIÓN: 26.0 (NicePod Orchestrator - Master Integrity & Zero Flicker)
// Misión: Orquestar la visualización del podcast mediante componentes especializados y sincronía Realtime.
// [RESOLUCIÓN]: Fix masivo de errores TS2304, TS2786 y restauración total de importaciones de UI.

"use client";

import { User } from '@supabase/supabase-js';
import { AnimatePresence, motion } from 'framer-motion'; // [FIX]: Importación de animación restaurada
import {
  CornerUpRight
} from 'lucide-react'; // [FIX]: Iconos restaurados
import Image from 'next/image'; // [FIX]: Importación prioritaria para evitar conflicto con window.Image
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

// --- INFRAESTRUCTURA DE COMPONENTES UI ---
import { Button } from '@/components/ui/button';

// --- INFRAESTRUCTURA DE DATOS Y SINCRO ---
import { useAudio } from '@/contexts/audio-context';
import { useAuth } from '@/hooks/use-auth';
import { useOfflineAudio } from '@/hooks/use-offline-audio';
import { usePodcastSync } from '@/hooks/use-podcast-sync';
import { useToast } from '@/hooks/use-toast';
import { PodcastWithProfile } from '@/types/podcast';

// --- COMPONENTES SATÉLITE (Arquitectura NSP) ---
import { RemixDialog } from '@/components/remix-dialog';
import { AudioConsole } from './podcast/audio-console';
import { ContentVault } from './podcast/content-vault';
import { CuratorAside } from './podcast/curator-aside';
import { IntegrityShield } from './podcast/integrity-shield';
import { MediaStage } from './podcast/media-stage';

/**
 * INTERFAZ DE INTEGRIDAD EXTENDIDA: 
 * Garantiza que TS reconozca las columnas de la versión 2.5 de la base de datos.
 */
interface ExtendedPodcast extends PodcastWithProfile {
  audio_ready: boolean;
  image_ready: boolean;
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
    username: string;
    reputation_score?: number;
    is_verified?: boolean;
    role?: string;
  } | null;
}

interface PodcastViewProps {
  podcastData: PodcastWithProfile;
  user: User | null;
  initialIsLiked: boolean;
  replies?: PodcastWithProfile[];
}

/**
 * PodcastView: El director de orquesta de la estación de escucha NicePod.
 */
export function PodcastView({
  podcastData,
  user,
  initialIsLiked,
  replies = []
}: PodcastViewProps) {

  const { supabase } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  // 1. ACTIVACIÓN DEL SISTEMA NERVIOSO (Realtime Sync)
  // Consumimos el hook que forjamos para actualizar la UI en cuanto terminen los activos.
  const {
    podcast,
    isAudioReady,
    isImageReady,
    isConstructing,
    isFailed
  } = usePodcastSync(podcastData);

  // 2. INTEGRACIÓN CON EL MOTOR DE AUDIO GLOBAL
  const {
    playPodcast,
    currentPodcast,
    isPlaying,
    isLoading: audioLoading,
    togglePlayPause
  } = useAudio();

  // 3. ESTADOS SOCIALES Y DE INTERFAZ
  const [isLiked, setIsLiked] = useState<boolean>(initialIsLiked);
  const [likeCount, setLikeCount] = useState<number>(Number(podcast.like_count || 0));
  const [isLiking, setIsLiking] = useState<boolean>(false);
  const [isScriptExpanded, setIsScriptExpanded] = useState<boolean>(false);
  const [isEditingTags, setIsEditingTags] = useState<boolean>(false);
  const [isRemixOpen, setIsRemixOpen] = useState<boolean>(false);

  // 4. LÓGICA DE PERSISTENCIA OFFLINE (PWA)
  const {
    isOfflineAvailable,
    isDownloading,
    downloadForOffline,
    removeFromOffline
  } = useOfflineAudio(podcast);

  // --- DERIVACIONES LÓGICAS (Rigor Senior) ---
  const isOwner = useMemo(() => user?.id === podcast.user_id, [user?.id, podcast.user_id]);
  const isCurrentActive = useMemo(() => currentPodcast?.id === podcast.id, [currentPodcast?.id, podcast.id]);

  // Sincronización de contador de likes tras cambios en tiempo real
  useEffect(() => {
    setLikeCount(Number(podcast.like_count || 0));
  }, [podcast.like_count]);

  // --- 5. MANEJADORES DE ACCIÓN SOBERANA ---

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

    if (isLiked) {
      setIsLiked(false);
      setLikeCount(prev => Math.max(0, prev - 1));
      await supabase.from('likes').delete().match({ user_id: user.id, podcast_id: podcast.id });
    } else {
      setIsLiked(true);
      setLikeCount(prev => prev + 1);
      await supabase.from('likes').insert({ user_id: user.id, podcast_id: podcast.id });
    }
    setIsLiking(false);
  }, [supabase, user, isLiked, isLiking, podcast.id]);

  const handlePublishAction = useCallback(async () => {
    if (!supabase) return;
    const { error } = await supabase
      .from('micro_pods')
      .update({ status: 'published', published_at: new Date().toISOString() })
      .eq('id', podcast.id);

    if (!error) {
      toast({ title: "Portal Abierto", description: "El podcast es ahora público." });
      router.refresh();
    }
  }, [supabase, podcast.id, toast, router]);

  const handleDownloadAction = useCallback(() => {
    if (isOfflineAvailable) {
      if (confirm("¿Eliminar de la bóveda local?")) removeFromOffline();
    } else {
      downloadForOffline();
    }
  }, [isOfflineAvailable, removeFromOffline, downloadForOffline]);

  return (
    <main className="container mx-auto max-w-6xl py-4 md:py-8 px-4 md:px-6 w-full animate-in fade-in duration-700">

      {/* CAPA I: ESCUDO DE INTEGRIDAD (Alertas y QA) */}
      <IntegrityShield
        isFailed={isFailed}
        isConstructing={isConstructing}
        isOwner={isOwner}
        status={podcast.status}
        listeningProgress={0}
        hasListenedFully={!!podcast.reviewed_by_user}
        onPublish={handlePublishAction}
      />

      {/* GRID DE TRABAJO TÁCTICO: DENSIDAD G-6 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        {/* COLUMNA DE CONOCIMIENTO (2/3) */}
        <div className="lg:col-span-2 space-y-6">

          {/* MÓDULO: ESCENARIO MULTIMEDIA (Imagen 3) */}
          <MediaStage
            imageUrl={podcast.cover_image_url}
            imageReady={isImageReady}
            title={podcast.title}
            isConstructing={isConstructing}
          />

          {/* MÓDULO: BÓVEDA DE CONTENIDO (Guion y Tags) */}
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
            onEditTags={() => setIsEditingTags(true)}
          />
        </div>

        {/* COLUMNA TÁCTICA: LATERAL (1/3) */}
        <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-24">

          {/* MÓDULO: CONSOLA DE AUDIO (Smart Player) */}
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

          {/* MÓDULO: NODO DE IDENTIDAD (Perfil y Meta) */}
          <CuratorAside
            profile={podcast.profiles as any}
            createdAt={podcast.created_at}
            duration={podcast.duration_seconds || 0}
            placeName={podcast.place_name}
            creationData={podcast.creation_data}
            sources={podcast.sources || []}
            isConstructing={isConstructing}
          />

          {/* ACCIÓN DE REMIX (Cierre de Sabiduría) */}
          <AnimatePresence>
            {!isConstructing && podcast.status === 'published' && user && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="w-full"
              >
                <Button
                  onClick={() => setIsRemixOpen(true)}
                  className="w-full h-14 rounded-2xl bg-indigo-600 text-white font-black uppercase text-[10px] tracking-[0.2em] shadow-lg hover:scale-[1.02] transition-all"
                >
                  <CornerUpRight className="mr-2.5 h-4 w-4" /> APORTAR A ESTA FRECUENCIA
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* DIÁLOGOS DE INTERACCIÓN */}
      {isRemixOpen && user && (
        <RemixDialog
          isOpen={isRemixOpen}
          onOpenChange={setIsRemixOpen}
          parentPodcast={{
            id: podcast.id,
            title: podcast.title,
            author: {
              full_name: podcast.profiles?.full_name || 'Anónimo',
              avatar_url: podcast.profiles?.avatar_url || null
            }
          }}
          quoteContext={(podcast.script_text as any)?.script_plain?.substring(0, 400) || ""}
          timestamp={0}
        />
      )}

      {/* FIRMA SOBERANA NICEPOD */}
      <div className="mt-16 flex flex-col items-center justify-center opacity-10 py-10">
        <Image
          src="/nicepod-logo.png"
          alt="NicePod"
          width={40}
          height={40}
          className="grayscale mb-4"
        />
        <p className="text-[8px] font-black uppercase tracking-[0.8em]">Intelligence Redefined • V2.5</p>
      </div>

    </main>
  );
}