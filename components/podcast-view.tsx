"use client";

import { useState, useMemo, useEffect } from 'react';
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
import { Heart, Share2, Download, Bot, Calendar, Clock, Wand2, PlayCircle } from 'lucide-react';
import { AudioStudio } from '@/components/create-flow/audio-studio';

type ScriptLine = { speaker: string; line: string; };
interface ScriptViewerProps { scriptText: string | null; }

function ScriptViewer({ scriptText }: ScriptViewerProps) {
  const formattedScript = useMemo(() => {
    if (!scriptText) return null;
    try {
      const scriptData = JSON.parse(scriptText);
      if (!Array.isArray(scriptData)) { throw new Error("El formato del guion no es un array válido."); }
      return scriptData.map((item: ScriptLine) => item.line).join('\n\n');
    } catch (error) {
      console.error("Error al parsear o formatear el guion JSON:", error);
      return null;
    }
  }, [scriptText]);

  if (formattedScript === null) {
    return <p className="text-destructive">El guion no se pudo cargar o tiene un formato incorrecto.</p>;
  }

  return (
    <div className="prose prose-sm max-w-none dark:prose-invert font-serif">
      <p style={{ whiteSpace: 'pre-wrap' }}>{formattedScript}</p>
    </div>
  );
}

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
  
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likeCount, setLikeCount] = useState(podcastData.like_count);
  const [isLiking, setIsLiking] = useState(false);
  const [isStudioOpen, setIsStudioOpen] = useState(false);

  useEffect(() => {
    if (!supabase || podcastData.audio_url) { return; }
    const channel = supabase
      .channel(`micro_pod_${podcastData.id}`)
      .on<PodcastWithProfile>(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'micro_pods', filter: `id=eq.${podcastData.id}` },
        (payload) => {
          if (payload.new.audio_url) {
            console.log("¡Audio detectado! Refrescando datos...");
            router.refresh();
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [supabase, podcastData.id, podcastData.audio_url, router]);

  // ================== INTERVENCIÓN QUIRÚRGICA FINAL ==================
  // Se añade el manejo de 'null' en la actualización del estado de `likeCount`
  // para garantizar la seguridad de tipos y eliminar los errores de TypeScript.
  const handleLike = async () => {
    if (!supabase || !user) {
        toast({ title: "Acción requerida", description: "Debes iniciar sesión para dar 'like'.", variant: "destructive" });
        return;
    }
    setIsLiking(true);
    
    if (isLiked) {
      setIsLiked(false);
      setLikeCount(c => (c ?? 0) - 1); // <-- CORRECCIÓN
      const { error } = await supabase.from('likes').delete().match({ user_id: user.id, podcast_id: podcastData.id });
      if (error) {
        setIsLiked(true);
        setLikeCount(c => (c ?? 0) + 1); // <-- CORRECCIÓN
        toast({ title: "Error", description: "No se pudo quitar el 'like'.", variant: "destructive" });
      }
    } else {
      setIsLiked(true);
      setLikeCount(c => (c ?? 0) + 1); // <-- CORRECCIÓN
      const { error } = await supabase.from('likes').insert({ user_id: user.id, podcast_id: podcastData.id });
      if (error) {
        setIsLiked(false);
        setLikeCount(c => (c ?? 0) - 1); // <-- CORRECCIÓN
        toast({ title: "Error", description: "No se pudo dar 'like'.", variant: "destructive" });
      }
    }
    setIsLiking(false);
  };
  // ====================================================================

  return (
    <>
      <div className="container mx-auto max-w-4xl py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="bg-card/50 backdrop-blur-lg border-border/20 shadow-lg">
              <CardHeader>
                <Badge variant="secondary" className="mb-2 w-fit">{podcastData.status === 'published' ? 'Publicado' : 'Borrador'}</Badge>
                <CardTitle className="text-3xl font-bold">{podcastData.title}</CardTitle>
                <CardDescription className="pt-2">{podcastData.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Separator className="my-6" />
                <h3 className="text-xl font-semibold mb-4">Guion del Podcast</h3>
                <ScriptViewer scriptText={podcastData.script_text} />
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-card/50 backdrop-blur-lg border-border/20 shadow-lg">
              <CardHeader>
                <CardTitle>{podcastData.audio_url ? "Reproducir Podcast" : "Crear Podcast"}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {podcastData.audio_url ? (
                  <Button 
                    size="lg" 
                    className="w-full bg-green-500 hover:bg-green-600"
                    onClick={() => playPodcast(podcastData)}
                  >
                    <PlayCircle className="mr-2 h-5 w-5" />
                    Reproducir Audio
                  </Button>
                ) : (
                  <Button 
                    size="lg" 
                    className="w-full" 
                    onClick={() => setIsStudioOpen(true)}
                  >
                    <Wand2 className="mr-2 h-5 w-5" />
                    Generar Audio con IA
                  </Button>
                )}
                <div className="flex justify-around items-center">
                  <div className="flex items-center gap-1">
                    <Button onClick={handleLike} variant="ghost" size="icon" disabled={isLiking}>
                      <Heart className={`h-5 w-5 transition-colors ${isLiked ? 'text-red-500 fill-current' : 'text-muted-foreground'}`} />
                    </Button>
                    <span className="text-sm text-muted-foreground w-4 text-center">{likeCount ?? 0}</span>
                  </div>
                  <Button variant="ghost" size="icon" disabled>
                    <Share2 className="h-5 w-5 text-muted-foreground" />
                  </Button>
                  <Button variant="ghost" size="icon" disabled>
                    <Download className="h-5 w-5 text-muted-foreground" />
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur-lg border-border/20 shadow-lg">
              <CardHeader>
                <CardTitle>Metadatos</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-3">
                <div className="flex items-center">
                  <Image src={podcastData.profiles?.avatar_url || '/images/placeholder.svg'} alt={podcastData.profiles?.full_name || 'Creador'} width={24} height={24} className="rounded-full mr-2" />
                  <span className="font-medium">{podcastData.profiles?.full_name || 'Creador Anónimo'}</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Creado el: {new Date(podcastData.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Bot className="h-4 w-4 mr-2" />
                  <span>Agente de IA: Narrador Maestro</span>
                </div>
                {podcastData.duration_seconds && 
                  <div className="flex items-center text-muted-foreground">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>Duración Aprox: {Math.floor(podcastData.duration_seconds / 60)} min</span>
                  </div>
                }
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <AudioStudio podcastId={String(podcastData.id)} isOpen={isStudioOpen} onClose={() => setIsStudioOpen(false)} />
    </>
  );
}