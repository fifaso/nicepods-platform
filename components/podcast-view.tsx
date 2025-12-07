// components/podcast-view.tsx
// VERSIÓN: 5.8 (UI Final: Acordeón de Fuentes Científicas + Correcciones de Tipado)

"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import Image from 'next/image';

import { PodcastWithProfile } from '@/types/podcast';
import { useAuth } from '@/hooks/use-auth';
import { useAudio } from '@/contexts/audio-context';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Heart, Share2, Download, Calendar, Clock, PlayCircle, ChevronDown, Loader2, Mic, Tag, Pencil, BookOpen, ExternalLink } from 'lucide-react';
import { CreationMetadata } from './creation-metadata';
import { formatTime } from '@/lib/utils';
import { ScriptViewer } from './script-viewer';
import { cn } from '@/lib/utils';
import { TagCurationCanvas } from './tag-curation-canvas';

interface PodcastViewProps { 
  podcastData: PodcastWithProfile;
  user: User; 
  initialIsLiked: boolean; 
}

// Definición local de la interfaz de Fuente para seguridad de tipos
interface SourceItem {
  title?: string;
  url?: string;
  snippet?: string;
}

export function PodcastView({ podcastData, user, initialIsLiked }: PodcastViewProps) {
  const router = useRouter();
  const { supabase } = useAuth();
  const { playPodcast, logInteractionEvent } = useAudio();
  const { toast } = useToast();
  
  const [localPodcastData, setLocalPodcastData] = useState(podcastData);
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likeCount, setLikeCount] = useState(localPodcastData.like_count);
  const [isLiking, setIsLiking] = useState(false);
  const [isScriptExpanded, setIsScriptExpanded] = useState(false);
  const [isSourcesExpanded, setIsSourcesExpanded] = useState(false); 
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [isEditingTags, setIsEditingTags] = useState(false);

  useEffect(() => {
    setLocalPodcastData(podcastData);
    setLikeCount(podcastData.like_count);
    setIsLiked(initialIsLiked);
  }, [podcastData, initialIsLiked]);

  // Suscripción a cambios en tiempo real (para actualizar cuando el audio esté listo)
  useEffect(() => {
    const wasAudioRequested = localPodcastData.creation_data?.inputs?.generateAudioDirectly ?? true;
    const isAudioComplete = !!localPodcastData.audio_url;
    const isImageComplete = !!localPodcastData.cover_image_url;
    const isPodcastComplete = isImageComplete && (isAudioComplete || !wasAudioRequested);

    if (!supabase || isPodcastComplete) { 
      return; 
    }

    const channel = supabase.channel(`micro_pod_${localPodcastData.id}`)
      .on<PodcastWithProfile>(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'micro_pods', filter: `id=eq.${localPodcastData.id}` },
        (payload) => {
          console.log("Cambio detectado en el podcast:", payload.new);
          setLocalPodcastData(prevData => ({ ...prevData, ...(payload.new as PodcastWithProfile) }));
          
          if (payload.new.audio_url) {
            setIsGeneratingAudio(false);
          }
        }
      ).subscribe();
      
    return () => { 
      supabase.removeChannel(channel); 
    };
  }, [supabase, localPodcastData.id, localPodcastData.audio_url, localPodcastData.cover_image_url, localPodcastData.creation_data]);

  const isOwner = user?.id === localPodcastData.user_id;

  const displayTags = useMemo(() => {
    const userTags = localPodcastData.user_tags;
    const aiTags = localPodcastData.ai_tags;
    if (userTags && userTags.length > 0) return userTags;
    if (aiTags && aiTags.length > 0) return aiTags;
    return [];
  }, [localPodcastData.ai_tags, localPodcastData.user_tags]);

  // Extracción segura de fuentes. Si no existen, es un array vacío.
  const displaySources: SourceItem[] = (localPodcastData as any).sources || [];

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
    if (!supabase) {
      toast({ title: "Error de conexión", variant: "destructive" });
      return;
    }
    setIsGeneratingAudio(true);
    toast({ title: "Iniciando generación de audio...", description: "Tu audio estará listo en unos momentos." });

    try {
      const { data: job, error: jobError } = await supabase
        .from('podcast_creation_jobs')
        .select('id')
        .eq('micro_pod_id', localPodcastData.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (jobError || !job) {
        throw new Error("No se pudo encontrar el trabajo de creación original asociado a este podcast.");
      }

      setLocalPodcastData(prev => ({...prev, status: 'pending_approval'}));
      
      const { error: invokeError } = await supabase.functions.invoke('generate-audio-from-script', {
        body: { job_id: job.id }
      });
      
      if (invokeError) throw invokeError;
      
    } catch (error) {
      console.error("Error al iniciar la generación de audio:", error);
      toast({ title: "Error", description: "No se pudo iniciar la generación de audio.", variant: "destructive" });
      setIsGeneratingAudio(false);
      setLocalPodcastData(prev => ({...prev, status: 'published'}));
    }
  };

  return (
    <>
      <div className="container mx-auto max-w-7xl py-12 px-4">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* COLUMNA PRINCIPAL (Izquierda) */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-card/50 backdrop-blur-lg border-border/20 shadow-lg overflow-hidden">
              
              {/* Cover Art */}
              {localPodcastData.cover_image_url && (
                <div className="aspect-video relative w-full">
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

              <CardHeader className="p-4 md:p-6">
                <Badge variant="secondary" className="mb-2 w-fit capitalize">{localPodcastData.status.replace('_', ' ')}</Badge>
                <CardTitle className="text-2xl md:text-3xl font-bold leading-tight">{localPodcastData.title}</CardTitle>
                <CardDescription className="pt-2 text-base text-muted-foreground/90">{localPodcastData.description}</CardDescription>
                
                <Separator className="my-6" />

                {/* ETIQUETAS */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <Tag className="h-4 w-4" />
                      <span>{localPodcastData.user_tags?.length ? 'Etiquetas del Creador' : 'Conceptos Clave (IA)'}</span>
                    </div>
                    {isOwner && (
                      <Button variant="ghost" size="sm" onClick={() => setIsEditingTags(true)} className="h-8 text-xs">
                        <Pencil className="h-3.5 w-3.5 mr-1.5" />
                        Editar Etiquetas
                      </Button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {displayTags.length > 0 ? (
                      displayTags.map(tag => (
                        <Badge key={tag} variant="outline" className="bg-background/50 hover:bg-background/80 transition-colors">
                          {tag}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground italic">Sin etiquetas definidas.</span>
                    )}
                  </div>
                </div>

                {/* [MODIFICACIÓN CLAVE]: ACORDEÓN DE FUENTES (Grounding) */}
                {/* Solo se renderiza si hay fuentes válidas */}
                {displaySources.length > 0 && (
                  <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 overflow-hidden transition-all">
                      <Collapsible open={isSourcesExpanded} onOpenChange={setIsSourcesExpanded}>
                        
                        <CollapsibleTrigger asChild>
                          <div className="flex justify-between items-center cursor-pointer p-4 hover:bg-blue-500/10 transition-colors">
                            <div className="flex items-center gap-2.5 text-blue-600 dark:text-blue-400">
                                <BookOpen className="h-5 w-5" />
                                <span className="font-semibold text-sm">
                                  {displaySources.length} Fuentes de Investigación Utilizadas
                                </span>
                            </div>
                            <ChevronDown className={cn("h-4 w-4 text-blue-500/70 transition-transform duration-300", isSourcesExpanded && 'rotate-180')} />
                          </div>
                        </CollapsibleTrigger>

                        <CollapsibleContent>
                            {/* Scroll interno limitado para evitar layout shifts gigantes */}
                            <div className="max-h-[300px] overflow-y-auto p-4 pt-0 space-y-3 custom-scrollbar">
                                <div className="h-px w-full bg-blue-500/10 mb-3" /> {/* Separador sutil */}
                                
                                {displaySources.map((source, idx) => (
                                    <div key={idx} className="group p-3 rounded-lg bg-background/60 border border-border/50 hover:border-blue-500/30 transition-colors">
                                        <div className="flex justify-between items-start gap-3">
                                            <span className="font-medium text-sm text-foreground/90 line-clamp-2">
                                              {source.title || "Fuente Referencial"}
                                            </span>
                                            {source.url && (
                                                <a 
                                                  href={source.url} 
                                                  target="_blank" 
                                                  rel="noopener noreferrer" 
                                                  className="flex-shrink-0 text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 px-2 py-1 rounded-full flex items-center gap-1 transition-colors"
                                                >
                                                    Ver <ExternalLink className="h-3 w-3" />
                                                </a>
                                            )}
                                        </div>
                                        {source.snippet && (
                                            <p className="mt-2 text-xs text-muted-foreground border-l-2 border-blue-500/20 pl-2 italic line-clamp-3">
                                                "{source.snippet}"
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CollapsibleContent>

                      </Collapsible>
                  </div>
                )}

              </CardHeader>
              
              <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
                <Separator className="my-6" />
                
                {/* VISOR DE GUION (ScriptViewer) */}
                <Collapsible open={isScriptExpanded} onOpenChange={setIsScriptExpanded}>
                  <CollapsibleTrigger asChild>
                    <div className="flex justify-between items-center cursor-pointer mb-4 group select-none">
                      <h3 className="text-xl font-bold tracking-tight group-hover:text-primary transition-colors">Guion Completo</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground group-hover:text-primary">
                        <span>{isScriptExpanded ? 'Ocultar' : 'Leer'}</span>
                        <ChevronDown className={cn("h-5 w-5 transition-transform duration-300", isScriptExpanded && 'rotate-180')} />
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="animate-slide-down">
                    <ScriptViewer scriptText={localPodcastData.script_text} />
                  </CollapsibleContent>
                </Collapsible>

              </CardContent>
            </Card>
          </div>

          {/* COLUMNA LATERAL (Derecha - Acciones) */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Tarjeta de Reproducción */}
            <Card className="bg-card/50 backdrop-blur-lg border-border/20 shadow-lg sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg">
                  {localPodcastData.audio_url 
                    ? "Escuchar Ahora" 
                    : (localPodcastData.status !== 'published' || isGeneratingAudio)
                      ? "Procesando Audio..." 
                      : "Audio Pendiente"}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {localPodcastData.audio_url ? (
                  <Button size="lg" className="w-full bg-green-600 hover:bg-green-700 text-white shadow-md transition-all active:scale-95" onClick={() => playPodcast(localPodcastData)}>
                    <PlayCircle className="mr-2 h-5 w-5 fill-current" /> Reproducir
                  </Button>
                ) : ( (localPodcastData.status !== 'published' || isGeneratingAudio) ? (
                  <Button size="lg" className="w-full opacity-80" disabled>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creando...
                  </Button>
                ) : (
                  <Button size="lg" className="w-full" onClick={handleGenerateAudio} disabled={isGeneratingAudio}>
                    <Mic className="mr-2 h-5 w-5" /> Generar Audio
                  </Button>
                ))}
                
                <div className="flex justify-around items-center pt-2">
                  <div className="flex items-center gap-1">
                    <Button onClick={handleLike} variant="ghost" size="icon" disabled={isLiking} className="hover:bg-red-500/10">
                      <Heart className={cn("h-6 w-6 transition-colors", isLiked ? 'text-red-500 fill-current' : 'text-muted-foreground')} />
                    </Button>
                    <span className="text-sm font-medium text-muted-foreground w-6 text-center">{likeCount ?? 0}</span>
                  </div>
                  <Button variant="ghost" size="icon" disabled className="opacity-50"><Share2 className="h-5 w-5 text-muted-foreground" /></Button>
                  <Button variant="ghost" size="icon" disabled={!localPodcastData.audio_url} className={!localPodcastData.audio_url ? "opacity-50" : ""}><Download className="h-5 w-5 text-muted-foreground" /></Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Tarjeta de Metadatos */}
            <Card className="bg-card/30 backdrop-blur-sm border-border/10 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium text-muted-foreground">Información</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-4">
                <div className="flex items-center p-2 bg-background/40 rounded-lg">
                  <Image src={localPodcastData.profiles?.avatar_url || '/images/placeholder.svg'} alt={localPodcastData.profiles?.full_name || 'Creador'} width={32} height={32} className="rounded-full mr-3 border border-border" />
                  <div>
                    <p className="text-xs text-muted-foreground">Creado por</p>
                    <span className="font-medium">{localPodcastData.profiles?.full_name || 'Anónimo'}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center text-muted-foreground text-xs">
                      <Calendar className="h-3.5 w-3.5 mr-1.5" /> Fecha
                    </div>
                    <p className="font-medium">{new Date(localPodcastData.created_at).toLocaleDateString()}</p>
                  </div>
                  {(localPodcastData.duration_seconds ?? 0) > 0 && (
                    <div className="space-y-1">
                      <div className="flex items-center text-muted-foreground text-xs">
                        <Clock className="h-3.5 w-3.5 mr-1.5" /> Duración
                      </div>
                      <p className="font-medium">{formatTime(localPodcastData.duration_seconds!)}</p>
                    </div>
                  )}
                </div>
                
                <Separator className="my-2" />
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