// components/podcast-view.tsx
// VERSIÓN FINAL Y VICTORIOSA: Permite la generación de audio bajo demanda.

"use client";

import { useState, useEffect } from 'react';
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
import { Heart, Share2, Download, Calendar, Clock, PlayCircle, ChevronDown, Loader2, Mic } from 'lucide-react'; // Cambiamos MicOff por Mic
import { CreationMetadata } from './creation-metadata';
import { formatTime } from '@/lib/utils';
import { ScriptViewer } from './script-viewer';
import { cn } from '@/lib/utils';

interface PodcastViewProps { 
  podcastData: PodcastWithProfile;
  user: User; 
  initialIsLiked: boolean; 
}

export function PodcastView({ podcastData, user, initialIsLiked }: PodcastViewProps) {
  const router = useRouter();
  const { supabase } = useAuth();
  const { playPodcast } = useAudio();
  const { toast } = useToast();
  
  const [localPodcastData, setLocalPodcastData] = useState(podcastData);
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likeCount, setLikeCount] = useState(localPodcastData.like_count);
  const [isLiking, setIsLiking] = useState(false);
  const [isScriptExpanded, setIsScriptExpanded] = useState(false);
  // [INTERVENCIÓN ESTRATÉGICA] Nuevo estado para gestionar la carga de la generación manual de audio.
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);

  useEffect(() => {
    setLocalPodcastData(podcastData);
    setLikeCount(podcastData.like_count);
    setIsLiked(initialIsLiked);
  }, [podcastData, initialIsLiked]);

  useEffect(() => {
    // Si ya hay un audio, o si ya estamos en proceso de generar uno manualmente, no necesitamos suscribirnos.
    if (!supabase || localPodcastData.audio_url || isGeneratingAudio) { return; }

    const channel = supabase.channel(`micro_pod_${localPodcastData.id}`)
      .on<PodcastWithProfile>(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'micro_pods', filter: `id=eq.${localPodcastData.id}` },
        (payload) => {
          if (payload.new.audio_url) {
            console.log("¡Audio detectado! Actualizando UI en tiempo real...");
            setLocalPodcastData(prevData => ({ ...prevData, ...payload.new }));
            setIsGeneratingAudio(false); // Detenemos el estado de carga
          }
        }
      ).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [supabase, localPodcastData.id, localPodcastData.audio_url, isGeneratingAudio]);

  const handleLike = async () => { /* ... (sin cambios) ... */ };

  // [INTERVENCIÓN ESTRATÉGICA] Nueva función para iniciar la generación de audio bajo demanda.
  const handleGenerateAudio = async () => {
    if (!supabase) {
      toast({ title: "Error de conexión", variant: "destructive" });
      return;
    }
    setIsGeneratingAudio(true);
    toast({ title: "Iniciando generación de audio...", description: "Tu audio estará listo en unos momentos." });

    try {
      // 1. Encontrar el job_id original asociado a este podcast.
      const { data: job, error: jobError } = await supabase
        .from('podcast_creation_jobs')
        .select('id')
        .eq('micro_pod_id', localPodcastData.id)
        .single();

      if (jobError || !job) {
        throw new Error("No se pudo encontrar el trabajo de creación original asociado a este podcast.");
      }

      // 2. Actualizar el estado del podcast en la UI para una respuesta inmediata.
      setLocalPodcastData(prev => ({...prev, status: 'pending_approval'}));
      
      // 3. Invocar al dispatcher para que inicie la función de generación de audio.
      const { error: invokeError } = await supabase.functions.invoke('secure-webhook-dispatcher', {
        body: {
          job_id: job.id,
          target_webhook_url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/generate-audio-from-script`
        }
      });
      
      if (invokeError) {
        throw invokeError;
      }
      
    } catch (error) {
      console.error("Error al iniciar la generación de audio:", error);
      toast({ title: "Error", description: "No se pudo iniciar la generación de audio. Inténtalo de nuevo.", variant: "destructive" });
      setIsGeneratingAudio(false); // Revertir el estado de carga si hay un error
      setLocalPodcastData(prev => ({...prev, status: 'published'})); // Revertir estado del podcast
    }
  };


  return (
    <>
      <div className="container mx-auto max-w-7xl py-12 px-4">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="bg-card/50 backdrop-blur-lg border-border/20 shadow-lg">
              <CardHeader className="p-4">
                <Badge variant="secondary" className="mb-2 w-fit">{localPodcastData.status === 'published' ? 'Publicado' : 'Procesando'}</Badge>
                <CardTitle className="text-3xl font-bold">{localPodcastData.title}</CardTitle>
                <CardDescription className="pt-2">{localPodcastData.description}</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <Separator className="my-4" />
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
                {/* [INTERVENCIÓN ESTRATÉGICA FINAL] Lógica de renderizado de 3+1 estados */}
                {localPodcastData.audio_url ? (
                  // Estado 1: El audio existe y está listo para reproducir.
                  <Button size="lg" className="w-full bg-green-500 hover:bg-green-600" onClick={() => playPodcast(localPodcastData)}>
                    <PlayCircle className="mr-2 h-5 w-5" />Reproducir Audio
                  </Button>
                ) : (localPodcastData.status !== 'published' || isGeneratingAudio) ? (
                  // Estado 2: El audio se está procesando (ya sea inicialmente o por acción manual).
                  <Button size="lg" className="w-full" disabled>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generando Audio
                  </Button>
                ) : (
                  // Estado 3: Es un podcast de solo guion, listo para generar el audio.
                  <Button size="lg" className="w-full" onClick={handleGenerateAudio} disabled={isGeneratingAudio}>
                    <Mic className="mr-2 h-5 w-5" />Generar Audio
                  </Button>
                )}
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
                {localPodcastData.duration_seconds && localPodcastData.duration_seconds > 0 &&
                  <div className="flex items-center text-muted-foreground">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>Duración: {formatTime(localPodcastData.duration_seconds)}</span>
                  </div>
                }
                
                {localPodcastData.creation_data && (
                  <>
                    <Separator className="my-4" />
                    <CreationMetadata data={localPodcastData.creation_data} />
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}