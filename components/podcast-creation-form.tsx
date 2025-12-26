// components/podcast-creation-form.tsx
// VERSIÓN: 16.0 (Master Recovery - Zero Reference Errors & Full Provenance)

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

// Importación Dinámica de Componentes Críticos
import dynamic from 'next/dynamic';

const ScriptEditorStep = dynamic(
  () => import('./create-flow/script-editor-step').then((mod) => mod.ScriptEditorStep),
  { 
    ssr: false, 
    loading: () => (
      <div className="h-64 w-full flex flex-col items-center justify-center text-muted-foreground animate-pulse bg-secondary/10 rounded-xl">
        <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
        <span className="text-xs font-bold tracking-widest uppercase opacity-60">Iniciando Estación Creativa</span>
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
import { ArchetypeStep } from "./create-flow/archetype-step";       
import { ArchetypeInputStep } from "./create-flow/archetype-input"; 

// --- DEFINICIÓN DE TIPOS Y RUTAS ---

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

// [FIX]: Definimos la constante maestra con un nombre unificado para evitar ReferenceErrors
const MASTER_FLOW_PATHS: Record<string, FlowState[]> = {
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
    formMethods, 
    currentFlowState, 
    history, 
    (step, hist) => {
      if (step) setCurrentFlowState(step as FlowState);
      if (hist) setHistory(hist as FlowState[]);
    },
    () => setHasRestorableData(true)
  );

  useEffect(() => {
    if (isMounted && hasRestorableData) {
      toast({
        title: "Sesión encontrada",
        description: "¿Deseas continuar con tu progreso?",
        action: (
          <div className="flex gap-2">
            <ToastAction altText="X" onClick={() => { discardSession(); setHasRestorableData(false); }}>Limpiar</ToastAction>
            <ToastAction altText="O" onClick={() => { restoreSession(); setHasRestorableData(false); }} className="bg-primary text-white font-bold">Continuar</ToastAction>
          </div>
        ),
      });
    }
  }, [hasRestorableData, isMounted, toast, restoreSession, discardSession]);

  // --- MÉTODOS DE TRANSICIÓN (Memoizados para estabilidad) ---

  const transitionTo = useCallback((state: FlowState) => {
    setHistory(prev => [...prev, state]);
    setCurrentFlowState(state);
  }, []);

  const goBack = useCallback(() => {
    setHistory(prev => {
      const newHistory = [...prev];
      if (newHistory.length > 1) {
        newHistory.pop();
        setCurrentFlowState(newHistory[newHistory.length - 1]);
      }
      return newHistory;
    });
  }, []);

  const updateFormData = useCallback((data: Partial<PodcastCreationData>) => {
    Object.entries(data).forEach(([key, value]) => {
      // Normalización de nombres: mapeamos selectedAgent a agentName automáticamente
      const targetKey = key === 'selectedAgent' ? 'agentName' : key;
      setValue(targetKey as any, value, { shouldValidate: true });
    });
  }, [setValue]);

  // --- LÓGICA DE INTELIGENCIA ---

  const handleGenerateDraft = async () => {
    setIsGeneratingScript(true);
    try {
      const vals = getValues();
      const payload = {
        purpose: vals.purpose,
        style: vals.style || 'solo',
        duration: vals.duration,
        depth: vals.narrativeDepth,
        tone: vals.purpose === 'inspire' ? vals.selectedArchetype : (vals.agentName || vals.selectedTone),
        raw_inputs: {
          topic: vals.solo_topic || vals.archetype_topic || vals.question_to_answer || vals.link_topicA,
          motivation: vals.solo_motivation || vals.archetype_goal || vals.legacy_lesson || vals.link_catalyst,
          archetype: vals.selectedArchetype
        }
      };

      const { data: res, error } = await supabase.functions.invoke('generate-script-draft', { body: payload });
      if (error || !res?.success) throw new Error(res?.error || "Error de red con la IA.");

      setValue('final_title', res.draft.suggested_title);
      setValue('final_script', res.draft.script_body);
      setValue('sources', res.draft.sources || []);

      transitionTo('SCRIPT_EDITING');
    } catch (e: any) {
      toast({ title: "Fallo Creativo", description: e.message, variant: "destructive" });
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const handleNextTransition = async () => {
    let fields: any[] = [];
    let next: FlowState | null = null;

    switch(currentFlowState) {
      case 'LEARN_SUB_SELECTION': next = 'SOLO_TALK_INPUT'; break;
      case 'INSPIRE_SUB_SELECTION': next = 'ARCHETYPE_SELECTION'; break;
      case 'SOLO_TALK_INPUT': fields = ['solo_topic', 'solo_motivation']; next = 'TONE_SELECTION'; break;
      case 'ARCHETYPE_SELECTION': fields = ['selectedArchetype']; next = 'ARCHETYPE_GOAL'; break;
      case 'ARCHETYPE_GOAL': fields = ['archetype_goal']; next = 'DETAILS_STEP'; break;
      case 'LINK_POINTS_INPUT':
        if (await trigger(['link_topicA', 'link_topicB'])) await handleGenerateNarratives();
        return;
      case 'NARRATIVE_SELECTION': fields = ['link_selectedNarrative']; next = 'TONE_SELECTION'; break;
      case 'FREESTYLE_SELECTION':
        const s = getValues('style');
        if (s === 'solo') next = 'SOLO_TALK_INPUT';
        else if (s === 'link') next = 'LINK_POINTS_INPUT';
        else if (s === 'archetype') next = 'ARCHETYPE_SELECTION';
        break;
      case 'LEGACY_INPUT': fields = ['legacy_lesson']; next = 'TONE_SELECTION'; break;
      case 'QUESTION_INPUT': fields = ['question_to_answer']; next = 'TONE_SELECTION'; break;
      case 'TONE_SELECTION': fields = ['selectedTone']; next = 'DETAILS_STEP'; break;
      case 'DETAILS_STEP': 
        if (await trigger(['duration', 'narrativeDepth'])) await handleGenerateDraft();
        return;
      case 'SCRIPT_EDITING': fields = ['final_title', 'final_script']; next = 'AUDIO_STUDIO_STEP'; break;
      case 'AUDIO_STUDIO_STEP': fields = ['voiceGender', 'voiceStyle']; next = 'FINAL_STEP'; break;
    }

    if (next && (fields.length === 0 || await trigger(fields))) transitionTo(next);
  };

  const handleGenerateNarratives = useCallback(async () => {
    setIsLoadingNarratives(true);
    try {
      const v = getValues();
      const { data } = await supabase.functions.invoke('generate-narratives', {
        body: { topicA: v.link_topicA, topicB: v.link_topicB, catalyst: v.link_catalyst }
      });
      if (data?.narratives) { setNarrativeOptions(data.narratives); transitionTo('NARRATIVE_SELECTION'); }
    } finally { setIsLoadingNarratives(false); }
  }, [supabase, getValues, transitionTo]);

  const handleFinalSubmit: SubmitHandler<any> = useCallback(async (data) => {
    if (!supabase || !user) return;
    const finalAgent = data.purpose === 'inspire' ? data.selectedArchetype : (data.agentName || data.selectedTone || 'script-architect-v1');
    const payload = {
      purpose: data.purpose,
      agentName: finalAgent,
      final_script: data.final_script,
      final_title: data.final_title,
      sources: data.sources || [],
      inputs: { ...data }
    };
    const { data: result } = await supabase.functions.invoke('queue-podcast-job', { body: payload });
    if (result?.success) { clearDraft(); router.push('/podcasts?tab=library'); }
  }, [supabase, user, router, clearDraft]);

  // --- UI METRICS (Blindadas) ---

  const progressMetrics = useMemo(() => {
    if (!isMounted) return { step: 0, total: 1, percent: 0, isInitial: true };
    const path = MASTER_FLOW_PATHS[formData.purpose as keyof typeof MASTER_FLOW_PATHS] || MASTER_FLOW_PATHS.learn;
    const steps = path.filter(s => s !== 'SELECTING_PURPOSE');
    // FIX: Usamos casting a string[] para que indexOf sea compatible con currentFlowState
    const idx = (steps as string[]).indexOf(currentFlowState);
    return {
      step: idx !== -1 ? idx + 1 : 1,
      total: steps.length,
      percent: idx !== -1 ? Math.round(((idx + 1) / steps.length) * 100) : 0,
      isInitial: currentFlowState === 'SELECTING_PURPOSE'
    };
  }, [currentFlowState, formData.purpose, isMounted]);

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

  // BLOQUEO DE HIDRATACIÓN
  if (!isMounted) return null;

  return (
    <CreationContext.Provider value={{ updateFormData, transitionTo, goBack }}>
      <FormProvider {...formMethods}>
        <div className="flex flex-col h-full w-full max-w-4xl mx-auto px-4 py-4 md:py-8 overflow-hidden">
            
            {/* Progress Header */}
            {!progressMetrics.isInitial && !isGeneratingScript && (
              <div className="w-full mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex justify-between items-end mb-2">
                   <div>
                     <h2 className="text-lg font-bold tracking-tight">Arquitectura</h2>
                     <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest opacity-70">
                       Paso {progressMetrics.step} de {progressMetrics.total}
                     </p>
                   </div>
                   <div className="text-xs font-mono font-bold text-primary px-2 py-1 bg-primary/5 rounded border border-primary/10">
                    {progressMetrics.percent}%
                   </div>
                </div>
                <div className="h-1.5 w-full bg-secondary/30 rounded-full overflow-hidden border border-white/5">
                    <div className="h-full bg-primary transition-all duration-1000 ease-out" style={{ width: `${progressMetrics.percent}%` }} />
                </div>
              </div>
            )}

            <Card className={`flex-grow flex flex-col overflow-hidden relative border-0 shadow-none ${progressMetrics.isInitial ? "bg-transparent" : "bg-card/40 backdrop-blur-3xl rounded-3xl border border-border/40 shadow-2xl transition-all duration-700"}`}>
                <CardContent className="p-0 flex-grow flex flex-col h-full overflow-hidden relative">
                    {isGeneratingScript ? (
                        <DraftGenerationLoader formData={formData} />
                    ) : (
                        <div className="flex-grow overflow-y-auto custom-scrollbar h-full">
                            {renderCurrentStep()}
                        </div>
                    )}
                </CardContent>

                {/* Master Navigation */}
                {!progressMetrics.isInitial && !isGeneratingScript && (
                    <div className="p-4 md:p-6 border-t border-border/10 flex justify-between items-center bg-background/20 backdrop-blur-md z-30">
                        <Button type="button" variant="ghost" onClick={goBack} disabled={isSubmitting} className="h-11 px-5 rounded-xl font-bold text-muted-foreground hover:bg-secondary/40 transition-all">
                            <ChevronLeft className="mr-2 h-4 w-4" /> Anterior
                        </Button>
                        <div className="flex gap-3">
                            {currentFlowState === 'DETAILS_STEP' ? (
                                <Button type="button" onClick={handleNextTransition} className="bg-primary text-white rounded-full px-8 h-12 font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all">
                                    <FileText className="mr-2 h-4 w-4" /> CREAR BORRADOR
                                </Button>
                            ) : currentFlowState === 'FINAL_STEP' ? (
                                <Button type="button" onClick={handleSubmit(handleFinalSubmit)} disabled={isSubmitting} className="bg-primary text-white rounded-full px-10 h-12 font-black shadow-xl shadow-primary/30 active:scale-95 transition-all group">
                                    {isSubmitting ? <Loader2 className="mr-3 h-4 w-4 animate-spin" /> : <Wand2 className="mr-3 h-4 w-4 group-hover:rotate-12 transition-transform" />}
                                    PRODUCIR
                                </Button>
                            ) : (
                                <Button type="button" onClick={handleNextTransition} className="bg-foreground text-background rounded-full px-8 h-12 font-bold hover:opacity-90 active:scale-95 transition-all">
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