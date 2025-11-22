// components/smart-job-card.tsx
// Un componente "inteligente" que se suscribe a los cambios de un podcast en tiempo real para mostrar el progreso.

"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot } from 'lucide-react';
import type { Tables } from '@/types/supabase';

type UserCreationJob = Tables<'podcast_creation_jobs'>;
type MicroPod = Tables<'micro_pods'>;

// Definimos los hitos de progreso
const PROGRESS_STAGES = {
  SCRIPT_CREATED: 33,
  AUDIO_GENERATED: 66,
  COVER_GENERATED: 100,
};

export function SmartJobCard({ job }: { job: UserCreationJob }) {
  const supabase = createClient();
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("Iniciando...");

  useEffect(() => {
    // Si no hay un micro_pod_id, el guion aún no se ha creado.
    if (!job.micro_pod_id) {
      setStatusText("Creando guion...");
      setProgress(PROGRESS_STAGES.SCRIPT_CREATED / 2); // Progreso visual inicial
      return;
    }

    // Si tenemos micro_pod_id, el guion ya existe.
    setProgress(PROGRESS_STAGES.SCRIPT_CREATED);
    setStatusText("Generando audio...");

    // Nos suscribimos a los cambios de ESTE podcast específico.
    const channel = supabase
      .channel(`micro_pod_progress_${job.micro_pod_id}`)
      .on<MicroPod>(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'micro_pods',
          filter: `id=eq.${job.micro_pod_id}`,
        },
        (payload) => {
          const newPod = payload.new;
          let currentProgress = PROGRESS_STAGES.SCRIPT_CREATED;
          let status = "Generando audio...";

          if (newPod.audio_url) {
            currentProgress = PROGRESS_STAGES.AUDIO_GENERATED;
            status = "Generando carátula...";
          }
          if (newPod.cover_image_url) {
            currentProgress = newPod.audio_url ? PROGRESS_STAGES.COVER_GENERATED : PROGRESS_STAGES.SCRIPT_CREATED + 33;
            status = newPod.audio_url ? "Finalizando..." : "Generando audio...";
          }
          if (newPod.audio_url && newPod.cover_image_url) {
            currentProgress = 100;
            status = "¡Completado!";
          }
          
          setProgress(currentProgress);
          setStatusText(status);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [job.micro_pod_id, supabase]);

  return (
    <Card className="bg-background/50 border-primary/20 overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{job.job_title || "Creación en progreso..."}</CardTitle>
          <Badge variant="secondary">{statusText}</Badge>
        </div>
        <CardDescription>Iniciado el: {new Date(job.created_at).toLocaleString()}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center text-sm text-muted-foreground">
          <Bot className="mr-2 h-4 w-4" />
          <p>Nuestros agentes de IA están trabajando en tu idea...</p>
        </div>
      </CardContent>
      <div className="relative h-1 w-full bg-muted/30">
        <div 
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 ease-in-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </Card>
  );
}