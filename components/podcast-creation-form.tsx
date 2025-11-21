// components/podcast-creation-form.tsx
// VERSIÓN FINAL Y COMPLETA: Implementa la Máquina de Estados Finita (FSM) y toda la lógica funcional sin abreviaciones.

"use client";

import { useState, useCallback, createContext, useContext } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useForm, FormProvider, SubmitHandler, FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PodcastCreationSchema, PodcastCreationData } from "@/lib/validation/podcast-schema";
import { soloTalkAgents, linkPointsAgents } from "@/lib/agent-config";

import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Wand2, Loader2 } from "lucide-react";

import { PurposeSelectionStep } from "./create-flow/PurposeSelectionStep";
import { LearnSubStep } from "./create-flow/LearnSubStep";
import { InspireSubStep } from "./create-flow/InspireSubStep";
import { LegacyStep } from "./create-flow/LegacyStep";
import { QuestionStep } from "./create-flow/QuestionStep";
import { StyleSelectionStep } from "./create-flow/style-selection";
import { SoloTalkStep } from "./create-flow/solo-talk-step";
import { LinkPointsStep } from "./create-flow/link-points";
import { NarrativeSelectionStep } from "./create-flow/narrative-selection";
import { DetailsStep } from "./create-flow/details-step";
import { FinalStep } from "./create-flow/final-step";
import { ArchetypeStep } from "./create-flow/archetype-step";
import { AudioStudio } from "./create-flow/audio-studio";

export interface NarrativeOption { 
  title: string; 
  thesis: string; 
}

export type FlowState = 
  | 'SELECTING_PURPOSE' | 'LEARN_SUB_SELECTION' | 'INSPIRE_SUB_SELECTION'
  | 'SOLO_TALK_INPUT' | 'ARCHETYPE_SELECTION' | 'LINK_POINTS_INPUT' | 'NARRATIVE_SELECTION'
  | 'LEGACY_INPUT' | 'QUESTION_INPUT' | 'FREESTYLE_SELECTION'
  | 'DETAILS_STEP' | 'AUDIO_STUDIO_STEP' | 'FINAL_STEP';

interface CreationContextType {
  updateFormData: (data: Partial<PodcastCreationData>) => void;
  transitionTo: (state: FlowState) => void;
  goBack: () => void;
}

const CreationContext = createContext<CreationContextType | undefined>(undefined);

export const useCreationContext = () => {
  const context = useContext(CreationContext);
  if (!context) throw new Error("useCreationContext debe ser usado dentro de un CreationFormProvider");
  return context;
};

export function PodcastCreationForm() {
  const router = useRouter();
  const { toast } = useToast();
  const { supabase, user } = useAuth();
  
  const [currentFlowState, setCurrentFlowState] = useState<FlowState>('SELECTING_PURPOSE');
  const [history, setHistory] = useState<FlowState[]>(['SELECTING_PURPOSE']);
  
  const [isLoadingNarratives, setIsLoadingNarratives] = useState(false);
  const [narrativeOptions, setNarrativeOptions] = useState<NarrativeOption[]>([]);

  const formMethods = useForm<PodcastCreationData>({
    resolver: zodResolver(PodcastCreationSchema),
    mode: "onBlur",
    defaultValues: {
      purpose: "learn",
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
      legacy_lesson: '',
      question_to_answer: '',
      duration: '',
      narrativeDepth: '',
      selectedAgent: undefined,
      voiceGender: "Masculino",
      voiceStyle: "Calmado",
      voicePace: "Moderado",
      speakingRate: 1.0,
      tags: [],
      generateAudioDirectly: true,
    },
  });

  const { handleSubmit, trigger, getValues, setValue, watch } = formMethods;
  const { isSubmitting } = formMethods.formState;
  const formData = watch();

  const transitionTo = (state: FlowState) => {
    setHistory(prev => [...prev, state]);
    setCurrentFlowState(state);
  };

  const goBack = () => {
    setHistory(prev => {
      const newHistory = [...prev];
      newHistory.pop();
      setCurrentFlowState(newHistory[newHistory.length - 1] || 'SELECTING_PURPOSE');
      return newHistory;
    });
  };

  const updateFormData = (data: Partial<PodcastCreationData>) => {
    Object.entries(data).forEach(([key, value]) => {
      setValue(key as keyof PodcastCreationData, value, { shouldValidate: true });
    });
  };

  const handleNextTransition = async () => {
    let fieldsToValidate: (keyof PodcastCreationData)[] = [];
    let nextState: FlowState = 'DETAILS_STEP';

    switch(currentFlowState) {
      case 'SOLO_TALK_INPUT':
        fieldsToValidate = ['solo_topic', 'solo_motivation'];
        nextState = 'DETAILS_STEP';
        break;
      case 'ARCHETYPE_SELECTION':
        fieldsToValidate = ['archetype_topic', 'archetype_goal'];
        nextState = 'DETAILS_STEP';
        break;
      case 'LINK_POINTS_INPUT':
        const isLinkPointsValid = await trigger(['link_topicA', 'link_topicB']);
        if (isLinkPointsValid) await handleGenerateNarratives();
        return;
      case 'NARRATIVE_SELECTION':
        fieldsToValidate = ['link_selectedNarrative', 'link_selectedTone'];
        nextState = 'DETAILS_STEP';
        break;
      case 'FREESTYLE_SELECTION':
        fieldsToValidate = ['style'];
        const style = getValues('style');
        if (style === 'solo') nextState = 'SOLO_TALK_INPUT';
        else if (style === 'link') nextState = 'LINK_POINTS_INPUT';
        else if (style === 'archetype') nextState = 'ARCHETYPE_SELECTION';
        break;
      case 'LEGACY_INPUT':
        fieldsToValidate = ['legacy_lesson'];
        nextState = 'DETAILS_STEP';
        break;
      case 'QUESTION_INPUT':
        fieldsToValidate = ['question_to_answer'];
        nextState = 'DETAILS_STEP';
        break;
      case 'DETAILS_STEP':
        fieldsToValidate = ['duration', 'narrativeDepth', 'selectedAgent'];
        nextState = 'AUDIO_STUDIO_STEP';
        break;
      case 'AUDIO_STUDIO_STEP':
        fieldsToValidate = ['voiceGender', 'voiceStyle', 'voicePace', 'speakingRate'];
        nextState = 'FINAL_STEP';
        break;
    }

    const isStepValid = await trigger(fieldsToValidate);
    if (isStepValid) transitionTo(nextState);
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
        transitionTo('NARRATIVE_SELECTION');
      } else {
        throw new Error("Respuesta del servidor inesperada.");
      }
    } catch (e) {
      toast({ title: "Error al Generar Narrativas", description: e instanceof Error ? e.message : "Inténtalo de nuevo.", variant: "destructive" });
    } finally {
      setIsLoadingNarratives(false);
    }
  }, [supabase, toast, getValues, transitionTo]);

  const handleFinalSubmit: SubmitHandler<PodcastCreationData> = useCallback(async (formData) => {
    if (!supabase || !user) {
      toast({ title: "Error de Autenticación", variant: "destructive" });
      return;
    }

    let jobInputs: Record<string, any> = {};
    switch (formData.purpose) {
        case 'learn':
        case 'freestyle':
            if (formData.style === 'solo' || formData.style === 'archetype') {
                jobInputs = {
                    topic: formData.style === 'archetype' ? formData.archetype_topic : formData.solo_topic,
                    motivation: formData.style === 'archetype' ? formData.archetype_goal : formData.solo_motivation,
                };
            }
            break;
        case 'inspire':
             jobInputs = { topic: formData.archetype_topic, motivation: formData.archetype_goal };
             break;
        case 'explore':
            jobInputs = { topicA: formData.link_topicA, topicB: formData.link_topicB, catalyst: formData.link_catalyst, narrative: formData.link_selectedNarrative, tone: formData.link_selectedTone };
            break;
        case 'reflect':
            jobInputs = { topic: "Reflexión Personal", motivation: formData.legacy_lesson };
            break;
        case 'answer':
            jobInputs = { topic: formData.question_to_answer, motivation: "Una respuesta clara y concisa." };
            break;
    }
    
    const payload = {
      purpose: formData.purpose,
      style: formData.style,
      agentName: formData.selectedAgent,
      inputs: {
        ...jobInputs,
        duration: formData.duration,
        depth: formData.narrativeDepth,
        tags: formData.tags,
        generateAudioDirectly: formData.generateAudioDirectly,
        voiceGender: formData.voiceGender,
        voiceStyle: formData.voiceStyle,
        voicePace: formData.voicePace,
        speakingRate: formData.speakingRate,
      },
    };

    if (payload.purpose === 'inspire') {
        payload.style = 'archetype';
        payload.agentName = formData.selectedArchetype;
    }
    
    const { data, error } = await supabase.functions.invoke('queue-podcast-job', { body: payload });

    if (error || (data && !data.success)) {
      toast({ title: "Error al Enviar tu Idea", description: data?.error?.message || error?.message, variant: "destructive" });
      return;
    }

    toast({ title: "¡Tu idea está en camino!", description: "Serás redirigido a tu biblioteca. El proceso ha comenzado." });
    router.push('/podcasts?tab=library');
  }, [supabase, user, toast, router]);
  
  const onValidationErrors = (errors: FieldErrors<PodcastCreationData>) => {
    console.error("Errores de validación del formulario:", errors);
    toast({ title: "Formulario incompleto", description: "Por favor, revisa los campos con errores.", variant: "destructive" });
  };

  const renderCurrentStep = () => {
    switch (currentFlowState) {
      case 'SELECTING_PURPOSE': return <PurposeSelectionStep />;
      case 'LEARN_SUB_SELECTION': return <LearnSubStep />;
      case 'INSPIRE_SUB_SELECTION': return <InspireSubStep />;
      case 'LEGACY_INPUT': return <LegacyStep />;
      case 'QUESTION_INPUT': return <QuestionStep />;
      case 'SOLO_TALK_INPUT': return <SoloTalkStep />;
      case 'ARCHETYPE_SELECTION': return <ArchetypeStep />;
      case 'LINK_POINTS_INPUT': return <LinkPointsStep />;
      case 'NARRATIVE_SELECTION': return <NarrativeSelectionStep narrativeOptions={narrativeOptions} />;
      case 'FREESTYLE_SELECTION': return <StyleSelectionStep />;
      case 'DETAILS_STEP':
        const agents = formData.purpose === 'explore' ? linkPointsAgents : soloTalkAgents;
        return <DetailsStep agents={agents} />;
      case 'AUDIO_STUDIO_STEP': return <AudioStudio />;
      case 'FINAL_STEP': return <FinalStep />;
      default: return <div>Estado inválido: {currentFlowState}</div>;
    }
  };

  const flowPaths: Record<string, FlowState[]> = {
    learn: ['SELECTING_PURPOSE', 'LEARN_SUB_SELECTION', 'SOLO_TALK_INPUT', 'DETAILS_STEP', 'AUDIO_STUDIO_STEP', 'FINAL_STEP'],
    inspire: ['SELECTING_PURPOSE', 'INSPIRE_SUB_SELECTION', 'ARCHETYPE_SELECTION', 'DETAILS_STEP', 'AUDIO_STUDIO_STEP', 'FINAL_STEP'],
    explore: ['SELECTING_PURPOSE', 'LINK_POINTS_INPUT', 'NARRATIVE_SELECTION', 'DETAILS_STEP', 'AUDIO_STUDIO_STEP', 'FINAL_STEP'],
    reflect: ['SELECTING_PURPOSE', 'LEGACY_INPUT', 'DETAILS_STEP', 'AUDIO_STUDIO_STEP', 'FINAL_STEP'],
    answer: ['SELECTING_PURPOSE', 'QUESTION_INPUT', 'DETAILS_STEP', 'AUDIO_STUDIO_STEP', 'FINAL_STEP'],
    freestyle: ['SELECTING_PURPOSE', 'FREESTYLE_SELECTION'],
  };
  const currentPath = flowPaths[formData.purpose] || [];
  const totalSteps = currentPath.length > 1 ? currentPath.length : 6; // Fallback
  const currentStepIndex = history.length;
  const progress = totalSteps > 0 ? (currentStepIndex / totalSteps) * 100 : 0;
  
  const isFinalStep = currentFlowState === 'FINAL_STEP';
  const isPurposeSelection = currentFlowState === 'SELECTING_PURPOSE';
  const isSpecialButtonStep = currentFlowState === 'LINK_POINTS_INPUT';

  return (
    <CreationContext.Provider value={{ updateFormData, transitionTo, goBack }}>
      <FormProvider {...formMethods}>
        <form onSubmit={(e) => e.preventDefault()}>
            <div className="bg-gradient-to-br from-purple-100/80 via-blue-100/80 to-indigo-100/80 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 py-4 rounded-xl shadow-lg">
                <div className="max-w-4xl mx-auto px-4 flex flex-col">
                    {!isPurposeSelection && (
                      <div className="mb-6 flex-shrink-0">
                          <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium text-gray-800 dark:text-gray-300">Paso {currentStepIndex} de {totalSteps}</span>
                              <span className="text-sm text-gray-600 dark:text-gray-400">{Math.round(progress)}% completado</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                      </div>
                    )}
                    <Card className="glass-card border border-white/40 dark:border-white/20 shadow-glass backdrop-blur-xl flex-1 flex flex-col">
                        <CardContent className="p-6 flex-1 flex flex-col">
                          {renderCurrentStep()}
                        </CardContent>
                    </Card>
                    {!isPurposeSelection && (
                      <div className="flex justify-between items-center mt-6 flex-shrink-0">
                          <Button type="button" variant="outline" onClick={goBack} disabled={isSubmitting || isLoadingNarratives}>
                              <ChevronLeft className="mr-2 h-4 w-4" />Atrás
                          </Button>
                          <div className="ml-auto">
                              {isSpecialButtonStep ? (
                                  <Button type="button" size="lg" onClick={handleNextTransition} disabled={isLoadingNarratives}>
                                      {isLoadingNarratives && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>} Generar Narrativas
                                  </Button>
                              ) : isFinalStep ? (
                                  <Button type="button" size="lg" onClick={handleSubmit(handleFinalSubmit, onValidationErrors)} disabled={isSubmitting}>
                                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                      <Wand2 className="mr-2 h-4 w-4" />Crear Podcast
                                  </Button>
                              ) : (
                                  <Button type="button" onClick={handleNextTransition}>
                                      Siguiente <ChevronRight className="ml-2 h-4 w-4" />
                                  </Button>
                              )}
                          </div>
                      </div>
                    )}
                </div>
            </div>
        </form>
      </FormProvider>
    </CreationContext.Provider>
  );
}