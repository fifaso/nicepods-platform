// components/podcast-creation-form.tsx
// VERSIÓN FINAL: Contenedor estricto para prevenir scroll global.

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
import { ChevronLeft, ChevronRight, Wand2, Loader2, FileText } from "lucide-react";

import { PurposeSelectionStep } from "./create-flow/purpose-selection-step";
import { LearnSubStep } from "./create-flow/LearnSubStep";
import { InspireSubStep } from "./create-flow/InspireSubStep";
import { LegacyStep } from "./create-flow/LegacyStep";
import { QuestionStep } from "./create-flow/QuestionStep";
import { StyleSelectionStep } from "./create-flow/style-selection";
import { SoloTalkStep } from "./create-flow/solo-talk-step";
import { LinkPointsStep } from "./create-flow/link-points";
import { NarrativeSelectionStep } from "./create-flow/narrative-selection-step";
import { DetailsStep } from "./create-flow/details-step";
import { FinalStep } from "./create-flow/final-step";
import { ArchetypeStep } from "./create-flow/archetype-step";
import { AudioStudio } from "./create-flow/audio-studio";
import { ScriptEditorStep } from "./create-flow/script-editor-step";

export interface NarrativeOption { 
  title: string; 
  thesis: string; 
}

export type FlowState = 
  | 'SELECTING_PURPOSE' | 'LEARN_SUB_SELECTION' | 'INSPIRE_SUB_SELECTION'
  | 'SOLO_TALK_INPUT' | 'ARCHETYPE_INPUT'
  | 'LINK_POINTS_INPUT' | 'NARRATIVE_SELECTION'
  | 'LEGACY_INPUT' | 'QUESTION_INPUT' | 'FREESTYLE_SELECTION'
  | 'DETAILS_STEP' 
  | 'SCRIPT_EDITING' 
  | 'AUDIO_STUDIO_STEP' | 'FINAL_STEP';

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
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
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
      final_title: '',
      final_script: '',
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
    let nextState: FlowState | null = null;

    switch(currentFlowState) {
      case 'SOLO_TALK_INPUT': fieldsToValidate = ['solo_topic', 'solo_motivation']; nextState = 'DETAILS_STEP'; break;
      case 'ARCHETYPE_INPUT': fieldsToValidate = ['selectedArchetype', 'archetype_topic', 'archetype_goal']; nextState = 'DETAILS_STEP'; break;
      case 'LINK_POINTS_INPUT':
        const isLinkPointsValid = await trigger(['link_topicA', 'link_topicB']);
        if (isLinkPointsValid) await handleGenerateNarratives();
        return;
      case 'NARRATIVE_SELECTION': fieldsToValidate = ['link_selectedNarrative', 'link_selectedTone']; nextState = 'DETAILS_STEP'; break;
      case 'FREESTYLE_SELECTION':
        const style = getValues('style');
        fieldsToValidate = ['style'];
        if (style === 'solo') nextState = 'SOLO_TALK_INPUT';
        else if (style === 'link') nextState = 'LINK_POINTS_INPUT';
        else if (style === 'archetype') nextState = 'ARCHETYPE_INPUT';
        break;
      case 'LEGACY_INPUT': fieldsToValidate = ['legacy_lesson']; nextState = 'DETAILS_STEP'; break;
      case 'QUESTION_INPUT': fieldsToValidate = ['question_to_answer']; nextState = 'DETAILS_STEP'; break;
      case 'DETAILS_STEP': 
        const isDetailsValid = await trigger(['duration', 'narrativeDepth', 'selectedAgent']);
        if (isDetailsValid) await handleGenerateDraft();
        return;
      case 'SCRIPT_EDITING': fieldsToValidate = ['final_title', 'final_script']; nextState = 'AUDIO_STUDIO_STEP'; break;
      case 'AUDIO_STUDIO_STEP': fieldsToValidate = ['voiceGender', 'voiceStyle', 'voicePace', 'speakingRate']; nextState = 'FINAL_STEP'; break;
    }

    if (nextState) {
      const isStepValid = await trigger(fieldsToValidate);
      if (isStepValid) transitionTo(nextState);
    }
  };

  const handleGenerateNarratives = useCallback(async () => {
    if (!supabase) { toast({ title: "Error", variant: "destructive" }); return; }
    const { link_topicA, link_topicB, link_catalyst } = getValues();
    setIsLoadingNarratives(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-narratives', {
        body: { topicA: link_topicA, topicB: link_topicB, catalyst: link_catalyst }
      });
      if (error) throw new Error(error.message);
      if (data?.narratives) {
        setNarrativeOptions(data.narratives);
        transitionTo('NARRATIVE_SELECTION');
      }
    } catch (e) {
      toast({ title: "Error", description: "Falló la generación de narrativas.", variant: "destructive" });
    } finally {
      setIsLoadingNarratives(false);
    }
  }, [supabase, getValues, transitionTo, toast]);

  const handleGenerateDraft = async () => {
    setIsGeneratingScript(true);
    try {
      const currentData = getValues();
      const draftPayload = {
        purpose: currentData.purpose,
        style: currentData.style,
        duration: currentData.duration,
        depth: currentData.narrativeDepth,
        raw_inputs: {
          solo_topic: currentData.solo_topic,
          solo_motivation: currentData.solo_motivation,
          legacy_lesson: currentData.legacy_lesson,
          question: currentData.question_to_answer,
          archetype_topic: currentData.archetype_topic,
          archetype_goal: currentData.archetype_goal,
          archetype: currentData.selectedArchetype,
          topicA: currentData.link_topicA,
          topicB: currentData.link_topicB,
          catalyst: currentData.link_catalyst
        }
      };

      const { data, error } = await supabase.functions.invoke('generate-script-draft', { body: draftPayload });

      if (error) throw new Error(error.message);
      if (!data?.success) throw new Error(data?.error || "Error generando borrador");

      setValue('final_title', data.draft.suggested_title);
      setValue('final_script', data.draft.script_body);
      transitionTo('SCRIPT_EDITING');

    } catch (error) {
      toast({ title: "Error", description: "No se pudo crear el borrador.", variant: "destructive" });
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const handleFinalSubmit: SubmitHandler<PodcastCreationData> = useCallback(async (formData) => {
    if (!supabase || !user) { toast({ title: "Error Auth", variant: "destructive" }); return; }

    let jobInputs: Record<string, any> = {};
    switch (formData.purpose) {
        case 'learn':
        case 'freestyle':
            if (formData.style === 'solo' || formData.style === 'archetype') jobInputs = { topic: formData.solo_topic, motivation: formData.solo_motivation };
            break;
        case 'inspire': jobInputs = { topic: formData.archetype_topic, motivation: formData.archetype_goal }; break;
        case 'explore': jobInputs = { topicA: formData.link_topicA, topicB: formData.link_topicB, catalyst: formData.link_catalyst, narrative: formData.link_selectedNarrative, tone: formData.link_selectedTone }; break;
        case 'reflect': jobInputs = { topic: "Reflexión Personal", motivation: formData.legacy_lesson }; break;
        case 'answer': jobInputs = { topic: formData.question_to_answer, motivation: "Respuesta" }; break;
    }
    
    const payload = {
      purpose: formData.purpose,
      style: formData.style,
      agentName: formData.selectedAgent,
      final_script: formData.final_script,
      final_title: formData.final_title,
      inputs: { ...jobInputs, duration: formData.duration, depth: formData.narrativeDepth, tags: formData.tags, generateAudioDirectly: formData.generateAudioDirectly, voiceGender: formData.voiceGender, voiceStyle: formData.voiceStyle, voicePace: formData.voicePace, speakingRate: formData.speakingRate },
    };

    if (payload.purpose === 'inspire') { payload.style = 'archetype'; payload.agentName = formData.selectedArchetype; }
    
    const { data, error } = await supabase.functions.invoke('queue-podcast-job', { body: payload });
    if (error || !data?.success) { toast({ title: "Error", description: error?.message, variant: "destructive" }); return; }
    router.push('/podcasts?tab=library');
  }, [supabase, user, toast, router]);
  
  const renderCurrentStep = () => {
    switch (currentFlowState) {
      case 'SELECTING_PURPOSE': return <PurposeSelectionStep />;
      case 'LEARN_SUB_SELECTION': return <LearnSubStep />;
      case 'INSPIRE_SUB_SELECTION': return <InspireSubStep />;
      case 'LEGACY_INPUT': return <LegacyStep />;
      case 'QUESTION_INPUT': return <QuestionStep />;
      case 'SOLO_TALK_INPUT': return <SoloTalkStep />;
      case 'ARCHETYPE_INPUT': return <ArchetypeStep />;
      case 'LINK_POINTS_INPUT': return <LinkPointsStep />;
      case 'NARRATIVE_SELECTION': return <NarrativeSelectionStep narrativeOptions={narrativeOptions} />;
      case 'FREESTYLE_SELECTION': return <StyleSelectionStep />;
      case 'DETAILS_STEP': return <DetailsStep agents={formData.purpose === 'explore' ? linkPointsAgents : soloTalkAgents} />;
      case 'SCRIPT_EDITING': return <ScriptEditorStep />;
      case 'AUDIO_STUDIO_STEP': return <AudioStudio />;
      case 'FINAL_STEP': return <FinalStep />;
      default: return null;
    }
  };

  const currentStepIndex = history.length;
  const currentPath = flowPaths[formData.purpose] || [];
  const totalSteps = currentPath.length > 1 ? currentPath.length : 6;
  const progress = totalSteps > 0 ? (currentStepIndex / totalSteps) * 100 : 0;
  const isFinalStep = currentFlowState === 'FINAL_STEP';
  const isSelectingPurpose = currentFlowState === 'SELECTING_PURPOSE';

  return (
    <CreationContext.Provider value={{ updateFormData, transitionTo, goBack }}>
      <FormProvider {...formMethods}>
        <form onSubmit={(e) => e.preventDefault()} className="h-full">
            {/* CONTENEDOR APP-SHELL: Altura fija y sin márgenes extra en móvil */}
            <div className="h-[calc(100vh-4rem)] flex flex-col py-0 md:py-4 bg-transparent">
                <div className="w-full max-w-4xl mx-auto px-0 md:px-4 flex flex-col flex-grow h-full overflow-hidden">
                    
                    {/* TARJETA PRINCIPAL: Transparencia total en selección de propósito */}
                    <Card className={`flex-1 flex flex-col overflow-hidden relative transition-all duration-500
                        ${isSelectingPurpose 
                            ? "bg-transparent border-0 shadow-none rounded-none" 
                            : "bg-transparent md:bg-background/40 border-0 md:border border-white/10 shadow-none md:shadow-xl backdrop-blur-0 md:backdrop-blur-xl rounded-none md:rounded-xl"
                        }`}
                    >
                        {!isSelectingPurpose && (
                            <div className="absolute top-0 left-0 w-full h-1 bg-secondary/30 z-10">
                                <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500" style={{ width: `${progress}%` }} />
                            </div>
                        )}

                        <CardContent className="p-0 flex-1 flex flex-col h-full overflow-hidden relative">
                          <div className="flex-1 overflow-hidden h-full flex flex-col">
                             {renderCurrentStep()}
                          </div>
                        </CardContent>

                        {!isSelectingPurpose && (
                           <div className="flex-shrink-0 p-3 md:p-4 border-t border-white/5 bg-background/60 backdrop-blur-md flex justify-between items-center z-20">
                               <Button type="button" variant="ghost" onClick={goBack} disabled={isSubmitting || isGeneratingScript}>
                                   <ChevronLeft className="mr-2 h-4 w-4" />Atrás
                               </Button>
                               <div className="ml-auto">
                                   {currentFlowState === 'LINK_POINTS_INPUT' ? (
                                       <Button type="button" onClick={handleNextTransition} disabled={isLoadingNarratives}>
                                           {isLoadingNarratives && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>} Generar Narrativas
                                       </Button>
                                   ) : currentFlowState === 'DETAILS_STEP' ? (
                                       <Button type="button" onClick={handleNextTransition} disabled={isGeneratingScript} className="bg-primary text-white">
                                           {isGeneratingScript ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Escribiendo...</> : <><FileText className="mr-2 h-4 w-4" /> Generar Borrador</>}
                                       </Button>
                                   ) : isFinalStep ? (
                                       <Button type="button" onClick={handleSubmit(handleFinalSubmit)} disabled={isSubmitting} className="bg-gradient-to-r from-primary to-purple-600 text-white shadow-md">
                                           {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                                           Producir Podcast
                                       </Button>
                                   ) : (
                                       <Button type="button" onClick={handleNextTransition}>
                                           Siguiente <ChevronRight className="ml-2 h-4 w-4" />
                                       </Button>
                                   )}
                               </div>
                           </div>
                        )}
                    </Card>
                </div>
            </div>
        </form>
      </FormProvider>
    </CreationContext.Provider>
  );
}