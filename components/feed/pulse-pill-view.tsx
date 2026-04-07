/**
 * ARCHIVO: components/feed/pulse-pill-view.tsx
 * VERSIÓN: 1.3 (NicePod Sovereign Pulse Console - Build Shield Certified)
 * PROTOCOLO: MADRID RESONANCE V4.0
 * 
 * Misión: Terminal de alta fidelidad para el consumo de píldoras estratégicas.
 * [CORRECCIÓN V1.3]: Resolución de desincronía en AuthContext y tipado 
 * explícito de payloads de tiempo real (Realtime Postgres Changes).
 * Nivel de Integridad: 100% (Soberano / Sin abreviaciones / Producción-Ready)
 */

"use client";

import { RealtimePostgresChangesPayload, User } from '@supabase/supabase-js';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';

// --- INFRAESTRUCTURA DE INTERFAZ (UI) ---
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

// --- NÚCLEO DE ESTADOS Y GOBERNANZA ---
import { useAudio } from '@/contexts/audio-context';
import { useAuth } from '@/hooks/use-auth';
import { useOfflineAudio } from '@/hooks/use-offline-audio';
import { useToast } from '@/hooks/use-toast';
import { cn, formatTime, getSafeAsset } from '@/lib/utils';
import { PodcastWithProfile } from '@/types/podcast';

// --- COMPONENTES DE PERITAJE TÉCNICO ---
import { SourceEvidenceBoard } from '@/components/podcast/source-evidence-board';
import { SovereignPublishTool } from '@/components/podcast/sovereign-publish-tool';

// --- ICONOGRAFÍA INDUSTRIAL (LUCIDE-REACT) ---
import {
  AlertCircle,
  BrainCircuit,
  Clock,
  FileText,
  Heart,
  Loader2,
  PlayCircle,
  Share2,
  TrendingUp,
  Zap
} from 'lucide-react';

/**
 * INTERFAZ: PulsePillViewProperties
 */
interface PulsePillViewProperties {
  initialPodcastData: PodcastWithProfile;
  authenticatedUser: User | null;
  initialIsLikedStatus: boolean;
  replies?: PodcastWithProfile[];
}

/**
 * INTERFAZ: AudioPulseEventDetail
 */
interface AudioPulseEventDetail {
  currentTime: number;
  duration: number;
}

/**
 * PulsePillView: El escenario de absorción de inteligencia estratégica.
 */
export function PulsePillView({
  initialPodcastData,
  authenticatedUser,
  initialIsLikedStatus,
  replies = []
}: PulsePillViewProperties) {

  // [FIX V1.3]: Aliasing nominal de 'supabase' a 'supabaseClient' para cumplir con el Dogma.
  const { supabase: supabaseClient } = useAuth();
  const { toast } = useToast();
  const {
    playPodcast,
    currentPodcast,
    isPlaying,
    isLoading: isAudioLoading,
    togglePlayPause,
  } = useAudio();

  // --- ESTADOS DE HIDRATACIÓN Y CRONOMETRÍA ---
  const [isClientSideMounted, setIsClientSideMounted] = useState<boolean>(false);
  const [localPlaybackTime, setLocalPlaybackTime] = useState<number>(0);
  const [localAudioDuration, setLocalAudioDuration] = useState<number>(initialPodcastData.duration_seconds || 0);

  useEffect(() => {
    setIsClientSideMounted(true);
  }, []);

  // --- ESTADOS DE DATOS SOBERANOS ---
  const [localPodcastData, setLocalPodcastData] = useState<PodcastWithProfile>(initialPodcastData);
  const [isLikedByVoyager, setIsLikedByVoyager] = useState<boolean>(initialIsLikedStatus);
  const [resonanceCount, setResonanceCount] = useState<number>(Number(localPodcastData.like_count || 0));
  const [isInteractionProcessActive, setIsInteractionProcessActive] = useState<boolean>(false);

  // --- LÓGICA DE INTEGRIDAD Y AUTORÍA ---
  const isIntelligenceConstructing = localPodcastData.processing_status !== 'completed' && localPodcastData.processing_status !== 'failed';
  const isSynthesisFailed = localPodcastData.processing_status === 'failed';
  const isAdministratorOwner = authenticatedUser?.id === localPodcastData.user_id;

  const hasUpdatedDatabaseReference = useRef<boolean>(false);

  // --- CAPACIDADES OFFLINE ---
  const { isOfflineAvailable, downloadForOffline, removeFromOffline, isDownloading } = useOfflineAudio(localPodcastData);

  const isCurrentPillActive = useMemo(() =>
    currentPodcast?.id === localPodcastData.id,
    [currentPodcast?.id, localPodcastData.id]
  );

  /**
   * EFECTO: AudioPulseSincronization
   */
  useEffect(() => {
    if (!isClientSideMounted || !isCurrentPillActive) return;

    const handleHardwarePulse = (event: CustomEvent<AudioPulseEventDetail>) => {
      const { currentTime, duration } = event.detail;
      setLocalPlaybackTime(currentTime);

      if (duration && duration !== localAudioDuration) {
        setLocalAudioDuration(duration);
      }

      if (!localPodcastData.reviewed_by_user && duration > 0) {
        const completionPercentage = (currentTime / duration) * 100;
        if (completionPercentage > 95 && authenticatedUser && !hasUpdatedDatabaseReference.current) {
          hasUpdatedDatabaseReference.current = true;
          supabaseClient
            .from('micro_pods')
            .update({ reviewed_by_user: true })
            .eq('id', localPodcastData.id)
            .then();
        }
      }
    };

    window.addEventListener('nicepod-timeupdate', handleHardwarePulse as EventListener);
    return () => window.removeEventListener('nicepod-timeupdate', handleHardwarePulse as EventListener);
  }, [isCurrentPillActive, isClientSideMounted, authenticatedUser, localAudioDuration, localPodcastData.id, localPodcastData.reviewed_by_user, supabaseClient]);

  /**
   * EFECTO: RealtimeRevelationSentinel
   * [FIX V1.3]: Tipado estricto del payload para evitar error TS7006.
   */
  useEffect(() => {
    if (!supabaseClient || !isClientSideMounted) return;

    const revelationChannel = supabaseClient.channel(`pill_revelation_${localPodcastData.id}`)
      .on<PodcastWithProfile>(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'micro_pods', filter: `id=eq.${localPodcastData.id}` },
        (payload: RealtimePostgresChangesPayload<PodcastWithProfile>) => {
          setLocalPodcastData(previousData => ({ ...previousData, ...(payload.new as PodcastWithProfile) }));
        }
      ).subscribe();

    return () => {
      supabaseClient.removeChannel(revelationChannel);
    };
  }, [supabaseClient, localPodcastData.id, isClientSideMounted]);

  /**
   * renderedScriptTranscription:
   * Misión: Normalizar la salida del guion para evitar errores de renderizado de objetos.
   */
  const renderedScriptTranscription = useMemo(() => {
    const rawScript = localPodcastData.script_text;
    if (!rawScript) return "";
    try {
      const parsedScript = typeof rawScript === 'string' ? JSON.parse(rawScript) : rawScript;
      if (Array.isArray(parsedScript)) {
        return parsedScript.map((segment: { speaker?: string, line?: string, text?: string }) =>
          `${segment.speaker || 'Analista'}: ${segment.line || segment.text || ''}`
        ).join('\n\n');
      }
      return parsedScript.script_body || parsedScript.text || String(rawScript);
    } catch (exception) {
      return String(rawScript);
    }
  }, [localPodcastData.script_text]);

  // --- MANEJADORES DE ACCIÓN ---

  const handlePlaybackControl = () => {
    if (isCurrentPillActive) {
      togglePlayPause();
    } else {
      playPodcast(localPodcastData);
    }
  };

  const handleResonanceInteraction = async () => {
    if (!supabaseClient || !authenticatedUser) return;
    setIsInteractionProcessActive(true);

    const podcastIdentification = localPodcastData.id;
    const userIdentification = authenticatedUser.id;

    if (isLikedByVoyager) {
      setIsLikedByVoyager(false);
      setResonanceCount(previousCount => Math.max(0, previousCount - 1));
      await supabaseClient.from('likes').delete().match({
        user_id: userIdentification,
        podcast_id: podcastIdentification
      });
    } else {
      setIsLikedByVoyager(true);
      setResonanceCount(previousCount => previousCount + 1);
      await supabaseClient.from('likes').insert({
        user_id: userIdentification,
        podcast_id: podcastIdentification
      });
    }
    setIsInteractionProcessActive(false);
  };

  if (!isClientSideMounted) return null;

  return (
    <div className="container mx-auto max-w-7xl py-6 md:py-12 px-4 md:px-6 overflow-x-hidden">

      <AnimatePresence mode="wait">
        {isIntelligenceConstructing ? (
          <motion.div key="constructing_state" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Card className="bg-slate-900/40 backdrop-blur-3xl border-white/5 rounded-[3rem] p-12 flex flex-col items-center text-center space-y-8 min-h-[500px] justify-center shadow-2xl">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-3xl animate-pulse rounded-full" />
                <BrainCircuit className="h-20 w-20 text-primary relative z-10 animate-bounce" />
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
          <motion.div key="failed_state" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
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
          <motion.div key="ready_state" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">

            <div className="grid lg:grid-cols-5 gap-8 items-start">

              {/* COLUMNA IZQUIERDA: AUDIO Y STATUS */}
              <div className="lg:col-span-2 space-y-6 lg:sticky lg:top-24">
                <Card className="bg-slate-900/60 backdrop-blur-3xl border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
                  <div className="p-8 space-y-6">
                    <header className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-aurora animate-aurora text-white border-none font-black text-[9px] px-2.5 uppercase">PULSE PILL</Badge>
                        <div className="h-px flex-1 bg-white/5" />
                      </div>
                      <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-white leading-none">
                        {localPodcastData.title}
                      </h1>
                    </header>

                    <div className="bg-black/40 p-5 rounded-2xl border border-white/5 border-l-4 border-l-primary">
                      <p className="text-sm font-medium text-zinc-400 leading-relaxed italic">
                        "{localPodcastData.description}"
                      </p>
                    </div>

                    <div className="pt-4 space-y-6">
                      <Button
                        onClick={handlePlaybackControl}
                        disabled={isAudioLoading && !isCurrentPillActive}
                        className="w-full h-20 rounded-[1.5rem] bg-white text-slate-950 hover:bg-zinc-200 transition-all shadow-xl shadow-white/5 group"
                      >
                        {isAudioLoading && isCurrentPillActive ? (
                          <Loader2 className="h-8 w-8 animate-spin" />
                        ) : (isPlaying && isCurrentPillActive) ? (
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
                          <button onClick={handleResonanceInteraction} disabled={isInteractionProcessActive} className="group flex items-center gap-2 transition-all">
                            <Heart className={cn("h-6 w-6 transition-colors", isLikedByVoyager ? "fill-primary text-primary" : "text-white/20 group-hover:text-white/60")} />
                            <span className="text-xs font-black text-white/40 tabular-nums">{resonanceCount}</span>
                          </button>
                          <button className="text-white/20 hover:text-white/60 transition-colors"><Share2 size={20} /></button>
                        </div>
                        <div className="flex items-center gap-4 text-white/20">
                          <Clock size={16} />
                          <span className="text-xs font-mono font-bold">{formatTime(localPlaybackTime)} / {formatTime(localAudioDuration)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* FICHA DEL CURADOR */}
                <Card className="bg-white/5 border-white/5 rounded-2xl p-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 rounded-full overflow-hidden border border-white/10">
                      <Image src={getSafeAsset(localPodcastData.profiles?.avatar_url, 'avatar')} alt="NP" fill />
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase text-white/40 tracking-widest">Inteligencia de</p>
                      <p className="font-bold text-sm text-white uppercase">{localPodcastData.profiles?.full_name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black uppercase text-white/40 tracking-widest">Frecuencia</p>
                    <p className="font-bold text-sm text-primary uppercase">{new Date(localPodcastData.created_at).toLocaleDateString()}</p>
                  </div>
                </Card>
              </div>

              {/* COLUMNA DERECHA: DOSSIER DE EVIDENCIA */}
              <div className="lg:col-span-3 space-y-8">
                <div className="px-0 pb-2 mb-4 border-b border-white/5">
                  <h2 className="text-2xl font-black uppercase tracking-tighter text-white flex items-center gap-3">
                    <Zap className="text-primary h-6 w-6" /> Dossier de Inteligencia
                  </h2>
                </div>

                <SourceEvidenceBoard sources={localPodcastData.sources as any[]} />

                {isAdministratorOwner && (
                  <div className="mt-12">
                    <SovereignPublishTool
                      podcastId={localPodcastData.id}
                      currentStatus={localPodcastData.status}
                      isOwner={isAdministratorOwner}
                      onPublished={() => setLocalPodcastData(previousData => ({ ...previousData, status: 'published' }))}
                    />
                  </div>
                )}
              </div>

            </div>

            <Separator className="bg-white/5 my-12" />

            {/* TRANSCRIPCIÓN MAESTRA */}
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