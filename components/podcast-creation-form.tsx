// components/podcast-creation-form.tsx
// VERSIÓN: 9.5 (Master Production - Provenance Guaranteed & Full Context)

"use client";

import { useState, useCallback, createContext, useContext, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useForm, FormProvider, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PodcastCreationSchema, PodcastCreationData } from "@/lib/validation/podcast-schema";
import { useAudio } from "@/contexts/audio-context";
import { usePersistentForm } from "@/hooks/use-persistent-form";

// Importación Dinámica (Lazy Load) para componentes pesados
import dynamic from 'next/dynamic';

const ScriptEditorStep = dynamic(
  () => import('./create-flow/script-editor-step').then((mod) => mod.ScriptEditorStep),
  { 
    ssr: false, 
    loading: () => (
      <div className="h-64 w-full flex items-center justify-center text-muted-foreground animate-pulse">
        <Loader2 className="h-6 w-6 animate-spin mr-2 text-primary" />
        <span className="text-sm font-medium">Cargando Editor de Guion...</span>
      </div>
    )
  }
);

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ChevronLeft, 
  ChevronRight, 
  Wand2, 
  Loader2, 
  FileText, 
  AlertCircle, 
  History, 
  Trash2,
  CheckCircle2
} from "lucide-react";
import { ToastAction } from "@/components/ui/toast"; 

// Importación de Pasos del Flow
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
import { ArchetypeStep } from "./create-flow/archetype-step";       
import { ArchetypeInputStep } from "./create-flow/archetype-input"; 

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
  const [narrativeOptions, setNarrativeOptions] = useState<any[]>([]);
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
      sources: [], // Fundamental para el registro de transparencia
    },
  });

  const { handleSubmit, trigger, getValues, setValue, watch } = formMethods;
  const { isSubmitting } = formMethods.formState;
  const formData = watch();

  const { restoreSession, discardSession, clearDraft } = usePersistentForm(
    formMethods, 
    currentFlowState, 
    history, 
    (savedStep, savedHistory) => {
      setHistory(savedHistory as FlowState[]);
      setCurrentFlowState(savedStep as FlowState);
    },
    () => setHasRestorableData(true) 
  );

  useEffect(() => {
    if (isMounted && hasRestorableData) {
      toast({
        title: "Borrador recuperado",
        description: "¿Deseas continuar donde te quedaste?",
        duration: 10000, 
        action: (
          <div className="flex items-center gap-2">
             <ToastAction altText="Descartar" onClick={() => { discardSession(); setHasRestorableData(false); }} className="text-xs">Limpiar</ToastAction>
             <ToastAction altText="Continuar" onClick={() => { restoreSession(); setHasRestorableData(false); }} className="bg-primary text-primary-foreground text-xs">Continuar</ToastAction>
          </div>
        ),
      });
    }
  }, [hasRestorableData, isMounted, toast, restoreSession, discardSession]);

  const transitionTo = (state: FlowState) => {
    setHistory(prev => [...prev, state]);
    setCurrentFlowState(state);
  };

  const goBack = () => {
    setHistory(prev => {
      const newHistory = [...prev];
      newHistory.pop();
      const lastStep = newHistory[newHistory.length - 1] || 'SELECTING_PURPOSE';
      setCurrentFlowState(lastStep);
      return newHistory;
    });
  };

  const updateFormData = (data: Partial<PodcastCreationData>) => {
    Object.entries(data).forEach(([key, value]) => {
      setValue(key as keyof PodcastCreationData, value, { shouldValidate: true });
    });
  };

  /**
   * FASE 1: GENERACIÓN DE INVESTIGACIÓN Y BORRADOR
   * Es el punto donde capturamos las fuentes de Tavily.
   */
  const handleGenerateDraft = async () => {
    setIsGeneratingScript(true);
    try {
      const currentData = getValues();
      
      // Determinamos el agente para que la búsqueda sea Agent-Centric
      const selectedAgent = currentData.purpose === 'inspire' ? currentData.selectedArchetype : currentData.selectedTone;

      const draftPayload = {
        purpose: currentData.purpose,
        style: currentData.style || 'solo',
        duration: currentData.duration,
        depth: currentData.narrativeDepth,
        tone: selectedAgent,
        raw_inputs: {
          topic: currentData.solo_topic || currentData.archetype_topic || currentData.question_to_answer || currentData.link_topicA,
          motivation: currentData.solo_motivation || currentData.archetype_goal || currentData.legacy_lesson || currentData.link_catalyst,
          archetype: currentData.selectedArchetype,
          topicA: currentData.link_topicA,
          topicB: currentData.link_topicB
        }
      };

      const { data, error } = await supabase.functions.invoke('generate-script-draft', { body: draftPayload });

      if (error || !data?.success) throw new Error(data?.error || "Error de comunicación con los Agentes AI.");

      // CUSTODIA DE DATOS: Guardamos el resultado de la investigación
      setValue('final_title', data.draft.suggested_title);
      setValue('final_script', data.draft.script_body);
      
      // [FIX CRÍTICO]: Sincronizamos las fuentes recolectadas por Tavily
      const researchSources = Array.isArray(data.draft.sources) ? data.draft.sources : [];
      setValue('sources', researchSources);

      transitionTo('SCRIPT_EDITING');

    } catch (error: any) {
      toast({ 
        title: "Fallo en la Investigación", 
        description: error.message || "No se pudo crear el borrador.", 
        variant: "destructive" 
      });
    } finally {
      setIsGeneratingScript(false);
    }
  };

  /**
   * FASE 2: ENVÍO A PRODUCCIÓN
   * Empaqueta el guion final y las fuentes para el Orquestador.
   */
  const handleFinalSubmit: SubmitHandler<PodcastCreationData> = useCallback(async (formData) => {
    if (!supabase || !user) return;
    
    const determinedAgent = formData.purpose === 'inspire' ? formData.selectedArchetype : formData.selectedTone;
    
    // Mapeo exhaustivo de entradas para el orquestador
    const jobInputs = {
        topic: formData.solo_topic || formData.archetype_topic || formData.question_to_answer || formData.link_topicA,
        motivation: formData.solo_motivation || formData.archetype_goal || formData.legacy_lesson || formData.link_catalyst,
        duration: formData.duration,
        depth: formData.narrativeDepth,
        tags: formData.tags,
        generateAudioDirectly: formData.generateAudioDirectly,
        voiceGender: formData.voiceGender,
        voiceStyle: formData.voiceStyle,
        voicePace: formData.voicePace,
        speakingRate: formData.speakingRate,
        archetype: formData.selectedArchetype
    };
    
    const payload = {
      purpose: formData.purpose,
      style: formData.style || (formData.purpose === 'inspire' ? 'archetype' : 'solo'),
      agentName: determinedAgent,
      final_script: formData.final_script,
      final_title: formData.final_title,
      creation_mode: 'standard',
      // [TRANSPARENCIA]: Enviamos el array de fuentes que guardamos en handleGenerateDraft
      sources: formData.sources || [], 
      inputs: jobInputs
    };
    
    const { data, error } = await supabase.functions.invoke('queue-podcast-job', { body: payload });
    
    if (error || !data?.success) {
      toast({ title: "Error de Producción", description: error?.message || "Fallo al encolar el trabajo.", variant: "destructive" });
      return;
    }
    
    toast({ 
      title: "¡Producción iniciada!", 
      description: "Tu podcast estará disponible en la biblioteca en breve.",
      action: <CheckCircle2 className="h-5 w-5 text-green-500" /> 
    });
    
    clearDraft();
    router.push('/podcasts?tab=library');
  }, [supabase, user, toast, router, clearDraft]);

  // --- LÓGICA DE NAVEGACIÓN ---

  const handleNextTransition = async () => {
    let fieldsToValidate: (keyof PodcastCreationData)[] = [];
    let nextState: FlowState | null = null;

    switch(currentFlowState) {
      case 'SELECTING_PURPOSE': 
          // La navegación se maneja dentro del componente PurposeSelectionStep vía updateFormData
          break;
      case 'LEARN_SUB_SELECTION': nextState = 'SOLO_TALK_INPUT'; break;
      case 'INSPIRE_SUB_SELECTION': nextState = 'ARCHETYPE_SELECTION'; break;
      case 'SOLO_TALK_INPUT': fieldsToValidate = ['solo_topic', 'solo_motivation']; nextState = 'TONE_SELECTION'; break;
      case 'ARCHETYPE_SELECTION': fieldsToValidate = ['selectedArchetype']; nextState = 'ARCHETYPE_GOAL'; break;
      case 'ARCHETYPE_GOAL': fieldsToValidate = ['archetype_goal']; nextState = 'DETAILS_STEP'; break;
      case 'LINK_POINTS_INPUT':
        const isInputsValid = await trigger(['link_topicA', 'link_topicB']);
        if (isInputsValid) await handleGenerateNarratives();
        return;
      case 'NARRATIVE_SELECTION': fieldsToValidate = ['link_selectedNarrative']; nextState = 'TONE_SELECTION'; break;
      case 'FREESTYLE_SELECTION':
        const style = getValues('style');
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
        return;
      case 'SCRIPT_EDITING': fieldsToValidate = ['final_title', 'final_script']; nextState = 'AUDIO_STUDIO_STEP'; break;
      case 'AUDIO_STUDIO_STEP': fieldsToValidate = ['voiceGender', 'voiceStyle']; nextState = 'FINAL_STEP'; break;
    }

    if (nextState) {
      const isStepValid = await trigger(fieldsToValidate);
      if (isStepValid) transitionTo(nextState);
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
      if (error) throw error;
      if (data?.narratives) {
        setNarrativeOptions(data.narratives);
        transitionTo('NARRATIVE_SELECTION');
      }
    } catch {
      toast({ title: "Error", description: "No pudimos conectar los ejes temáticos.", variant: "destructive" });
    } finally {
      setIsLoadingNarratives(false);
    }
  }, [supabase, getValues, transitionTo, toast]);

  // --- RENDERIZADO DINÁMICO ---

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

  // --- UI HELPERS ---

  const flowPaths: Record<string, FlowState[]> = {
    learn: ['SELECTING_PURPOSE', 'LEARN_SUB_SELECTION', 'SOLO_TALK_INPUT', 'TONE_SELECTION', 'DETAILS_STEP', 'SCRIPT_EDITING', 'AUDIO_STUDIO_STEP', 'FINAL_STEP'],
    inspire: ['SELECTING_PURPOSE', 'INSPIRE_SUB_SELECTION', 'ARCHETYPE_SELECTION', 'ARCHETYPE_GOAL', 'DETAILS_STEP', 'SCRIPT_EDITING', 'AUDIO_STUDIO_STEP', 'FINAL_STEP'],
    explore: ['SELECTING_PURPOSE', 'LINK_POINTS_INPUT', 'NARRATIVE_SELECTION', 'TONE_SELECTION', 'DETAILS_STEP', 'SCRIPT_EDITING', 'AUDIO_STUDIO_STEP', 'FINAL_STEP'],
    reflect: ['SELECTING_PURPOSE', 'LEGACY_INPUT', 'TONE_SELECTION', 'DETAILS_STEP', 'SCRIPT_EDITING', 'AUDIO_STUDIO_STEP', 'FINAL_STEP'],
    answer: ['SELECTING_PURPOSE', 'QUESTION_INPUT', 'TONE_SELECTION', 'DETAILS_STEP', 'SCRIPT_EDITING', 'AUDIO_STUDIO_STEP', 'FINAL_STEP'],
    freestyle: ['SELECTING_PURPOSE', 'FREESTYLE_SELECTION'],
  };

  const currentPath = flowPaths[formData.purpose] || [];
  const effectiveSteps = currentPath.filter(s => s !== 'SELECTING_PURPOSE');
  const currentIndex = effectiveSteps.indexOf(currentFlowState as any);
  const currentStepNumber = currentIndex !== -1 ? currentIndex + 1 : 1;
  const progressPercent = Math.round((currentStepNumber / (effectiveSteps.length || 6)) * 100);

  return (
    <CreationContext.Provider value={{ updateFormData, transitionTo, goBack }}>
      <FormProvider {...formMethods}>
        <form onSubmit={(e) => e.preventDefault()} className="h-full w-full overflow-hidden flex flex-col">
            
            {/* PROGRESS BAR HEADER */}
            {currentFlowState !== 'SELECTING_PURPOSE' && !isGeneratingScript && (
              <div className="w-full max-w-4xl mx-auto px-6 py-4 flex-shrink-0 z-20 animate-in fade-in slide-in-from-top-4">
                <div className="flex justify-between items-end mb-2">
                   <div className="flex flex-col">
                     <span className="text-sm font-bold text-foreground/80 tracking-tight">Arquitectura del Podcast</span>
                     <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mt-0.5">
                       Etapa {currentStepNumber} de {effectiveSteps.length}
                     </span>
                   </div>
                   <div className="text-right text-xs font-mono font-bold text-primary">{progressPercent}%</div>
                </div>
                <div className="h-2 w-full bg-secondary/50 rounded-full overflow-hidden backdrop-blur-sm border border-white/5">
                    <div className="h-full bg-primary transition-all duration-700 ease-out shadow-[0_0_15px_rgba(168,85,247,0.4)]" style={{ width: `${progressPercent}%` }} />
                </div>
              </div>
            )}

            {/* MAIN CONTAINER */}
            <div className={`flex-grow flex flex-col overflow-hidden relative px-4 pb-4 transition-all duration-500`}>
                <Card className={`flex-grow flex flex-col overflow-hidden relative border-0 shadow-2xl transition-all duration-500
                    ${currentFlowState === 'SELECTING_PURPOSE' 
                        ? "bg-transparent shadow-none" 
                        : "bg-white/70 dark:bg-zinc-950/80 backdrop-blur-2xl rounded-2xl md:rounded-3xl border border-white/20 dark:border-white/5"
                    }`}
                >
                    <CardContent className="p-0 flex-grow flex flex-col h-full overflow-hidden relative">
                      <div className="flex-grow overflow-hidden h-full flex flex-col">
                         {isGeneratingScript ? (
                            <DraftGenerationLoader formData={formData} />
                         ) : (
                            <div className="flex-grow overflow-y-auto custom-scrollbar h-full">
                                {renderCurrentStep()}
                            </div>
                         )}
                      </div>
                    </CardContent>

                    {/* NAVIGATION FOOTER */}
                    {currentFlowState !== 'SELECTING_PURPOSE' && !isGeneratingScript && (
                       <div className="flex-shrink-0 px-6 py-4 md:py-6 z-20 bg-gradient-to-t from-background/90 via-background/50 to-transparent backdrop-blur-md border-t border-border/10">
                           <div className="flex justify-between items-center gap-4 max-w-4xl mx-auto w-full">
                               <Button 
                                 type="button" 
                                 variant="ghost" 
                                 onClick={goBack} 
                                 disabled={isSubmitting}
                                 className="text-muted-foreground hover:text-foreground transition-all hover:bg-secondary/30 h-11 px-5 rounded-xl"
                               >
                                   <ChevronLeft className="mr-2 h-4 w-4" /> Anterior
                               </Button>

                               <div className="flex items-center gap-3">
                                   {currentFlowState === 'DETAILS_STEP' ? (
                                       <Button 
                                          type="button" 
                                          onClick={handleNextTransition} 
                                          disabled={isGeneratingScript} 
                                          className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg rounded-full px-8 h-12 text-sm font-bold transition-all active:scale-95"
                                       >
                                           <FileText className="mr-2 h-4 w-4" /> Generar Borrador
                                       </Button>
                                   ) : currentFlowState === 'FINAL_STEP' ? (
                                       <Button 
                                          type="button" 
                                          onClick={handleSubmit(handleFinalSubmit)} 
                                          disabled={isSubmitting} 
                                          className="bg-primary text-primary-foreground shadow-xl rounded-full px-10 h-12 text-sm font-black transition-all active:scale-95 group"
                                       >
                                           {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4 group-hover:rotate-12 transition-transform" />}
                                           INICIAR PRODUCCIÓN
                                       </Button>
                                   ) : (
                                       <Button 
                                          type="button" 
                                          onClick={handleNextTransition} 
                                          className="bg-foreground text-background hover:opacity-90 shadow-lg rounded-full px-8 h-12 text-sm font-bold transition-transform active:scale-95"
                                       >
                                           Continuar <ChevronRight className="ml-2 h-4 w-4" />
                                       </Button>
                                   )}
                               </div>
                           </div>
                       </div>
                    )}
                </Card>
            </div>
        </form>
      </FormProvider>
    </CreationContext.Provider>
  );
}