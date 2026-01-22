// components/podcast-view.tsx
// VERSIÓN: 20.4 (Ultimate Master - Script Object Fix & Perfect Mobile Alignment)

"use client";

import { User } from '@supabase/supabase-js';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';

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
import { cn, formatTime, getSafeAsset } from '@/lib/utils';
import { PodcastWithProfile, ResearchSource } from '@/types/podcast';
import {
  AlertCircle,
  Calendar,
  ChevronDown,
  Clock,
  Construction,
  CornerUpRight,
  Download,
  Ear,
  FileText,
  Heart,
  Loader2,
  Lock,
  MapPin,
  Mic,
  Pencil,
  PlayCircle,
  Share2,
  ShieldAlert,
  Sparkles,
  Users
} from 'lucide-react';
import { CreationMetadata } from './creation-metadata';
import { TagCurationCanvas } from './tag-curation-canvas';

/**
 * ScriptViewer: Carga diferida optimizada para rendimiento
 */
const ScriptEditor = dynamic(
  () => import('./script-viewer').then((mod) => mod.ScriptViewer),
  {
    ssr: false,
    loading: () => (
      <div className="h-32 w-full flex flex-col items-center justify-center text-muted-foreground animate-pulse bg-secondary/10 rounded-xl">
        <Loader2 className="h-5 w-5 animate-spin mb-2" />
        <span className="text-xs font-bold uppercase tracking-widest opacity-50">Sincronizando...</span>
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
  useEffect(() => { setIsClient(true); }, []);

  // --- ESTADOS DE DATOS LOCALES ---
  const [localPodcastData, setLocalPodcastData] = useState<PodcastWithProfile>(podcastData);
  const [isLiked, setIsLiked] = useState<boolean>(initialIsLiked);
  const [likeCount, setLikeCount] = useState<number>(Number(localPodcastData.like_count || 0));
  const [isLiking, setIsLiking] = useState<boolean>(false);

  // --- ESTADOS DE TIEMPO (Local Event Sync) ---
  const [localTime, setLocalTime] = useState(0);
  const [localDuration, setLocalDuration] = useState(podcastData.duration_seconds || 0);

  // --- ESTADOS DE INTERFAZ ---
  const [isScriptExpanded, setIsScriptExpanded] = useState<boolean>(false);
  const [isEditingTags, setIsEditingTags] = useState<boolean>(false);
  const [viewerRole, setViewerRole] = useState<string>('user');
  const [isRemixOpen, setIsRemixOpen] = useState<boolean>(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState<boolean>(false);

  // --- LÓGICA DE INTEGRIDAD (Shield System) ---
  const isConstructing = localPodcastData.processing_status !== 'completed' && localPodcastData.processing_status !== 'failed';
  const isFailed = localPodcastData.processing_status === 'failed';

  // --- LÓGICA DE QA Y VALIDACIÓN ---
  const [hasListenedFully, setHasListenedFully] = useState<boolean>(!!localPodcastData.reviewed_by_user);
  const [listeningProgress, setListeningProgress] = useState<number>(0);
  const hasUpdatedDbRef = useRef<boolean>(false);

  // --- LÓGICA OFFLINE ---
  const { isOfflineAvailable, isDownloading, downloadForOffline, removeFromOffline } = useOfflineAudio(localPodcastData);

  const isCurrentActive = useMemo(() => currentPodcast?.id === localPodcastData.id, [currentPodcast?.id, localPodcastData.id]);

  const publishedReplies = useMemo(() =>
    replies.filter(r => r.status === 'published'),
    [replies]);

  const pendingReplies = useMemo(() =>
    replies.filter(r => r.status === 'pending_approval' && r.user_id === user?.id),
    [replies, user?.id]);

  // 1. SINCRONIZACIÓN DE PROPS
  useEffect(() => {
    setLocalPodcastData(podcastData);
    setLikeCount(Number(podcastData.like_count || 0));
    setIsLiked(initialIsLiked);

    if (podcastData.reviewed_by_user) {
      setHasListenedFully(true);
      setListeningProgress(100);
      hasUpdatedDbRef.current = true;
    }
  }, [podcastData, initialIsLiked]);

  // 2. DETECCIÓN DE PRIVILEGIOS
  useEffect(() => {
    const fetchRole = async () => {
      if (!user || !supabase) return;
      const { data } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
      if (data?.role) setViewerRole(data.role);
    };
    fetchRole();
  }, [user, supabase]);

  // 3. PERSISTENCIA DE QA
  const markAsListened = async () => {
    if (!supabase || !user || hasUpdatedDbRef.current) return;
    hasUpdatedDbRef.current = true;
    setHasListenedFully(true);
    if (isClient) localStorage.removeItem(`nicepod_progress_${localPodcastData.id}`);
    await supabase.from('micro_pods').update({ reviewed_by_user: true }).eq('id', localPodcastData.id);
  };

  // 4. MOTOR DE TIEMPO (Suscripción local)
  useEffect(() => {
    if (!isClient || !isCurrentActive) return;

    const handlePulse = (e: any) => {
      const { currentTime, duration } = e.detail;
      setLocalTime(currentTime);
      if (duration && duration !== localDuration) setLocalDuration(duration);

      if (!hasListenedFully && duration > 0) {
        const percent = (currentTime / duration) * 100;
        setListeningProgress(percent);
        localStorage.setItem(`nicepod_progress_${localPodcastData.id}`, currentTime.toString());
        if (percent > 95 && user && !hasUpdatedDbRef.current) markAsListened();
      }
    };

    window.addEventListener('nicepod-timeupdate', handlePulse);
    return () => window.removeEventListener('nicepod-timeupdate', handlePulse);
  }, [isCurrentActive, isClient, hasListenedFully, user, localDuration, localPodcastData.id]);

  // 5. SUBSCRIPCIÓN REALTIME (Auto-Revelación)
  useEffect(() => {
    if (!supabase || !isClient) return;

    const channel = supabase.channel(`sync_${localPodcastData.id}`)
      .on<PodcastWithProfile>(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'micro_pods', filter: `id=eq.${localPodcastData.id}` },
        (payload) => {
          setLocalPodcastData(prev => ({ ...prev, ...(payload.new as PodcastWithProfile) }));
          if (payload.new.processing_status === 'completed') {
            setIsGeneratingAudio(false);
            toast({ title: "¡Podcast Completado!", description: "Activos listos.", variant: "default" });
          }
        }
      ).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [supabase, localPodcastData.id, isClient]);

  // --- HELPERS DINÁMICOS ---
  const isOwner = user?.id === localPodcastData.user_id;
  const isAdmin = viewerRole === 'admin';
  const sources = useMemo<ResearchSource[]>(() => (localPodcastData.sources as unknown as ResearchSource[]) || [], [localPodcastData.sources]);

  const displayTags = useMemo(() => {
    const userTags = localPodcastData.user_tags || [];
    const aiTags = localPodcastData.ai_tags || [];
    return userTags.length > 0 ? userTags : aiTags;
  }, [localPodcastData]);

  /**
   * [FIX]: NORMALIZADOR DE GUION MAESTRO
   * Resuelve el error [object Object] manejando Strings, Objetos y Arrays.
   */
  const normalizedScriptText = useMemo(() => {
    const raw = localPodcastData.script_text;
    if (!raw) return "";
    try {
      const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;

      // Caso 1: Es un Array de segmentos (La raíz del error object Object)
      if (Array.isArray(parsed)) {
        return parsed.map((segment: any) => {
          const content = segment.line || segment.text || segment.content || "";
          const speaker = segment.speaker ? `${segment.speaker}: ` : "";
          return `${speaker}${content}`;
        }).join('\n\n');
      }

      // Caso 2: Es un Objeto con propiedad script_body
      if (parsed && typeof parsed === 'object') {
        return parsed.script_body || parsed.text || parsed.content || JSON.stringify(parsed);
      }

      return String(raw);
    } catch {
      return String(raw);
    }
  }, [localPodcastData.script_text]);

  const profileUrl = useMemo(() => {
    const username = localPodcastData.profiles?.username;
    return username ? `/profile/${username}` : null;
  }, [localPodcastData.profiles]);

  // --- ACCIONES ---

  const handlePlaySmart = () => {
    if (isCurrentActive) {
      togglePlayPause();
    } else {
      const savedTime = isClient ? localStorage.getItem(`nicepod_progress_${localPodcastData.id}`) : null;
      playPodcast(localPodcastData, publishedReplies);
      if (savedTime && !hasListenedFully) {
        setTimeout(() => seekTo(parseFloat(savedTime)), 500);
      }
    }
  };

  const handleDownloadToggle = () => {
    if (isOfflineAvailable) {
      if (confirm("¿Eliminar de descargas?")) removeFromOffline();
    } else downloadForOffline();
  };

  const handlePublishToCommunity = async () => {
    if (!hasListenedFully || !supabase) return;
    const { error } = await supabase.from('micro_pods').update({
      status: 'published',
      published_at: new Date().toISOString()
    }).eq('id', localPodcastData.id);
    if (!error) {
      setLocalPodcastData(prev => ({ ...prev, status: 'published' }));
      toast({ title: "¡Portal Abierto!", description: "Ya es público." });
    }
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
      const { error } = await supabase.from('likes').insert({ user_id: user.id, podcast_id: podId });
      if (!error) {
        await supabase.from('playback_events').insert({ user_id: user.id, podcast_id: podId, event_type: 'liked' });
      }
    }
    setIsLiking(false);
  };

  const handleSaveTags = async (newTags: string[]) => {
    if (!supabase) return;
    const { error } = await supabase.from('micro_pods').update({ user_tags: newTags }).eq('id', localPodcastData.id);
    if (!error) {
      setLocalPodcastData(prev => ({ ...prev, user_tags: newTags }));
      toast({ title: "Mapa Semántico Actualizado" });
    }
  };

  if (!isClient) return null;

  return (
    <>
      {/* [FIX]: overflow-x-hidden forzado para eliminar scroll lateral en dispositivos móviles */}
      <div className="container mx-auto max-w-7xl py-8 md:py-16 px-4 md:px-6 overflow-x-hidden w-full">

        {/* ALERTA: ERROR DE PRODUCCIÓN */}
        {isFailed && (
          <Alert variant="destructive" className="mb-8 border-red-500/50 bg-red-500/10 backdrop-blur-2xl animate-pulse">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle className="font-black uppercase tracking-widest text-[10px]">Interrupción de Síntesis</AlertTitle>
            <AlertDescription className="text-sm font-medium mt-1">
              Fallo al generar activos. El equipo técnico ha sido notificado.
            </AlertDescription>
          </Alert>
        )}

        {/* BANNER: MODERACIÓN */}
        {isAdmin && user && (
          <Alert variant="destructive" className="mb-8 border-orange-500/50 bg-orange-500/5 backdrop-blur-xl">
            <ShieldAlert className="h-4 w-4 text-orange-500" />
            <AlertTitle className="font-black uppercase tracking-widest text-[10px]">Control Admin</AlertTitle>
            <AlertDescription className="flex justify-between items-center mt-2">
              <span className="text-[10px]">Podcast ID: {localPodcastData.id}</span>
              <Button variant="destructive" size="sm" className="h-7 text-[10px] font-bold">RESTRINGIR</Button>
            </AlertDescription>
          </Alert>
        )}

        {/* BANNER: QA FLOW (Centrado responsivo) */}
        {isOwner && !isConstructing && !isFailed && localPodcastData.status === 'pending_approval' && (
          <div className="mb-8 rounded-3xl border border-primary/20 bg-primary/5 p-5 md:p-6 backdrop-blur-2xl animate-in fade-in slide-in-from-top-4 shadow-xl">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="p-4 bg-primary/10 rounded-2xl text-primary shadow-inner"><Lock className="h-6 w-6" /></div>
                <div>
                  <h3 className="font-black text-lg tracking-tight uppercase leading-tight">Borrador en Cuarentena</h3>
                  <p className="text-sm text-muted-foreground font-medium leading-tight">Valida la calidad antes de liberar el conocimiento.</p>
                </div>
              </div>
              <Button
                onClick={handlePublishToCommunity}
                disabled={!hasListenedFully}
                className={cn(
                  "w-full md:w-auto h-12 px-8 font-black transition-all rounded-full",
                  hasListenedFully ? "bg-green-600 text-white shadow-xl" : "bg-secondary text-muted-foreground opacity-50"
                )}
              >
                {hasListenedFully ? <><Users className="mr-2 h-4 w-4" /> PUBLICAR AHORA</> : <><Ear className="mr-2 h-4 w-4" /> QA: {Math.round(listeningProgress)}%</>}
              </Button>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8 md:gap-10 items-start">
          <div className="lg:col-span-2 space-y-8 w-full">

            {/* VISTA: CONSTRUCCIÓN REALTIME */}
            {isConstructing ? (
              <Card className="bg-card/30 backdrop-blur-3xl border-border/40 shadow-2xl rounded-[2.5rem] overflow-hidden p-6 md:p-12 flex flex-col items-center text-center space-y-10 min-h-[550px] justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 blur-[80px] animate-pulse rounded-full" />
                  <Construction className="h-20 w-20 text-primary relative z-10 animate-bounce" />
                </div>
                <div className="space-y-4 relative z-10">
                  <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white">Forjando Sabiduría</h2>
                  <p className="text-muted-foreground text-base md:text-lg max-w-md mx-auto font-medium">
                    Sintetizando voz neuronal y carátula. Se revelará automáticamente al completarse.
                  </p>
                </div>
                <div className="flex flex-col items-center gap-4 bg-primary/5 px-6 md:px-8 py-5 rounded-3xl border border-primary/20">
                  <div className="flex items-center gap-3 text-primary">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Procesando Activos</span>
                  </div>
                  <div className="h-1 w-40 bg-primary/10 rounded-full overflow-hidden">
                    <motion.div initial={{ x: "-100%" }} animate={{ x: "100%" }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }} className="h-full w-full bg-primary" />
                  </div>
                </div>
              </Card>
            ) : (
              /* VISTA: PODCAST TERMINADO */
              <Card className="bg-card/30 backdrop-blur-3xl border-border/40 shadow-2xl rounded-[2rem] md:rounded-[2.5rem] overflow-hidden animate-in zoom-in-95 duration-700 w-full">
                {localPodcastData.cover_image_url && (
                  <div className="aspect-video relative w-full group overflow-hidden">
                    <Image src={localPodcastData.cover_image_url} alt="" fill className="animate-fade-in group-hover:scale-105 transition-transform duration-1000 object-cover" priority />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  </div>
                )}
                <CardHeader className="p-6 md:p-12">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-6">
                    <Badge variant="secondary" className="px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] bg-primary/10 text-primary border-primary/20">
                      {localPodcastData.status === 'published' ? 'PÚBLICO' : 'MODO QA'}
                    </Badge>
                  </div>
                  <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-4 text-center md:text-left">
                    <CardTitle className="text-3xl md:text-6xl font-black leading-tight tracking-tighter uppercase text-foreground">
                      {localPodcastData.title}
                    </CardTitle>
                    {isOwner && (
                      <Button variant="ghost" size="icon" onClick={() => setIsEditingTags(true)} className="rounded-full hover:bg-primary/10 flex-shrink-0">
                        <Pencil size={20} className="text-primary" />
                      </Button>
                    )}
                  </div>
                  <CardDescription className="text-lg md:text-2xl text-muted-foreground font-medium mt-4 leading-snug text-center md:text-left">
                    {localPodcastData.description}
                  </CardDescription>
                  <Separator className="my-8 md:my-10 opacity-10" />
                  <div className="flex flex-wrap justify-center md:justify-start gap-2.5">
                    {displayTags.map(tag => (
                      <Badge key={tag} variant="outline" className="bg-white/5 border-white/10 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardHeader>
                <CardContent className="p-6 md:p-12 pt-0">
                  <Separator className="mb-10 opacity-10" />
                  <Collapsible open={isScriptExpanded} onOpenChange={setIsScriptExpanded}>
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-lg font-black uppercase tracking-tighter flex items-center gap-3">
                        <FileText className="h-5 w-5 text-primary" /> Transcripción Maestra
                      </h3>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-9 px-4 rounded-xl text-[10px] font-black tracking-widest hover:bg-primary/10">
                          {isScriptExpanded ? 'CONTRAER' : 'LEER TODO'}
                          <ChevronDown className={cn("ml-2 h-4 w-4 transition-transform duration-500", isScriptExpanded && 'rotate-180')} />
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                    <CollapsibleContent className="animate-in slide-in-from-top-4 duration-500">
                      <div className="p-6 md:p-12 bg-black/30 rounded-[2rem] md:rounded-[3rem] border border-border/40 shadow-inner">
                        <ScriptEditor scriptText={normalizedScriptText} />
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </CardContent>
              </Card>
            )}
          </div>

          {/* COLUMNA LATERAL (Sidebar) */}
          <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-24 lg:self-start w-full">

            <Card className={cn(
              "bg-primary text-white border-none shadow-2xl rounded-[2.5rem] overflow-hidden relative group transition-all duration-1000",
              isConstructing && "opacity-40 grayscale pointer-events-none translate-y-4"
            )}>
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/20 pointer-events-none" />
              <CardHeader className="pb-4 relative text-center md:text-left">
                <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center justify-center md:justify-start gap-2">
                  <PlayCircle className="h-5 w-5" /> Consola de Audio
                </CardTitle>
              </CardHeader>
              <CardContent className="relative flex flex-col gap-6">
                <Button
                  size="lg"
                  className="w-full bg-white text-primary hover:bg-zinc-100 rounded-2xl h-16 text-xl font-black shadow-2xl transition-all"
                  onClick={handlePlaySmart}
                  disabled={audioLoading || isConstructing}
                >
                  {audioLoading && isCurrentActive ? <Loader2 className="h-6 w-6 animate-spin" /> : (isPlaying && isCurrentActive ? "PAUSAR" : "REPRODUCIR")}
                </Button>
                <div className="flex justify-between items-center px-2">
                  <div className="flex items-center gap-2">
                    <Button onClick={handleLike} variant="ghost" size="icon" disabled={isLiking || isConstructing} className="hover:bg-white/20 text-white h-12 w-12 rounded-2xl">
                      <Heart className={cn("h-7 w-7 transition-all", isLiked ? 'fill-current scale-110 text-red-400' : 'opacity-60')} />
                    </Button>
                    <span className="text-sm font-black tabular-nums">{likeCount}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl text-white/60 hover:text-white" disabled={isConstructing}><Share2 className="h-5 w-5" /></Button>
                    <Button
                      variant="ghost" size="icon"
                      disabled={isConstructing || isDownloading}
                      onClick={handleDownloadToggle}
                      className={cn("h-12 w-12 rounded-2xl transition-all", isOfflineAvailable ? "text-green-300 bg-white/10" : "text-white/60")}
                    >
                      {isDownloading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {!isConstructing && localPodcastData.status === 'published' && user && (
              <Card className="bg-indigo-600 text-white border-none shadow-xl rounded-[2.5rem] overflow-hidden relative animate-in slide-in-from-right-4 duration-1000 group cursor-pointer active:scale-[0.98]">
                <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:rotate-12 transition-transform duration-700"><Sparkles className="h-14 w-14" /></div>
                <CardContent className="p-8 flex flex-col gap-5 relative text-center md:text-left">
                  <h3 className="font-black text-xl uppercase leading-tight">¿Tienes una postura?</h3>
                  <Button onClick={() => setIsRemixOpen(true)} className="w-full bg-white text-indigo-600 hover:bg-white/90 rounded-2xl h-14 font-black uppercase shadow-lg">
                    <CornerUpRight className="mr-2 h-5 w-5" /> RESPONDER
                  </Button>
                </CardContent>
              </Card>
            )}

            <Card className="bg-card/20 backdrop-blur-xl border-border/40 shadow-xl rounded-[2.5rem] overflow-hidden w-full">
              <CardContent className="p-6 md:p-8 space-y-8">
                {profileUrl ? (
                  <Link href={profileUrl} className="block group w-full">
                    <div className="flex items-center gap-4 p-5 bg-background/40 rounded-[2rem] border border-border/40 group-hover:border-primary/40 transition-all shadow-sm">
                      <div className="relative h-14 w-14 flex-shrink-0">
                        <Image src={getSafeAsset(localPodcastData.profiles?.avatar_url, 'avatar')} alt="" fill className="rounded-2xl object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] font-black uppercase text-muted-foreground/60 mb-0.5 tracking-[0.2em]">Curador</p>
                        <p className="font-black text-sm truncate uppercase tracking-tight">{localPodcastData.profiles?.full_name}</p>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div className="flex items-center gap-4 p-5 bg-background/20 rounded-[2rem] opacity-60 border border-dashed border-white/10">
                    <Mic className="h-6 w-6 text-muted-foreground" /><p className="font-black text-xs uppercase text-muted-foreground">Anónimo</p>
                  </div>
                )}
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center gap-4 p-5 bg-background/20 rounded-2xl border border-white/5">
                    <Calendar className="h-5 w-5 text-muted-foreground/60" />
                    <div><p className="text-[9px] font-black uppercase text-muted-foreground/50 tracking-widest">Registro</p><p className="text-sm font-bold uppercase">{new Date(localPodcastData.created_at).toLocaleDateString()}</p></div>
                  </div>
                  {!isConstructing && localPodcastData.duration_seconds && (
                    <div className="flex items-center gap-4 p-5 bg-background/20 rounded-2xl border border-white/5">
                      <Clock className="h-5 w-5 text-muted-foreground/60" />
                      <div><p className="text-[9px] font-black uppercase text-muted-foreground/50 tracking-widest">Duración</p><p className="text-sm font-bold tracking-tighter font-mono">{formatTime(localPodcastData.duration_seconds)}</p></div>
                    </div>
                  )}
                  {localPodcastData.place_name && (
                    <div className="flex items-center gap-4 p-5 bg-primary/5 rounded-2xl border border-primary/20">
                      <MapPin className="h-5 w-5 text-primary" />
                      <div className="min-w-0">
                        <p className="text-[9px] font-black uppercase text-primary/60 tracking-widest">Ubicación</p>
                        <p className="text-xs font-bold text-foreground truncate uppercase tracking-tight">{localPodcastData.place_name}</p>
                      </div>
                    </div>
                  )}
                </div>
                <Separator className="opacity-10" />
                <CreationMetadata data={localPodcastData.creation_data} sources={sources} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {isClient && isOwner && (
        <TagCurationCanvas isOpen={isEditingTags} onOpenChange={setIsEditingTags} suggestedTags={localPodcastData.ai_tags || []} publishedTags={localPodcastData.user_tags || []} onSave={handleSaveTags} />
      )}

      {isClient && isRemixOpen && user && (
        <RemixDialog isOpen={isRemixOpen} onOpenChange={setIsRemixOpen} parentPodcast={{ id: localPodcastData.id, title: localPodcastData.title, author: { full_name: localPodcastData.profiles?.full_name || 'Anónimo', avatar_url: localPodcastData.profiles?.avatar_url || null } }} quoteContext={normalizedScriptText.substring(0, 400)} timestamp={localTime} />
      )}
    </>
  );
}