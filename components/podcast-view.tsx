// components/podcast-view.tsx
// VERSIÓN FINAL COMPLETA - SIMPLIFICADA

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
import { Heart, Share2, Download, Calendar, Clock, PlayCircle, ChevronDown, Loader2 } from 'lucide-react';
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

  useEffect(() => {
    setLocalPodcastData(podcastData);
    setLikeCount(podcastData.like_count);
    setIsLiked(initialIsLiked);
  }, [podcastData, initialIsLiked]);

  useEffect(() => {
    if (!supabase || localPodcastData.audio_url) { return; }
    const channel = supabase.channel(`micro_pod_${localPodcastData.id}`)
      .on<PodcastWithProfile>(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'micro_pods', filter: `id=eq.${localPodcastData.id}` },
        (payload) => {
          if (payload.new.audio_url) {
            console.log("¡Audio detectado! Actualizando UI en tiempo real...");
            setLocalPodcastData(prevData => ({ ...prevData, ...payload.new }));
          }
        }
      ).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [supabase, localPodcastData.id, localPodcastData.audio_url, router]);

  const handleLike = async () => {
    if (!supabase || !user) {
        toast({ title: "Acción requerida", description: "Debes iniciar sesión para dar 'like'.", variant: "destructive" });
        return;
    }
    setIsLiking(true);
    if (isLiked) {
      setIsLiked(false);
      setLikeCount(c => (c ?? 1) - 1);
      const { error } = await supabase.from('likes').delete().match({ user_id: user.id, podcast_id: localPodcastData.id });
      if (error) {
        setIsLiked(true);
        setLikeCount(c => (c ?? 0) + 1);
        toast({ title: "Error", description: "No se pudo quitar el 'like'.", variant: "destructive" });
      }
    } else {
      setIsLiked(true);
      setLikeCount(c => (c ?? 0) + 1);
      const { error } = await supabase.from('likes').insert({ user_id: user.id, podcast_id: localPodcastData.id });
      if (error) {
        setIsLiked(false);
        setLikeCount(c => (c ?? 1) - 1);
        toast({ title: "Error", description: "No se pudo dar 'like'.", variant: "destructive" });
      }
    }
    setIsLiking(false);
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
              <CardHeader><CardTitle>{localPodcastData.audio_url ? "Reproducir Podcast" : "Procesando Audio..."}</CardTitle></CardHeader>
              <CardContent className="flex flex-col gap-4">
                {localPodcastData.audio_url ? (
                  <Button size="lg" className="w-full bg-green-500 hover:bg-green-600" onClick={() => playPodcast(localPodcastData)}>
                    <PlayCircle className="mr-2 h-5 w-5" />Reproducir Audio
                  </Button>
                ) : (
                  <Button size="lg" className="w-full" disabled>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generando Audio
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
    </>
  );
}