// components/podcast-creation-form.tsx
// VERSIÓN: 14.0 (Master Stability - Fixed Reference Errors & Schema Sync)

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

// Importación Dinámica
import dynamic from 'next/dynamic';

const ScriptEditorStep = dynamic(
  () => import('./create-flow/script-editor-step').then((mod) => mod.ScriptEditorStep),
  { 
    ssr: false, 
    loading: () => (
      <div className="h-64 w-full flex flex-col items-center justify-center text-muted-foreground animate-pulse">
        <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
        <span className="text-sm font-bold tracking-widest uppercase opacity-50">Cargando Editor de Audio</span>
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
  History, 
  Trash2,
  CheckCircle2,
  Sparkles,
  AlertCircle
} from "lucide-react";
import { ToastAction } from "@/components/ui/toast"; 

// Pasos del Flow
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
  | 'SELECTING_PURPOSE' | 'LEARN_SUB_SELECTION' | 'INSPIRE_SUB_SELECTION'
  | 'SOLO_TALK_INPUT' | 'ARCHETYPE_SELECTION' | 'ARCHETYPE_GOAL'      
  | 'LINK_POINTS_INPUT' | 'NARRATIVE_SELECTION' | 'LEGACY_INPUT' 
  | 'QUESTION_INPUT' | 'FREESTYLE_SELECTION' | 'DETAILS_STEP' 
  | 'TONE_SELECTION' | 'SCRIPT_EDITING' | 'AUDIO_STUDIO_STEP' | 'FINAL_STEP';

interface CreationContextType {
  updateFormData: (data: Partial<PodcastCreationData>) => void;
  transitionTo: (state: FlowState) => void;
  goBack: () => void;
}

const CreationContext = createContext<CreationContextType | undefined>(undefined);
export const useCreationContext = () => {
  const context = useContext(CreationContext);
  if (!context) throw new Error("useCreationContext must be used within a Provider");
  return context;
};

const FLOW_MAP: Record<string, FlowState[]> = {
  learn: ['SELECTING_PURPOSE', 'LEARN_SUB_SELECTION', 'SOLO_TALK_INPUT', 'TONE_SELECTION', 'DETAILS_STEP', 'SCRIPT_EDITING', 'AUDIO_STUDIO_STEP', 'FINAL_STEP'],
  inspire: ['SELECTING_PURPOSE', 'INSPIRE_SUB_SELECTION', 'ARCHETYPE_SELECTION', 'ARCHETYPE_GOAL', 'DETAILS_STEP', 'SCRIPT_EDITING', 'AUDIO_STUDIO_STEP', 'FINAL_STEP'],
  explore: ['SELECTING_PURPOSE', 'LINK_POINTS_INPUT', 'NARRATIVE_SELECTION', 'TONE_SELECTION', 'DETAILS_STEP', 'SCRIPT_EDITING', 'AUDIO_STUDIO_STEP', 'FINAL_STEP'],
  reflect: ['SELECTING_PURPOSE', 'LEGACY_INPUT', 'TONE_SELECTION', 'DETAILS_STEP', 'SCRIPT_EDITING', 'AUDIO_STUDIO_STEP', 'FINAL_STEP'],
  answer: ['SELECTING_PURPOSE', 'QUESTION_INPUT', 'TONE_SELECTION', 'DETAILS_STEP', 'SCRIPT_EDITING', 'AUDIO_STUDIO_STEP', 'FINAL_STEP'],
  freestyle: ['SELECTING_PURPOSE', 'FREESTYLE_SELECTION'],
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

  useEffect(() => { setIsMounted(true); }, []);

  const formMethods = useForm<PodcastCreationData | any>({
    resolver: zodResolver(PodcastCreationSchema),
    mode: "onChange",
    defaultValues: {
      purpose: "learn",
      solo_topic: '',
      solo_motivation: '',
      duration: '',
      narrativeDepth: '',
      generateAudioDirectly: true,
      sources: [],
    },
  });

  const { handleSubmit, trigger, getValues, setValue, watch } = formMethods;
  const { isSubmitting } = formMethods.formState;
  const formData = watch();

  const { restoreSession, discardSession, clearDraft } = usePersistentForm(
    formMethods, currentFlowState, history, 
    (step, hist) => { setHistory(hist as FlowState[]); setCurrentFlowState(step as FlowState); },
    () => setHasRestorableData(true)
  );

  useEffect(() => {
    if (isMounted && hasRestorableData) {
      toast({
        title: "Sesión pendiente",
        description: "¿Deseas retomar tu progreso?",
        action: (
          <div className="flex gap-2">
            <ToastAction altText="X" onClick={() => { discardSession(); setHasRestorableData(false); }}>Limpiar</ToastAction>
            <ToastAction altText="O" onClick={() => { restoreSession(); setHasRestorableData(false); }} className="bg-primary text-white">Continuar</ToastAction>
          </div>
        ),
      });
    }
  }, [hasRestorableData, isMounted, toast, restoreSession, discardSession]);

  // --- NAVEGACIÓN ---

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
      setValue(key as any, value, { shouldValidate: true });
    });
  };

  // --- LÓGICA DE NEGOCIO ---

  const handleGenerateDraft = async () => {
    setIsGeneratingScript(true);
    try {
      const data = getValues();
      const payload = {
        purpose: data.purpose,
        style: data.style || 'solo',
        duration: data.duration,
        depth: data.narrativeDepth,
        tone: data.purpose === 'inspire' ? data.selectedArchetype : (data.selectedTone || data.agentName),
        raw_inputs: {
          topic: data.solo_topic || data.archetype_topic || data.question_to_answer || data.link_topicA,
          motivation: data.solo_motivation || data.archetype_goal || data.legacy_lesson || data.link_catalyst,
          archetype: data.selectedArchetype
        }
      };

      const { data: res, error } = await supabase.functions.invoke('generate-script-draft', { body: payload });
      if (error || !res?.success) throw new Error(res?.error || "Fallo en IA");

      setValue('final_title', res.draft.suggested_title);
      setValue('final_script', res.draft.script_body);
      setValue('sources', res.draft.sources || []);

      transitionTo('SCRIPT_EDITING');
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setIsGeneratingScript(false);
    }
  };

  /**
   * REINCORPORACIÓN DE handleNextTransition (Línea 328 Fix)
   */
  const handleNextTransition = async () => {
    let fieldsToValidate: any[] = [];
    let nextState: FlowState | null = null;

    switch(currentFlowState) {
      case 'LEARN_SUB_SELECTION': nextState = 'SOLO_TALK_INPUT'; break;
      case 'INSPIRE_SUB_SELECTION': nextState = 'ARCHETYPE_SELECTION'; break;
      case 'SOLO_TALK_INPUT': fieldsToValidate = ['solo_topic', 'solo_motivation']; nextState = 'TONE_SELECTION'; break;
      case 'ARCHETYPE_SELECTION': fieldsToValidate = ['selectedArchetype']; nextState = 'ARCHETYPE_GOAL'; break;
      case 'ARCHETYPE_GOAL': fieldsToValidate = ['archetype_goal']; nextState = 'DETAILS_STEP'; break;
      case 'LINK_POINTS_INPUT':
        if (await trigger(['link_topicA', 'link_topicB'])) await handleGenerateNarratives();
        return;
      case 'NARRATIVE_SELECTION': fieldsToValidate = ['link_selectedNarrative']; nextState = 'TONE_SELECTION'; break;
      case 'FREESTYLE_SELECTION':
        const s = getValues('style');
        if (s === 'solo') nextState = 'SOLO_TALK_INPUT';
        else if (s === 'link') nextState = 'LINK_POINTS_INPUT';
        else if (s === 'archetype') nextState = 'ARCHETYPE_SELECTION';
        break;
      case 'LEGACY_INPUT': fieldsToValidate = ['legacy_lesson']; nextState = 'TONE_SELECTION'; break;
      case 'QUESTION_INPUT': fieldsToValidate = ['question_to_answer']; nextState = 'TONE_SELECTION'; break;
      case 'TONE_SELECTION': fieldsToValidate = ['selectedTone']; nextState = 'DETAILS_STEP'; break;
      case 'DETAILS_STEP': 
        if (await trigger(['duration', 'narrativeDepth'])) await handleGenerateDraft();
        return;
      case 'SCRIPT_EDITING': fieldsToValidate = ['final_title', 'final_script']; nextState = 'AUDIO_STUDIO_STEP'; break;
      case 'AUDIO_STUDIO_STEP': fieldsToValidate = ['voiceGender', 'voiceStyle']; nextState = 'FINAL_STEP'; break;
    }

    if (nextState && await trigger(fieldsToValidate)) transitionTo(nextState);
  };

  const handleGenerateNarratives = useCallback(async () => {
    setIsLoadingNarratives(true);
    try {
      const data = getValues();
      const { data: res } = await supabase.functions.invoke('generate-narratives', {
        body: { topicA: data.link_topicA, topicB: data.link_topicB, catalyst: data.link_catalyst }
      });
      if (res?.narratives) { setNarrativeOptions(res.narratives); transitionTo('NARRATIVE_SELECTION'); }
    } finally { setIsLoadingNarratives(false); }
  }, [supabase, getValues]);

  const handleFinalSubmit: SubmitHandler<any> = useCallback(async (data) => {
    if (!supabase || !user) return;
    const determinedAgent = data.purpose === 'inspire' ? data.selectedArchetype : (data.selectedTone || data.agentName);
    
    const payload = {
      purpose: data.purpose,
      agentName: determinedAgent,
      final_script: data.final_script,
      final_title: data.final_title,
      sources: data.sources || [],
      inputs: { ...data }
    };
    
    const { data: res } = await supabase.functions.invoke('queue-podcast-job', { body: payload });
    if (res?.success) {
      clearDraft();
      router.push('/podcasts?tab=library');
    }
  }, [supabase, user, router, clearDraft]);

  const renderCurrentStep = () => {
    if (!isMounted) return null;
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

  const progressMetrics = useMemo(() => {
    const path = FLOW_MAP[formData.purpose] || FLOW_MAP.learn;
    const steps = path.filter(s => s !== 'SELECTING_PURPOSE');
    const idx = (steps as string[]).indexOf(currentFlowState);
    return {
      step: idx !== -1 ? idx + 1 : 1,
      total: steps.length,
      percent: idx !== -1 ? Math.round(((idx + 1) / steps.length) * 100) : 0,
      isInitial: currentFlowState === 'SELECTING_PURPOSE'
    };
  }, [currentFlowState, formData.purpose]);

  return (
    <CreationContext.Provider value={{ updateFormData, transitionTo, goBack }}>
      <FormProvider {...formMethods}>
        <div className="flex flex-col h-full w-full max-w-4xl mx-auto px-4 py-4 md:py-8">
            
            {isMounted && !progressMetrics.isInitial && !isGeneratingScript && (
              <div className="w-full mb-6 animate-in fade-in slide-in-from-top-4">
                <div className="flex justify-between items-end mb-2">
                   <div>
                     <h2 className="text-lg font-bold">Creación</h2>
                     <p className="text-[10px] text-muted-foreground uppercase font-black">Paso {progressMetrics.step} de {progressMetrics.total}</p>
                   </div>
                   <div className="text-xs font-mono font-bold text-primary">{progressMetrics.percent}%</div>
                </div>
                <div className="h-1 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${progressMetrics.percent}%` }} />
                </div>
              </div>
            )}

            <Card className={`flex-grow flex flex-col overflow-hidden relative border-0 shadow-none ${progressMetrics.isInitial ? "bg-transparent" : "bg-card/40 backdrop-blur-2xl rounded-3xl border border-border/40 shadow-2xl transition-all duration-500"}`}>
                <CardContent className="p-0 flex-grow flex flex-col h-full overflow-hidden relative">
                    {isGeneratingScript ? <DraftGenerationLoader formData={formData} /> : renderCurrentStep()}
                </CardContent>

                {!progressMetrics.isInitial && !isGeneratingScript && (
                    <div className="p-4 border-t border-border/10 flex justify-between items-center bg-background/20 backdrop-blur-md">
                        <Button type="button" variant="ghost" onClick={goBack} disabled={isSubmitting} className="h-10 px-4">
                            <ChevronLeft className="mr-2 h-4 w-4" /> Atrás
                        </Button>
                        <div className="flex gap-2">
                            {currentFlowState === 'DETAILS_STEP' ? (
                                <Button type="button" onClick={handleNextTransition} className="bg-primary text-white rounded-full px-6 h-10 font-bold">
                                    <FileText className="mr-2 h-4 w-4" /> Borrador
                                </Button>
                            ) : currentFlowState === 'FINAL_STEP' ? (
                                <Button type="button" onClick={handleSubmit(handleFinalSubmit)} disabled={isSubmitting} className="bg-primary text-white rounded-full px-8 h-10 font-black">
                                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />} PRODUCIR
                                </Button>
                            ) : (
                                <Button type="button" onClick={handleNextTransition} className="bg-foreground text-background rounded-full px-6 h-10 font-bold">
                                    Siguiente <ChevronRight className="ml-2 h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </Card>
        </div>
      </FormProvider>
    </CreationContext.Provider>
  );
}