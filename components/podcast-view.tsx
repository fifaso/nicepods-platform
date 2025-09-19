"use client";

import { useState, useMemo } from 'react';
import { User } from '@supabase/supabase-js';
import Link from 'next/link';
import Image from 'next/image';

// --- Importaciones de Hooks y Tipos ---
import { useAuth } from '@/hooks/use-auth';
import { useAudio, type PlayablePodcast } from '@/contexts/audio-context';
import { useToast } from '@/hooks/use-toast';
import { PodcastWithProfile } from '@/types/podcast';

// --- Importaciones de Componentes de UI ---
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { Heart, Play, Pause, Share2, Download, Bot, Calendar, Clock } from 'lucide-react';

// ================== INTERVENCIÓN QUIRÚRGICA: REFACTOR DEL SCRIPT VIEWER ==================
type ScriptLine = { speaker: string; line: string; };
interface ScriptViewerProps { scriptText: string | null; }

function ScriptViewer({ scriptText }: ScriptViewerProps) {
  // El hook useMemo sigue siendo una buena práctica para evitar recalcular en cada render.
  const formattedScript = useMemo(() => {
    if (!scriptText) return null;
    try {
      const scriptData = JSON.parse(scriptText);
      
      // Verificamos que sea un array antes de procesarlo.
      if (!Array.isArray(scriptData)) {
        throw new Error("El formato del guion no es un array válido.");
      }

      // La lógica clave:
      // 1. Mapeamos el array para extraer ÚNICAMENTE la propiedad 'line' de cada objeto.
      // 2. Unimos todas las líneas en una única cadena de texto, separando cada una
      //    con un doble salto de línea para crear párrafos distintos.
      return scriptData.map((item: ScriptLine) => item.line).join('\n\n');

    } catch (error) {
      console.error("Error al parsear o formatear el guion JSON:", error);
      return null;
    }
  }, [scriptText]);

  if (formattedScript === null) {
    return <p className="text-destructive">El guion no se pudo cargar o tiene un formato incorrecto.</p>;
  }

  // El renderizado ahora es mucho más simple.
  // Las clases 'prose' de Tailwind se encargarán de formatear el bloque de texto
  // con un espaciado y estilo de párrafo adecuados. La propiedad 'white-space-pre-wrap'
  // asegura que los saltos de línea (\n\n) se respeten.
  return (
    <div className="prose prose-sm max-w-none dark:prose-invert font-serif">
      <p style={{ whiteSpace: 'pre-wrap' }}>{formattedScript}</p>
    </div>
  );
}
// =========================================================================================

interface PodcastViewProps { 
  podcastData: PodcastWithProfile;
  user: User; 
  initialIsLiked: boolean; 
}

export function PodcastView({ podcastData, user, initialIsLiked }: PodcastViewProps) {
  const { supabase } = useAuth();
  const { playPodcast, togglePlayPause, currentPodcast, isPlaying } = useAudio();
  const { toast } = useToast();
  
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likeCount, setLikeCount] = useState(podcastData.like_count || 0);

  const handlePlay = () => {
    const playablePodcast: PlayablePodcast = {
      id: podcastData.id.toString(),
      title: podcastData.title,
      audioUrl: podcastData.audio_url || '',
    };
    playPodcast(playablePodcast);
  };

  const isCurrentlyPlaying = currentPodcast?.id === podcastData.id.toString() && isPlaying;

  return (
    <div className="container mx-auto max-w-4xl py-12">
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Columna Principal: Guion y Reproductor */}
        <div className="lg:col-span-2">
          <Card className="bg-card/50 backdrop-blur-lg border-border/20 shadow-lg">
            <CardHeader>
              <Badge variant="secondary" className="mb-2 w-fit">{podcastData.status}</Badge>
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

        {/* Columna Lateral: Interacciones y Metadatos */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Módulo de Reproductor y Acciones */}
          <Card className="bg-card/50 backdrop-blur-lg border-border/20 shadow-lg">
            <CardHeader>
              <CardTitle>Reproductor</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="lg" className="w-full" onClick={handlePlay} disabled={!podcastData.audio_url}>
                      {isCurrentlyPlaying ? <Pause className="mr-2 h-5 w-5" /> : <Play className="mr-2 h-5 w-5" />}
                      {isCurrentlyPlaying ? 'Pausar' : 'Escuchar Ahora'}
                    </Button>
                  </TooltipTrigger>
                  {!podcastData.audio_url && (
                    <TooltipContent>
                      <p>El audio para este guion aún no ha sido generado.</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>

              <div className="flex justify-around">
                <Button variant="ghost" size="icon" onClick={() => setIsLiked(!isLiked)}>
                  <Heart className={`h-5 w-5 ${isLiked ? 'text-red-500 fill-current' : 'text-muted-foreground'}`} />
                </Button>
                <Button variant="ghost" size="icon">
                  <Share2 className="h-5 w-5 text-muted-foreground" />
                </Button>
                <Button variant="ghost" size="icon" disabled>
                  <Download className="h-5 w-5 text-muted-foreground/50" />
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Módulo de Metadatos de Creación */}
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
  );
}