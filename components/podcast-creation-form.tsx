// components/podcast-creation-form.tsx
// VERSIÓN FINAL, COMPLETA Y SIN ABREVIACIONES

"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useForm, FormProvider, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PodcastCreationSchema, PodcastCreationData } from "@/lib/validation/podcast-schema";
import { soloTalkAgents, linkPointsAgents } from "@/lib/agent-config";

// --- Importaciones de Componentes de UI ---
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Wand2, Loader2 } from "lucide-react";

// --- Importaciones de los Pasos del Flujo ---
import { StyleSelectionStep } from "./create-flow/style-selection";
import { SoloTalkStep } from "./create-flow/solo-talk-step";
import { LinkPointsStep } from "./create-flow/link-points";
import { NarrativeSelectionStep } from "./create-flow/narrative-selection";
import { DetailsStep } from "./create-flow/details-step";
import { FinalStep } from "./create-flow/final-step";
import { ArchetypeStep, archetypeOptions } from "./create-flow/archetype-step";

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
    defaultValues: {
      style: undefined,
      solo_topic: '',
      solo_motivation: '',
      link_topicA: '',
      link_topicB: '',
      link_catalyst: '',
      link_selectedNarrative: null,
      link_selectedTone: undefined,
      selectedArchetype: undefined,
      archetype_topic: '',
      archetype_goal: '',
      duration: '',
      narrativeDepth: '',
      tags: [],
      selectedAgent: undefined,
    }
  });

  const { handleSubmit, trigger, watch, getValues } = formMethods;
  const { isSubmitting } = formMethods.formState;
  const currentStyle = watch('style');
  const selectedArchetypeValue = watch('selectedArchetype');

  const goToNextStep = () => setCurrentStep(previousStep => previousStep + 1);
  const goToPreviousStep = () => setCurrentStep(previousStep => previousStep - 1);

  const totalSteps = currentStyle === 'link' ? 5 : 4;

  const handleStepNavigation = async () => {
    let fieldsToValidate: (keyof PodcastCreationData)[] = [];
    const stepForValidation = currentStep;
    
    if (stepForValidation === 1) fieldsToValidate = ['style'];
    
    if (stepForValidation === 2) {
      if (currentStyle === 'solo') fieldsToValidate = ['solo_topic', 'solo_motivation'];
      if (currentStyle === 'link') fieldsToValidate = ['link_topicA', 'link_topicB'];
      if (currentStyle === 'archetype') fieldsToValidate = ['selectedArchetype', 'archetype_topic', 'archetype_goal'];
    }
    
    if ((currentStyle === 'solo' || currentStyle === 'archetype') && stepForValidation === 3) {
      if (currentStyle === 'archetype') {
        fieldsToValidate = ['duration', 'narrativeDepth'];
      } else {
        fieldsToValidate = ['duration', 'narrativeDepth', 'selectedAgent'];
      }
    }
    
    if (currentStyle === 'link' && stepForValidation === 3) fieldsToValidate = ['link_selectedNarrative', 'link_selectedTone'];
    if (currentStyle === 'link' && stepForValidation === 4) fieldsToValidate = ['duration', 'narrativeDepth', 'selectedAgent'];
    
    const isStepValid = await trigger(fieldsToValidate);
    if (isStepValid) goToNextStep();
  };
  
  const handleGenerateNarratives = useCallback(async () => {
    if (!supabase) {
      toast({ title: "Error de Conexión", variant: "destructive" });
      return;
    }
    
    const { link_topicA, link_topicB, link_catalyst } = getValues();
    setIsLoadingNarratives(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-narratives', {
        body: { topicA: link_topicA, topicB: link_topicB, catalyst: link_catalyst }
      });
      if (error) throw new Error(error.message);
      if (data?.narratives && Array.isArray(data.narratives)) {
        setNarrativeOptions(data.narratives);
        toast({ title: "Narrativas generadas" });
        goToNextStep();
      } else {
        throw new Error("Respuesta del servidor inesperada.");
      }
    } catch (e) {
      toast({ title: "Error al Generar Narrativas", description: e instanceof Error ? e.message : "Inténtalo de nuevo.", variant: "destructive" });
    } finally {
      setIsLoadingNarratives(false);
    }
  }, [supabase, toast, getValues, goToNextStep]);

  const handleGenerateNarrativesClick = async () => {
    const isStepValid = await trigger(['link_topicA', 'link_topicB']);
    if (isStepValid) await handleGenerateNarratives();
  };

  const handleFinalSubmit: SubmitHandler<PodcastCreationData> = useCallback(async (formData) => {
    if (!supabase || !user) {
      toast({ title: "Error de Autenticación", variant: "destructive" });
      return;
    }

    let jobInputs = {};
    if (formData.style === 'solo') {
      jobInputs = { topic: formData.solo_topic, motivation: formData.solo_motivation };
    } else if (formData.style === 'archetype') {
      jobInputs = { topic: formData.archetype_topic, goal: formData.archetype_goal };
    } else { // 'link'
      jobInputs = { topicA: formData.link_topicA, topicB: formData.link_topicB, catalyst: formData.link_catalyst, narrative: formData.link_selectedNarrative, tone: formData.link_selectedTone };
    }
    
    const agentName = formData.style === 'archetype' ? formData.selectedArchetype : formData.selectedAgent;

    const payload = {
      style: formData.style,
      agentName: agentName,
      inputs: { ...jobInputs, duration: formData.duration, depth: formData.narrativeDepth, tags: formData.tags },
    };

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
        return <p className="text-center text-muted-foreground">Por favor, selecciona un estilo para continuar.</p>;
      case 3:
        if (currentStyle === 'solo') return <DetailsStep agents={soloTalkAgents} />;
        if (currentStyle === 'archetype') {
          const preselectedAgent = archetypeOptions.find(opt => opt.value === selectedArchetypeValue);
          return <DetailsStep agents={[]} preselectedAgent={preselectedAgent} />;
        }
        if (currentStyle === 'link') return <NarrativeSelectionStep narrativeOptions={narrativeOptions} />;
        return null;
      case 4:
        if (currentStyle === 'solo' || currentStyle === 'archetype') return <FinalStep />;
        if (currentStyle === 'link') return <DetailsStep agents={linkPointsAgents} />;
        return null;
      case 5:
        if (currentStyle === 'link') return <FinalStep />;
        return null;
      default:
        return <div>Error: Paso inválido. Por favor, refresca la página.</div>;
    }
  };

  return (
    <FormProvider {...formMethods}>
      <div className="bg-gradient-to-br from-purple-100/80 via-blue-100/80 to-indigo-100/80 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 py-4 rounded-xl shadow-lg">
          <form onSubmit={handleSubmit(handleFinalSubmit)}>
              <div className="max-w-4xl mx-auto px-4 flex flex-col">
                  <div className="mb-6 flex-shrink-0">
                      <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-800 dark:text-gray-300">Paso {currentStep} de {totalSteps}</span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">{Math.round(progress)}% completado</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                  </div>
                  <Card className="glass-card border border-white/40 dark:border-white/20 shadow-glass backdrop-blur-xl flex-1 flex flex-col">
                      <CardContent className="p-6 flex-1 flex flex-col">
                        {renderCurrentStep()}
                      </CardContent>
                  </Card>
                  <div className="flex justify-between items-center mt-6 flex-shrink-0">
                      <Button type="button" variant="outline" onClick={goToPreviousStep} disabled={currentStep === 1 || isSubmitting || isLoadingNarratives}>
                          <ChevronLeft className="mr-2 h-4 w-4" />Atrás
                      </Button>
                      <div className="ml-auto">
                          {currentStep === 2 && currentStyle === 'link' ? (
                              <Button type="button" size="lg" onClick={handleGenerateNarrativesClick} disabled={isLoadingNarratives}>
                                  {isLoadingNarratives ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Generando...</> : 'Generar Narrativas'}
                              </Button>
                          ) : currentStep < totalSteps ? (
                              <Button type="button" onClick={handleStepNavigation}>
                                  Siguiente <ChevronRight className="ml-2 h-4 w-4" />
                              </Button>
                          ) : (
                              <Button type="submit" disabled={isSubmitting}>
                                  {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Encolando Idea...</> : <><Wand2 className="mr-2 h-4 w-4" />Crear Guion</>}
                              </Button>
                          )}
                      </div>
                  </div>
              </div>
          </form>
      </div>
    </FormProvider>
  );
}