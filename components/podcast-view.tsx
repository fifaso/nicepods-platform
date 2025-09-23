"use client";

import { useState, useMemo } from 'react';
import { User } from '@supabase/supabase-js';
import Image from 'next/image';

// --- Importaciones de Hooks y Tipos ---
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { PodcastWithProfile } from '@/types/podcast';

// --- Importaciones de Componentes de UI ---
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
// ================== INTERVENCIÓN QUIRÚRGICA #1: IMPORTACIÓN DE COMPONENTES DE DIÁLOGO ==================
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
// ===================================================================================================
import { Heart, Share2, Download, Bot, Calendar, Clock, Wand2 } from 'lucide-react'; // Se añade Wand2 para el nuevo botón

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
  const { toast } = useToast();
  
  // ================== INTERVENCIÓN QUIRÚRGICA #2: GESTIÓN DE ESTADO PARA EL DIÁLOGO ==================
  const [isFutureFeatureDialogOpen, setIsFutureFeatureDialogOpen] = useState(false);
  // ==============================================================================================

  const [isLiked, setIsLiked] = useState(initialIsLiked);

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
            
            {/* ================== INTERVENCIÓN QUIRÚRGICA #3: MÓDULO DE GENERACIÓN DE AUDIO ================== */}
            <Card className="bg-card/50 backdrop-blur-lg border-border/20 shadow-lg">
              <CardHeader>
                <CardTitle>Crear Podcast</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <Button 
                  size="lg" 
                  className="w-full" 
                  onClick={() => setIsFutureFeatureDialogOpen(true)}
                  // Deshabilitamos el botón si ya existiera un audio, aunque no es el caso actual.
                  disabled={!!podcastData.audio_url}
                >
                  <Wand2 className="mr-2 h-5 w-5" />
                  Generar Audio con IA
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
            {/* ============================================================================================== */}
            
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
                  {/* Podríamos hacer este campo dinámico en el futuro */}
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

      {/* ================== INTERVENCIÓN QUIRÚRGICA #4: COMPONENTE DE DIÁLOGO (POPUP) ================== */}
      <AlertDialog open={isFutureFeatureDialogOpen} onOpenChange={setIsFutureFeatureDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl">El Futuro del Audio está Llegando</AlertDialogTitle>
            <AlertDialogDescription className="pt-4 text-base">
              ¡Gracias por ser uno de nuestros primeros exploradores! Esta es una versión MVP de NicePod, y la generación de audio con voces de IA de alta calidad es el próximo gran paso en nuestro viaje.
              <br/><br/>
              Estamos construyendo una herramienta para potenciar tu creatividad y facilitar el aprendizaje. Imagina convertir tus guiones en audio profesional con un solo clic. ¡Ese es el futuro que estamos creando juntos!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction className="w-full">¡Entendido!</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* ============================================================================================== */}
    </>
  );
}