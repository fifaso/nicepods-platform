// components/podcast-creation-form.tsx
// VERSIÓN: 11.0 (Master Reliability - Fixed Types & Full Source Provenance)

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

// Importación Dinámica para optimización de carga
import dynamic from 'next/dynamic';

const ScriptEditorStep = dynamic(
  () => import('./create-flow/script-editor-step').then((mod) => mod.ScriptEditorStep),
  { 
    ssr: false, 
    loading: () => (
      <div className="h-64 w-full flex items-center justify-center text-muted-foreground animate-pulse">
        <Loader2 className="h-6 w-6 animate-spin mr-2 text-primary" />
        <span className="text-sm font-medium">Iniciando editor de guion...</span>
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

// Pasos del flujo de creación
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
  if (!context) throw new Error("useCreationContext debe ser usado dentro de un CreationFormProvider");
  return context;
};

// Rutas de navegación lógica
const FLOW_PATHS: Record<string, FlowState[]> = {
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

  const formMethods = useForm<PodcastCreationData>({
    resolver: zodResolver(PodcastCreationSchema),
    mode: "onBlur",
    defaultValues: {
      purpose: "learn",
      style: undefined,
      solo_topic: '',
      solo_motivation: '',
      duration: '',
      narrativeDepth: '',
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
        title: "Sesión pendiente",
        description: "¿Deseas retomar tu última creación?",
        action: (
          <div className="flex gap-2">
            <ToastAction altText="Descartar" onClick={() => { discardSession(); setHasRestorableData(false); }}>Limpiar</ToastAction>
            <ToastAction altText="Retomar" onClick={() => { restoreSession(); setHasRestorableData(false); }} className="bg-primary text-white">Retomar</ToastAction>
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

  const handleGenerateDraft = async () => {
    setIsGeneratingScript(true);
    try {
      const currentData = getValues();
      const selectedAgent = currentData.purpose === 'inspire' ? currentData.selectedArchetype : currentData.selectedTone;

      const payload = {
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

      const { data, error } = await supabase.functions.invoke('generate-script-draft', { body: payload });
      if (error || !data?.success) throw new Error(data?.error || "Los agentes de IA no están disponibles.");

      setValue('final_title', data.draft.suggested_title);
      setValue('final_script', data.draft.script_body);
      
      // PERSISTENCIA DE FUENTES (TAVILY)
      setValue('sources', Array.isArray(data.draft.sources) ? data.draft.sources : []);

      transitionTo('SCRIPT_EDITING');
    } catch (e: any) {
      toast({ title: "Error Creativo", description: e.message, variant: "destructive" });
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const handleFinalSubmit: SubmitHandler<PodcastCreationData> = useCallback(async (data) => {
    if (!supabase || !user) return;
    const determinedAgent = data.purpose === 'inspire' ? data.selectedArchetype : data.selectedTone;
    
    const payload = {
      purpose: data.purpose,
      style: data.style || (data.purpose === 'inspire' ? 'archetype' : 'solo'),
      agentName: determinedAgent,
      final_script: data.final_script,
      final_title: data.final_title,
      sources: data.sources || [],
      inputs: { ...data, tags: data.tags }
    };
    
    const { data: res, error } = await supabase.functions.invoke('queue-podcast-job', { body: payload });
    
    if (res?.success) {
      toast({ title: "¡Producción iniciada!", description: "Tu podcast estará listo en unos minutos.", action: <CheckCircle2 className="h-5 w-5 text-green-500"/> });
      clearDraft();
      router.push('/podcasts?tab=library');
    } else {
      toast({ title: "Error de Producción", description: error?.message || "Fallo en el servidor.", variant: "destructive" });
    }
  }, [supabase, user, toast, router, clearDraft]);

  const handleNextTransition = async () => {
    let fieldsToValidate: (keyof PodcastCreationData)[] = [];
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
      const { link_topicA, link_topicB, link_catalyst } = getValues();
      const { data } = await supabase.functions.invoke('generate-narratives', {
        body: { topicA: link_topicA, topicB: link_topicB, catalyst: link_catalyst }
      });
      if (data?.narratives) { setNarrativeOptions(data.narratives); transitionTo('NARRATIVE_SELECTION'); }
    } finally { setIsLoadingNarratives(false); }
  }, [supabase, getValues]);

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

  // CÁLCULO DE PROGRESO SEGURO PARA TYPESCRIPT
  const currentPath = FLOW_PATHS[formData.purpose] || FLOW_PATHS.learn;
  const effectiveSteps = currentPath.filter(s => s !== 'SELECTING_PURPOSE');
  
  // FIX IMAGEN 42: Cast a 'string[]' para evitar error de tipado en subconjunto de FlowState
  const currentIndex = (effectiveSteps as string[]).indexOf(currentFlowState);
  const currentStepNumber = currentIndex !== -1 ? currentIndex + 1 : 1;
  const progressPercent = Math.round((currentStepNumber / effectiveSteps.length) * 100);

  return (
    <CreationContext.Provider value={{ updateFormData, transitionTo, goBack }}>
      <FormProvider {...formMethods}>
        <div className="flex flex-col h-full w-full max-w-4xl mx-auto px-4 py-4 md:py-8">
            
            {/* Header de Progreso Blindado */}
            {isMounted && currentFlowState !== 'SELECTING_PURPOSE' && !isGeneratingScript && (
              <div className="w-full mb-4 md:mb-8 animate-in fade-in slide-in-from-top-4">
                <div className="flex justify-between items-end mb-2">
                   <div>
                     <h2 className="text-lg font-bold tracking-tight text-foreground/90">Construcción</h2>
                     <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">
                        Paso {currentStepNumber} de {effectiveSteps.length}
                     </p>
                   </div>
                   <div className="text-xs font-mono font-bold text-primary">{progressPercent}%</div>
                </div>
                <div className="h-1.5 w-full bg-secondary/30 rounded-full overflow-hidden border border-white/5">
                    <div className="h-full bg-primary transition-all duration-700 ease-out shadow-[0_0_10px_rgba(168,85,247,0.3)]" style={{ width: `${progressPercent}%` }} />
                </div>
              </div>
            )}

            {/* Contenedor Principal Adaptativo */}
            <Card className={`flex-grow flex flex-col overflow-hidden relative border-0 shadow-none ${currentFlowState === 'SELECTING_PURPOSE' ? "bg-transparent" : "bg-card/40 backdrop-blur-2xl rounded-3xl border border-border/40 shadow-2xl"}`}>
                <CardContent className="p-0 flex-grow flex flex-col h-full overflow-hidden relative">
                    {isGeneratingScript ? (
                        <DraftGenerationLoader formData={formData} />
                    ) : (
                        <div className="flex-grow overflow-y-auto custom-scrollbar">
                            {renderCurrentStep()}
                        </div>
                    )}
                </CardContent>

                {/* Footer de Navegación Profesional */}
                {isMounted && currentFlowState !== 'SELECTING_PURPOSE' && !isGeneratingScript && (
                    <div className="p-4 md:p-6 border-t border-border/10 flex justify-between items-center bg-background/20 backdrop-blur-md">
                        <Button type="button" variant="ghost" onClick={goBack} disabled={isSubmitting} className="h-11 px-5 rounded-xl hover:bg-secondary/40 transition-all">
                            <ChevronLeft className="mr-2 h-4 w-4" /> Anterior
                        </Button>
                        <div className="flex gap-3">
                            {currentFlowState === 'DETAILS_STEP' ? (
                                <Button type="button" onClick={handleNextTransition} className="bg-primary text-white rounded-full px-8 h-12 font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">
                                    <FileText className="mr-2 h-4 w-4" /> CREAR BORRADOR
                                </Button>
                            ) : currentFlowState === 'FINAL_STEP' ? (
                                <Button type="button" onClick={handleSubmit(handleFinalSubmit)} disabled={isSubmitting} className="bg-primary text-white rounded-full px-10 h-12 font-black shadow-xl shadow-primary/30 active:scale-95 transition-all">
                                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                                    PRODUCIR
                                </Button>
                            ) : (
                                <Button type="button" onClick={handleNextTransition} className="bg-foreground text-background rounded-full px-8 h-12 font-bold hover:opacity-90 transition-all">
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