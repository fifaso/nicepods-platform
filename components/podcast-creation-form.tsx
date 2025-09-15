// components/podcast-creation-form.tsx
"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useForm, FormProvider, SubmitHandler, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PodcastCreationSchema, PodcastCreationData } from "@/lib/validation/podcast-schema";
import { AgentOption, soloTalkAgents, linkPointsAgents } from "@/lib/agent-config"; // MODIFICACIÓN: Importamos la configuración de agentes

// --- MODIFICACIÓN: Importamos componentes de UI adicionales de shadcn/ui ---
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Heart, Loader2 } from "lucide-react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// --- FIN MODIFICACIÓN ---

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

// ========================================================================
// NUEVO SUB-COMPONENTE REUTILIZABLE PARA LA SELECCIÓN DE AGENTES
// ========================================================================
function AgentSelector({ agents }: { agents: AgentOption[] }) {
  const { control } = useFormContext<PodcastCreationData>();

  return (
    <div className="mt-8 pt-6 border-t border-border/40">
      <h3 className="text-lg font-semibold mb-4 text-foreground">Elige tu Agente Especializado</h3>
      <FormField
        control={control}
        name="selectedAgent"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                {agents.map((agent) => (
                  <FormItem key={agent.value} className="flex items-center space-x-3 space-y-0 p-4 rounded-lg border border-border/40 hover:bg-muted/50 transition-colors">
                    <FormControl>
                      <RadioGroupItem value={agent.value} />
                    </FormControl>
                    <FormLabel className="font-normal w-full cursor-pointer">
                      <span className="font-semibold block text-foreground">{agent.label}</span>
                      <span className="text-sm text-muted-foreground">{agent.description}</span>
                    </FormLabel>
                  </FormItem>
                ))}
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
// ========================================================================

export function PodcastCreationForm() {
  // ========================================================================
  // 1. INICIALIZACIÓN DE HOOKS Y ESTADOS
  // ========================================================================
  
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
      // MODIFICACIÓN: Añadimos el nuevo campo al estado por defecto del formulario.
      selectedAgent: undefined,
    }
  });

  const { handleSubmit, trigger, watch, setValue } = formMethods;
  const { isSubmitting } = formMethods.formState;

  // ========================================================================
  // 2. DEFINICIÓN DE FUNCIONES HANDLER
  // ========================================================================

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
      if (style === 'link') fieldsToValidate = ['link_topicA', 'link_topicB'];
    } else if (currentStep === 3) {
      const style = watch('style');
      // MODIFICACIÓN: Añadimos la validación del agente seleccionado para poder avanzar.
      if (style === 'solo') fieldsToValidate = ['duration', 'narrativeDepth', 'selectedAgent'];
      if (style === 'link') fieldsToValidate = ['link_selectedNarrative', 'link_selectedTone', 'duration', 'narrativeDepth', 'selectedAgent'];
    }
    const isStepValid = await trigger(fieldsToValidate.length > 0 ? fieldsToValidate : undefined);
    if (isStepValid) {
      goToNextStep();
    }
  };
  
  const handleGenerateNarratives: SubmitHandler<PodcastCreationData> = async (formData) => {
    setIsLoadingNarratives(true);
    try {
      const { link_topicA, link_topicB, link_catalyst } = formData;
      const { data, error } = await supabase.functions.invoke('generate-narratives', { body: { topicA: link_topicA, topicB: link_topicB, catalyst: link_catalyst } });
      if (error) throw new Error(error.message);
      if (!data.narratives || data.narratives.length === 0) throw new Error("La IA no pudo generar narrativas.");
      setNarrativeOptions(data.narratives);
      goToNextStep();
    } catch (error: any) {
      toast({ title: "Falló la Generación de Narrativas", description: error.message, variant: "destructive" });
    } finally {
      setIsLoadingNarratives(false);
    }
  };

  const handleFinalSubmit: SubmitHandler<PodcastCreationData> = useCallback(async (formData) => {
    let payload;
    // MODIFICACIÓN: Actualizamos la construcción del payload para incluir el 'agentName'.
    if (formData.style === 'solo') {
      const { style, solo_topic, solo_motivation, duration, narrativeDepth, tags, selectedAgent } = formData;
      payload = { 
        style, 
        agentName: selectedAgent, 
        inputs: { topic: solo_topic, motivation: solo_motivation, duration, narrativeDepth, tags } 
      };
    } else {
      const { style, link_selectedNarrative, link_selectedTone, duration, narrativeDepth, tags, selectedAgent } = formData;
      payload = { 
        style, 
        agentName: selectedAgent, 
        inputs: { narrative: link_selectedNarrative, tone: link_selectedTone, duration, narrativeDepth, tags } 
      };
    }
    try {
      const { error } = await supabase.functions.invoke('queue-podcast-job', { body: payload });
      if (error) { throw new Error(error.message); }
      toast({ title: "¡Podcast Encolado!", description: "Tu idea ha sido enviada a nuestros agentes de IA." });
      router.push(`/podcasts?tab=library`);
    } catch (error: any) {
      toast({ title: "Falló al Encolar el Trabajo", description: error.message, variant: "destructive" });
    }
  }, [supabase, toast, router]);

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;
  
  // ========================================================================
  // 3. RENDERIZADO DEL COMPONENTE
  // ========================================================================
  
  const renderCurrentStep = () => {
    const currentStyle = watch('style');
    switch (currentStep) {
      case 1: 
        return <StyleSelectionStep updateFormData={updateFormStyle} onNext={goToNextStep} />;
      case 2:
        if (currentStyle === 'solo') return <SoloTalkStep />;
        if (currentStyle === 'link') return <LinkPointsStep />;
        return null;
      case 3:
        // MODIFICACIÓN: En el paso 3, renderizamos los detalles Y el selector de agentes.
        if (currentStyle === 'solo') return (
          <>
            <DetailsStep />
            <AgentSelector agents={soloTalkAgents} />
          </>
        );
        if (currentStyle === 'link') return (
          <>
            <NarrativeSelectionStep narrativeOptions={narrativeOptions} />
            <AgentSelector agents={linkPointsAgents} />
          </>
        );
        return null;
      case 4: 
        return <FinalStep />;
      default: 
        return <div>Error: Paso inválido.</div>;
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