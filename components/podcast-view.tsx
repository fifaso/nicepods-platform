// components/podcast-view.tsx
// VERSIÓN: 19.1 (Master Integrity - Public Access & Hybrid Auth Fix)

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
  Map as MapIcon,
  FileText, // [FIJO]: Importación faltante
  FileJson  // [FIJO]: Importación faltante
} from 'lucide-react';
import { CreationMetadata } from './creation-metadata';
import { formatTime } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { TagCurationCanvas } from './tag-curation-canvas';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Integraciones Clave de PWA y Remixes
import { useOfflineAudio } from '@/hooks/use-offline-audio';
import { RemixDialog } from '@/components/remix-dialog';

/**
 * ScriptViewer: Carga diferida para optimizar el bundle inicial
 */
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
  user: User | null; // [FIJO]: Ahora permite visitantes públicos (null)
  initialIsLiked: boolean;
  replies?: PodcastWithProfile[]; 
}

export function PodcastView({ podcastData, user, initialIsLiked, replies = [] }: PodcastViewProps) {
  const { supabase } = useAuth();
  const { playPodcast, logInteractionEvent, currentPodcast, currentTime, duration: currentDuration, seekTo } = useAudio();
  const { toast } = useToast();
  
  // --- ESTADOS DE DATOS ---
  const [localPodcastData, setLocalPodcastData] = useState<PodcastWithProfile>(podcastData);
  const [isLiked, setIsLiked] = useState<boolean>(initialIsLiked);
  const [likeCount, setLikeCount] = useState<number>(Number(localPodcastData.like_count || 0));
  const [isLiking, setIsLiking] = useState<boolean>(false);
  
  // --- ESTADOS DE INTERFAZ ---
  const [isScriptExpanded, setIsScriptExpanded] = useState<boolean>(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState<boolean>(false);
  const [isEditingTags, setIsEditingTags] = useState<boolean>(false);
  const [viewerRole, setViewerRole] = useState<string>('user');
  const [isRemixOpen, setIsRemixOpen] = useState<boolean>(false);

  // --- LÓGICA DE VALIDACIÓN (QA / LISTEN TO PUBLISH) ---
  const [hasListenedFully, setHasListenedFully] = useState<boolean>(false);
  const [listeningProgress, setListeningProgress] = useState<number>(0);
  const hasUpdatedDbRef = useRef<boolean>(false);

  // --- LÓGICA OFFLINE (PWA) ---
  const { isOfflineAvailable, isDownloading, downloadForOffline, removeFromOffline } = useOfflineAudio(localPodcastData);

  // --- GESTIÓN DE HILOS (REMIXES) ---
  const pendingReplies = useMemo(() => 
    replies.filter(r => r.status === 'pending_approval' && r.user_id === user?.id),
  [replies, user?.id]);

  const publishedReplies = useMemo(() => 
    replies.filter(r => r.status === 'published'),
  [replies]);

  // 1. SINCRONIZACIÓN INICIAL
  useEffect(() => {
    setLocalPodcastData(podcastData);
    setLikeCount(Number(podcastData.like_count || 0));
    setIsLiked(initialIsLiked);

    if (podcastData.reviewed_by_user) {
        setHasListenedFully(true);
        setListeningProgress(100);
        hasUpdatedDbRef.current = true;
    } else {
        const savedTime = localStorage.getItem(`nicepod_progress_${podcastData.id}`);
        if (savedTime && podcastData.duration_seconds) {
            const time = parseFloat(savedTime);
            const percent = (time / podcastData.duration_seconds) * 100;
            setListeningProgress(Math.min(percent, 99)); 
        }
    }
  }, [podcastData, initialIsLiked]);

  // 2. DETECCIÓN DE PRIVILEGIOS
  useEffect(() => {
    const fetchRole = async () => {
        if (!user || !supabase) return; // [FIJO]: Guardia para visitantes
        const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        if (data?.role) setViewerRole(data.role);
    };
    fetchRole();
  }, [user, supabase]);

  // 3. PERSISTENCIA DE QA (Escucha Completa)
  const markAsListened = async () => {
    if (!supabase || !user || hasUpdatedDbRef.current) return; // [FIJO]: Solo dueños marcan QA
    hasUpdatedDbRef.current = true;
    setHasListenedFully(true);
    localStorage.removeItem(`nicepod_progress_${localPodcastData.id}`);

    await supabase.from('micro_pods').update({ reviewed_by_user: true }).eq('id', localPodcastData.id);
  };

  // 4. MONITOR DE PROGRESO EN TIEMPO REAL
  useEffect(() => {
    if (hasListenedFully || currentPodcast?.id !== localPodcastData.id) return;

    if (currentDuration > 0) {
        const percent = (currentTime / currentDuration) * 100;
        setListeningProgress(percent);
        
        if (currentTime > 0) {
            localStorage.setItem(`nicepod_progress_${localPodcastData.id}`, currentTime.toString());
        }

        if (percent > 95 && user) { // [FIJO]: Solo procesar QA si hay usuario
            markAsListened();
        }
    }
  }, [currentTime, currentDuration, currentPodcast, localPodcastData.id, hasListenedFully, user]);

  // 5. SUBSCRIPCIÓN REALTIME
  useEffect(() => {
    const isPodcastComplete = !!localPodcastData.cover_image_url && !!localPodcastData.audio_url;
    if (!supabase || isPodcastComplete) return; 

    const channel = supabase.channel(`micro_pod_${localPodcastData.id}`)
      .on<PodcastWithProfile>(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'micro_pods', filter: `id=eq.${localPodcastData.id}` },
        (payload) => {
          setLocalPodcastData(prevData => ({ ...prevData, ...(payload.new as PodcastWithProfile) }));
          if (payload.new.audio_url) setIsGeneratingAudio(false);
        }
      ).subscribe();
      
    return () => { supabase.removeChannel(channel); };
  }, [supabase, localPodcastData.id, localPodcastData.audio_url, localPodcastData.cover_image_url]);

  // --- HELPERS DINÁMICOS ---

  const isOwner = user?.id === localPodcastData.user_id;
  const isAdmin = viewerRole === 'admin';

  const sources = useMemo<ResearchSource[]>(() => {
      return localPodcastData.sources || [];
  }, [localPodcastData.sources]);

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
    } catch {
      return String(rawScript);
    }
  }, [localPodcastData.script_text]);

  const profileUrl = useMemo(() => {
    const username = localPodcastData.profiles?.username;
    return username ? `/profile/${username}` : null;
  }, [localPodcastData.profiles]);

  // --- ACCIONES DE USUARIO ---

  const handlePlaySmart = () => {
      const savedTime = localStorage.getItem(`nicepod_progress_${localPodcastData.id}`);
      playPodcast(localPodcastData);
      if (savedTime && !hasListenedFully) {
          setTimeout(() => seekTo(parseFloat(savedTime)), 500);
      }
  };

  const handleDownloadToggle = () => {
    if (isOfflineAvailable) {
        if(confirm("¿Eliminar este episodio de tus descargas?")) removeFromOffline();
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
        toast({ title: "¡Publicado!", description: "Ahora es visible para toda la comunidad." });
    }
  };

  const handleLike = async () => {
    if (!supabase || !user) {
        toast({ title: "Inicia sesión", description: "Debes estar conectado para dar like.", variant: "destructive" });
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

  // Helper para Remix (Placeholder si no estaba definido)
  const getCleanContextText = () => normalizedScriptText.substring(0, 200);

  return (
    <>
      <div className="container mx-auto max-w-7xl py-8 md:py-16 px-4 md:px-6">
        
        {/* BANNER: MODERACIÓN ADMINISTRATIVA */}
        {isAdmin && user && (
            <Alert variant="destructive" className="mb-8 border-red-500/50 bg-red-500/5 backdrop-blur-xl">
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle className="font-black uppercase tracking-widest text-[10px]">Control de Torre</AlertTitle>
                <AlertDescription className="flex justify-between items-center mt-2">
                    <span className="text-sm font-medium">Contenido bajo supervisión de administrador.</span>
                    <Button variant="destructive" size="sm" className="h-8 text-[10px] font-bold">BANEAR</Button>
                </AlertDescription>
            </Alert>
        )}

        {/* BANNER: FLUJO DE APROBACIÓN (QA) */}
        {isOwner && localPodcastData.status === 'pending_approval' && (
             <div className="mb-8 rounded-3xl border border-primary/20 bg-primary/5 p-6 backdrop-blur-2xl animate-in fade-in slide-in-from-top-4 duration-700">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-primary/10 rounded-2xl text-primary shadow-inner">
                            <Lock className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="font-black text-lg tracking-tight uppercase">Borrador Privado</h3>
                            <p className="text-sm text-muted-foreground font-medium leading-tight">
                                Valida la calidad del audio antes de liberarlo al mundo.
                            </p>
                        </div>
                    </div>
                    
                    <div className="w-full md:w-auto flex flex-col items-end gap-3">
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
                                <><PlayCircle className="mr-2 h-4 w-4" /> ESCUCHA PARA DESBLOQUEAR ({Math.round(listeningProgress)}%)</>
                            )}
                        </Button>
                    </div>
                </div>
             </div>
        )}

        <div className="grid lg:grid-cols-3 gap-10 items-start">
          
          <div className="lg:col-span-2 space-y-8">
            <Card className="bg-card/30 backdrop-blur-3xl border-border/40 shadow-2xl rounded-[2.5rem] overflow-hidden">
              
              {localPodcastData.cover_image_url && (
                <div className="aspect-video relative w-full group overflow-hidden">
                  <Image 
                    src={localPodcastData.cover_image_url} 
                    alt={localPodcastData.title} 
                    fill 
                    style={{ objectFit: 'cover' }} 
                    className="animate-fade-in group-hover:scale-105 transition-transform duration-1000" 
                    priority 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
              )}

              <CardHeader className="p-8 md:p-12">
                <div className="flex flex-wrap items-center gap-3 mb-6">
                    <Badge variant="secondary" className="px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] bg-primary/10 text-primary border-primary/20">
                        {localPodcastData.status === 'pending_approval' ? 'MODO QA' : 'PUBLICADO'}
                    </Badge>
                </div>
                
                <CardTitle className="text-3xl md:text-5xl font-black leading-none tracking-tighter text-foreground mb-4">
                    {localPodcastData.title}
                </CardTitle>
                
                <CardDescription className="text-lg md:text-xl text-muted-foreground font-medium leading-snug">
                    {localPodcastData.description || "Un viaje sonoro a través del conocimiento."}
                </CardDescription>
                
                <Separator className="my-10 opacity-10" />

                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">
                    <Tag className="h-3 w-3" />
                    <span>Conceptos de Resonancia</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {displayTags.map(tag => (
                      <Badge key={tag} variant="outline" className="bg-white/5 hover:bg-white/10 border-white/10 px-4 py-1.5 rounded-xl text-xs font-bold">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-8 md:p-12 pt-0">
                <Separator className="mb-10 opacity-10" />
                
                <Collapsible open={isScriptExpanded} onOpenChange={setIsScriptExpanded}>
                  <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-black uppercase tracking-tighter text-foreground/80 flex items-center gap-2">
                         <FileText className="h-4 w-4 text-primary" /> Guion del Episodio
                      </h3>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-10 px-4 rounded-xl text-xs font-bold hover:bg-primary/10">
                            {isScriptExpanded ? 'OCULTAR' : 'LEER TODO'}
                            <ChevronDown className={cn("ml-2 h-4 w-4 transition-transform duration-500", isScriptExpanded && 'rotate-180')} />
                        </Button>
                      </CollapsibleTrigger>
                  </div>
                  
                  <CollapsibleContent className="animate-in slide-in-from-top-2 duration-500">
                    <div className="p-8 bg-black/20 rounded-[2rem] border border-border/40 shadow-inner">
                        <ScriptEditor scriptText={normalizedScriptText} />
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </CardContent>
            </Card>

            {/* SECCIÓN: HILO DE RESPUESTAS */}
            {(pendingReplies.length > 0 || publishedReplies.length > 0) && (
                <div className="space-y-6">
                    <div className="flex items-center gap-3 px-4">
                        <MessageCircle className="h-5 w-5 text-primary" />
                        <h3 className="text-xl font-black tracking-tighter uppercase">Hilo de Conversación</h3>
                    </div>
                    
                    <div className="pl-6 border-l-2 border-primary/10 space-y-4">
                        {publishedReplies.map((reply) => (
                            <Card key={reply.id} className="bg-card/20 border-border/40 hover:border-primary/30 transition-all rounded-3xl group">
                                <CardContent className="p-5 flex items-center gap-4">
                                    <div className="relative h-12 w-12 rounded-2xl overflow-hidden border border-border/50">
                                        {reply.cover_image_url ? <Image src={reply.cover_image_url} alt="" fill className="object-cover"/> : <Mic className="m-auto h-5 w-5 text-muted-foreground"/>}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <Link href={`/podcast/${reply.id}`} className="hover:text-primary transition-colors">
                                            <h4 className="font-bold text-sm truncate">{reply.title}</h4>
                                        </Link>
                                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">
                                            {reply.profiles?.full_name} • {formatTime(reply.duration_seconds || 0)}
                                        </p>
                                    </div>
                                    <Button size="icon" variant="ghost" className="rounded-full h-10 w-10 bg-primary/5 text-primary" onClick={() => playPodcast(reply)}>
                                        <PlayCircle className="h-5 w-5" />
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
          </div>

          <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-24 lg:self-start">
            
            <Card className="bg-primary text-white border-none shadow-2xl rounded-[2.5rem] overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
              <CardHeader className="pb-4 relative">
                <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
                    <PlayCircle className="h-5 w-5" /> Reproducir
                </CardTitle>
              </CardHeader>
              <CardContent className="relative flex flex-col gap-6">
                {localPodcastData.audio_url ? (
                  <Button size="lg" className="w-full bg-white text-primary hover:bg-white/90 rounded-2xl h-16 text-lg font-black" onClick={handlePlaySmart}>
                    ESCUCHAR AHORA
                  </Button>
                ) : (
                  <Button size="lg" className="w-full bg-white/20 text-white opacity-80 cursor-wait rounded-2xl h-16" disabled>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> PROCESANDO...
                  </Button>
                )}
                
                <div className="flex justify-between items-center px-2">
                  <div className="flex items-center gap-1.5">
                    <Button onClick={handleLike} variant="ghost" size="icon" disabled={isLiking} className="hover:bg-white/20 text-white h-11 w-11 rounded-xl">
                      <Heart className={cn("h-6 w-6 transition-all", isLiked ? 'fill-current scale-110 text-red-400' : 'opacity-60')} />
                    </Button>
                    <span className="text-sm font-black tabular-nums">{likeCount}</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="h-11 w-11 rounded-xl text-white/60 hover:text-white"><Share2 className="h-5 w-5" /></Button>
                    <Button 
                        variant="ghost" size="icon" 
                        disabled={!localPodcastData.audio_url || isDownloading} 
                        onClick={handleDownloadToggle}
                        className={cn("h-11 w-11 rounded-xl", isOfflineAvailable ? "text-green-300" : "text-white/60")}
                    >
                        {isDownloading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* MÓDULO REMIX */}
            {localPodcastData.audio_url && localPodcastData.status === 'published' && user && (
                <Card className="bg-indigo-600 text-white border-none shadow-xl rounded-[2rem] overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4 opacity-20"><Sparkles className="h-12 w-12" /></div>
                    <CardContent className="p-6 flex flex-col gap-4 relative">
                        <h3 className="font-black text-lg uppercase mb-1">¿Tienes una postura?</h3>
                        <Button onClick={() => setIsRemixOpen(true)} className="w-full bg-white text-indigo-600 hover:bg-white/90 rounded-xl h-12 font-bold">
                            <CornerUpRight className="mr-2 h-4 w-4" /> RESPONDER
                        </Button>
                    </CardContent>
                </Card>
            )}

            <Card className="bg-card/20 backdrop-blur-xl border-border/40 shadow-xl rounded-[2.5rem] overflow-hidden">
              <CardContent className="p-8 space-y-8">
                {profileUrl ? (
                  <Link href={profileUrl} className="block group">
                    <div className="flex items-center gap-4 p-4 bg-background/40 rounded-2xl border border-border/40 group-hover:border-primary/40 transition-all">
                      <div className="relative h-12 w-12">
                        <Image 
                          src={localPodcastData.profiles?.avatar_url || '/images/placeholder-avatar.svg'} 
                          alt={localPodcastData.profiles?.full_name || 'Autor'} 
                          fill 
                          className="rounded-xl object-cover" 
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] font-black uppercase text-muted-foreground/60">Autor NicePod</p>
                        <p className="font-bold truncate group-hover:text-primary">{localPodcastData.profiles?.full_name}</p>
                      </div>
                    </div>
                  </Link>
                ) : (
                    <div className="flex items-center gap-4 p-4 bg-background/20 rounded-2xl opacity-60">
                        <Mic className="h-6 w-6 text-muted-foreground" />
                        <p className="font-bold text-sm">Creador no verificado</p>
                    </div>
                )}
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-background/20 rounded-2xl">
                    <Calendar className="h-4 w-4 text-muted-foreground/60" />
                    <div>
                        <p className="text-[9px] font-black uppercase text-muted-foreground/50">Fecha</p>
                        <p className="text-sm font-bold">{new Date(localPodcastData.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {localPodcastData.duration_seconds && (
                    <div className="flex items-center gap-3 p-4 bg-background/20 rounded-2xl">
                      <Clock className="h-4 w-4 text-muted-foreground/60" />
                      <div>
                        <p className="text-[9px] font-black uppercase text-muted-foreground/50">Duración</p>
                        <p className="text-sm font-bold">{formatTime(localPodcastData.duration_seconds)}</p>
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
      
      {/* APOYO */}
      {isOwner && (
        <TagCurationCanvas 
          isOpen={isEditingTags} 
          onOpenChange={setIsEditingTags} 
          suggestedTags={localPodcastData.ai_tags || []} 
          publishedTags={localPodcastData.user_tags || []} 
          onSave={() => {}} 
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
            quoteContext={getCleanContextText()} 
            timestamp={currentTime} 
          />
      )}
    </>
  );
}