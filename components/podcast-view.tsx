"use client";

import { useState, useMemo } from 'react';
import { User } from '@supabase/supabase-js';
import Image from 'next/image';

// --- Importaciones de Hooks y Tipos ---
import { PodcastWithProfile } from '@/types/podcast';

// --- Importaciones de Componentes de UI ---
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Heart, Share2, Download, Bot, Calendar, Clock, Wand2 } from 'lucide-react';

// ================== INTERVENCIÓN QUIRÚRGICA FINAL ==================
// Se corrige la ruta de importación para que apunte al directorio correcto (`create-flow`)
// y se utiliza el alias de ruta `@/components` para mantener la consistencia del proyecto.
import { AudioStudio } from '@/components/create-flow/audio-studio';
// ====================================================================

type ScriptLine = { speaker: string; line: string; };
interface ScriptViewerProps { scriptText: string | null; }

function ScriptViewer({ scriptText }: ScriptViewerProps) {
  const formattedScript = useMemo(() => {
    if (!scriptText) return null;
    try {
      const scriptData = JSON.parse(scriptText);
      if (!Array.isArray(scriptData)) {
        throw new Error("El formato del guion no es un array válido.");
      }
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
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isStudioOpen, setIsStudioOpen] = useState(false);

  return (
    <>
      <div className="container mx-auto max-w-4xl py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Columna Principal: Guion y Título */}
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

          {/* Columna Lateral: Interacciones y Metadatos */}
          <div className="lg:col-span-1 space-y-6">
            
            <Card className="bg-card/50 backdrop-blur-lg border-border/20 shadow-lg">
              <CardHeader>
                <CardTitle>Crear Podcast</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <Button 
                  size="lg" 
                  className="w-full" 
                  onClick={() => setIsStudioOpen(true)}
                  disabled={!!podcastData.audio_url}
                >
                  <Wand2 className="mr-2 h-5 w-5" />
                  {podcastData.audio_url ? "Audio ya Generado" : "Generar Audio con IA"}
                </Button>

                <div className="flex justify-around">
                  <Button variant="ghost" size="icon" disabled>
                    <Heart className="h-5 w-5 text-muted-foreground/50" />
                  </Button>
                  <Button variant="ghost" size="icon" disabled>
                    <Share2 className="h-5 w-5 text-muted-foreground/50" />
                  </Button>
                  <Button variant="ghost" size="icon" disabled>
                    <Download className="h-5 w-5 text-muted-foreground/50" />
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

      <AudioStudio
        podcastId={String(podcastData.id)}
        isOpen={isStudioOpen}
        onClose={() => setIsStudioOpen(false)}
      />
    </>
  );
}