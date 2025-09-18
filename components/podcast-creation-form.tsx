// components/podcast-creation-form.tsx
"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useForm, FormProvider, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PodcastCreationSchema, PodcastCreationData } from "@/lib/validation/podcast-schema";
import { AgentOption, soloTalkAgents, linkPointsAgents } from "@/lib/agent-config";

// --- Importaciones de Componentes de UI ---
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Heart, Loader2 } from "lucide-react";

// --- Importaciones de los Pasos del Flujo ---
import { StyleSelectionStep } from "./create-flow/style-selection";
import { SoloTalkStep } from "./create-flow/solo-talk-step";
import { LinkPointsStep } from "./create-flow/link-points";
import { NarrativeSelectionStep } from "./create-flow/narrative-selection";
import { DetailsStep } from "./create-flow/details-step";
import { FinalStep } from "./create-flow/final-step";

export interface NarrativeOption { 
  title: string; 
  thesis: string; 
}

export function PodcastCreationForm() {
  // La sección de inicialización y los handlers permanecen sin cambios.
  const router = useRouter();
  const { toast } = useToast();
  const { supabase } = useAuth();
  
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
      duration: '',
      narrativeDepth: '',
      tags: [],
      selectedAgent: undefined,
    }
  });

  const { handleSubmit, trigger, watch, setValue } = formMethods;
  const { isSubmitting } = formMethods.formState;

  const updateFormStyle = useCallback((data: Partial<PodcastCreationData>) => {
    for (const key in data) {
      setValue(key as keyof PodcastCreationData, data[key as keyof PodcastCreationData], { shouldValidate: true });
    }
  }, [setValue]);
  
  const goToNextStep = () => setCurrentStep(previousStep => previousStep + 1);
  const goToPreviousStep = () => setCurrentStep(previousStep => previousStep - 1);

  const handleStepNavigation = async () => {
    let fieldsToValidate: (keyof PodcastCreationData)[] = [];
    if (currentStep === 2) {
      const style = watch('style');
      if (style === 'solo') fieldsToValidate = ['solo_topic', 'solo_motivation'];
      if (style === 'link') fieldsToValidate = ['link_topicA', 'link_topicB', 'link_catalyst']; // Añadido catalyst que faltaba
    } else if (currentStep === 3) {
      const style = watch('style');
      if (style === 'solo') fieldsToValidate = ['duration', 'narrativeDepth', 'selectedAgent'];
      if (style === 'link') fieldsToValidate = ['link_selectedNarrative', 'link_selectedTone', 'duration', 'narrativeDepth', 'selectedAgent'];
    }
    const isStepValid = await trigger(fieldsToValidate.length > 0 ? fieldsToValidate : undefined);
    if (isStepValid) {
      goToNextStep();
    }
  };
  
  const handleGenerateNarratives: SubmitHandler<PodcastCreationData> = async (formData) => {
    // ... (Esta función permanece sin cambios)
  };

  const handleFinalSubmit: SubmitHandler<PodcastCreationData> = useCallback(async (formData) => {
    // ... (Esta función permanece sin cambios)
  }, [supabase, toast, router]);

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;
  
  // ================== MODIFICACIÓN QUIRÚRGICA: LA LÓGICA DE RENDERIZADO ==================
  // Esta es la función que hemos corregido para que cumpla el "contrato" con DetailsStep.
  const renderCurrentStep = () => {
    const currentStyle = watch('style');
    switch (currentStep) {
      case 1: 
        return <StyleSelectionStep updateFormData={updateFormStyle} onNext={goToNextStep} />;
      case 2:
        if (currentStyle === 'solo') return <SoloTalkStep />;
        if (currentStyle === 'link') return <LinkPointsStep />;
        return null; // Renderiza nulo si el estilo no está definido.
      case 3:
        // Aquí está la lógica corregida. Ahora pasamos la prop 'agents' que DetailsStep espera.
        if (currentStyle === 'solo') {
          return <DetailsStep agents={soloTalkAgents} />;
        }
        if (currentStyle === 'link') {
          // Para el estilo 'link', seguimos mostrando primero la selección de narrativa.
          // Y AHORA, también renderizamos DetailsStep con la lista de agentes correcta.
          return (
            <>
              <NarrativeSelectionStep narrativeOptions={narrativeOptions} />
              {/* Le pasamos la lista de agentes para el estilo 'link' */}
              <DetailsStep agents={linkPointsAgents} />
            </>
          );
        }
        return null; // Renderiza nulo si el estilo no está definido.
      case 4: 
        return <FinalStep />;
      default: 
        return <div>Error: Paso inválido.</div>;
    }
  };
  // ====================================================================================

  return (
    <FormProvider {...formMethods}>
      <div className="bg-gradient-to-br from-purple-100/80 via-blue-100/80 to-indigo-100/80 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 py-4 rounded-xl shadow-lg">
          <form onSubmit={handleSubmit(handleFinalSubmit)}>
              <div className="max-w-4xl mx-auto px-4 flex flex-col">
                  {/* ... (El resto del JSX del formulario permanece sin cambios) ... */}
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
                      <Button type="button" variant="outline" onClick={goToPreviousStep} disabled={currentStep === 1}>
                          <ChevronLeft className="mr-2 h-4 w-4" />Atrás
                      </Button>
                      <div className="ml-auto">
                          {currentStep === 2 && watch('style') === 'link' ? (
                              <Button type="button" size="lg" onClick={handleSubmit(handleGenerateNarratives)} disabled={isLoadingNarratives}>
                                  {isLoadingNarratives ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Generando...</> : 'Generar Narrativas'}
                              </Button>
                          ) : currentStep < totalSteps ? (
                              <Button type="button" onClick={handleStepNavigation}>
                                  Siguiente <ChevronRight className="ml-2 h-4 w-4" />
                              </Button>
                          ) : (
                              <Button type="submit" disabled={isSubmitting}>
                                  {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creando...</> : <><Heart className="mr-2 h-4 w-4" />Crear Podcast</>}
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