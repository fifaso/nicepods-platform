// components/podcast-view.tsx
// VERSIÓN FINAL: Integra visualización de Fuentes Científicas (Grounding) + UI de Etiquetas.

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
  const [isSourcesExpanded, setIsSourcesExpanded] = useState(false); // Nuevo estado para fuentes
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [isEditingTags, setIsEditingTags] = useState(false);

  useEffect(() => {
    setLocalPodcastData(podcastData);
    setLikeCount(podcastData.like_count);
    setIsLiked(initialIsLiked);
  }, [podcastData, initialIsLiked]);

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

  // [NUEVO]: Extracción segura de fuentes (el tipo puede no estar actualizado en TS, así que casteamos o accedemos con seguridad)
  const displaySources = (localPodcastData as any).sources || [];

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
        body: {
          job_id: job.id,
        }
      });
      
      if (invokeError) {
        throw invokeError;
      }
      
    } catch (error) {
      console.error("Error al iniciar la generación de audio:", error);
      toast({ title: "Error", description: "No se pudo iniciar la generación de audio. Inténtalo de nuevo.", variant: "destructive" });
      setIsGeneratingAudio(false);
      setLocalPodcastData(prev => ({...prev, status: 'published'}));
    }
  };

  return (
    <>
      <div className="container mx-auto max-w-7xl py-12 px-4">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-card/50 backdrop-blur-lg border-border/20 shadow-lg overflow-hidden">
              {localPodcastData.cover_image_url && (
                <div className="aspect-video relative w-full">
                  <Image src={localPodcastData.cover_image_url} alt={`Carátula de ${localPodcastData.title}`} fill style={{ objectFit: 'cover' }} className="animate-fade-in" priority />
                </div>
              )}
              <CardHeader className="p-4">
                <Badge variant="secondary" className="mb-2 w-fit">{localPodcastData.status}</Badge>
                <CardTitle className="text-3xl font-bold">{localPodcastData.title}</CardTitle>
                <CardDescription className="pt-2">{localPodcastData.description}</CardDescription>
                
                <Separator className="my-4" />

                {/* SECCIÓN DE ETIQUETAS */}
                <div className="mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Tag className="h-4 w-4" />
                      <h4>{localPodcastData.user_tags && localPodcastData.user_tags.length > 0 ? 'Etiquetas' : 'Sugerencias de la IA'}</h4>
                    </div>
                    {isOwner && (
                      <Button variant="ghost" size="sm" onClick={() => setIsEditingTags(true)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Revisar y Curar
                      </Button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {displayTags.length > 0 ? (
                      displayTags.map(tag => (
                        <Badge key={tag} variant={localPodcastData.user_tags && localPodcastData.user_tags.length > 0 ? 'default' : 'outline'}>
                          {tag}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No hay etiquetas para este podcast.</p>
                    )}
                  </div>
                </div>

                {/* [NUEVO]: SECCIÓN DE FUENTES CIENTÍFICAS (SI EXISTEN) */}
                {displaySources && displaySources.length > 0 && (
                  <div className="mt-6">
                      <Collapsible open={isSourcesExpanded} onOpenChange={setIsSourcesExpanded}>
                        <CollapsibleTrigger asChild>
                          <div className="flex justify-between items-center cursor-pointer group p-3 bg-secondary/10 rounded-lg hover:bg-secondary/20 transition-colors">
                            <div className="flex items-center gap-2 text-blue-500">
                                <BookOpen className="h-4 w-4" />
                                <h4 className="font-semibold text-sm">Fuentes de Investigación ({displaySources.length})</h4>
                            </div>
                            <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform duration-300", isSourcesExpanded && 'rotate-180')} />
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="pt-2 space-y-2">
                            {displaySources.map((source: any, idx: number) => (
                                <div key={idx} className="p-3 border border-border/30 rounded-lg bg-background/40 text-sm">
                                    <div className="flex justify-between items-start gap-2">
                                        <span className="font-medium text-foreground">{source.title || "Fuente sin título"}</span>
                                        {source.url && (
                                            <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-1 whitespace-nowrap">
                                                Ver <ExternalLink className="h-3 w-3" />
                                            </a>
                                        )}
                                    </div>
                                    {source.snippet && (
                                        <p className="text-muted-foreground text-xs mt-1 italic border-l-2 border-primary/20 pl-2">
                                            "{source.snippet}"
                                        </p>
                                    )}
                                </div>
                            ))}
                        </CollapsibleContent>
                      </Collapsible>
                  </div>
                )}

              </CardHeader>
              <CardContent className="p-4 pt-0">
                <Separator className="my-4" />
                
                {/* SECCIÓN DE GUION */}
                <Collapsible open={isScriptExpanded} onOpenChange={setIsScriptExpanded}>
                  <CollapsibleTrigger asChild>
                    <div className="flex justify-between items-center cursor-pointer mb-4 group">
                      <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">Guion del Podcast</h3>
                      <ChevronDown className={cn("h-5 w-5 text-muted-foreground transition-transform duration-300", isScriptExpanded && 'rotate-180')} />
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <ScriptViewer scriptText={localPodcastData.script_text} />
                  </CollapsibleContent>
                </Collapsible>

              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-card/50 backdrop-blur-lg border-border/20 shadow-lg">
              <CardHeader>
                <CardTitle>
                  {localPodcastData.audio_url 
                    ? "Podcast Completo" 
                    : (localPodcastData.status !== 'published' || isGeneratingAudio)
                      ? "Procesando Audio..." 
                      : "Generar Audio"}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {localPodcastData.audio_url ? (
                  <Button size="lg" className="w-full bg-green-500 hover:bg-green-600" onClick={() => playPodcast(localPodcastData)}>
                    <PlayCircle className="mr-2 h-5 w-5" />Reproducir Audio
                  </Button>
                ) : ( (localPodcastData.status !== 'published' || isGeneratingAudio) ? (
                  <Button size="lg" className="w-full" disabled>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generando Audio
                  </Button>
                ) : (
                  <Button size="lg" className="w-full" onClick={handleGenerateAudio} disabled={isGeneratingAudio}>
                    <Mic className="mr-2 h-5 w-5" />Generar Audio
                  </Button>
                ))}
                <div className="flex justify-around items-center">
                  <div className="flex items-center gap-1">
                    <Button onClick={handleLike} variant="ghost" size="icon" disabled={isLiking}>
                      <Heart className={cn("h-5 w-5 transition-colors", isLiked ? 'text-red-500 fill-current' : 'text-muted-foreground')} />
                    </Button>
                    <span className="text-sm text-muted-foreground w-4 text-center">{likeCount ?? 0}</span>
                  </div>
                  <Button variant="ghost" size="icon" disabled><Share2 className="h-5 w-5 text-muted-foreground" /></Button>
                  <Button variant="ghost" size="icon" disabled={!localPodcastData.audio_url}><Download className="h-5 w-5 text-muted-foreground" /></Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-card/50 backdrop-blur-lg border-border/20 shadow-lg">
              <CardHeader>
                <CardTitle>Metadatos</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-4">
                <div className="flex items-center">
                  <Image src={localPodcastData.profiles?.avatar_url || '/images/placeholder.svg'} alt={localPodcastData.profiles?.full_name || 'Creador'} width={24} height={24} className="rounded-full mr-2" />
                  <span className="font-medium">{localPodcastData.profiles?.full_name || 'Creador Anónimo'}</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Creado el: {new Date(localPodcastData.created_at).toLocaleDateString()}</span>
                </div>
                
                {(localPodcastData.duration_seconds ?? 0) > 0 && (
                  <div className="flex items-center text-muted-foreground">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>Duración: {formatTime(localPodcastData.duration_seconds!)}</span>
                  </div>
                )}
                
                <Separator className="my-4" />
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