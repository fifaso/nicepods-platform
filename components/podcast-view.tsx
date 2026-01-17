// components/podcast-view.tsx
// VERSIÓN: 20.1 (Production Master - Full Recovery & Realtime Integrity Shield)

"use client";

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';

import { PodcastWithProfile, ResearchSource } from '@/types/podcast';
import { useAuth } from '@/hooks/use-auth';
import { useAudio } from '@/contexts/audio-context';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Heart,
  Share2,
  Download,
  Calendar,
  Clock,
  PlayCircle,
  ChevronDown,
  Loader2,
  Mic,
  Tag,
  Pencil,
  Globe,
  ExternalLink,
  ShieldAlert,
  CheckCircle,
  Lock,
  Users,
  Trash2,
  CornerUpRight,
  Sparkles,
  MessageCircle,
  AlertCircle,
  MapPin,
  FileText,
  Construction,
  Zap,
  Ear
} from 'lucide-react';
import { CreationMetadata } from './creation-metadata';
import { formatTime, cn } from '@/lib/utils';
import { TagCurationCanvas } from './tag-curation-canvas';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useOfflineAudio } from '@/hooks/use-offline-audio';
import { RemixDialog } from '@/components/remix-dialog';

/**
 * ScriptViewer: Carga diferida estratégica
 */
const ScriptEditor = dynamic(
  () => import('./script-viewer').then((mod) => mod.ScriptViewer),
  {
    ssr: false,
    loading: () => (
      <div className="h-32 w-full flex flex-col items-center justify-center text-muted-foreground animate-pulse bg-secondary/10 rounded-xl">
        <Loader2 className="h-5 w-5 animate-spin mb-2" />
        <span className="text-xs font-bold uppercase tracking-widest opacity-50">Sincronizando Guion...</span>
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
    logInteractionEvent,
    currentPodcast,
    currentTime,
    duration: currentDuration,
    seekTo,
    isPlaying,
    isLoading: audioLoading,
    togglePlayPause
  } = useAudio();
  const { toast } = useToast();

  // --- ESTADOS DE HIDRATACIÓN ---
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);

  // --- ESTADOS DE DATOS ---
  const [localPodcastData, setLocalPodcastData] = useState<PodcastWithProfile>(podcastData);
  const [isLiked, setIsLiked] = useState<boolean>(initialIsLiked);
  const [likeCount, setLikeCount] = useState<number>(Number(localPodcastData.like_count || 0));
  const [isLiking, setIsLiking] = useState<boolean>(false);

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

  // 1. SINCRONIZACIÓN DE PROPS A ESTADO LOCAL
  useEffect(() => {
    setLocalPodcastData(podcastData);
    setLikeCount(Number(podcastData.like_count || 0));
    setIsLiked(initialIsLiked);

    if (podcastData.reviewed_by_user) {
      setHasListenedFully(true);
      setListeningProgress(100);
      hasUpdatedDbRef.current = true;
    } else if (isClient) {
      const savedTime = localStorage.getItem(`nicepod_progress_${podcastData.id}`);
      if (savedTime && podcastData.duration_seconds) {
        const time = parseFloat(savedTime);
        const percent = (time / podcastData.duration_seconds) * 100;
        setListeningProgress(Math.min(percent, 99));
      }
    }
  }, [podcastData, initialIsLiked, isClient]);

  // 2. DETECCIÓN DE PRIVILEGIOS DE ADMINISTRADOR
  useEffect(() => {
    const fetchRole = async () => {
      if (!user || !supabase) return;
      const { data } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
      if (data?.role) setViewerRole(data.role);
    };
    fetchRole();
  }, [user, supabase]);

  // 3. PERSISTENCIA DE CONTROL DE CALIDAD (QA)
  const markAsListened = async () => {
    if (!supabase || !user || hasUpdatedDbRef.current) return;
    hasUpdatedDbRef.current = true;
    setHasListenedFully(true);
    if (isClient) localStorage.removeItem(`nicepod_progress_${localPodcastData.id}`);

    await supabase.from('micro_pods').update({ reviewed_by_user: true }).eq('id', localPodcastData.id);
  };

  // 4. MONITOR DE PROGRESO DE AUDIO EN TIEMPO REAL
  useEffect(() => {
    if (!isCurrentActive || hasListenedFully || !isClient) return;

    if (currentDuration > 0) {
      const percent = (currentTime / currentDuration) * 100;
      setListeningProgress(percent);

      if (currentTime > 0) {
        localStorage.setItem(`nicepod_progress_${localPodcastData.id}`, currentTime.toString());
      }

      if (percent > 95 && user && !hasUpdatedDbRef.current) {
        markAsListened();
      }
    }
  }, [currentTime, currentDuration, isCurrentActive, hasListenedFully, user, isClient, localPodcastData.id]);

  // 5. SUSCRIPCIÓN REALTIME (Auto-revelación al completar producción)
  useEffect(() => {
    if (!supabase || !isClient) return;

    const channel = supabase.channel(`podcast_status_${localPodcastData.id}`)
      .on<PodcastWithProfile>(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'micro_pods', filter: `id=eq.${localPodcastData.id}` },
        (payload) => {
          setLocalPodcastData(prev => ({ ...prev, ...(payload.new as PodcastWithProfile) }));
          if (payload.new.processing_status === 'completed') {
            setIsGeneratingAudio(false);
            toast({ 
              title: "¡Forja Completada!", 
              description: "Los activos multimedia ya están disponibles.",
              variant: "default" 
            });
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
  }, [localPodcastData.ai_tags, localPodcastData.user_tags]);

  const normalizedScriptText = useMemo(() => {
    const rawScript = localPodcastData.script_text;
    if (!rawScript) return "";
    try {
      const parsed = typeof rawScript === 'string' ? JSON.parse(rawScript) : rawScript;
      return parsed.script_body || String(parsed);
    } catch { return String(rawScript); }
  }, [localPodcastData.script_text]);

  const profileUrl = useMemo(() => {
    const username = localPodcastData.profiles?.username;
    return username ? `/profile/${username}` : null;
  }, [localPodcastData.profiles]);

  // --- MANEJADORES DE ACCIONES ---

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
      if (confirm("¿Eliminar este episodio de tus descargas?")) removeFromOffline();
    } else {
      downloadForOffline();
    }
  };

  const handlePublishToCommunity = async () => {
    if (!hasListenedFully || !supabase) return;

    const { error } = await supabase.from('micro_pods').update({
      status: 'published',
      published_at: new Date().toISOString()
    }).eq('id', localPodcastData.id);

    if (!error) {
      setLocalPodcastData(prev => ({ ...prev, status: 'published' }));
      toast({ title: "¡Portal Abierto!", description: "Tu conocimiento ahora es público." });
    }
  };

  const handleLike = async () => {
    if (!supabase || !user) {
      toast({ title: "Inicia sesión", description: "Debes estar conectado para interactuar." });
      return;
    }
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
      if (!error) logInteractionEvent(podId, 'liked');
    }
    setIsLiking(false);
  };

  const handleSaveTags = async (newTags: string[]) => {
    if (!supabase) return;
    const { error } = await supabase.from('micro_pods').update({ user_tags: newTags }).eq('id', localPodcastData.id);
    if (!error) {
      setLocalPodcastData(prev => ({ ...prev, user_tags: newTags }));
      toast({ title: "ADN Semántico Actualizado" });
    }
  };

  const handleGenerateAudio = async () => {
    if (!supabase) return;
    setIsGeneratingAudio(true);
    const { error } = await supabase.functions.invoke('process-podcast-job', {
      body: { podcast_id: localPodcastData.id, force_audio: true }
    });
    if (error) {
      toast({ title: "Falla de Motor", description: "No se pudo iniciar la síntesis neuronal.", variant: "destructive" });
      setIsGeneratingAudio(false);
    }
  };

  if (!isClient) return null;

  return (
    <>
      <div className="container mx-auto max-w-7xl py-8 md:py-16 px-4 md:px-6">

        {/* ALERTA: ERROR DE PRODUCCIÓN CRÍTICO */}
        {isFailed && (
          <Alert variant="destructive" className="mb-8 border-red-500/50 bg-red-500/10 backdrop-blur-2xl animate-pulse shadow-2xl">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle className="font-black uppercase tracking-widest text-[10px]">Interrupción de Síntesis</AlertTitle>
            <AlertDescription className="text-sm font-medium mt-1">
              Hubo un error al forjar los activos multimedia. El equipo técnico ha sido notificado.
            </AlertDescription>
          </Alert>
        )}

        {/* BANNER: MODERACIÓN (Solo Admins) */}
        {isAdmin && user && (
          <Alert variant="destructive" className="mb-8 border-orange-500/50 bg-orange-500/5 backdrop-blur-xl">
            <ShieldAlert className="h-4 w-4 text-orange-500" />
            <AlertTitle className="font-black uppercase tracking-widest text-[10px] text-orange-500">Torre de Control Admin</AlertTitle>
            <AlertDescription className="flex justify-between items-center mt-2">
              <span className="text-xs font-medium">Gestionando ID: {localPodcastData.id}. Visibilidad actual: {localPodcastData.status}</span>
              <Button variant="destructive" size="sm" className="h-7 text-[10px] font-bold">RESTRINGIR</Button>
            </AlertDescription>
          </Alert>
        )}

        {/* BANNER: FLUJO DE CALIDAD (QA) */}
        {isOwner && !isConstructing && !isFailed && localPodcastData.status === 'pending_approval' && (
          <div className="mb-8 rounded-3xl border border-primary/20 bg-primary/5 p-6 backdrop-blur-2xl animate-in fade-in slide-in-from-top-4 duration-700 shadow-xl">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-primary/10 rounded-2xl text-primary shadow-inner"><Lock className="h-6 w-6" /></div>
                <div>
                  <h3 className="font-black text-lg tracking-tight uppercase">Borrador en Cuarentena</h3>
                  <p className="text-sm text-muted-foreground font-medium leading-tight">Escucha el resultado final antes de publicarlo en el Centro de Descubrimiento.</p>
                </div>
              </div>

              <div className="w-full md:w-auto">
                <Button
                  onClick={handlePublishToCommunity}
                  disabled={!hasListenedFully}
                  className={cn(
                    "w-full md:w-auto h-12 px-8 font-black transition-all duration-500 rounded-full",
                    hasListenedFully
                      ? "bg-green-600 hover:bg-green-700 text-white shadow-xl shadow-green-500/20"
                      : "bg-secondary text-muted-foreground opacity-50"
                  )}
                >
                  {hasListenedFully ? (
                    <><Users className="mr-2 h-4 w-4" /> PUBLICAR AHORA</>
                  ) : (
                    <><Ear className="mr-2 h-4 w-4" /> ESCUCHA PARA LIBERAR ({Math.round(listeningProgress)}%)</>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-10 items-start">
          <div className="lg:col-span-2 space-y-8">
            
            {/* COMPONENTE: ESCUDO DE CONSTRUCCIÓN REALTIME */}
            {isConstructing ? (
              <Card className="bg-card/30 backdrop-blur-3xl border-border/40 shadow-2xl rounded-[2.5rem] overflow-hidden p-12 flex flex-col items-center text-center space-y-10 min-h-[600px] justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 blur-[80px] animate-pulse rounded-full" />
                  <Construction className="h-24 w-24 text-primary relative z-10 animate-bounce" />
                </div>
                <div className="space-y-4 relative z-10">
                  <h2 className="text-3xl md:text-6xl font-black uppercase tracking-tighter text-white">Forjando Sabiduría</h2>
                  <p className="text-muted-foreground text-lg max-w-md mx-auto font-medium leading-relaxed">
                    Estamos sintetizando la voz neuronal e interpretando la narrativa. Quédate aquí, se revelará automáticamente al completarse.
                  </p>
                </div>
                <div className="flex flex-col items-center gap-4 bg-primary/5 px-8 py-5 rounded-3xl border border-primary/20">
                  <div className="flex items-center gap-3">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <span className="text-xs font-black uppercase tracking-[0.3em] text-primary">Sincronizando Activos</span>
                  </div>
                  <div className="h-1.5 w-48 bg-primary/10 rounded-full overflow-hidden">
                    <motion.div 
                        initial={{ x: "-100%" }} 
                        animate={{ x: "100%" }} 
                        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                        className="h-full w-full bg-primary" 
                    />
                  </div>
                </div>
              </Card>
            ) : (
              /* VISTA NORMAL: EL PODCAST EN TODO SU ESPLENDOR */
              <Card className="bg-card/30 backdrop-blur-3xl border-border/40 shadow-2xl rounded-[2.5rem] overflow-hidden animate-in zoom-in-95 duration-700">
                {localPodcastData.cover_image_url && (
                  <div className="aspect-video relative w-full group overflow-hidden">
                    <Image src={localPodcastData.cover_image_url} alt={localPodcastData.title} fill className="animate-fade-in group-hover:scale-105 transition-transform duration-1000 object-cover" priority />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  </div>
                )}
                <CardHeader className="p-8 md:p-12">
                  <div className="flex flex-wrap items-center gap-3 mb-6">
                    <Badge variant="secondary" className="px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] bg-primary/10 text-primary border-primary/20">
                      {localPodcastData.status === 'published' ? 'ESTATUS: PÚBLICO' : 'ESTATUS: PRIVADO (QA)'}
                    </Badge>
                    {localPodcastData.creation_mode === 'remix' && (
                      <Badge variant="outline" className="px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] border-indigo-500/30 text-indigo-400 bg-indigo-500/5">
                        REMIX NEURONAL
                      </Badge>
                    )}
                  </div>

                  <div className="flex justify-between items-start gap-4">
                    <CardTitle className="text-3xl md:text-6xl font-black leading-[0.9] tracking-tighter text-foreground mb-6 uppercase">
                      {localPodcastData.title}
                    </CardTitle>
                    {isOwner && (
                      <Button variant="ghost" size="icon" onClick={() => setIsEditingTags(true)} className="rounded-full hover:bg-primary/10">
                        <Pencil size={20} className="text-primary" />
                      </Button>
                    )}
                  </div>

                  <CardDescription className="text-lg md:text-2xl text-muted-foreground font-medium leading-snug">
                    {localPodcastData.description}
                  </CardDescription>

                  <Separator className="my-10 opacity-10" />

                  <div className="space-y-6">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">
                      <Tag className="h-3 w-3" />
                      <span>Mapa Semántico</span>
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                      {displayTags.map(tag => (
                        <Badge key={tag} variant="outline" className="bg-white/5 hover:bg-primary/10 hover:border-primary/40 border-white/10 px-5 py-2 rounded-2xl text-xs font-bold transition-all">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-8 md:p-12 pt-0">
                  <Separator className="mb-10 opacity-10" />
                  <Collapsible open={isScriptExpanded} onOpenChange={setIsScriptExpanded}>
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-xl font-black uppercase tracking-tighter text-foreground/80 flex items-center gap-3">
                        <FileText className="h-5 w-5 text-primary" /> Transcripción Maestra
                      </h3>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-10 px-5 rounded-2xl text-xs font-black tracking-widest hover:bg-primary/10">
                          {isScriptExpanded ? 'CONTRAER' : 'LEER TODO'}
                          <ChevronDown className={cn("ml-2 h-4 w-4 transition-transform duration-500", isScriptExpanded && 'rotate-180')} />
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                    <CollapsibleContent className="animate-in slide-in-from-top-4 duration-700">
                      <div className="p-8 lg:p-12 bg-black/30 rounded-[3rem] border border-border/40 shadow-inner leading-relaxed">
                        <ScriptEditor scriptText={normalizedScriptText} />
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </CardContent>
              </Card>
            )}

            {/* HILO SOCIAL DE REMIXES */}
            {(pendingReplies.length > 0 || publishedReplies.length > 0) && (
              <div className="space-y-8 py-10">
                <div className="flex items-center gap-4 px-4">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent to-primary/20" />
                  <MessageCircle className="h-6 w-6 text-primary" />
                  <h3 className="text-2xl font-black tracking-tighter uppercase">Hilo Resonante</h3>
                  <div className="h-px flex-1 bg-gradient-to-l from-transparent to-primary/20" />
                </div>

                <div className="pl-6 border-l-2 border-primary/20 space-y-5">
                  {publishedReplies.map((reply) => (
                    <Card key={reply.id} className="bg-card/20 border-border/40 hover:border-primary/40 transition-all rounded-[2rem] group shadow-lg">
                      <CardContent className="p-6 flex items-center gap-5">
                        <div className="relative h-14 w-14 rounded-2xl overflow-hidden border border-border/50 shadow-inner">
                          {reply.cover_image_url ? <Image src={reply.cover_image_url} alt="" fill className="object-cover" /> : <Mic className="m-auto h-6 w-6 text-muted-foreground" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link href={`/podcast/${reply.id}`} className="hover:text-primary transition-colors">
                            <h4 className="font-bold text-base truncate uppercase tracking-tight">{reply.title}</h4>
                          </Link>
                          <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1">
                            {reply.profiles?.full_name} • {formatTime(reply.duration_seconds || 0)}
                          </p>
                        </div>
                        <Button size="icon" variant="ghost" className="rounded-full h-12 w-12 bg-primary/5 text-primary hover:bg-primary/20" onClick={() => playPodcast(reply, publishedReplies)}>
                          <PlayCircle className="h-6 w-6" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* COLUMNA LATERAL: REPRODUCTOR E INTELIGENCIA */}
          <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-24 lg:self-start">
            
            <Card className={cn(
                "bg-primary text-white border-none shadow-2xl rounded-[2.5rem] overflow-hidden relative group transition-all duration-1000",
                isConstructing && "opacity-40 grayscale pointer-events-none translate-y-4"
            )}>
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/20 pointer-events-none" />
              <CardHeader className="pb-4 relative">
                <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
                  <PlayCircle className="h-5 w-5" /> Consola de Audio
                </CardTitle>
              </CardHeader>
              <CardContent className="relative flex flex-col gap-6">
                <Button
                  size="lg"
                  className="w-full bg-white text-primary hover:bg-zinc-100 rounded-2xl h-16 text-xl font-black shadow-2xl active:scale-95 transition-all"
                  onClick={handlePlaySmart}
                  disabled={audioLoading || isConstructing}
                >
                  {audioLoading && isCurrentActive ? <Loader2 className="h-6 w-6 animate-spin" /> : isCurrentActive && isPlaying ? "PAUSAR VIAJE" : "INICIAR EXPERIENCIA"}
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

            {/* BOTÓN: ACCIÓN REMIX */}
            {!isConstructing && localPodcastData.status === 'published' && user && (
              <Card className="bg-indigo-600 text-white border-none shadow-xl rounded-[2.5rem] overflow-hidden relative group cursor-pointer active:scale-[0.98] transition-all">
                <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:rotate-12 transition-transform duration-700"><Sparkles className="h-14 w-14" /></div>
                <CardContent className="p-8 flex flex-col gap-5 relative">
                  <div className="space-y-1">
                    <h3 className="font-black text-xl uppercase leading-tight">¿Tienes una postura?</h3>
                    <p className="text-xs font-bold text-indigo-100/70 uppercase tracking-widest">Responde con un remix de voz.</p>
                  </div>
                  <Button onClick={() => setIsRemixOpen(true)} className="w-full bg-white text-indigo-600 hover:bg-white/90 rounded-2xl h-14 font-black uppercase tracking-tighter shadow-lg">
                    <CornerUpRight className="mr-2 h-5 w-5" /> UNIRME AL HILO
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* CARD: METADATOS DEL CURADOR */}
            <Card className="bg-card/20 backdrop-blur-xl border-border/40 shadow-xl rounded-[2.5rem] overflow-hidden">
              <CardContent className="p-8 space-y-8">
                {profileUrl ? (
                  <Link href={profileUrl} className="block group">
                    <div className="flex items-center gap-4 p-5 bg-background/40 rounded-[2rem] border border-border/40 group-hover:border-primary/40 transition-all shadow-sm">
                      <div className="relative h-14 w-14">
                        <Image src={localPodcastData.profiles?.avatar_url || '/images/placeholder-avatar.svg'} alt="" fill className="rounded-2xl object-cover shadow-md" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] font-black uppercase text-muted-foreground/60 mb-0.5 tracking-[0.3em]">Curador NicePod</p>
                        <p className="font-black text-sm truncate group-hover:text-primary transition-colors uppercase tracking-tight">{localPodcastData.profiles?.full_name}</p>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div className="flex items-center gap-4 p-5 bg-background/20 rounded-[2rem] opacity-60 grayscale border border-dashed border-white/10">
                    <Mic className="h-6 w-6 text-muted-foreground" />
                    <p className="font-black text-xs uppercase tracking-widest text-muted-foreground">Creador Anónimo</p>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center gap-4 p-5 bg-background/20 rounded-2xl border border-white/5">
                    <Calendar className="h-5 w-5 text-muted-foreground/60" />
                    <div>
                      <p className="text-[9px] font-black uppercase text-muted-foreground/50 tracking-widest">Registro Temporal</p>
                      <p className="text-sm font-bold uppercase tracking-tight">{new Date(localPodcastData.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {localPodcastData.duration_seconds && !isConstructing && (
                    <div className="flex items-center gap-4 p-5 bg-background/20 rounded-2xl border border-white/5">
                      <Clock className="h-5 w-5 text-muted-foreground/60" />
                      <div>
                        <p className="text-[9px] font-black uppercase text-muted-foreground/50 tracking-widest">Dimensión Sonora</p>
                        <p className="text-sm font-bold tracking-tighter font-mono">{formatTime(localPodcastData.duration_seconds)}</p>
                      </div>
                    </div>
                  )}

                  {localPodcastData.place_name && (
                    <div className="flex items-center gap-4 p-5 bg-primary/5 rounded-2xl border border-primary/20 animate-in fade-in duration-1000">
                      <MapPin className="h-5 w-5 text-primary" />
                      <div className="min-w-0">
                        <p className="text-[9px] font-black uppercase text-primary/60 tracking-widest">Ubicación Clave</p>
                        <p className="text-xs font-bold text-foreground truncate uppercase tracking-tight">{localPodcastData.place_name}</p>
                      </div>
                    </div>
                  )}
                </div>

                <Separator className="opacity-10" />

                <CreationMetadata 
                  data={localPodcastData.creation_data} 
                  sources={sources} 
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* COMPONENTES DE APOYO (Modales y Canvas) */}
      {isOwner && (
        <TagCurationCanvas 
          isOpen={isEditingTags} 
          onOpenChange={setIsEditingTags} 
          suggestedTags={localPodcastData.ai_tags || []} 
          publishedTags={localPodcastData.user_tags || []} 
          onSave={handleSaveTags} 
        />
      )}

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
          timestamp={currentTime} 
        />
      )}
    </>
  );
}