// components/podcast-view.tsx
// VERSIÓN: 24.0 (Sovereign Integrity Standard - Full Logic & zero Abbreviations)
// Misión: Gestionar la visualización adaptativa y la sincronía de activos en tiempo real.
// [RESOLUCIÓN]: Eliminación total de errores de tipos, restauración de funciones perdidas y optimización de densidad.

"use client";

import { User } from '@supabase/supabase-js';
import { AnimatePresence, motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { RemixDialog } from '@/components/remix-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import { useAudio } from '@/contexts/audio-context';
import { useAuth } from '@/hooks/use-auth';
import { useOfflineAudio } from '@/hooks/use-offline-audio';
import { useToast } from '@/hooks/use-toast';
import { cn, formatTime, getSafeAsset, nicepodLog } from '@/lib/utils';
import { PodcastWithProfile, ResearchSource } from '@/types/podcast';
import {
  AlertCircle,
  ChevronDown,
  CornerUpRight,
  Download,
  Ear,
  FileText,
  Heart,
  Loader2,
  Lock,
  MapPin,
  Mic,
  Share2,
  Sparkles,
  Users
} from 'lucide-react';
import { CreationMetadata } from './creation-metadata';
import { TagCurationCanvas } from './tag-curation-canvas';

/**
 * INTERFAZ DE INTEGRIDAD: 
 * Extendemos PodcastWithProfile para asegurar que TS reconozca las columnas de la V2.5
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
  } | null;
}

/**
 * ScriptViewer: Carga diferida para proteger el rendimiento de la GPU en móviles.
 */
const ScriptEditor = dynamic(
  () => import('./script-viewer').then((mod) => mod.ScriptViewer),
  {
    ssr: false,
    loading: () => (
      <div className="h-32 w-full flex flex-col items-center justify-center text-muted-foreground animate-pulse bg-secondary/5 rounded-2xl">
        <Loader2 className="h-5 w-5 animate-spin mb-2" />
        <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Sincronizando...</span>
      </div>
    )
  }
);

interface PodcastViewProps {
  podcastData: PodcastWithProfile;
  user: User | null;
  initialIsLiked: boolean;
  replies?: PodcastWithProfile[];
}

export function PodcastView({ podcastData, user, initialIsLiked, replies = [] }: PodcastViewProps) {
  const { supabase } = useAuth();
  const router = useRouter();
  const {
    playPodcast,
    currentPodcast,
    isPlaying,
    isLoading: audioLoading,
    togglePlayPause,
    seekTo
  } = useAudio();
  const { toast } = useToast();

  // --- ESTADOS DE HIDRATACIÓN ---
  const [isClient, setIsClient] = useState(false);

  // --- ESTADOS DE DATOS LOCALES (Casting controlado) ---
  const [localPodcastData, setLocalPodcastData] = useState<ExtendedPodcast>(podcastData as ExtendedPodcast);
  const [isLiked, setIsLiked] = useState<boolean>(initialIsLiked);
  const [likeCount, setLikeCount] = useState<number>(Number(podcastData.like_count || 0));
  const [isLiking, setIsLiking] = useState<boolean>(false);

  // --- ESTADOS DE TIEMPO Y PROGRESO ---
  const [localTime, setLocalTime] = useState(0);
  const [localDuration, setLocalDuration] = useState(podcastData.duration_seconds || 0);
  const [listeningProgress, setListeningProgress] = useState<number>(0);
  const [hasListenedFully, setHasListenedFully] = useState<boolean>(!!podcastData.reviewed_by_user);

  // --- ESTADOS DE INTERFAZ ---
  const [isScriptExpanded, setIsScriptExpanded] = useState<boolean>(false);
  const [isEditingTags, setIsEditingTags] = useState<boolean>(false);
  const [isRemixOpen, setIsRemixOpen] = useState<boolean>(false);
  const [viewerRole, setViewerRole] = useState<string>('user');

  // --- GUARDIAS DE MEMORIA ---
  const hasUpdatedDbRef = useRef<boolean>(false);
  const channelRef = useRef<any>(null);

  // --- LÓGICA OFFLINE ---
  const { isOfflineAvailable, isDownloading, downloadForOffline, removeFromOffline } = useOfflineAudio(localPodcastData);

  useEffect(() => { setIsClient(true); }, []);

  // --- DERIVACIONES LÓGICAS (Calculadas en cada render para precisión) ---
  const isOwner = useMemo(() => user?.id === localPodcastData.user_id, [user?.id, localPodcastData.user_id]);
  const isCurrentActive = useMemo(() => currentPodcast?.id === localPodcastData.id, [currentPodcast?.id, localPodcastData.id]);
  const isConstructing = localPodcastData.processing_status === 'processing';
  const isFailed = localPodcastData.processing_status === 'failed';
  const audioReady = !!localPodcastData.audio_ready;
  const imageReady = !!localPodcastData.image_ready;

  // 1. SINCRONIZACIÓN DE PROPS
  useEffect(() => {
    setLocalPodcastData(podcastData as ExtendedPodcast);
    setLikeCount(Number(podcastData.like_count || 0));
    setIsLiked(initialIsLiked);
    setLocalDuration(podcastData.duration_seconds || 0);
    setHasListenedFully(!!podcastData.reviewed_by_user);
  }, [podcastData, initialIsLiked]);

  // 2. DETECCIÓN DE PRIVILEGIOS
  useEffect(() => {
    if (!user || !supabase) return;
    const fetchRole = async () => {
      const { data } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
      if (data?.role) setViewerRole(data.role);
    };
    fetchRole();
  }, [user, supabase]);

  // 3. PERSISTENCIA DE QA (Vía RPC para rapidez)
  const markAsListened = useCallback(async () => {
    if (!supabase || !user || hasUpdatedDbRef.current) return;
    hasUpdatedDbRef.current = true;
    setHasListenedFully(true);

    const { error } = await supabase
      .from('micro_pods')
      .update({ reviewed_by_user: true })
      .eq('id', localPodcastData.id);

    if (error) {
      console.error("🔥 [QA-Error]:", error.message);
      hasUpdatedDbRef.current = false;
    }
  }, [supabase, user, localPodcastData.id]);

  // 4. MOTOR DE EVENTOS DE TIEMPO
  useEffect(() => {
    if (!isClient || !isCurrentActive) return;

    const handlePulse = (e: any) => {
      const { currentTime, duration } = e.detail;
      setLocalTime(currentTime);
      if (duration && duration !== localDuration) setLocalDuration(duration);

      if (!hasListenedFully && duration > 0) {
        const percent = (currentTime / duration) * 100;
        setListeningProgress(percent);
        if (percent > 95 && user && !hasUpdatedDbRef.current) markAsListened();
      }
    };

    window.addEventListener('nicepod-timeupdate', handlePulse);
    return () => window.removeEventListener('nicepod-timeupdate', handlePulse);
  }, [isCurrentActive, isClient, hasListenedFully, user, localDuration, localPodcastData.id, markAsListened]);

  // 5. SUBSCRIPCIÓN REALTIME (REVELACIÓN AUTOMÁTICA)
  useEffect(() => {
    if (!supabase || !isClient) return;

    if (channelRef.current) supabase.removeChannel(channelRef.current);

    channelRef.current = supabase.channel(`view_sync_${localPodcastData.id}`)
      .on<ExtendedPodcast>(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'micro_pods', filter: `id=eq.${localPodcastData.id}` },
        (payload) => {
          const newData = payload.new as ExtendedPodcast;
          nicepodLog("Sincronía detectada:", newData.processing_status);

          setLocalPodcastData(prev => ({ ...prev, ...newData }));

          if (newData.processing_status === 'completed') {
            toast({ title: "¡Forja Completada!", description: "El podcast está listo para ser escuchado." });
            router.refresh();
          }
        }
      ).subscribe();

    return () => { if (channelRef.current) supabase.removeChannel(channelRef.current); };
  }, [supabase, localPodcastData.id, isClient, toast, router]);

  // --- ACCIONES DE INTERFAZ ---

  const handlePlaySmart = () => {
    if (isCurrentActive) {
      togglePlayPause();
    } else {
      playPodcast(localPodcastData, replies.filter(r => r.status === 'published'));
    }
  };

  const handleDownloadToggle = () => {
    if (isOfflineAvailable) {
      if (confirm("¿Eliminar de la bóveda local?")) removeFromOffline();
    } else {
      downloadForOffline();
    }
  };

  const handleLike = useCallback(async () => {
    if (!supabase || !user || isLiking) return;
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
  }, [supabase, user, isLiked, isLiking, localPodcastData.id]);

  const handleSaveTags = useCallback(async (newTags: string[]) => {
    if (!supabase) return;
    const { error } = await supabase.from('micro_pods').update({ user_tags: newTags }).eq('id', localPodcastData.id);
    if (!error) {
      setLocalPodcastData(prev => ({ ...prev, user_tags: newTags }));
      toast({ title: "Etiquetas sincronizadas" });
    }
  }, [supabase, localPodcastData.id, toast]);

  const handlePublishToCommunity = useCallback(async () => {
    if (!hasListenedFully || !supabase) return;
    const { error } = await supabase.from('micro_pods').update({
      status: 'published',
      published_at: new Date().toISOString()
    }).eq('id', localPodcastData.id);

    if (!error) {
      setLocalPodcastData(prev => ({ ...prev, status: 'published' }));
      toast({ title: "¡Portal Abierto!", description: "Wisdom shared successfully." });
    }
  }, [hasListenedFully, supabase, localPodcastData.id, toast]);

  // --- MEMOIZACIÓN DE TEXTO ---
  const normalizedScriptText = useMemo(() => {
    const raw = localPodcastData.script_text;
    if (!raw) return "";
    try {
      const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
      return parsed.script_body || parsed.script_plain || String(raw);
    } catch { return String(raw); }
  }, [localPodcastData.script_text]);

  const sources = useMemo<ResearchSource[]>(() =>
    (localPodcastData.sources as unknown as ResearchSource[]) || [],
    [localPodcastData.sources]
  );

  if (!isClient) return null;

  return (
    <div className="container mx-auto max-w-6xl py-4 md:py-8 px-4 md:px-6 w-full animate-in fade-in duration-700">

      {/* ALERTAS DE INTEGRIDAD */}
      <AnimatePresence>
        {isFailed && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <Alert variant="destructive" className="mb-4 rounded-2xl bg-red-500/10 border-red-500/20 backdrop-blur-xl">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="text-[10px] font-black uppercase tracking-widest">Error de Sincronía</AlertTitle>
              <AlertDescription className="text-xs font-medium">No se pudieron materializar los activos multimedia.</AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BANNER DE VALIDACIÓN (QA FLOW) */}
      {isOwner && !isConstructing && !isFailed && localPodcastData.status === 'pending_approval' && (
        <div className="mb-6 rounded-3xl border border-primary/20 bg-primary/5 p-4 md:p-6 backdrop-blur-2xl flex flex-col md:flex-row justify-between items-center gap-4 shadow-xl">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="p-3 bg-primary/10 rounded-2xl text-primary shadow-inner"><Lock className="h-5 w-5" /></div>
            <div>
              <h3 className="font-black text-sm uppercase tracking-tight leading-none">Validación Requerida</h3>
              <p className="text-[11px] text-muted-foreground font-medium mt-1.5">Escucha el guion completo para liberar este conocimiento.</p>
            </div>
          </div>
          <Button
            onClick={handlePublishToCommunity}
            disabled={!hasListenedFully}
            className={cn(
              "w-full md:w-auto h-11 px-8 font-black rounded-full transition-all",
              hasListenedFully ? "bg-green-600 text-white shadow-lg hover:scale-105" : "bg-secondary text-muted-foreground opacity-50"
            )}
          >
            {hasListenedFully ? <><Users className="mr-2 h-4 w-4" /> PUBLICAR</> : <><Ear className="mr-2 h-4 w-4" /> PROGRESO QA: {Math.round(listeningProgress)}%</>}
          </Button>
        </div>
      )}

      {/* GRID DE TRABAJO PRINCIPAL */}
      <div className="grid lg:grid-cols-3 gap-6 md:gap-8 items-start">

        {/* COLUMNA IZQUIERDA: CONTENIDO SOBERANO */}
        <div className="lg:col-span-2 space-y-6 w-full">
          <Card className="bg-card/30 backdrop-blur-3xl border-border/40 shadow-2xl rounded-[2.5rem] overflow-hidden w-full">

            {/* ÁREA DE CARÁTULA: REVELACIÓN DINÁMICA */}
            <div className="aspect-video relative w-full group bg-zinc-900/50">
              {imageReady ? (
                <Image
                  src={localPodcastData.cover_image_url || getSafeAsset(null, 'cover')}
                  alt={localPodcastData.title}
                  fill
                  className="object-cover animate-in fade-in duration-1000 group-hover:scale-[1.02] transition-transform"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3">
                  <div className="p-4 bg-white/5 rounded-full border border-white/5 animate-pulse">
                    <Sparkles className="h-8 w-8 text-primary/40" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/40">Sintetizando Imagen</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
            </div>

            <CardHeader className="p-6 md:p-8">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="secondary" className="px-2.5 py-0.5 text-[8px] font-black uppercase tracking-widest bg-primary/10 text-primary border-primary/20">
                  {localPodcastData.status === 'published' ? 'PÚBLICO' : 'EN BÓVEDA PRIVADA'}
                </Badge>
                {isConstructing && (
                  <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-primary/30 bg-primary/5 animate-pulse">
                    <Loader2 className="h-2.5 w-2.5 animate-spin text-primary" />
                    <span className="text-[8px] font-black text-primary uppercase">Procesando</span>
                  </div>
                )}
              </div>
              <CardTitle className="text-3xl md:text-5xl font-black leading-[0.95] tracking-tighter uppercase italic text-foreground">
                {localPodcastData.title}
              </CardTitle>
              <CardDescription className="text-base md:text-xl text-muted-foreground font-medium mt-4 leading-snug">
                {localPodcastData.description}
              </CardDescription>

              <div className="flex flex-wrap gap-2 mt-6">
                {(localPodcastData.user_tags?.length ? localPodcastData.user_tags : localPodcastData.ai_tags)?.map(tag => (
                  <Badge key={tag} variant="outline" className="bg-white/5 border-white/10 px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider text-muted-foreground/80">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </CardHeader>

            <CardContent className="p-6 md:p-8 pt-0">
              <Separator className="mb-8 opacity-10" />
              <Collapsible open={isScriptExpanded} onOpenChange={setIsScriptExpanded} className="w-full">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-base font-black uppercase tracking-tighter flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" /> Transcripción Maestra
                  </h3>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 px-4 rounded-xl text-[9px] font-black tracking-[0.2em] hover:bg-primary/10">
                      {isScriptExpanded ? 'CONTRAER' : 'EXPANDIR'}
                      <ChevronDown className={cn("ml-2 h-3 w-3 transition-transform duration-500", isScriptExpanded && 'rotate-180')} />
                    </Button>
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent className="animate-in slide-in-from-top-2 duration-300">
                  <div className="p-6 md:p-8 bg-black/40 rounded-[2rem] border border-border/40 shadow-inner">
                    <ScriptEditor scriptText={normalizedScriptText} />
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </CardContent>
          </Card>
        </div>

        {/* COLUMNA DERECHA: TERMINAL TÁCTICA */}
        <div className="lg:col-span-1 space-y-4 lg:sticky lg:top-24 lg:self-start w-full">

          {/* MÓDULO I: ESTACIÓN DE ESCUCHA */}
          <Card className={cn(
            "bg-primary text-white border-none shadow-2xl rounded-[2.2rem] overflow-hidden relative group transition-all duration-700",
            !audioReady && "opacity-60 saturate-50 pointer-events-none"
          )}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/30 pointer-events-none" />
            <CardHeader className="pb-3 pt-6 px-6 relative">
              <CardTitle className="text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center md:justify-start gap-2 opacity-80">
                <Mic className="h-4 w-4" /> Estación de Escucha
              </CardTitle>
            </CardHeader>
            <CardContent className="relative flex flex-col gap-4 pb-6 px-6">
              <Button
                size="lg"
                onClick={handlePlaySmart}
                className="w-full bg-white text-primary hover:bg-zinc-100 rounded-2xl h-14 text-lg font-black shadow-xl transition-all active:scale-[0.98]"
              >
                {!audioReady ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>SINTETIZANDO VOZ...</span>
                  </div>
                ) : audioLoading && isCurrentActive ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  isPlaying && isCurrentActive ? "PAUSAR" : "REPRODUCIR"
                )}
              </Button>

              <div className="flex justify-between items-center bg-black/20 rounded-2xl p-2 px-4 border border-white/5">
                <div className="flex items-center gap-2">
                  <button onClick={handleLike} disabled={isLiking} className="hover:scale-110 transition-transform">
                    <Heart className={cn("h-6 w-6", isLiked ? 'fill-red-500 text-red-500' : 'text-white opacity-40')} />
                  </button>
                  <span className="text-xs font-black tabular-nums">{likeCount}</span>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-10 w-10 text-white/40 hover:text-white"><Share2 size={16} /></Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleDownloadToggle}
                    disabled={isDownloading}
                    className={cn("h-10 w-10 transition-all", isOfflineAvailable ? "text-green-400" : "text-white/40")}
                  >
                    {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* MÓDULO II: IDENTIDAD DEL CURADOR */}
          <Card className="bg-card/20 backdrop-blur-xl border-border/40 shadow-xl rounded-[2.2rem] overflow-hidden w-full">
            <CardContent className="p-5 space-y-6">
              <Link href={localPodcastData.profiles?.username ? `/profile/${localPodcastData.profiles.username}` : '#'} className="block group">
                <div className="flex items-center gap-4 p-4 bg-background/40 rounded-[1.8rem] border border-border/40 group-hover:border-primary/40 transition-all duration-500 shadow-sm">
                  <div className="relative h-12 w-12 flex-shrink-0">
                    <Image
                      src={getSafeAsset(localPodcastData.profiles?.avatar_url, 'avatar')}
                      alt="" fill className="rounded-2xl object-cover border border-white/5"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="font-black text-xs truncate uppercase tracking-tight text-foreground leading-none">
                      {localPodcastData.profiles?.full_name || 'Curador Anónimo'}
                    </p>
                    <p className="text-[9px] text-muted-foreground uppercase tracking-widest mt-1.5">
                      Soberanía: <span className="text-primary font-black">{localPodcastData.profiles?.reputation_score || 0} pts</span>
                    </p>
                  </div>
                </div>
              </Link>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col p-4 bg-white/[0.03] rounded-2xl border border-white/5">
                  <span className="text-[8px] font-black uppercase text-muted-foreground/40 mb-1 tracking-[0.2em]">Registro</span>
                  <span className="text-[10px] font-bold text-foreground uppercase">{new Date(localPodcastData.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex flex-col p-4 bg-white/[0.03] rounded-2xl border border-white/5">
                  <span className="text-[8px] font-black uppercase text-muted-foreground/40 mb-1 tracking-[0.2em]">Longitud</span>
                  <span className="text-[10px] font-bold text-foreground font-mono">{formatTime(localDuration)}</span>
                </div>
              </div>

              {localPodcastData.place_name && (
                <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-foreground/80 truncate">
                    {localPodcastData.place_name}
                  </span>
                </div>
              )}

              <Separator className="opacity-10" />
              <CreationMetadata data={localPodcastData.creation_data} sources={sources} />
            </CardContent>
          </Card>

          {/* MÓDULO III: INTERACCIÓN REMIX */}
          {!isConstructing && localPodcastData.status === 'published' && user && (
            <Button
              onClick={() => setIsRemixOpen(true)}
              className="w-full h-14 rounded-[1.8rem] bg-indigo-600 text-white font-black uppercase text-[10px] tracking-[0.2em] shadow-lg hover:scale-[1.02] transition-all hover:bg-indigo-500"
            >
              <CornerUpRight className="mr-2.5 h-4 w-4" /> APORTAR A ESTA FRECUENCIA
            </Button>
          )}
        </div>
      </div>

      {/* COMPONENTES DE DIÁLOGO */}
      <AnimatePresence>
        {isEditingTags && (
          <TagCurationCanvas
            isOpen={isEditingTags}
            onOpenChange={setIsEditingTags}
            suggestedTags={localPodcastData.ai_tags || []}
            publishedTags={localPodcastData.user_tags || []}
            onSave={handleSaveTags}
          />
        )}
      </AnimatePresence>

      {isRemixOpen && user && (
        <RemixDialog
          isOpen={isRemixOpen}
          onOpenChange={setIsRemixOpen}
          parentPodcast={{
            id: localPodcastData.id,
            title: localPodcastData.title,
            author: {
              full_name: localPodcastData.profiles?.full_name || 'Anónimo',
              avatar_url: localPodcastData.profiles?.avatar_url || null
            }
          }}
          quoteContext={normalizedScriptText.substring(0, 400)}
          timestamp={localTime}
        />
      )}
    </div>
  );
}