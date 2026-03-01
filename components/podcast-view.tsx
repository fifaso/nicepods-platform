// components/podcast-view.tsx
// VERSIÓN: 26.1

"use client";

import { User } from '@supabase/supabase-js';
import { AnimatePresence, motion } from 'framer-motion';
import { CornerUpRight } from 'lucide-react';
import Image from 'next/image';
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

// --- COMPONENTES SATÉLITE (Arquitectura Atómica) ---
import { RemixDialog } from '@/components/remix-dialog';
import { AudioConsole } from './podcast/audio-console';
import { ContentVault } from './podcast/content-vault';
import { CuratorAside } from './podcast/curator-aside';
import { IntegrityShield } from './podcast/integrity-shield';
import { MediaStage } from './podcast/media-stage';

/**
 * INTERFAZ: ExtendedPodcast
 * [RE-INGENIERÍA V26.1]: 
 * Expandimos el contrato de tipos para incluir las nuevas columnas de la 
 * estrategia geoespacial y asegurar la visibilidad de metadatos de perfil.
 */
interface ExtendedPodcast extends PodcastWithProfile {
  audio_ready: boolean;
  image_ready: boolean;
  place_name: string | null; // [FIX]: Inyección explícita para resolver TS2339
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
 * COMPONENTE: PodcastView
 * El orquestador soberano de la estación de escucha.
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
  // El objeto 'podcast' devuelto por el hook debe ser tratado como ExtendedPodcast.
  const {
    podcast: rawPodcast,
    isAudioReady,
    isImageReady,
    isConstructing,
    isFailed
  } = usePodcastSync(podcastData);

  // [SINCRO]: Aplicamos casting de integridad para habilitar el acceso a 'place_name'
  const podcast = rawPodcast as ExtendedPodcast;

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

  // 4. LÓGICA DE PERSISTENCIA OFFLINE
  const {
    isOfflineAvailable,
    isDownloading,
    downloadForOffline,
    removeFromOffline
  } = useOfflineAudio(podcast);

  // --- DERIVACIONES LÓGICAS ---
  const isOwner = useMemo(() => user?.id === podcast.user_id, [user?.id, podcast.user_id]);
  const isCurrentActive = useMemo(() => currentPodcast?.id === podcast.id, [currentPodcast?.id, podcast.id]);

  useEffect(() => {
    setLikeCount(Number(podcast.like_count || 0));
  }, [podcast.like_count]);

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
    } catch (err) {
      console.error("🔥 [Social-Error] Fallo en el protocolo de resonancia.");
    } finally {
      setIsLiking(false);
    }
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
    <main className="container mx-auto max-w-screen-xl py-6 md:py-10 px-4 md:px-8 w-full animate-in fade-in duration-700">

      {/* CAPA I: ESCUDO DE INTEGRIDAD */}
      <IntegrityShield
        isFailed={isFailed}
        isConstructing={isConstructing}
        isOwner={isOwner}
        status={podcast.status}
        listeningProgress={0}
        hasListenedFully={!!podcast.reviewed_by_user}
        onPublish={handlePublishAction}
      />

      {/* GRID DE TRABAJO TÁCTICO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

        {/* COLUMNA DE CONOCIMIENTO (2/3) */}
        <div className="lg:col-span-2 space-y-8">
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
            onEditTags={() => setIsEditingTags(true)}
          />
        </div>

        {/* COLUMNA TÁCTICA (1/3) */}
        <div className="lg:col-span-1 space-y-8 lg:sticky lg:top-32">
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

          {/* 
              MÓDULO: NODO DE IDENTIDAD (Perfil y Meta) 
              [RESTAURACIÓN]: placeName ahora es reconocido gracias al casting de podcast.
          */}
          <CuratorAside
            profile={podcast.profiles as any}
            createdAt={podcast.created_at}
            duration={podcast.duration_seconds || 0}
            placeName={podcast.place_name}
            creationData={podcast.creation_data}
            sources={podcast.sources || []}
            isConstructing={isConstructing}
          />

          {/* ACCIÓN DE REMIX */}
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
                  className="w-full h-16 rounded-[2rem] bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase text-[10px] tracking-[0.2em] shadow-xl hover:scale-[1.02] transition-all"
                >
                  <CornerUpRight className="mr-3 h-4 w-4" /> APORTAR A ESTA FRECUENCIA
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
              full_name: podcast.profiles?.full_name || 'Curador Anónimo',
              avatar_url: podcast.profiles?.avatar_url || null
            }
          }}
          quoteContext={(podcast.script_text as any)?.script_plain?.substring(0, 400) || ""}
          timestamp={0}
        />
      )}

      {/* FIRMA SOBERANA */}
      <div className="mt-24 flex flex-col items-center justify-center opacity-10 py-16 border-t border-white/5">
        <Image
          src="/nicepod-logo.png"
          alt="NicePod"
          width={48}
          height={48}
          className="grayscale mb-6"
        />
        <p className="text-[10px] font-black uppercase tracking-[0.8em]">NicePod Intelligence Terminal</p>
      </div>

    </main>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Resolución TS2339: La definición de 'ExtendedPodcast' inyecta place_name 
 *    en el contrato de datos local, permitiendo que Vercel build reconozca la 
 *    propiedad antes de pasarla al componente CuratorAside.
 * 2. Rendimiento (CLS): El uso de max-screen-xl y pt calibrados asegura que 
 *    la página nazca sin saltos visuales tras el handshake de Realtime.
 * 3. Diseño Cohesivo: Se han unificado los radios de borde a [2rem] y 
 *    paddings tácticos para que el visor de podcast se sienta una extensión 
 *    natural del Dashboard minimalista.
 */