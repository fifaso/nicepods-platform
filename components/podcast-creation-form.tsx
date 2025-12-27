// components/podcast-creation-form.tsx
// VERSIÓN: 10.0 (Master Integrity - Fluid Architecture & Source Provenance)

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

// Importación Dinámica de Componentes de Alto Peso
import dynamic from 'next/dynamic';

const ScriptEditorStep = dynamic(
  () => import('./create-flow/script-editor-step').then((mod) => mod.ScriptEditorStep),
  { 
    ssr: false, 
    loading: () => (
      <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground animate-pulse">
        <Loader2 className="h-10 w-10 animate-spin mb-4 text-primary/40" />
        <span className="text-xs font-bold tracking-widest uppercase opacity-40 text-center">Iniciando Estudio de Edición</span>
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

// Registro de Pasos del Flujo
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
  if (!context) throw new Error("CreationContext not found");
  return context;
};

// Rutas Maestras de Navegación
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
    formMethods, currentFlowState, history, 
    (step, hist) => {
      if (step) setCurrentFlowState(step as FlowState);
      if (hist) setHistory(hist as FlowState[]);
    },
    () => setHasRestorableData(true)
  );

  useEffect(() => {
    if (isMounted && hasRestorableData) {
      toast({
        title: "Sesión recuperada",
        description: "¿Retomar tu último borrador?",
        action: (
          <div className="flex gap-2">
            <ToastAction altText="X" onClick={() => { discardSession(); setHasRestorableData(false); }}>Limpiar</ToastAction>
            <ToastAction altText="O" onClick={() => { restoreSession(); setHasRestorableData(false); }} className="bg-primary text-white font-bold">Continuar</ToastAction>
          </div>
        ),
      });
    }
  }, [hasRestorableData, isMounted, toast, restoreSession, discardSession]);

  // --- MÉTODOS ESTRATÉGICOS ---

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
      // Normalización Quirúrgica: selectedAgent (UI) -> agentName (Backend/Schema)
      const targetKey = key === 'selectedAgent' ? 'agentName' : key;
      setValue(targetKey as any, value, { shouldValidate: true });
    });
  }, [setValue]);

  // --- LÓGICA DE INTELIGENCIA Y FUENTES ---

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
      if (error || !res?.success) throw new Error(res?.error || "Fallo en la comunicación con la IA.");

      // CUSTODIA DE DATOS: Aseguramos que las fuentes de Tavily se guarden en el estado
      setValue('final_title', res.draft.suggested_title);
      setValue('final_script', res.draft.script_body);
      setValue('sources', res.draft.sources || []);

      transitionTo('SCRIPT_EDITING');
    } catch (e: any) {
      toast({ title: "Error Creativo", description: e.message, variant: "destructive" });
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const handleFinalSubmit: SubmitHandler<any> = useCallback(async (data) => {
    if (!supabase || !user) return;
    
    // Determinación final de identidad del agente
    const finalAgent = data.purpose === 'inspire' ? data.selectedArchetype : (data.agentName || data.selectedTone || 'script-architect-v1');

    const payload = {
      purpose: data.purpose,
      agentName: finalAgent,
      final_script: data.final_script,
      final_title: data.final_title,
      sources: data.sources || [], // Transparencia total de fuentes
      inputs: { ...data }
    };
    
    const { data: result, error } = await supabase.functions.invoke('queue-podcast-job', { body: payload });
    
    if (result?.success) {
      toast({ title: "Producción Iniciada", description: "Tu podcast estará disponible en breve.", action: <CheckCircle2 className="h-5 w-5 text-green-500"/> });
      clearDraft();
      router.push('/podcasts?tab=library');
    } else {
      toast({ title: "Fallo en Producción", description: error?.message || "Revisa tu conexión.", variant: "destructive" });
    }
  }, [supabase, user, router, clearDraft, toast]);

  // --- NAVEGACIÓN TÉCNICA ---

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
    else if (next) toast({ title: "Paso incompleto", variant: "destructive", action: <AlertCircle className="h-5 w-5"/> });
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

  // --- UI DYNAMICS (Cálculo de Progreso Seguro) ---

  const metrics = useMemo(() => {
    if (!isMounted) return { step: 0, total: 1, percent: 0, isInitial: true };
    const path = MASTER_FLOW_PATHS[formData.purpose as keyof typeof MASTER_FLOW_PATHS] || MASTER_FLOW_PATHS.learn;
    const steps = path.filter(s => s !== 'SELECTING_PURPOSE');
    const idx = (steps as string[]).indexOf(currentFlowState);
    return {
      step: idx !== -1 ? idx + 1 : 1,
      total: steps.length,
      percent: idx !== -1 ? Math.round(((idx + 1) / steps.length) * 100) : 0,
      isInitial: currentFlowState === 'SELECTING_PURPOSE'
    };
  }, [currentFlowState, formData.purpose, isMounted]);

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

  if (!isMounted) return null;

  return (
    <CreationContext.Provider value={{ updateFormData, transitionTo, goBack }}>
      <FormProvider {...formMethods}>
        {/* CONTENEDOR FLUIDO: Bloqueado a 100dvh para evitar bucles de renderizado en móvil */}
        <div className="fixed inset-0 flex flex-col bg-background overflow-hidden h-[100dvh]">
            
            {/* 1. PROGRESS HEADER */}
            {!metrics.isInitial && !isGeneratingScript && (
              <div className="flex-shrink-0 w-full pt-14 pb-4 px-6 md:pt-10">
                <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-top-2">
                    <div className="flex justify-between items-center mb-3">
                        <div className="flex flex-col">
                            <h1 className="text-xl md:text-2xl font-black tracking-tighter text-foreground flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                                CONSTRUCCIÓN
                            </h1>
                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em] opacity-60">Etapa {metrics.step} de {metrics.total}</span>
                        </div>
                        <div className="text-xs font-mono font-bold text-primary bg-primary/10 px-2 py-1 rounded border border-primary/20">{metrics.percent}%</div>
                    </div>
                    <div className="h-1 w-full bg-secondary/30 rounded-full overflow-hidden border border-white/5">
                        <div className="h-full bg-primary transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(168,85,247,0.4)]" style={{ width: `${metrics.percent}%` }} />
                    </div>
                </div>
              </div>
            )}

            {/* 2. BODY CONTENT (SCROLL INTERNO) */}
            <main className="flex-1 overflow-hidden flex flex-col items-center">
                <div className={`w-full h-full flex flex-col transition-all duration-700 ${metrics.isInitial ? "max-w-5xl" : "max-w-4xl px-4"}`}>
                    <Card className={`flex-1 flex flex-col overflow-hidden relative border-0 shadow-none ${!metrics.isInitial && "bg-card/40 backdrop-blur-3xl rounded-3xl border border-border/40 shadow-2xl"}`}>
                        <CardContent className="p-0 flex-1 flex flex-col h-full overflow-hidden relative">
                            {isGeneratingScript ? (
                                <DraftGenerationLoader formData={formData} />
                            ) : (
                                <div className="flex-1 overflow-y-auto custom-scrollbar-hide px-2">
                                    {renderCurrentStep()}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>

            {/* 3. NAVIGATION FOOTER (FIJO) */}
            <footer className="flex-shrink-0 w-full p-4 md:p-8 bg-gradient-to-t from-background via-background/90 to-transparent">
                <div className="max-w-4xl mx-auto">
                    {!metrics.isInitial && !isGeneratingScript && (
                        <div className="flex justify-between items-center gap-4">
                            <Button type="button" variant="ghost" onClick={goBack} disabled={isSubmitting} className="h-12 px-6 rounded-2xl font-bold text-muted-foreground hover:bg-secondary/40">
                                <ChevronLeft className="mr-1 h-4 w-4" /> ANTERIOR
                            </Button>
                            
                            <div className="flex items-center gap-3">
                                {currentFlowState === 'DETAILS_STEP' ? (
                                    <Button type="button" onClick={handleNextTransition} className="bg-primary text-white rounded-full px-8 h-12 font-bold shadow-lg shadow-primary/20 animate-in zoom-in-95">
                                        <FileText className="mr-2 h-4 w-4" /> CREAR BORRADOR
                                    </Button>
                                ) : currentFlowState === 'FINAL_STEP' ? (
                                    <Button type="button" onClick={handleSubmit(handleFinalSubmit)} disabled={isSubmitting} className="bg-primary text-white rounded-full px-10 h-12 font-black shadow-xl shadow-primary/30 group active:scale-95 transition-all">
                                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4 group-hover:rotate-12 transition-transform" />}
                                        PRODUCIR
                                    </Button>
                                ) : (
                                    <Button type="button" onClick={handleNextTransition} className="bg-foreground text-background rounded-full px-8 h-12 font-bold hover:opacity-90 active:scale-95 transition-all">
                                        SIGUIENTE <ChevronRight className="ml-1 h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </footer>

            {/* Spacer para el reproductor global */}
            <div className={`transition-all duration-500 ${currentPodcast ? "h-24" : "h-0"}`} />
        </div>
      </FormProvider>
    </CreationContext.Provider>
  );
}