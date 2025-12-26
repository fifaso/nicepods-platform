// components/podcast-creation-form.tsx
// VERSIÓN: 9.3 (Fix: Navigation Logic for Sub-Steps & Archetype Flow)

"use client";

import { useState, useCallback, createContext, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useForm, FormProvider, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PodcastCreationSchema, PodcastCreationData } from "@/lib/validation/podcast-schema";
import { useAudio } from "@/contexts/audio-context";
import { usePersistentForm } from "@/hooks/use-persistent-form";

// Importación Dinámica (Lazy Load) para TipTap
import dynamic from 'next/dynamic';

const ScriptEditorStep = dynamic(
  () => import('./create-flow/script-editor-step').then((mod) => mod.ScriptEditorStep),
  { 
    ssr: false, 
    loading: () => (
      <div className="h-64 w-full flex items-center justify-center text-muted-foreground animate-pulse">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        Cargando Editor...
      </div>
    )
  }
);

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Wand2, Loader2, FileText, AlertCircle, History, Trash2 } from "lucide-react";
import { ToastAction } from "@/components/ui/toast"; 

// Importación de Pasos
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
import { AudioStudio } from "./create-flow/audio-studio";
import { ToneSelectionStep } from "./create-flow/tone-selection-step";
import { DraftGenerationLoader } from "./create-flow/draft-generation-loader";

// Importaciones del flujo de Arquetipos
import { ArchetypeStep } from "./create-flow/archetype-step";       
import { ArchetypeInputStep } from "./create-flow/archetype-input"; 

export interface NarrativeOption { 
  title: string; 
  thesis: string; 
}

export type FlowState = 
  | 'SELECTING_PURPOSE' 
  | 'LEARN_SUB_SELECTION' 
  | 'INSPIRE_SUB_SELECTION'
  | 'SOLO_TALK_INPUT' 
  | 'ARCHETYPE_SELECTION' 
  | 'ARCHETYPE_GOAL'      
  | 'LINK_POINTS_INPUT' 
  | 'NARRATIVE_SELECTION'
  | 'LEGACY_INPUT' 
  | 'QUESTION_INPUT' 
  | 'FREESTYLE_SELECTION'
  | 'DETAILS_STEP' 
  | 'TONE_SELECTION'
  | 'SCRIPT_EDITING' 
  | 'AUDIO_STUDIO_STEP' 
  | 'FINAL_STEP';

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
  const { currentPodcast } = useAudio();
  
  const [isMounted, setIsMounted] = useState(false);
  
  const [currentFlowState, setCurrentFlowState] = useState<FlowState>('SELECTING_PURPOSE');
  const [history, setHistory] = useState<FlowState[]>(['SELECTING_PURPOSE']);
  
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [isLoadingNarratives, setIsLoadingNarratives] = useState(false);
  const [narrativeOptions, setNarrativeOptions] = useState<NarrativeOption[]>([]);

  const [hasRestorableData, setHasRestorableData] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
      selectedTone: undefined,
      voiceGender: "Masculino",
      voiceStyle: "Calmado",
      voicePace: "Moderado",
      speakingRate: 1.0,
      tags: [],
      generateAudioDirectly: true,
      final_title: '',
      final_script: '',
      sources: [],
    },
  });

  const { handleSubmit, trigger, getValues, setValue, watch } = formMethods;
  const { isSubmitting } = formMethods.formState;
  const formData = watch();

  // ===========================================================================
  // SISTEMA DE HIDRATACIÓN
  // ===========================================================================

  const handleHydrationUI = useCallback((savedStep: string, savedHistory: string[]) => {
    setHistory(savedHistory as FlowState[]);
    setCurrentFlowState(savedStep as FlowState);
  }, []);

  const { restoreSession, discardSession, clearDraft } = usePersistentForm(
    formMethods, 
    currentFlowState, 
    history, 
    handleHydrationUI,
    useCallback(() => setHasRestorableData(true), []) 
  );

  useEffect(() => {
    if (isMounted && hasRestorableData) {
      toast({
        title: "Sesión encontrada",
        description: "Tienes un borrador sin guardar de tu visita anterior.",
        duration: Infinity, 
        action: (
          <div className="flex items-center gap-2">
             <ToastAction 
                altText="Nuevo" 
                onClick={() => {
                    discardSession();
                    setHasRestorableData(false);
                }} 
                className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
             >
                <Trash2 className="h-3 w-3 mr-1" /> Nuevo
             </ToastAction>
             
             <ToastAction 
                altText="Continuar" 
                onClick={() => {
                    restoreSession();
                    setHasRestorableData(false);
                }} 
                className="bg-primary text-primary-foreground hover:bg-primary/90 border-0 transition-colors"
             >
                <History className="h-3 w-3 mr-1" /> Continuar
             </ToastAction>
          </div>
        ),
      });
    }
  }, [hasRestorableData, isMounted, toast, restoreSession, discardSession]);

  // ===========================================================================

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

  const handleGenerateDraft = async () => {
    setIsGeneratingScript(true);
    try {
      const currentData = getValues();
      const draftPayload = {
        purpose: currentData.purpose,
        style: currentData.style,
        duration: currentData.duration,
        depth: currentData.narrativeDepth,
        tone: currentData.purpose === 'inspire' ? currentData.selectedArchetype : currentData.selectedTone,
        
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
      
      if (data.draft.sources && Array.isArray(data.draft.sources)) {
          setValue('sources', data.draft.sources);
      } else {
          setValue('sources', []);
      }

      transitionTo('SCRIPT_EDITING');

    } catch (error) {
      toast({ title: "Error", description: "No se pudo crear el borrador.", variant: "destructive" });
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const handleNextTransition = async () => {
    let fieldsToValidate: (keyof PodcastCreationData)[] = [];
    let nextState: FlowState | null = null;

    switch(currentFlowState) {
      // [CORRECCIÓN CRÍTICA] Agregar lógica para los sub-pasos intermedios
      case 'LEARN_SUB_SELECTION':
        // No hay validación requerida aquí, es solo selección
        nextState = 'SOLO_TALK_INPUT';
        break;

      case 'INSPIRE_SUB_SELECTION':
        // Conecta el sub-paso de Inspire con la Selección de Arquetipos
        nextState = 'ARCHETYPE_SELECTION';
        break;

      case 'SOLO_TALK_INPUT': fieldsToValidate = ['solo_topic', 'solo_motivation']; nextState = 'TONE_SELECTION'; break;
      
      case 'ARCHETYPE_SELECTION': 
          fieldsToValidate = ['selectedArchetype']; 
          nextState = 'ARCHETYPE_GOAL'; 
          break;

      case 'ARCHETYPE_GOAL': 
          // Validamos solo 'archetype_goal' porque 'archetype_topic' es oculto/auto-generado
          fieldsToValidate = ['archetype_goal']; 
          nextState = 'DETAILS_STEP'; 
          break;

      case 'LINK_POINTS_INPUT':
        const isLinkPointsValid = await trigger(['link_topicA', 'link_topicB']);
        if (isLinkPointsValid) await handleGenerateNarratives();
        else toast({ title: "Falta información", description: "Completa los temas.", variant: "destructive" });
        return;
      case 'NARRATIVE_SELECTION': fieldsToValidate = ['link_selectedNarrative']; nextState = 'TONE_SELECTION'; break;
      case 'FREESTYLE_SELECTION':
        const style = getValues('style');
        fieldsToValidate = ['style'];
        if (style === 'solo') nextState = 'SOLO_TALK_INPUT';
        else if (style === 'link') nextState = 'LINK_POINTS_INPUT';
        else if (style === 'archetype') nextState = 'ARCHETYPE_SELECTION';
        break;
      case 'LEGACY_INPUT': fieldsToValidate = ['legacy_lesson']; nextState = 'TONE_SELECTION'; break;
      case 'QUESTION_INPUT': fieldsToValidate = ['question_to_answer']; nextState = 'TONE_SELECTION'; break;
      case 'TONE_SELECTION': fieldsToValidate = ['selectedTone']; nextState = 'DETAILS_STEP'; break;
      case 'DETAILS_STEP': 
        const isDetailsValid = await trigger(['duration', 'narrativeDepth']);
        if (isDetailsValid) await handleGenerateDraft();
        else toast({ title: "Configuración incompleta", variant: "destructive" });
        return;
      case 'SCRIPT_EDITING': fieldsToValidate = ['final_title', 'final_script']; nextState = 'AUDIO_STUDIO_STEP'; break;
      case 'AUDIO_STUDIO_STEP': fieldsToValidate = ['voiceGender', 'voiceStyle', 'voicePace', 'speakingRate']; nextState = 'FINAL_STEP'; break;
    }

    if (nextState) {
      const isStepValid = await trigger(fieldsToValidate);
      if (isStepValid) transitionTo(nextState);
      else toast({ title: "Falta completar este paso", variant: "destructive", action: <AlertCircle className="h-5 w-5" /> });
    }
  };

  const handleGenerateNarratives = useCallback(async () => {
    if (!supabase) return;
    const { link_topicA, link_topicB, link_catalyst } = getValues();
    setIsLoadingNarratives(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-narratives', {
        body: { topicA: link_topicA, topicB: link_topicB, catalyst: link_catalyst }
      });
      if (data?.narratives) {
        setNarrativeOptions(data.narratives);
        transitionTo('NARRATIVE_SELECTION');
      }
    } catch (e) {
      toast({ title: "Error", variant: "destructive" });
    } finally {
      setIsLoadingNarratives(false);
    }
  }, [supabase, getValues, transitionTo, toast]);

  const handleFinalSubmit: SubmitHandler<PodcastCreationData> = useCallback(async (formData) => {
    if (!supabase || !user) return;
    const determinedAgent = formData.purpose === 'inspire' ? formData.selectedArchetype : formData.selectedTone;
    if (!determinedAgent) { toast({ title: "Falta Información", variant: "destructive" }); return; }

    let jobInputs: Record<string, any> = {};
    switch (formData.purpose) {
        case 'learn':
        case 'freestyle': if (formData.style === 'solo' || formData.style === 'archetype') jobInputs = { topic: formData.solo_topic, motivation: formData.solo_motivation }; break;
        case 'inspire': jobInputs = { topic: formData.archetype_topic, motivation: formData.archetype_goal }; break;
        case 'explore': jobInputs = { topicA: formData.link_topicA, topicB: formData.link_topicB, catalyst: formData.link_catalyst, narrative: formData.link_selectedNarrative, tone: formData.link_selectedTone }; break;
        case 'reflect': jobInputs = { topic: "Reflexión Personal", motivation: formData.legacy_lesson }; break;
        case 'answer': jobInputs = { topic: formData.question_to_answer, motivation: "Respuesta" }; break;
    }
    
    const payload = {
      purpose: formData.purpose,
      style: formData.style,
      agentName: determinedAgent,
      final_script: formData.final_script,
      final_title: formData.final_title,
      sources: formData.sources, 
      inputs: { ...jobInputs, duration: formData.duration, depth: formData.narrativeDepth, tags: formData.tags, generateAudioDirectly: formData.generateAudioDirectly, voiceGender: formData.voiceGender, voiceStyle: formData.voiceStyle, voicePace: formData.voicePace, speakingRate: formData.speakingRate },
    };
    if (payload.purpose === 'inspire') { payload.style = 'archetype'; payload.agentName = formData.selectedArchetype!; }
    
    const { data, error } = await supabase.functions.invoke('queue-podcast-job', { body: payload });
    if (error || !data?.success) { toast({ title: "Error", description: error?.message, variant: "destructive" }); return; }
    
    clearDraft();
    router.push('/podcasts?tab=library');
  }, [supabase, user, toast, router, clearDraft]);
  
  const renderCurrentStep = () => {
    switch (currentFlowState) {
      case 'SELECTING_PURPOSE': return <PurposeSelectionStep />;
      case 'LEARN_SUB_SELECTION': return <LearnSubStep />;
      case 'INSPIRE_SUB_SELECTION': return <InspireSubStep />;
      case 'LEGACY_INPUT': return <LegacyStep />;
      case 'QUESTION_INPUT': return <QuestionStep />;
      case 'SOLO_TALK_INPUT': return <SoloTalkStep />;
      
      case 'ARCHETYPE_SELECTION': return <ArchetypeStep />; 
      case 'ARCHETYPE_GOAL': return <ArchetypeInputStep />; 
      
      case 'LINK_POINTS_INPUT': return <LinkPointsStep />;
      case 'NARRATIVE_SELECTION': return <NarrativeSelectionStep narrativeOptions={narrativeOptions} />;
      case 'FREESTYLE_SELECTION': return <StyleSelectionStep />;
      case 'DETAILS_STEP': return <DetailsStep />; 
      case 'TONE_SELECTION': return <ToneSelectionStep />;
      case 'SCRIPT_EDITING': return <ScriptEditorStep />;
      case 'AUDIO_STUDIO_STEP': return <AudioStudio />;
      case 'FINAL_STEP': return <FinalStep />;
      default: return null;
    }
  };

  const isWideView = currentFlowState === 'SCRIPT_EDITING';
  const containerMaxWidth = isWideView ? "max-w-[1400px]" : "max-w-4xl";
  const playerPadding = isMounted && currentPodcast ? 'pb-24' : 'pb-4';
  const shouldShowLoader = isGeneratingScript;
  const isSelectingPurpose = currentFlowState === 'SELECTING_PURPOSE';
  const isFinalStep = currentFlowState === 'FINAL_STEP';
  const shouldShowHeader = !isSelectingPurpose && !shouldShowLoader;
  const shouldShowFooter = !isSelectingPurpose && !shouldShowLoader;

  const flowPaths: Record<string, FlowState[]> = {
    learn: ['SELECTING_PURPOSE', 'LEARN_SUB_SELECTION', 'SOLO_TALK_INPUT', 'TONE_SELECTION', 'DETAILS_STEP', 'SCRIPT_EDITING', 'AUDIO_STUDIO_STEP', 'FINAL_STEP'],
    inspire: ['SELECTING_PURPOSE', 'INSPIRE_SUB_SELECTION', 'ARCHETYPE_SELECTION', 'ARCHETYPE_GOAL', 'DETAILS_STEP', 'SCRIPT_EDITING', 'AUDIO_STUDIO_STEP', 'FINAL_STEP'],
    explore: ['SELECTING_PURPOSE', 'LINK_POINTS_INPUT', 'NARRATIVE_SELECTION', 'TONE_SELECTION', 'DETAILS_STEP', 'SCRIPT_EDITING', 'AUDIO_STUDIO_STEP', 'FINAL_STEP'],
    reflect: ['SELECTING_PURPOSE', 'LEGACY_INPUT', 'TONE_SELECTION', 'DETAILS_STEP', 'SCRIPT_EDITING', 'AUDIO_STUDIO_STEP', 'FINAL_STEP'],
    answer: ['SELECTING_PURPOSE', 'QUESTION_INPUT', 'TONE_SELECTION', 'DETAILS_STEP', 'SCRIPT_EDITING', 'AUDIO_STUDIO_STEP', 'FINAL_STEP'],
    freestyle: ['SELECTING_PURPOSE', 'FREESTYLE_SELECTION'],
  };

  const currentPathArray = flowPaths[formData.purpose] || [];
  
  // Solución simple para el tipado del indexOf
  const effectiveSteps = currentPathArray.filter(step => step !== 'SELECTING_PURPOSE');
  const totalSteps = effectiveSteps.length > 0 ? effectiveSteps.length : 6;
  const stepIndexInEffective = effectiveSteps.indexOf(currentFlowState as any);
  
  let currentStepNumber = stepIndexInEffective !== -1 ? stepIndexInEffective + 1 : 1;
  const progressPercent = Math.round((currentStepNumber / totalSteps) * 100);

  return (
    <CreationContext.Provider value={{ updateFormData, transitionTo, goBack }}>
      <FormProvider {...formMethods}>
        <form onSubmit={(e) => e.preventDefault()} className="h-full w-full overflow-hidden">
            
            <div 
                className={`fixed inset-0 w-full flex flex-col bg-transparent transition-all duration-300 pt-24 md:pt-28 ${playerPadding}`}
                style={{ zIndex: 0 }}
            >
                <div className={`w-full ${containerMaxWidth} mx-auto flex flex-col flex-grow h-full overflow-hidden relative md:px-4 py-0 md:py-4 transition-all duration-500 ease-in-out`}>
                    
                    {shouldShowHeader && (
                      <div className="w-full max-w-4xl mx-auto flex-shrink-0 px-4 py-1 z-20 mb-2">
                        <div className="flex justify-between items-end mb-1.5">
                           <div className="flex flex-col">
                             <span className="text-xs font-bold text-foreground/90 tracking-tight drop-shadow-sm">
                               {isGeneratingScript ? "Creando Guion..." : "Nuevo Podcast"}
                             </span>
                             <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold mt-0.5">
                               Paso {currentStepNumber}/{totalSteps}
                             </span>
                           </div>
                           <div className="text-right text-[10px] font-mono font-bold text-primary">
                             {progressPercent}%
                           </div>
                        </div>
                        <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden backdrop-blur-sm">
                            <div 
                              className="h-full bg-primary transition-all duration-500 ease-out shadow-[0_0_8px_rgba(168,85,247,0.6)]" 
                              style={{ width: `${progressPercent}%` }} 
                            />
                        </div>
                      </div>
                    )}

                    <Card className={`flex-1 flex flex-col overflow-hidden relative transition-all duration-500 border-0 shadow-none
                        ${isSelectingPurpose 
                            ? "bg-transparent rounded-none" 
                            : "bg-white/60 dark:bg-black/40 backdrop-blur-xl rounded-t-2xl md:rounded-xl mx-0 md:mx-0 border-0 md:border border-white/20 dark:border-white/10 shadow-lg"
                        }`}
                    >
                        <CardContent className="p-0 flex-1 flex flex-col h-full overflow-hidden relative">
                          <div className="flex-1 overflow-hidden h-full flex flex-col">
                             {shouldShowLoader ? (
                                <DraftGenerationLoader formData={formData} />
                             ) : (
                                renderCurrentStep()
                             )}
                          </div>
                        </CardContent>

                        {shouldShowFooter && (
                           <div className="flex-shrink-0 px-4 py-3 md:py-4 z-20 bg-gradient-to-t from-white/90 via-white/60 dark:from-black/90 dark:via-black/60 to-transparent backdrop-blur-md border-t border-border/10">
                               <div className="flex justify-between items-center gap-4">
                                   <Button 
                                     type="button" 
                                     variant="ghost" 
                                     onClick={goBack} 
                                     disabled={isSubmitting || isGeneratingScript}
                                     className="text-muted-foreground hover:text-foreground hover:bg-secondary/20 transition-colors h-9 px-3 text-xs"
                                   >
                                       <ChevronLeft className="mr-1 h-3 w-3" /> Atrás
                                   </Button>

                                   <div className="flex-1 flex justify-end">
                                       {currentFlowState === 'LINK_POINTS_INPUT' ? (
                                           <Button type="button" onClick={handleNextTransition} disabled={isLoadingNarratives} className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md rounded-full px-5 h-10 text-xs font-semibold">
                                               {isLoadingNarratives ? <Loader2 className="mr-2 h-3 w-3 animate-spin"/> : <Wand2 className="mr-2 h-3 w-3" />}
                                               Generar
                                           </Button>
                                       ) : currentFlowState === 'DETAILS_STEP' ? (
                                           <Button type="button" onClick={handleNextTransition} disabled={isGeneratingScript} className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md rounded-full px-5 h-10 text-xs font-semibold transition-all active:scale-95">
                                               {isGeneratingScript ? <><Loader2 className="mr-2 h-3 w-3 animate-spin" /> Escribiendo...</> : <><FileText className="mr-2 h-3 w-3" /> Crear Borrador</>}
                                           </Button>
                                       ) : isFinalStep ? (
                                           <Button type="button" onClick={handleSubmit(handleFinalSubmit)} disabled={isSubmitting} className="bg-primary text-primary-foreground shadow-md rounded-full px-6 h-10 text-xs font-semibold transition-all active:scale-95">
                                               {isSubmitting ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <Wand2 className="mr-2 h-3 w-3" />}
                                               Producir
                                           </Button>
                                       ) : (
                                           <Button 
                                              type="button" 
                                              onClick={handleNextTransition} 
                                              className="bg-foreground text-white dark:text-black hover:bg-foreground/90 shadow-md rounded-full px-5 h-10 text-xs font-semibold transition-transform active:scale-95"
                                           >
                                               Siguiente <ChevronRight className="ml-1 h-3 w-3" />
                                           </Button>
                                       )}
                                   </div>
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