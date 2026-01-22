// components/pulse-pill-view.tsx
// VERSIÓN: 1.1 (Strategic Pulse Console - Zero Error & High-Authority Integration)

"use client";

import { User } from '@supabase/supabase-js';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'; // [FIX]: Importación añadida
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAudio } from '@/contexts/audio-context';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { PodcastWithProfile } from '@/types/podcast';

import {
  AlertCircle,
  BrainCircuit,
  Clock // [FIX]: Importación añadida
  ,
  FileText,
  Heart,
  Loader2,
  PlayCircle,
  Share2,
  TrendingUp,
  Zap
} from 'lucide-react';

import { useOfflineAudio } from '@/hooks/use-offline-audio';
import { cn, formatTime, getSafeAsset } from '@/lib/utils';
import { SourceEvidenceBoard } from './podcast/source-evidence-board';
import { SovereignPublishTool } from './podcast/sovereign-publish-tool';

interface PulsePillViewProps {
  podcastData: PodcastWithProfile;
  user: User | null;
  initialIsLiked: boolean;
  replies?: PodcastWithProfile[];
}

export function PulsePillView({ podcastData, user, initialIsLiked, replies = [] }: PulsePillViewProps) {
  const { supabase } = useAuth();
  const { toast } = useToast();
  const {
    playPodcast,
    currentPodcast,
    isPlaying,
    isLoading: audioLoading,
    togglePlayPause,
    seekTo
  } = useAudio();

  // --- ESTADOS DE HIDRATACIÓN Y TIEMPO ---
  const [isClient, setIsClient] = useState(false);
  const [localTime, setLocalTime] = useState(0);
  const [localDuration, setLocalDuration] = useState(podcastData.duration_seconds || 0);

  useEffect(() => { setIsClient(true); }, []);

  // --- ESTADOS DE DATOS LOCALES ---
  const [localPodcastData, setLocalPodcastData] = useState<PodcastWithProfile>(podcastData);
  const [isLiked, setIsLiked] = useState<boolean>(initialIsLiked);
  const [likeCount, setLikeCount] = useState<number>(Number(localPodcastData.like_count || 0));
  const [isLiking, setIsLiking] = useState<boolean>(false);

  // --- LÓGICA DE INTEGRIDAD ---
  const isConstructing = localPodcastData.processing_status !== 'completed' && localPodcastData.processing_status !== 'failed';
  const isFailed = localPodcastData.processing_status === 'failed';
  const isOwner = user?.id === localPodcastData.user_id;

  // --- QA PROGRESS ---
  const [listeningProgress, setListeningProgress] = useState(0);
  const hasUpdatedDbRef = useRef(false);

  // --- OFFLINE ---
  const { isOfflineAvailable, downloadForOffline, removeFromOffline, isDownloading } = useOfflineAudio(localPodcastData);

  const isCurrentActive = useMemo(() => currentPodcast?.id === localPodcastData.id, [currentPodcast?.id, localPodcastData.id]);

  // 1. SINCRONIZACIÓN DE AUDIO PULSE (Event-Driven)
  useEffect(() => {
    if (!isClient || !isCurrentActive) return;

    const handlePulse = (e: any) => {
      const { currentTime, duration } = e.detail;
      setLocalTime(currentTime);
      if (duration && duration !== localDuration) setLocalDuration(duration);

      if (!localPodcastData.reviewed_by_user && duration > 0) {
        const percent = (currentTime / duration) * 100;
        setListeningProgress(percent);
        if (percent > 95 && user && !hasUpdatedDbRef.current) {
          hasUpdatedDbRef.current = true;
          supabase.from('micro_pods').update({ reviewed_by_user: true }).eq('id', localPodcastData.id).then();
        }
      }
    };

    window.addEventListener('nicepod-timeupdate', handlePulse);
    return () => window.removeEventListener('nicepod-timeupdate', handlePulse);
  }, [isCurrentActive, isClient, user, localDuration, localPodcastData.id, localPodcastData.reviewed_by_user, supabase]);

  // 2. SINCRONIZACIÓN REALTIME (Revelación automática)
  useEffect(() => {
    if (!supabase || !isClient) return;
    const channel = supabase.channel(`pill_revelation_${localPodcastData.id}`)
      .on<PodcastWithProfile>(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'micro_pods', filter: `id=eq.${localPodcastData.id}` },
        (payload) => {
          setLocalPodcastData(prev => ({ ...prev, ...(payload.new as PodcastWithProfile) }));
        }
      ).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [supabase, localPodcastData.id, isClient]);

  // 3. NORMALIZADOR DE GUION (Resuelve bug [object Object])
  const renderedScript = useMemo(() => {
    const raw = localPodcastData.script_text;
    if (!raw) return "";
    try {
      const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
      if (Array.isArray(parsed)) {
        return parsed.map((s: any) => `${s.speaker || 'Analista'}: ${s.line || s.text || ''}`).join('\n\n');
      }
      return parsed.script_body || parsed.text || String(raw);
    } catch {
      return String(raw);
    }
  }, [localPodcastData.script_text]);

  // --- MANEJADORES ---
  const handlePlay = () => {
    if (isCurrentActive) togglePlayPause();
    else playPodcast(localPodcastData);
  };

  const handleLike = async () => {
    if (!supabase || !user) return;
    setIsLiking(true);
    const podId = localPodcastData.id;
    if (isLiked) {
      setIsLiked(false);
      setLikeCount(c => Math.max(0, c - 1));
      await supabase.from('likes').delete().match({ user_id: user.id, podcast_id: podId });
    } else {
      setIsLiked(true);
      setLikeCount(c => c + 1);
      await supabase.from('likes').insert({ user_id: user.id, podcast_id: podId });
    }
    setIsLiking(false);
  };

  if (!isClient) return null;

  return (
    <div className="container mx-auto max-w-7xl py-6 md:py-12 px-4 md:px-6 overflow-x-hidden">

      <AnimatePresence mode="wait">
        {isConstructing ? (
          <motion.div key="constructing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
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
        ) : isFailed ? (
          <motion.div key="failed" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
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
          <motion.div key="ready" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">

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
                        onClick={handlePlay}
                        disabled={audioLoading && !isCurrentActive}
                        className="w-full h-20 rounded-[1.5rem] bg-white text-slate-950 hover:bg-zinc-200 transition-all shadow-xl shadow-white/5 group"
                      >
                        {audioLoading && isCurrentActive ? (
                          <Loader2 className="h-8 w-8 animate-spin" />
                        ) : (isPlaying && isCurrentActive) ? (
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
                          <button onClick={handleLike} disabled={isLiking} className="group flex items-center gap-2 transition-all">
                            <Heart className={cn("h-6 w-6 transition-colors", isLiked ? "fill-primary text-primary" : "text-white/20 group-hover:text-white/60")} />
                            <span className="text-xs font-black text-white/40 tabular-nums">{likeCount}</span>
                          </button>
                          <button className="text-white/20 hover:text-white/60 transition-colors"><Share2 size={20} /></button>
                        </div>
                        <div className="flex items-center gap-4 text-white/20">
                          <Clock size={16} />
                          <span className="text-xs font-mono font-bold">{formatTime(localTime)} / {formatTime(localDuration)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

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

                {isOwner && (
                  <div className="mt-12">
                    <SovereignPublishTool
                      podcastId={localPodcastData.id}
                      currentStatus={localPodcastData.status}
                      isOwner={isOwner}
                      onPublished={() => setLocalPodcastData(prev => ({ ...prev, status: 'published' }))}
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
                {renderedScript}
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