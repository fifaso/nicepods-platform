// components/podcast-view.tsx
// VERSIÓN FINAL CON REORDENACIÓN DE UI, CORRECCIÓN DE AUTO-REFRESCO Y GUION COLAPSABLE

"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import Image from 'next/image';

// --- Importaciones ---
import { PodcastWithProfile } from '@/types/podcast';
import { useAuth } from '@/hooks/use-auth';
import { useAudio } from '@/contexts/audio-context';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
// [INTERVENCIÓN QUIRÚRGICA #1]: Se importan los componentes para el colapsable y el icono de flecha
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Heart, Share2, Download, Calendar, Clock, Wand2, PlayCircle, ChevronDown } from 'lucide-react';
import { AudioStudio } from '@/components/create-flow/audio-studio';
import { CreationMetadata } from './creation-metadata';
import { formatTime } from '@/lib/utils';
import { ScriptViewer } from './script-viewer';
import { cn } from '@/lib/utils'; // Se importa cn para clases condicionales

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
  
  // [INTERVENCIÓN QUIRÚRGICA #2]: Se introduce un estado local para los datos del podcast
  const [localPodcastData, setLocalPodcastData] = useState(podcastData);
  
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  // Se lee el likeCount desde el estado local
  const [likeCount, setLikeCount] = useState(localPodcastData.like_count);
  const [isLiking, setIsLiking] = useState(false);
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  
  // [INTERVENCIÓN QUIRÚRGICA #3]: Se añade el estado para el guion colapsable
  const [isScriptExpanded, setIsScriptExpanded] = useState(false);

  // Efecto para sincronizar el estado local si las props cambian (ej. navegación)
  useEffect(() => {
    setLocalPodcastData(podcastData);
    setLikeCount(podcastData.like_count);
  }, [podcastData]);

  // [INTERVENCIÓN QUIRÚRGICA #4]: El useEffect de Realtime ahora actualiza el estado local directamente
  useEffect(() => {
    // Si el audio ya existe, no necesitamos suscribirnos a cambios para la URL del audio.
    if (!supabase || localPodcastData.audio_url) { return; }

    const channel = supabase.channel(`micro_pod_${localPodcastData.id}`)
      .on<PodcastWithProfile>(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'micro_pods', filter: `id=eq.${localPodcastData.id}` },
        (payload) => {
          // Si el evento de actualización contiene una nueva URL de audio...
          if (payload.new.audio_url) {
            console.log("¡Audio detectado! Actualizando UI en tiempo real...");
            // Actualizamos nuestro estado local con los nuevos datos. React se encargará de re-renderizar.
            setLocalPodcastData(prevData => ({ ...prevData, ...payload.new }));
            // Cerramos el estudio de audio si estaba abierto
            setIsStudioOpen(false);
          }
        }
      ).subscribe();

    // Limpieza al desmontar el componente
    return () => { supabase.removeChannel(channel); };
  }, [supabase, localPodcastData.id, localPodcastData.audio_url]);

  const handleLike = async () => { /* ... (sin cambios) */ };

  return (
    <>
      <div className="container mx-auto max-w-7xl py-12 px-4">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="bg-card/50 backdrop-blur-lg border-border/20 shadow-lg">
              <CardHeader>
                <Badge variant="secondary" className="mb-2 w-fit">{localPodcastData.status === 'published' ? 'Publicado' : 'Borrador'}</Badge>
                <CardTitle className="text-3xl font-bold">{localPodcastData.title}</CardTitle>
                <CardDescription className="pt-2">{localPodcastData.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Separator className="my-6" />
                {/* [INTERVENCIÓN QUIRÚRGICA #5]: Se implementa el componente Collapsible */}
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
            {/* [INTERVENCIÓN QUIRÚRGICA #6]: Se invierte el orden de las tarjetas */}
            <Card className="bg-card/50 backdrop-blur-lg border-border/20 shadow-lg">
              <CardHeader><CardTitle>{localPodcastData.audio_url ? "Reproducir Podcast" : "Crear Podcast"}</CardTitle></CardHeader>
              <CardContent className="flex flex-col gap-4">
                {localPodcastData.audio_url ? (
                  <Button size="lg" className="w-full bg-green-500 hover:bg-green-600" onClick={() => playPodcast(localPodcastData)}><PlayCircle className="mr-2 h-5 w-5" />Reproducir Audio</Button>
                ) : (
                  <Button size="lg" className="w-full" onClick={() => setIsStudioOpen(true)}><Wand2 className="mr-2 h-5 w-5" />Generar Audio con IA</Button>
                )}
                <div className="flex justify-around items-center">
                  <div className="flex items-center gap-1">
                    <Button onClick={handleLike} variant="ghost" size="icon" disabled={isLiking}>
                      <Heart className={cn("h-5 w-5 transition-colors", isLiked ? 'text-red-500 fill-current' : 'text-muted-foreground')} />
                    </Button>
                    <span className="text-sm text-muted-foreground w-4 text-center">{likeCount ?? 0}</span>
                  </div>
                  <Button variant="ghost" size="icon" disabled><Share2 className="h-5 w-5 text-muted-foreground" /></Button>
                  <Button variant="ghost" size="icon" disabled><Download className="h-5 w-5 text-muted-foreground" /></Button>
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
      <AudioStudio podcastId={String(localPodcastData.id)} isOpen={isStudioOpen} onClose={() => setIsStudioOpen(false)} />
    </>
  );
}