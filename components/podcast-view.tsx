// components/podcast-view.tsx
// VERSIÓN: 8.0 (Social Workflow: Listen-to-Publish & Admin Kill-Switch)

"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic'; 

import { PodcastWithProfile } from '@/types/podcast';
import { useAuth } from '@/hooks/use-auth';
import { useAudio } from '@/contexts/audio-context';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Heart, Share2, Download, Calendar, Clock, PlayCircle, ChevronDown, Loader2, Mic, Tag, Pencil, Globe, ExternalLink, ShieldAlert, CheckCircle, Lock, Users } from 'lucide-react';
import { CreationMetadata } from './creation-metadata';
import { formatTime } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { TagCurationCanvas } from './tag-curation-canvas';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Componente Dinámico Seguro
const ScriptViewer = dynamic(
  () => import('./script-viewer').then((mod) => mod.ScriptViewer),
  { 
    ssr: false, 
    loading: () => (
        <div className="h-24 w-full flex items-center justify-center text-muted-foreground animate-pulse">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Cargando guion...
        </div>
    )
  }
);

interface PodcastViewProps { 
  podcastData: PodcastWithProfile;
  user: User; 
  initialIsLiked: boolean; 
}

interface SourceItem {
  title?: string;
  url?: string;
  snippet?: string;
}

export function PodcastView({ podcastData, user, initialIsLiked }: PodcastViewProps) {
  const router = useRouter();
  const { supabase } = useAuth();
  
  // Conectamos con el reproductor global para verificar la escucha
  const { playPodcast, logInteractionEvent, currentPodcast, currentTime, duration: currentDuration } = useAudio();
  
  const { toast } = useToast();
  
  const [localPodcastData, setLocalPodcastData] = useState(podcastData);
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likeCount, setLikeCount] = useState(localPodcastData.like_count);
  const [isLiking, setIsLiking] = useState(false);
  
  // Estados de UI
  const [isScriptExpanded, setIsScriptExpanded] = useState(false);
  const [isSourcesExpanded, setIsSourcesExpanded] = useState(false); 
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [isEditingTags, setIsEditingTags] = useState(false);
  const [viewerRole, setViewerRole] = useState<string>('user');

  // Lógica de Validación de Escucha
  const [hasListenedFully, setHasListenedFully] = useState(false);
  const [listeningProgress, setListeningProgress] = useState(0);

  useEffect(() => {
    setLocalPodcastData(podcastData);
    setLikeCount(podcastData.like_count);
    setIsLiked(initialIsLiked);
  }, [podcastData, initialIsLiked]);

  // 1. Obtener Rol del Visitante (Para Admin Kill-Switch)
  useEffect(() => {
    const fetchRole = async () => {
        if (!user) return;
        const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        if (data?.role) setViewerRole(data.role);
    };
    fetchRole();
  }, [user, supabase]);

  // 2. Monitor de Progreso de Escucha (Workflow: 95% = Completo)
  useEffect(() => {
    // Si ya lo escuchó o el podcast no es este, no hacer nada
    if (hasListenedFully) return;
    if (currentPodcast?.id !== localPodcastData.id) return;

    if (currentDuration > 0) {
        const percent = (currentTime / currentDuration) * 100;
        setListeningProgress(percent);
        
        // Umbral del 95% para considerar "Escuchado"
        if (percent > 95) {
            setHasListenedFully(true);
        }
    }
  }, [currentTime, currentDuration, currentPodcast, localPodcastData.id, hasListenedFully]);

  // Real-time Subscription
  useEffect(() => {
    const wasAudioRequested = localPodcastData.creation_data?.inputs?.generateAudioDirectly ?? true;
    const isAudioComplete = !!localPodcastData.audio_url;
    const isImageComplete = !!localPodcastData.cover_image_url;
    const isPodcastComplete = isImageComplete && (isAudioComplete || !wasAudioRequested);

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
  }, [supabase, localPodcastData.id, localPodcastData.audio_url, localPodcastData.cover_image_url, localPodcastData.creation_data]);

  const isOwner = user?.id === localPodcastData.user_id;
  const isAdmin = viewerRole === 'admin';

  const displayTags = useMemo(() => {
    const userTags = localPodcastData.user_tags;
    const aiTags = localPodcastData.ai_tags;
    if (userTags && userTags.length > 0) return userTags;
    if (aiTags && aiTags.length > 0) return aiTags;
    return [];
  }, [localPodcastData.ai_tags, localPodcastData.user_tags]);

  const displaySources: SourceItem[] = useMemo(() => {
    const rawSources = (localPodcastData as any).sources; 
    if (Array.isArray(rawSources)) {
        return rawSources.filter(s => s.title || s.url); 
    }
    return [];
  }, [localPodcastData]);

  const normalizedScriptText = useMemo(() => {
    const rawScript = localPodcastData.script_text;
    if (!rawScript) return null;
    try {
      const parsed = JSON.parse(rawScript);
      if (parsed.script_body) return parsed.script_body;
      if (Array.isArray(parsed)) return parsed.map((l: any) => l.line).join('\n\n');
      return String(parsed);
    } catch (e) {
      return rawScript;
    }
  }, [localPodcastData.script_text]);

  const profileUrl = useMemo(() => {
    const username = localPodcastData.profiles?.username;
    if (username && typeof username === 'string' && username.trim() !== '') {
        return `/profile/${username.trim()}`;
    }
    return null; 
  }, [localPodcastData.profiles]);

  // --- ACTIONS ---

  const handleSaveTags = async (finalTags: string[]) => {
    const { error } = await supabase
      .from('micro_pods')
      .update({ user_tags: finalTags })
      .eq('id', localPodcastData.id);

    if (error) {
      toast({ title: "Error", description: "No se pudieron guardar las etiquetas.", variant: "destructive" });
    } else {
      setLocalPodcastData(prev => ({ ...prev, user_tags: finalTags }));
      toast({ title: "Éxito", description: "Tus etiquetas han sido actualizadas." });
    }
  };

  const handlePublishToCommunity = async () => {
    if (!hasListenedFully) {
        toast({ title: "Escucha requerida", description: "Debes escuchar el episodio completo antes de publicarlo.", variant: "destructive" });
        return;
    }

    const { error } = await supabase
        .from('micro_pods')
        .update({ 
            status: 'published',
            reviewed_by_user: true,
            published_at: new Date().toISOString()
        })
        .eq('id', localPodcastData.id);

    if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
        setLocalPodcastData(prev => ({ ...prev, status: 'published' }));
        toast({ 
            title: "¡Publicado!", 
            description: "Tu podcast ahora es visible para la comunidad.", 
            action: <CheckCircle className="h-5 w-5 text-green-500"/> 
        });
    }
  };

  const handleAdminBan = async () => {
    if (!confirm("¿Estás seguro de que quieres BANEAR este contenido? Desaparecerá del feed.")) return;

    const { error } = await supabase
        .from('micro_pods')
        .update({ 
            status: 'archived', // O 'failed' según prefieras
            admin_notes: `Banned by Admin ${user.id} at ${new Date().toISOString()}`
        })
        .eq('id', localPodcastData.id);

    if (error) {
        toast({ title: "Error Admin", description: error.message, variant: "destructive" });
    } else {
        setLocalPodcastData(prev => ({ ...prev, status: 'archived' }));
        toast({ title: "BANNED", description: "Contenido eliminado del feed público.", variant: "destructive" });
    }
  };

  const handleLike = async () => {
    if (!supabase || !user) {
        toast({ title: "Acción requerida", description: "Debes iniciar sesión para dar 'like'.", variant: "destructive" });
        return;
    }
    setIsLiking(true);

    if (isLiked) {
      setIsLiked(false);
      setLikeCount((c) => (c > 0 ? c - 1 : 0));
      const { error } = await supabase.from('likes').delete().match({ user_id: user.id, podcast_id: localPodcastData.id });
      if (error) {
        setIsLiked(true);
        setLikeCount((c) => c + 1);
        toast({ title: "Error", description: "No se pudo quitar el 'like'.", variant: "destructive" });
      }
    } else {
      setIsLiked(true);
      setLikeCount((c) => c + 1);
      const { error } = await supabase.from('likes').insert({ user_id: user.id, podcast_id: localPodcastData.id });
      if (error) {
        setIsLiked(false);
        setLikeCount((c) => (c > 0 ? c - 1 : 0));
        toast({ title: "Error", description: "No se pudo dar 'like'.", variant: "destructive" });
      } else {
        logInteractionEvent(localPodcastData.id, 'liked');
      }
    }
    setIsLiking(false);
  };

  const handleGenerateAudio = async () => {
    if (!supabase) { toast({ title: "Error de conexión", variant: "destructive" }); return; }
    setIsGeneratingAudio(true);
    toast({ title: "Iniciando...", description: "Tu audio estará listo en unos momentos." });

    try {
      const { data: job, error: jobError } = await supabase
        .from('podcast_creation_jobs')
        .select('id')
        .eq('micro_pod_id', localPodcastData.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (jobError || !job) throw new Error("Job original no encontrado.");

      setLocalPodcastData(prev => ({...prev, status: 'pending_approval'}));
      
      const { error: invokeError } = await supabase.functions.invoke('generate-audio-from-script', {
        body: { job_id: job.id }
      });
      if (invokeError) throw invokeError;
      
    } catch (error) {
      console.error("Error audio gen:", error);
      toast({ title: "Error", description: "No se pudo iniciar la generación.", variant: "destructive" });
      setIsGeneratingAudio(false);
      setLocalPodcastData(prev => ({...prev, status: 'published'}));
    }
  };

  return (
    <>
      <div className="container mx-auto max-w-7xl py-8 md:py-12 px-4">
        
        {/* --- ZONA DE SEGURIDAD ADMIN --- */}
        {isAdmin && (
            <Alert variant="destructive" className="mb-6 border-red-500/50 bg-red-500/10">
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>Modo Administrador</AlertTitle>
                <AlertDescription className="flex justify-between items-center">
                    <span>Tienes privilegios de moderación sobre este contenido.</span>
                    {localPodcastData.status !== 'archived' && (
                        <Button variant="destructive" size="sm" onClick={handleAdminBan}>
                            BANEAR CONTENIDO
                        </Button>
                    )}
                </AlertDescription>
            </Alert>
        )}

        {/* --- BANNER DE ESTADO PRIVADO (SOLO DUEÑO) --- */}
        {isOwner && localPodcastData.status === 'pending_approval' && (
             <div className="mb-6 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 backdrop-blur-sm animate-in fade-in slide-in-from-top-2">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-500/20 rounded-full text-yellow-500">
                            <Lock className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-foreground">Modo Privado (Borrador)</h3>
                            <p className="text-sm text-muted-foreground">
                                Solo tú puedes ver esto. Escucha el audio completo para verificarlo antes de publicar.
                            </p>
                        </div>
                    </div>
                    
                    <div className="w-full md:w-auto flex flex-col items-end gap-2">
                        <Button 
                            onClick={handlePublishToCommunity}
                            disabled={!hasListenedFully}
                            className={cn(
                                "w-full md:w-auto font-bold transition-all duration-500",
                                hasListenedFully 
                                    ? "bg-green-600 hover:bg-green-700 text-white shadow-[0_0_15px_rgba(34,197,94,0.4)]" 
                                    : "bg-muted text-muted-foreground cursor-not-allowed opacity-80"
                            )}
                        >
                            {hasListenedFully ? (
                                <><Users className="mr-2 h-4 w-4" /> PUBLICAR A LA COMUNIDAD</>
                            ) : (
                                <><PlayCircle className="mr-2 h-4 w-4" /> ESCUCHA PARA DESBLOQUEAR ({Math.round(listeningProgress)}%)</>
                            )}
                        </Button>
                        
                        {!hasListenedFully && (
                            <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-yellow-500 transition-all duration-300" style={{ width: `${listeningProgress}%` }} />
                            </div>
                        )}
                    </div>
                </div>
             </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8 items-start relative">
          
          {/* COLUMNA IZQUIERDA */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-card/50 backdrop-blur-lg border-border/20 shadow-lg overflow-hidden">
              
              {localPodcastData.cover_image_url && (
                <div className="aspect-video relative w-full bg-black/5">
                  <Image 
                    src={localPodcastData.cover_image_url} 
                    alt={`Carátula de ${localPodcastData.title}`} 
                    fill 
                    style={{ objectFit: 'cover' }} 
                    className="animate-fade-in" 
                    priority 
                  />
                </div>
              )}

              <CardHeader className="p-5 md:p-8">
                <div className="flex justify-between items-start gap-4">
                    <Badge variant={localPodcastData.status === 'published' ? 'default' : 'secondary'} className="mb-3 w-fit capitalize px-3 py-1 text-xs font-semibold tracking-wide">
                        {localPodcastData.status === 'pending_approval' ? 'Borrador Privado' : localPodcastData.status.replace('_', ' ')}
                    </Badge>
                </div>
                
                <CardTitle className="text-2xl md:text-4xl font-bold leading-tight tracking-tight">
                    {localPodcastData.title}
                </CardTitle>
                <CardDescription className="pt-3 text-base md:text-lg text-muted-foreground/90 leading-relaxed">
                    {localPodcastData.description}
                </CardDescription>
                
                <Separator className="my-6 md:my-8" />

                {/* ETIQUETAS */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <Tag className="h-4 w-4" />
                      <span>{localPodcastData.user_tags?.length ? 'Etiquetas Curadas' : 'Conceptos Clave'}</span>
                    </div>
                    {isOwner && (
                      <Button variant="ghost" size="sm" onClick={() => setIsEditingTags(true)} className="h-8 text-xs hover:bg-secondary/50">
                        <Pencil className="h-3.5 w-3.5 mr-1.5" />
                        Editar
                      </Button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {displayTags.length > 0 ? (
                      displayTags.map(tag => (
                        <Badge key={tag} variant="outline" className="bg-background/40 hover:bg-background/70 transition-colors px-3 py-1 text-xs">
                          {tag}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground italic">Sin etiquetas.</span>
                    )}
                  </div>
                </div>

                {/* FUENTES */}
                {displaySources.length > 0 && (
                  <div className="rounded-xl border border-primary/10 bg-primary/5 dark:bg-primary/10 overflow-hidden transition-all duration-300">
                      <Collapsible open={isSourcesExpanded} onOpenChange={setIsSourcesExpanded}>
                        <CollapsibleTrigger asChild>
                          <div className="flex justify-between items-center cursor-pointer p-4 hover:bg-primary/5 transition-colors group select-none">
                            <div className="flex items-center gap-2.5 text-primary">
                                <Globe className="h-5 w-5" />
                                <span className="font-semibold text-sm">
                                  {displaySources.length} Fuentes de Investigación
                                </span>
                            </div>
                            <div className="bg-background/50 p-1 rounded-full group-hover:bg-background/80 transition-colors">
                                <ChevronDown className={cn("h-4 w-4 text-primary/70 transition-transform duration-300", isSourcesExpanded && 'rotate-180')} />
                            </div>
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="animate-slide-down">
                            <div className="max-h-[400px] overflow-y-auto p-4 pt-0 space-y-2 custom-scrollbar">
                                <div className="h-px w-full bg-primary/10 mb-4" />
                                {displaySources.map((source, idx) => (
                                    <div key={idx} className={cn("group relative p-3 rounded-lg bg-background/60 border border-border/40 hover:border-primary/20 hover:shadow-sm transition-all", source.url && "cursor-pointer hover:bg-background/80")} onClick={() => source.url && window.open(source.url, '_blank')}>
                                        <div className="flex flex-col gap-1">
                                            <div className="flex justify-between items-start gap-3">
                                                <span className="font-medium text-sm text-foreground leading-snug line-clamp-2">{source.title || "Fuente"}</span>
                                                {source.url && <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors mt-0.5 flex-shrink-0" />}
                                            </div>
                                            {source.snippet && <p className="text-xs text-muted-foreground/80 line-clamp-2 border-l-2 border-primary/20 pl-2 mt-1 italic">{source.snippet}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CollapsibleContent>
                      </Collapsible>
                  </div>
                )}

              </CardHeader>
              
              <CardContent className="p-5 pt-0 md:p-8 md:pt-0">
                <Separator className="my-6" />
                
                {/* --- GUION COMPLETO (Renderizando texto normalizado) --- */}
                <Collapsible open={isScriptExpanded} onOpenChange={setIsScriptExpanded}>
                  <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold tracking-tight text-foreground">Guion del Episodio</h3>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="gap-2 text-primary hover:text-primary/80 hover:bg-primary/5">
                            {isScriptExpanded ? 'Ocultar Texto' : 'Leer Completo'}
                            <ChevronDown className={cn("h-4 w-4 transition-transform duration-300", isScriptExpanded && 'rotate-180')} />
                        </Button>
                      </CollapsibleTrigger>
                  </div>
                  
                  <CollapsibleContent className="animate-slide-down">
                    <div className="p-4 bg-secondary/20 rounded-xl border border-border/50">
                        <ScriptViewer scriptText={normalizedScriptText} />
                    </div>
                  </CollapsibleContent>
                </Collapsible>

              </CardContent>
            </Card>
          </div>

          {/* COLUMNA DERECHA */}
          <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-24 lg:self-start">
            <Card className="bg-card/50 backdrop-blur-lg border-border/20 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <PlayCircle className="h-5 w-5 text-primary" />
                    {localPodcastData.audio_url ? "Reproducir Episodio" : "Estado del Audio"}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {localPodcastData.audio_url ? (
                  <Button size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md transition-all active:scale-[0.98] h-12 text-base font-semibold" onClick={() => playPodcast(localPodcastData)}>
                    Reproducir Ahora
                  </Button>
                ) : ( (localPodcastData.status !== 'published' && localPodcastData.status !== 'pending_approval') || isGeneratingAudio ? (
                  <Button size="lg" className="w-full opacity-80 cursor-wait" disabled>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Procesando...
                  </Button>
                ) : (
                  <Button size="lg" variant="outline" className="w-full border-primary/50 hover:bg-primary/5" onClick={handleGenerateAudio} disabled={isGeneratingAudio}>
                    <Mic className="mr-2 h-4 w-4" /> Generar Audio
                  </Button>
                ))}
                
                <div className="flex justify-between items-center pt-2 px-2">
                  <div className="flex items-center gap-1">
                    <Button onClick={handleLike} variant="ghost" size="icon" disabled={isLiking} className="hover:bg-red-500/10 hover:text-red-500 h-9 w-9">
                      <Heart className={cn("h-5 w-5 transition-all", isLiked ? 'text-red-500 fill-current scale-110' : 'text-muted-foreground')} />
                    </Button>
                    <span className="text-sm font-medium text-muted-foreground tabular-nums">{likeCount ?? 0}</span>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground"><Share2 className="h-4.5 w-4.5" /></Button>
                    <Button variant="ghost" size="icon" disabled={!localPodcastData.audio_url} className="h-9 w-9 text-muted-foreground hover:text-foreground disabled:opacity-30"><Download className="h-4.5 w-4.5" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-card/30 backdrop-blur-sm border-border/10 shadow-sm">
              <CardContent className="p-5 text-sm space-y-5">
                
                {profileUrl ? (
                  <Link href={profileUrl} className="block group">
                    <div className="flex items-center gap-3 p-3 bg-background/40 rounded-xl border border-border/30 transition-all duration-300 group-hover:bg-background/60 group-hover:border-primary/20 group-hover:shadow-md">
                      <div className="relative h-10 w-10">
                        <Image 
                          src={localPodcastData.profiles?.avatar_url || '/images/placeholder.svg'} 
                          alt={localPodcastData.profiles?.full_name || 'Creador'} 
                          fill 
                          style={{ objectFit: 'cover' }}
                          className="rounded-full border border-border shadow-sm group-hover:scale-105 transition-transform" 
                        />
                      </div>
                      <div className="overflow-hidden flex-1">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1">
                          Creado por <ExternalLink className="h-2.5 w-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </p>
                        <p className="font-medium truncate text-foreground group-hover:text-primary transition-colors">
                          {localPodcastData.profiles?.full_name || 'Usuario NicePod'}
                        </p>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-background/40 rounded-xl border border-border/30 opacity-80 cursor-default">
                    <div className="relative h-10 w-10">
                        <Image 
                          src={localPodcastData.profiles?.avatar_url || '/images/placeholder.svg'} 
                          alt={localPodcastData.profiles?.full_name || 'Creador'} 
                          fill 
                          style={{ objectFit: 'cover' }}
                          className="rounded-full border border-border shadow-sm" 
                        />
                    </div>
                    <div className="overflow-hidden flex-1">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Creado por</p>
                        <p className="font-medium truncate text-foreground">
                          {localPodcastData.profiles?.full_name || 'Usuario NicePod'}
                        </p>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1 p-2 rounded-lg hover:bg-background/30 transition-colors">
                    <div className="flex items-center text-muted-foreground text-xs font-medium">
                      <Calendar className="h-3.5 w-3.5 mr-1.5" /> Publicado
                    </div>
                    <p className="font-medium pl-5">{new Date(localPodcastData.created_at).toLocaleDateString()}</p>
                  </div>
                  {(localPodcastData.duration_seconds ?? 0) > 0 && (
                    <div className="space-y-1 p-2 rounded-lg hover:bg-background/30 transition-colors">
                      <div className="flex items-center text-muted-foreground text-xs font-medium">
                        <Clock className="h-3.5 w-3.5 mr-1.5" /> Duración
                      </div>
                      <p className="font-medium pl-5">{formatTime(localPodcastData.duration_seconds!)}</p>
                    </div>
                  )}
                </div>
                
                <Separator />
                
                <CreationMetadata data={localPodcastData.creation_data} />
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
      
      {isOwner && (
        <TagCurationCanvas 
          isOpen={isEditingTags}
          onOpenChange={setIsEditingTags}
          suggestedTags={localPodcastData.ai_tags || []}
          publishedTags={localPodcastData.user_tags || []}
          onSave={handleSaveTags}
        />
      )}
    </>
  );
}