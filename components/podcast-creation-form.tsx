// components/podcast-creation-form.tsx
// VERSIÓN FINAL CON MAPEO EN FRONTEND PARA NO MODIFICAR EL BACKEND

"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useForm, FormProvider, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PodcastCreationSchema, PodcastCreationData } from "@/lib/validation/podcast-schema";
import { soloTalkAgents, linkPointsAgents } from "@/lib/agent-config";

import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Wand2, Loader2 } from "lucide-react";

import { StyleSelectionStep } from "./create-flow/style-selection";
import { SoloTalkStep } from "./create-flow/solo-talk-step";
import { LinkPointsStep } from "./create-flow/link-points";
import { NarrativeSelectionStep } from "./create-flow/narrative-selection";
import { DetailsStep } from "./create-flow/details-step";
import { FinalStep } from "./create-flow/final-step";
import { ArchetypeStep } from "./create-flow/archetype-step";

export interface NarrativeOption { 
  title: string; 
  thesis: string; 
}

export function PodcastCreationForm() {
  const router = useRouter();
  const { toast } = useToast();
  const { supabase, user } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoadingNarratives, setIsLoadingNarratives] = useState(false);
  const [narrativeOptions, setNarrativeOptions] = useState<NarrativeOption[]>([]);

  const formMethods = useForm<PodcastCreationData>({
    resolver: zodResolver(PodcastCreationSchema),
    mode: "onBlur",
    defaultValues: { /* ... (sin cambios) */ }
  });

  const { handleSubmit, trigger, watch, getValues } = formMethods;
  const { isSubmitting } = formMethods.formState;
  const currentStyle = watch('style');

  const goToNextStep = () => setCurrentStep(previousStep => previousStep + 1);
  const goToPreviousStep = () => setCurrentStep(previousStep => previousStep - 1);

  const totalSteps = currentStyle === 'link' ? 5 : 4;

  const handleStepNavigation = async () => { /* ... (sin cambios) */ };
  
  const handleGenerateNarratives = useCallback(async () => { /* ... (sin cambios) */ }, []);

  const handleGenerateNarrativesClick = async () => { /* ... (sin cambios) */ };

  const handleFinalSubmit: SubmitHandler<PodcastCreationData> = useCallback(async (formData) => {
    if (!supabase || !user) {
      toast({ title: "Error de Autenticación", variant: "destructive" });
      return;
    }

    let jobInputs = {};
    if (formData.style === 'solo' || formData.style === 'archetype') {
      // Unificamos la obtención de datos para solo y arquetipo
      jobInputs = {
        topic: formData.style === 'archetype' ? formData.archetype_topic : formData.solo_topic,
        motivation: formData.style === 'archetype' ? formData.archetype_goal : formData.solo_motivation,
      };
    } else { // 'link'
      jobInputs = { topicA: formData.link_topicA, topicB: formData.link_topicB, catalyst: formData.link_catalyst, narrative: formData.link_selectedNarrative, tone: formData.link_selectedTone };
    }
    
    // [INTERVENCIÓN QUIRÚRGICA #1]: Aquí ocurre la "traducción"
    // Preparamos el payload base
    const payload = {
      style: formData.style,
      agentName: formData.selectedAgent,
      inputs: { ...jobInputs, duration: formData.duration, depth: formData.narrativeDepth, tags: formData.tags },
    };

    // Si el estilo es 'archetype', lo "disfrazamos" como 'solo' para el backend,
    // pero nos aseguramos de que el agentName sea el arquetipo correcto.
    if (payload.style === 'archetype') {
      payload.style = 'solo'; // Se traduce el estilo.
      payload.agentName = formData.selectedArchetype; // Se asigna el agente de arquetipo.
      // `motivation` en `jobInputs` ya contiene `archetype_goal`, por lo que los prompts funcionarán.
    }

    // A partir de aquí, el resto del código no necesita saber sobre 'archetype'.
    const { data, error } = await supabase.functions.invoke('queue-podcast-job', { body: payload });

    if (error) {
      toast({ title: "Error de Conexión", variant: "destructive" });
      return;
    }
    
    if (data && !data.success) {
      toast({ title: "Error al Enviar tu Idea", description: data.error?.message, variant: "destructive" });
      return;
    }

    toast({ title: "¡Éxito!", description: "Tu idea está en la cola de procesamiento." });
    router.push('/podcasts?tab=library');
  }, [supabase, user, toast, router]);
  
  const progress = (currentStep / totalSteps) * 100;
  
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <StyleSelectionStep />;
      case 2:
        if (currentStyle === 'solo') return <SoloTalkStep />;
        if (currentStyle === 'link') return <LinkPointsStep />;
        if (currentStyle === 'archetype') return <ArchetypeStep />;
        return <p className="text-center text-muted-foreground">Por favor, selecciona un estilo.</p>;
      case 3:
        // [INTERVENCIÓN QUIRÚRGICA #2]: Se unifica la llamada a DetailsStep.
        // Tanto 'solo' como 'archetype' usarán los `soloTalkAgents`
        if (currentStyle === 'solo' || currentStyle === 'archetype') {
          return <DetailsStep agents={soloTalkAgents} />;
        }
        if (currentStyle === 'link') {
          return <NarrativeSelectionStep narrativeOptions={narrativeOptions} />;
        }
        return null;
      case 4:
        if (currentStyle === 'solo' || currentStyle === 'archetype') return <FinalStep />;
        if (currentStyle === 'link') return <DetailsStep agents={linkPointsAgents} />;
        return null;
      case 5:
        if (currentStyle === 'link') return <FinalStep />;
        return null;
      default:
        return <div>Error: Paso inválido. Refresca la página.</div>;
    }
  };

  return (
    <FormProvider {...formMethods}>
      <div className="bg-gradient-to-br from-purple-100/80 via-blue-100/80 to-indigo-100/80 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 py-4 rounded-xl shadow-lg">
          <form onSubmit={handleSubmit(handleFinalSubmit)}>
              {/* ... (resto del JSX del formulario sin cambios) ... */}
          </form>
      </div>
    </FormProvider>
  );
}