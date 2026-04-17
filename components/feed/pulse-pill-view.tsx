/**
 * ARCHIVO: components/feed/pulse-pill-view.tsx
 * VERSIÓN: 2.0 (Madrid Resonance - Sovereign Edition)
 * PROTOCOLO: MADRID RESONANCE V7.0
 * 
 * Misión: Terminal de alta fidelidad para el consumo de píldoras estratégicas.
 * [REFORMA V2.0]: Sincronización axial completa con el contrato purificado V7.0.
 * Eliminación de fugas snake_case y alineación absoluta con la Doctrina ZAP.
 *
 * Nivel de Integridad: 100% (Soberanía Nominal V7.0)
 */

"use client";

import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  Clock,
  FileText,
  Heart,
  Loader2,
  PlayCircle,
  Share2,
  TrendingUp,
  Zap
} from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';

// --- INFRAESTRUCTURA DE DATOS Y SINCRO ---
import { useAudio } from '@/contexts/audio-context';
import { useAuth } from '@/hooks/use-auth';
import { usePodcastSync } from '@/hooks/use-podcast-sync';

// --- COMPONENTES UI Y UTILIDADES ---
import { SourceEvidenceBoard } from '@/components/podcast/source-evidence-board';
import { SovereignPublishTool } from '@/components/podcast/sovereign-publish-tool';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { formatTime, getSafeAsset, nicepodLog, cn } from '@/lib/utils';
import { PodcastWithProfile } from '@/types/podcast';

/**
 * INTERFAZ: PulsePillViewComponentProperties
 */
interface PulsePillViewComponentProperties {
  initialPodcastData: PodcastWithProfile;
}

/**
 * PulsePillView: El director de escena para la inteligencia de pulso.
 */
export function PulsePillView({ initialPodcastData }: PulsePillViewComponentProperties) {
  const { supabaseSovereignClient: supabaseClient, authenticatedUser } = useAuth();

  const [isClientSideMounted, setIsClientSideMounted] = useState<boolean>(false);
  useEffect(() => {
    setIsClientSideMounted(true);
  }, []);

  const {
    podcast: localPodcastData,
    isAudioReady,
    processingStatus,
    isFailed: isSynthesisFailed,
    isConstructing: isIntelligenceConstructing
  } = usePodcastSync(initialPodcastData);

  const {
    playPodcastAction,
    currentActivePodcast,
    isAudioPlayingStatus: isAudioPlaying,
    isAudioLoadingStatus: isAudioLoading,
    togglePlayPauseAction
  } = useAudio();

  const [localPlaybackTimeSeconds, setLocalPlaybackTimeSeconds] = useState<number>(0);
  const [localAudioDurationSeconds, setLocalAudioDurationSeconds] = useState<number>(initialPodcastData.playbackDurationSecondsTotal || 0);

  const [isLikedByVoyager, setIsLikedByVoyager] = useState<boolean>(false);
  const [resonanceCount, setResonanceCount] = useState<number>(initialPodcastData.likeCountTotal || 0);
  const [isInteractionProcessActive, setIsInteractionProcessActive] = useState<boolean>(false);

  const isAdministratorOwner = authenticatedUser?.id === localPodcastData.authorUserIdentification;

  const isCurrentPillActive = useMemo(() =>
    currentActivePodcast?.identification === localPodcastData.identification,
    [currentActivePodcast?.identification, localPodcastData.identification]
  );

  /**
   * 1. PROTOCOLO DE SINCRONÍA DE ESCUCHA (QA)
   */
  useEffect(() => {
    if (!isClientSideMounted || !isCurrentPillActive) return;

    const handleHardwarePulse = (synchronizationEvent: Event) => {
      const customTelemetryEvent = synchronizationEvent as CustomEvent<{ currentTime: number; duration: number }>;
      const { currentTime, duration } = customTelemetryEvent.detail;
      
      setLocalPlaybackTimeSeconds(currentTime);
      if (duration > 0) setLocalAudioDurationSeconds(duration);

      // Si se escucha el 90% de la píldora, marcamos como revisada automáticamente.
      if (!localPodcastData.isReviewedByUserStatus && duration > 0) {
        const progressPercentageMagnitude = (currentTime / duration) * 100;
        if (progressPercentageMagnitude > 90) {
          supabaseClient
            .from('micro_pods')
            .update({ reviewed_by_user: true })
            .eq('id', localPodcastData.identification)
            .then();
        }
      }
    };

    window.addEventListener('nicepod-timeupdate', handleHardwarePulse as EventListener);
    return () => window.removeEventListener('nicepod-timeupdate', handleHardwarePulse as EventListener);
  }, [isCurrentPillActive, isClientSideMounted, authenticatedUser, localAudioDurationSeconds, localPodcastData.identification, localPodcastData.isReviewedByUserStatus, supabaseClient]);

  /**
   * 2. VERIFICACIÓN DE RESONANCIA
   */
  useEffect(() => {
    if (!supabaseClient || !isClientSideMounted || !authenticatedUser) return;

    supabaseClient
      .from('likes')
      .select('id')
      .match({ user_id: authenticatedUser.id, podcast_id: localPodcastData.identification })
      .maybeSingle()
      .then(({ data }) => setIsLikedByVoyager(!!data));
  }, [supabaseClient, localPodcastData.identification, isClientSideMounted, authenticatedUser]);

  /**
   * 3. RENDERIZACIÓN DE TRANSCRIPCIÓN
   */
  const renderedScriptTranscription = useMemo(() => {
    const rawScriptContent = localPodcastData.podcastScriptDossier;
    if (!rawScriptContent) return "Análisis narrativo en proceso...";

    try {
      const parsedScript = typeof rawScriptContent === 'string' ? JSON.parse(rawScriptContent) : rawScriptContent;
      return parsedScript.scriptBodyContent || parsedScript.scriptPlainContent || String(rawScriptContent);
    } catch {
      return String(rawScriptContent);
    }
  }, [localPodcastData.podcastScriptDossier]);

  // --- MANEJADORES DE ACCIÓN ---

  const handlePlaybackControlAction = useCallback(() => {
    if (isCurrentPillActive) {
      togglePlayPauseAction();
    } else {
      playPodcastAction(localPodcastData);
    }
  }, [isCurrentPillActive, togglePlayPauseAction, playPodcastAction, localPodcastData]);

  const handleResonanceInteractionAction = useCallback(async () => {
    if (!supabaseClient || !authenticatedUser || isInteractionProcessActive) return;
    setIsInteractionProcessActive(true);

    const podcastIdentification = localPodcastData.identification;
    const userIdentification = authenticatedUser.id;

    try {
      if (isLikedByVoyager) {
        setIsLikedByVoyager(false);
        setResonanceCount(prev => Math.max(0, prev - 1));
        await supabaseClient.from('likes').delete().match({ user_id: userIdentification, podcast_id: podcastIdentification });
      } else {
        setIsLikedByVoyager(true);
        setResonanceCount(prev => prev + 1);
        await supabaseClient.from('likes').insert({ user_id: userIdentification, podcast_id: podcastIdentification });
      }
    } catch (hardwareException) {
      nicepodLog("🔥 [PulseView] Resonance error", hardwareException, 'error');
    } finally {
      setIsInteractionProcessActive(false);
    }
  }, [supabaseClient, authenticatedUser, isLikedByVoyager, isInteractionProcessActive, localPodcastData.identification]);

  if (!isClientSideMounted) return null;

  return (
    <div className="container mx-auto max-w-7xl py-6 md:py-12 px-4 md:px-6 overflow-x-hidden">
      <AnimatePresence mode="wait">
        {isIntelligenceConstructing ? (
          <motion.div key="loading_visual_state" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Card className="flex flex-col items-center justify-center p-20 bg-slate-900/40 border-white/5 backdrop-blur-3xl rounded-[3rem] text-center space-y-8 shadow-2xl">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse" />
                <Loader2 className="h-16 w-16 animate-spin text-primary relative z-10" />
              </div>
              <div className="space-y-4">
                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white">Sintetizando Inteligencia</h2>
                <p className="text-muted-foreground text-lg max-w-md mx-auto font-medium">
                  Estamos procesando las fuentes de autoridad y calibrando tu píldora estratégica.
                </p>
              </div>
              <div className="flex items-center gap-3 bg-primary/10 px-6 py-3 rounded-2xl border border-primary/20">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Radar en Proceso</span>
              </div>
            </Card>
          </motion.div>
        ) : isSynthesisFailed ? (
          <motion.div key="failed_visual_state" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Alert variant="destructive" className="bg-red-500/10 border-red-500/50 backdrop-blur-xl rounded-[2rem] p-8 shadow-2xl">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <div className="ml-4 space-y-2">
                <AlertTitle className="text-xl font-black uppercase text-red-500">Falla de Consola</AlertTitle>
                <AlertDescription className="text-base text-red-400">
                  No se pudo completar la síntesis de esta píldora. Por favor, intenta un nuevo escaneo.
                </AlertDescription>
              </div>
            </Alert>
          </motion.div>
        ) : (
          <motion.div key="ready_visual_state" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">

            <div className="grid lg:grid-cols-5 gap-8 items-start">

              <div className="lg:col-span-2 space-y-6 lg:sticky lg:top-24">
                <Card className="bg-slate-900/60 backdrop-blur-3xl border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
                  <div className="p-8 space-y-6">
                    <header className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-aurora animate-aurora text-white border-none font-black text-[9px] px-2.5 uppercase">PULSE PILL</Badge>
                        <div className="h-px flex-1 bg-white/5" />
                      </div>
                      <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-white leading-none font-serif italic">
                        {localPodcastData.titleTextContent}
                      </h1>
                    </header>

                    <div className="bg-black/40 p-5 rounded-2xl border border-white/5 border-l-4 border-l-primary">
                      <p className="text-sm font-medium text-zinc-400 leading-relaxed italic">
                        "{localPodcastData.descriptionTextContent}"
                      </p>
                    </div>

                    <div className="pt-4 space-y-6">
                      <Button
                        onClick={handlePlaybackControlAction}
                        disabled={isAudioLoading && !isCurrentPillActive}
                        className="w-full h-20 rounded-[1.5rem] bg-white text-slate-950 hover:bg-zinc-200 transition-all shadow-xl shadow-white/5 group"
                      >
                        {isAudioLoading && isCurrentPillActive ? (
                          <Loader2 className="h-8 w-8 animate-spin" />
                        ) : (isAudioPlaying && isCurrentPillActive) ? (
                          <div className="flex items-center gap-3">
                            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity }} className="w-3 h-3 bg-primary rounded-full" />
                            <span className="font-black text-xl uppercase tracking-tighter">PAUSAR BRIEFING</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 font-black text-xl uppercase tracking-tighter">
                            <PlayCircle className="h-8 w-8 text-primary" /> ESCUCHAR AHORA
                          </div>
                        )}
                      </Button>

                      <div className="flex justify-between items-center px-2">
                        <div className="flex items-center gap-4">
                          <button 
                            onClick={handleResonanceInteractionAction} 
                            disabled={isInteractionProcessActive} 
                            className="group flex items-center gap-2 transition-all"
                          >
                            <Heart className={cn("h-6 w-6 transition-colors", isLikedByVoyager ? "fill-primary text-primary" : "text-white/20 group-hover:text-white/60")} />
                            <span className="text-xs font-black text-white/40 tabular-nums">{resonanceCount}</span>
                          </button>
                          <button className="text-white/20 hover:text-white/60 transition-colors"><Share2 size={20} /></button>
                        </div>
                        <div className="flex items-center gap-4 text-white/20">
                          <Clock size={16} />
                          <span className="text-xs font-mono font-bold">
                            {formatTime(localPlaybackTimeSeconds)} / {formatTime(localAudioDurationSeconds)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="bg-white/5 border-white/5 rounded-2xl p-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 rounded-full overflow-hidden border border-white/10 shadow-lg">
                      <Image 
                        src={getSafeAsset(localPodcastData.profiles?.avatarUniformResourceLocator, 'avatar')}
                        alt={localPodcastData.profiles?.fullName || "Curador"}
                        fill 
                      />
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase text-white/40 tracking-widest">Inteligencia de</p>
                      <p className="font-bold text-sm text-white uppercase">{localPodcastData.profiles?.fullName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black uppercase text-white/40 tracking-widest">Frecuencia</p>
                    <p className="font-bold text-sm text-primary uppercase">
                        {new Date(localPodcastData.creationTimestamp).toLocaleDateString()}
                    </p>
                  </div>
                </Card>
              </div>

              <div className="lg:col-span-3 space-y-8">
                <div className="px-0 pb-2 mb-4 border-b border-white/5">
                  <h2 className="text-2xl font-black uppercase tracking-tighter text-white flex items-center gap-3">
                    <Zap className="text-primary h-6 w-6" /> Dossier de Inteligencia
                  </h2>
                </div>

                <SourceEvidenceBoard intelligenceEvidenceSources={localPodcastData.intelligenceSourcesCollection || []} />

                {isAdministratorOwner && (
                  <div className="mt-12">
                    <SovereignPublishTool
                      podcastIdentification={localPodcastData.identification}
                      currentPublicationStatus={localPodcastData.publicationStatus}
                      isAdministratorOwner={isAdministratorOwner}
                      onPublicationSuccessAction={() => {}}
                    />
                  </div>
                )}
              </div>

            </div>

            <Separator className="bg-white/5 my-12" />

            <div className="max-w-3xl mx-auto opacity-40 hover:opacity-100 transition-opacity">
              <h3 className="text-center font-black uppercase tracking-[0.3em] text-[10px] text-white/60 mb-6 flex items-center justify-center gap-2">
                <FileText size={12} /> Master Transcription
              </h3>
              <div className="p-8 md:p-12 bg-black/20 rounded-[2.5rem] border border-white/5 font-medium leading-relaxed text-zinc-400 whitespace-pre-wrap">
                {renderedScriptTranscription}
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      <footer className="mt-20 py-10 border-t border-white/5 flex flex-col items-center gap-4 opacity-20">
        <div className="flex items-center gap-3">
          <TrendingUp size={20} />
          <span className="font-black text-[10px] uppercase tracking-[0.5em] text-white">NicePod Strategic Pulse Engine</span>
        </div>
      </footer>
    </div>
  );
}
