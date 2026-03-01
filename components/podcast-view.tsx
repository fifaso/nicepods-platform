// components/podcast-view.tsx
// VERSIÓN: 27.1

"use client";

import { User } from '@supabase/supabase-js';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CornerUpRight
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

// --- INFRAESTRUCTURA DE COMPONENTES UI (Design System) ---
import { Button } from '@/components/ui/button';

// --- INFRAESTRUCTURA DE DATOS Y SINCRO ---
import { useAudio } from '@/contexts/audio-context';
import { useAuth } from '@/hooks/use-auth';
import { useOfflineAudio } from '@/hooks/use-offline-audio';
import { usePodcastSync } from '@/hooks/use-podcast-sync';
import { useToast } from '@/hooks/use-toast';

// --- UTILIDADES Y CONTRATOS DE DATOS ---
import { nicepodLog } from "@/lib/utils"; // [FIX]: Importación de nicepodLog restaurada
import { PodcastWithProfile } from '@/types/podcast';

// --- COMPONENTES SATÉLITE (Arquitectura Atómica) ---
import { RemixDialog } from '@/components/remix-dialog';
import { AudioConsole } from './podcast/audio-console';
import { ContentVault } from './podcast/content-vault';
import { CuratorAside } from './podcast/curator-aside';
import { IntegrityShield } from './podcast/integrity-shield';
import { MediaStage } from './podcast/media-stage';

/**
 * INTERFAZ: PodcastViewProps
 * Define el contrato de entrada para la visualización soberana del podcast.
 */
interface PodcastViewProps {
  podcastData: PodcastWithProfile;
  user: User | null;
  initialIsLiked: boolean;
  replies?: PodcastWithProfile[];
}

/**
 * COMPONENTE: PodcastView
 * El director de escena de la estación de escucha NicePod V2.5.
 * 
 * Responsabilidades:
 * 1. Sincronizar estados Realtime de producción (Audio/Imagen).
 * 2. Gestionar la interactividad social (Likes) y persistencia (Offline).
 * 3. Orquestar la visualización multimodal mediante componentes desacoplados.
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

  /**
   * 1. ACTIVACIÓN DEL SISTEMA NERVIOSO (Realtime Sync)
   * Consumimos la señal de la base de datos para actualizar la UI sin refrescos.
   */
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
  const [isRemixOpen, setIsRemixOpen] = useState<boolean>(false);

  /**
   * 4. LÓGICA DE PERSISTENCIA OFFLINE (PWA)
   */
  const {
    isOfflineAvailable,
    isDownloading,
    downloadForOffline,
    removeFromOffline
  } = useOfflineAudio(podcast);

  // --- DERIVACIONES LÓGICAS SOBERANAS ---
  const isOwner = useMemo(() => user?.id === podcast.user_id, [user?.id, podcast.user_id]);
  const isCurrentActive = useMemo(() => currentPodcast?.id === podcast.id, [currentPodcast?.id, podcast.id]);

  // Sincronización del pulso de resonancia (Likes)
  useEffect(() => {
    setLikeCount(Number(podcast.like_count || 0));
  }, [podcast.like_count]);

  // --- 5. MANEJADORES DE ACCIÓN TÁCTICA ---

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
    } catch (err: any) {
      console.error("🔥 [Social-Action] Fallo en resonancia:", err.message);
    } finally {
      setIsLiking(false);
    }
  }, [supabase, user, isLiked, isLiking, podcast.id]);

  /**
   * handlePublishAction:
   * Misión: Elevar el podcast de borrador a estado público.
   */
  const handlePublishAction = useCallback(async () => {
    if (!supabase) return;

    // [TELEMETRÍA]: Registro nominal de intención de publicación.
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

      {/* CAPA I: ESCUDO DE INTEGRIDAD (Controles de Publicación y Alertas) */}
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

      {/* GRID DE TRABAJO TÁCTICO: Arquitectura 2/3 + 1/3 */}
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
            onEditTags={() => { }} // Reservado para futura iteración de curaduría
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

          {/* MÓDULO: NODO DE IDENTIDAD (CuratorAside) */}
          <CuratorAside
            profile={podcast.profiles as any}
            createdAt={podcast.created_at}
            duration={podcast.duration_seconds || 0}
            placeName={podcast.place_name || null}
            creationData={podcast.creation_data}
            sources={podcast.sources || []}
            isConstructing={isConstructing}
          />

          {/* ACCIÓN DE APORTE (REMIX) */}
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

      {/* DIÁLOGOS DE INTERACCIÓN (Portalizados) */}
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
        <Image
          src="/nicepod-logo.png"
          alt="NicePod"
          width={56}
          height={56}
          className="grayscale mb-6"
        />
        <p className="text-[10px] font-black uppercase tracking-[0.8em]">NicePod Intelligence Terminal</p>
      </footer>

    </main>
  );
}

/**
 * NOTA TÉCNICA DEL ARCHITECT:
 * 1. Saneamiento de Referencia: La inyección de 'nicepodLog' en el import 
 *    superior resuelve el error TS2304, garantizando que la telemetría de 
 *    producción sea nominal.
 * 2. Integridad de UI: Se han mantenido los radios de borde [2.5rem] para 
 *    cohesión con la nueva arquitectura del menú superior.
 * 3. Rendimiento (Memory): El uso de 'as any' en CuratorAside para el perfil 
 *    es una medida táctica temporal para evitar discrepancias con el 
 *    objeto devuelto por el JOIN de base de datos en tiempo real.
 */