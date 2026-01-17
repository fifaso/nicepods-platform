// components/podcast-view.tsx
// VERSIÓN: 20.0 (Ultimate Integrity - Shielded Production & Realtime Revelation)

"use client";

import { useState, useEffect, useMemo, useRef } from 'react';
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
  CornerUpRight,
  Sparkles,
  MessageCircle,
  AlertCircle,
  MapPin,
  FileText,
  Construction,
  Zap
} from 'lucide-react';
import { CreationMetadata } from './creation-metadata';
import { formatTime, cn } from '@/lib/utils';
import { TagCurationCanvas } from './tag-curation-canvas';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useOfflineAudio } from '@/hooks/use-offline-audio';
import { RemixDialog } from '@/components/remix-dialog';

const ScriptEditor = dynamic(
  () => import('./script-viewer').then((mod) => mod.ScriptViewer),
  {
    ssr: false,
    loading: () => (
      <div className="h-32 w-full flex flex-col items-center justify-center text-muted-foreground animate-pulse bg-secondary/10 rounded-xl">
        <Loader2 className="h-5 w-5 animate-spin mb-2" />
        <span className="text-xs font-bold uppercase tracking-widest opacity-50">Cargando Guion...</span>
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

  // --- LÓGICA DE INTEGRIDAD (Shield System) ---
  const isConstructing = localPodcastData.processing_status !== 'completed' && localPodcastData.processing_status !== 'failed';
  const isFailed = localPodcastData.processing_status === 'failed';

  // --- LÓGICA DE VALIDACIÓN (QA / LISTEN TO PUBLISH) ---
  const [hasListenedFully, setHasListenedFully] = useState<boolean>(!!localPodcastData.reviewed_by_user);
  const [listeningProgress, setListeningProgress] = useState<number>(0);
  const hasUpdatedDbRef = useRef<boolean>(false);

  // --- LÓGICA OFFLINE (PWA) ---
  const { isOfflineAvailable, isDownloading, downloadForOffline, removeFromOffline } = useOfflineAudio(localPodcastData);

  const isCurrentActive = useMemo(() => currentPodcast?.id === localPodcastData.id, [currentPodcast?.id, localPodcastData.id]);

  const publishedReplies = useMemo(() =>
    replies.filter(r => r.status === 'published'),
    [replies]);

  // 1. SINCRONIZACIÓN INICIAL Y PERSISTENCIA DE PROGRESO
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

  // 2. DETECCIÓN DE PRIVILEGIOS
  useEffect(() => {
    const fetchRole = async () => {
      if (!user || !supabase) return;
      const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      if (data?.role) setViewerRole(data.role);
    };
    fetchRole();
  }, [user, supabase]);

  // 3. MONITOR DE PROGRESO (QA Flow)
  useEffect(() => {
    if (!isCurrentActive || hasListenedFully || !isClient) return;

    if (currentDuration > 0) {
      const percent = (currentTime / currentDuration) * 100;
      setListeningProgress(percent);

      if (currentTime > 0) {
        localStorage.setItem(`nicepod_progress_${localPodcastData.id}`, currentTime.toString());
      }

      if (percent > 95 && user && !hasUpdatedDbRef.current) {
        hasUpdatedDbRef.current = true;
        setHasListenedFully(true);
        supabase.from('micro_pods').update({ reviewed_by_user: true }).eq('id', localPodcastData.id).then();
      }
    }
  }, [currentTime, currentDuration, isCurrentActive, hasListenedFully, user, isClient, supabase, localPodcastData.id]);

  // 4. SUSCRIPCIÓN REALTIME (Revelation logic)
  useEffect(() => {
    if (!supabase || !isClient) return;

    const channel = supabase.channel(`live_production_${localPodcastData.id}`)
      .on<PodcastWithProfile>(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'micro_pods', filter: `id=eq.${localPodcastData.id}` },
        (payload) => {
          console.log("⚡ [Realtime] Cambio de estado detectado:", payload.new.processing_status);
          setLocalPodcastData(prev => ({ ...prev, ...(payload.new as PodcastWithProfile) }));
          
          if (payload.new.processing_status === 'completed') {
            toast({ title: "¡Podcast Listo!", description: "La síntesis ha finalizado con éxito.", variant: "default" });
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

  const handlePublishToCommunity = async () => {
    if (!hasListenedFully || !supabase) return;
    const { error } = await supabase.from('micro_pods').update({
      status: 'published',
      published_at: new Date().toISOString()
    }).eq('id', localPodcastData.id);

    if (!error) {
      setLocalPodcastData(prev => ({ ...prev, status: 'published' }));
      toast({ title: "¡Liberado!", description: "El conocimiento ya es público." });
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
      if (!error) logInteractionEvent(podId, 'liked');
    }
    setIsLiking(false);
  };

  if (!isClient) return null;

  return (
    <>
      <div className="container mx-auto max-w-7xl py-8 md:py-16 px-4 md:px-6">

        {/* ALERTA: ERROR DE PRODUCCIÓN */}
        {isFailed && (
          <Alert variant="destructive" className="mb-8 border-red-500/50 bg-red-500/10 backdrop-blur-2xl animate-pulse">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle className="font-black uppercase tracking-widest text-xs">Fallo de Síntesis</AlertTitle>
            <AlertDescription className="text-sm font-medium mt-1">
              Hubo un error técnico al generar los activos. El equipo de NicePod ha sido notificado.
            </AlertDescription>
          </Alert>
        )}

        {/* BANNER: QA (Solo si ya está completado técnicamente) */}
        {isOwner && !isConstructing && !isFailed && localPodcastData.status === 'pending_approval' && (
          <div className="mb-8 rounded-3xl border border-primary/20 bg-primary/5 p-6 backdrop-blur-2xl animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-primary/10 rounded-2xl text-primary shadow-inner"><Lock className="h-6 w-6" /></div>
                <div>
                  <h3 className="font-black text-lg tracking-tight uppercase">Borrador Privado</h3>
                  <p className="text-sm text-muted-foreground font-medium">Valida la calidad final antes de publicar.</p>
                </div>
              </div>
              <Button
                onClick={handlePublishToCommunity}
                disabled={!hasListenedFully}
                className={cn("w-full md:w-auto h-12 px-8 font-black rounded-full transition-all", hasListenedFully ? "bg-green-600 hover:bg-green-700 text-white shadow-xl" : "bg-secondary text-muted-foreground opacity-50")}
              >
                {hasListenedFully ? <><Users className="mr-2 h-4 w-4" /> PUBLICAR AHORA</> : <><PlayCircle className="mr-2 h-4 w-4" /> ESCUCHA PARA LIBERAR ({Math.round(listeningProgress)}%)</>}
              </Button>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-10 items-start">
          <div className="lg:col-span-2 space-y-8">
            
            {/* ESTADO: EN CONSTRUCCIÓN (Shield View) */}
            {isConstructing ? (
              <Card className="bg-card/30 backdrop-blur-3xl border-border/40 shadow-2xl rounded-[2.5rem] overflow-hidden p-12 flex flex-col items-center text-center space-y-8 min-h-[500px] justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 blur-3xl animate-pulse rounded-full" />
                  <Construction className="h-20 w-20 text-primary relative z-10 animate-bounce" />
                </div>
                <div className="space-y-4">
                  <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">Forjando Sabiduría</h2>
                  <p className="text-muted-foreground text-lg max-w-md mx-auto font-medium">
                    Estamos sintetizando el audio e interpretando la narrativa. Quédate aquí, se revelará en segundos.
                  </p>
                </div>
                <div className="flex items-center gap-3 bg-primary/10 px-6 py-3 rounded-2xl border border-primary/20">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-primary">Procesando Activos</span>
                </div>
              </Card>
            ) : (
              /* VISTA NORMAL: PODCAST LISTO */
              <Card className="bg-card/30 backdrop-blur-3xl border-border/40 shadow-2xl rounded-[2.5rem] overflow-hidden animate-in zoom-in-95 duration-700">
                {localPodcastData.cover_image_url && (
                  <div className="aspect-video relative w-full group overflow-hidden">
                    <Image src={localPodcastData.cover_image_url} alt="" fill className="animate-fade-in group-hover:scale-105 transition-transform duration-1000 object-cover" priority />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                )}
                <CardHeader className="p-8 md:p-12">
                  <div className="flex flex-wrap items-center gap-3 mb-6">
                    <Badge variant="secondary" className="px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] bg-primary/10 text-primary border-primary/20">
                      {localPodcastData.status === 'published' ? 'PUBLICADO' : 'MODO QA'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-start gap-4">
                    <CardTitle className="text-3xl md:text-5xl font-black leading-none tracking-tighter uppercase">{localPodcastData.title}</CardTitle>
                    {isOwner && <Button variant="ghost" size="icon" onClick={() => setIsEditingTags(true)} className="rounded-full hover:bg-white/10"><Pencil size={18} className="text-primary" /></Button>}
                  </div>
                  <CardDescription className="text-lg md:text-xl text-muted-foreground font-medium mt-4 leading-snug">{localPodcastData.description}</CardDescription>
                  <Separator className="my-10 opacity-10" />
                  <div className="flex flex-wrap gap-2">
                    {displayTags.map(tag => <Badge key={tag} variant="outline" className="bg-white/5 border-white/10 px-4 py-1.5 rounded-xl text-xs font-bold uppercase">{tag}</Badge>)}
                  </div>
                </CardHeader>
                <CardContent className="p-8 md:p-12 pt-0">
                  <Separator className="mb-10 opacity-10" />
                  <Collapsible open={isScriptExpanded} onOpenChange={setIsScriptExpanded}>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-black uppercase tracking-tighter flex items-center gap-2"><FileText className="h-4 w-4 text-primary" /> Guion Maestro</h3>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-10 px-4 rounded-xl text-xs font-bold">
                          {isScriptExpanded ? 'OCULTAR' : 'LEER TODO'}
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                    <CollapsibleContent className="animate-in slide-in-from-top-2 duration-500">
                      <div className="p-8 bg-black/20 rounded-[2rem] border border-border/40"><ScriptEditor scriptText={normalizedScriptText} /></div>
                    </CollapsibleContent>
                  </Collapsible>
                </CardContent>
              </Card>
            )}
          </div>

          {/* COLUMNA LATERAL: REPRODUCTOR Y METADATOS */}
          <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-24 lg:self-start">
            
            {!isFailed && (
              <Card className={cn(
                "bg-primary text-white border-none shadow-2xl rounded-[2.5rem] overflow-hidden relative group transition-all duration-700",
                isConstructing && "opacity-50 grayscale pointer-events-none"
              )}>
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
                <CardHeader className="pb-4 relative">
                  <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
                    <PlayCircle className="h-5 w-5" /> Reproducir
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative flex flex-col gap-6">
                  <Button
                    size="lg"
                    className="w-full bg-white text-primary hover:bg-white/90 rounded-2xl h-16 text-lg font-black shadow-xl"
                    onClick={handlePlaySmart}
                    disabled={audioLoading || isConstructing}
                  >
                    {isConstructing ? "SINTETIZANDO..." : (isPlaying && isCurrentActive ? "PAUSAR" : "ESCUCHAR AHORA")}
                  </Button>
                  <div className="flex justify-between items-center px-2">
                    <div className="flex items-center gap-1.5">
                      <Button onClick={handleLike} variant="ghost" size="icon" disabled={isLiking || isConstructing} className="hover:bg-white/20 text-white h-11 w-11 rounded-xl">
                        <Heart className={cn("h-6 w-6 transition-all", isLiked ? 'fill-current text-red-400 scale-110' : 'opacity-60')} />
                      </Button>
                      <span className="text-sm font-black tabular-nums">{likeCount}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="h-11 w-11 rounded-xl text-white/60" disabled={isConstructing}><Share2 className="h-5 w-5" /></Button>
                      <Button
                        variant="ghost" size="icon"
                        disabled={isConstructing || isDownloading}
                        onClick={handleDownloadToggle}
                        className={cn("h-11 w-11 rounded-xl", isOfflineAvailable ? "text-green-300" : "text-white/60")}
                      >
                        {isDownloading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ACCIÓN REMIX (Solo si ya está publicado) */}
            {!isConstructing && localPodcastData.status === 'published' && user && (
              <Card className="bg-indigo-600 text-white border-none shadow-xl rounded-[2rem] overflow-hidden relative animate-in slide-in-from-right-4 duration-1000">
                <div className="absolute top-0 right-0 p-4 opacity-20"><Sparkles className="h-12 w-12" /></div>
                <CardContent className="p-6 flex flex-col gap-4 relative">
                  <h3 className="font-black text-lg uppercase mb-1 leading-tight">¿Tienes una postura?</h3>
                  <p className="text-[10px] font-medium opacity-70 uppercase tracking-widest">Únete con un remix de voz.</p>
                  <Button onClick={() => setIsRemixOpen(true)} className="w-full bg-white text-indigo-600 hover:bg-white/90 rounded-xl h-12 font-bold uppercase tracking-tighter">
                    <CornerUpRight className="mr-2 h-4 w-4" /> RESPONDER
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* METADATOS DE AUTORÍA Y ORIGEN */}
            <Card className="bg-card/20 backdrop-blur-xl border-border/40 shadow-xl rounded-[2.5rem] overflow-hidden">
              <CardContent className="p-8 space-y-8">
                <div className="flex items-center gap-4 p-4 bg-background/40 rounded-2xl border border-border/40">
                  <div className="relative h-12 w-12">
                    <Image src={localPodcastData.profiles?.avatar_url || '/images/placeholder-avatar.svg'} alt="" fill className="rounded-xl object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] font-black uppercase text-muted-foreground/60 mb-0.5 tracking-[0.2em]">Curador NicePod</p>
                    <p className="font-bold truncate uppercase tracking-tight text-sm">{localPodcastData.profiles?.full_name || "Anónimo"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-background/20 rounded-2xl">
                    <Calendar className="h-4 w-4 text-muted-foreground/60" />
                    <div>
                      <p className="text-[9px] font-black uppercase text-muted-foreground/50 tracking-widest">Registro</p>
                      <p className="text-xs font-bold uppercase">{new Date(localPodcastData.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  {localPodcastData.place_name && (
                    <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                      <MapPin className="h-4 w-4 text-primary" />
                      <div className="min-w-0">
                        <p className="text-[9px] font-black uppercase text-primary/60 tracking-widest">Ubicación</p>
                        <p className="text-xs font-bold text-foreground truncate uppercase">{localPodcastData.place_name}</p>
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
        <RemixDialog isOpen={isRemixOpen} onOpenChange={setIsRemixOpen} parentPodcast={{ id: localPodcastData.id, title: localPodcastData.title, author: { full_name: localPodcastData.profiles?.full_name || 'Anónimo', avatar_url: localPodcastData.profiles?.avatar_url || null } }} quoteContext={getCleanContextText()} timestamp={currentTime} />
      )}
    </>
  );
}