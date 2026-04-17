/**
 * ARCHIVO: components/podcast/intelligent-creation-job-administrative-card.tsx
 * VERSIÓN: 7.0 (Madrid Resonance - Sovereign Edition)
 * PROTOCOLO: MADRID RESONANCE V7.0
 *
 * Misión: Monitorear procesos de forja en tiempo real.
 * [REFORMA V7.0]: Purificación total de la nomenclatura en el flujo de Realtime.
 * Eliminación de fugas snake_case y alineación absoluta con la Doctrina ZAP.
 *
 * Nivel de Integridad: 100% (Soberanía Nominal V7.0)
 */

"use client";

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import type { Tables } from '@/types/database.types';
import { Bot } from 'lucide-react';
import { useEffect, useState } from 'react';

type UserCreationJobEntry = Tables<'podcast_creation_jobs'>;
type MicroPodRow = Tables<'micro_pods'>;

const PROGRESS_STAGES_PERCENTAGES = {
  SCRIPT_CREATED: 33,
  AUDIO_GENERATED: 66,
  COVER_GENERATED: 100,
};

/**
 * IntelligentCreationJobAdministrativeCard: Componente para mostrar el progreso de forja.
 */
export function IntelligentCreationJobAdministrativeCard({ jobSnapshot }: { jobSnapshot: UserCreationJobEntry }) {
  const supabaseSovereignClient = createClient();
  const [progressMagnitudePercentage, setProgressMagnitudePercentage] = useState(0);
  const [operationalStatusText, setOperationalStatusText] = useState("Iniciando...");

  const podcastIdentificationReference = jobSnapshot.micro_pod_id;

  useEffect(() => {
    if (!podcastIdentificationReference) {
      setOperationalStatusText("Creando guion...");
      setProgressMagnitudePercentage(PROGRESS_STAGES_PERCENTAGES.SCRIPT_CREATED / 2);
      return;
    }

    setProgressMagnitudePercentage(PROGRESS_STAGES_PERCENTAGES.SCRIPT_CREATED);
    setOperationalStatusText("Generando audio...");

    const progressSubscriptionChannel = supabaseSovereignClient
      .channel(`micro_pod_progress_${podcastIdentificationReference}`)
      .on<MicroPodRow>(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'micro_pods',
          filter: `id=eq.${podcastIdentificationReference}`,
        },
        (databaseChangeEventPayload) => {
          const freshPodSnapshot = databaseChangeEventPayload.new;
          let currentProgressMagnitude = PROGRESS_STAGES_PERCENTAGES.SCRIPT_CREATED;
          let statusTextContent = "Generando audio...";

          const isAudioBufferReady = !!freshPodSnapshot.audio_url;
          const isCoverImageReady = !!freshPodSnapshot.cover_image_url;

          if (isAudioBufferReady) {
            currentProgressMagnitude = PROGRESS_STAGES_PERCENTAGES.AUDIO_GENERATED;
            statusTextContent = "Generando carátula...";
          }
          if (isCoverImageReady) {
            currentProgressMagnitude = isAudioBufferReady ? PROGRESS_STAGES_PERCENTAGES.COVER_GENERATED : PROGRESS_STAGES_PERCENTAGES.SCRIPT_CREATED + 33;
            statusTextContent = isAudioBufferReady ? "Finalizando..." : "Generando audio...";
          }
          if (isAudioBufferReady && isCoverImageReady) {
            currentProgressMagnitude = 100;
            statusTextContent = "¡Completado!";
          }

          setProgressMagnitudePercentage(currentProgressMagnitude);
          setOperationalStatusText(statusTextContent);
        }
      )
      .subscribe();

    return () => {
      supabaseSovereignClient.removeChannel(progressSubscriptionChannel);
    };
  }, [podcastIdentificationReference, supabaseSovereignClient]);

  // Purificación Nominal de los campos de Job procedentes del Metal
  const jobTitleTextContent = jobSnapshot.job_title || "Creación en progreso...";
  const creationTimestamp = jobSnapshot.created_at;

  return (
    <Card className="bg-background/50 border-primary/20 overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{jobTitleTextContent}</CardTitle>
          <Badge variant="secondary">{operationalStatusText}</Badge>
        </div>
        <CardDescription>Iniciado el: {new Date(creationTimestamp).toLocaleString()}</CardDescription>
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
          style={{ width: `${progressMagnitudePercentage}%` }}
        />
      </div>
    </Card>
  );
}
