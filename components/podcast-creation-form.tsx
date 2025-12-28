// components/podcast-creation-form.tsx
// VERSIÓN: 18.0 (Master Integrity - Production Ready & Full Source Provenance)

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

// Importación Dinámica para componentes pesados (Mejora de LCP)
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
import { cn } from "@/lib/utils";

// Importación de Pasos Individuales
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
  if (!context) throw new Error("CreationContext error");
  return context;
};

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

  // --- HANDLERS DE NAVEGACIÓN ---

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
      // Normalización de seguridad para el Schema v3.1
      const finalKey = key === 'selectedAgent' ? 'agentName' : key;
      setValue(finalKey as any, value, { shouldValidate: true });
    });
  }, [setValue]);

  // --- LÓGICA DE PRODUCCIÓN IA ---

  const handleGenerateDraft = async () => {
    setIsGeneratingScript(true);
    try {
      const currentValues = getValues();
      const selectedAgent = currentValues.purpose === 'inspire' ? currentValues.selectedArchetype : (currentValues.agentName || currentValues.selectedTone);

      const payload = {
        purpose: currentValues.purpose,
        style: currentValues.style || 'solo',
        duration: currentValues.duration,
        depth: currentValues.narrativeDepth,
        tone: selectedAgent,
        raw_inputs: {
          topic: currentValues.solo_topic || currentValues.archetype_topic || currentValues.question_to_answer || currentValues.link_topicA,
          motivation: currentValues.solo_motivation || currentValues.archetype_goal || currentValues.legacy_lesson || currentValues.link_catalyst,
          archetype: currentValues.selectedArchetype
        }
      };

      const { data: response, error } = await supabase.functions.invoke('generate-script-draft', { body: payload });
      if (error || !response?.success) throw new Error(response?.error || "Fallo en la conexión con la IA.");

      // CUSTODIA DE DATOS: Guardamos fuentes de Tavily
      setValue('final_title', response.draft.suggested_title);
      setValue('final_script', response.draft.script_body);
      setValue('sources', response.draft.sources || []);

      transitionTo('SCRIPT_EDITING');
    } catch (e: any) {
      toast({ title: "Error Creativo", description: e.message, variant: "destructive" });
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const handleFinalSubmit: SubmitHandler<PodcastCreationData> = useCallback(async (data) => {
    if (!supabase || !user) return;
    
    // [FIX BOTÓN PRODUCIR]: Aseguramos el mapeo final del Agente
    const finalAgent = data.purpose === 'inspire' ? data.selectedArchetype : (data.agentName || data.selectedTone || 'script-architect-v1');
    
    const payload = {
      purpose: data.purpose,
      agentName: finalAgent,
      final_script: data.final_script,
      final_title: data.final_title,
      sources: data.sources || [], // Envío de fuentes para transparencia
      inputs: { ...data }
    };
    
    const { data: queueRes, error: queueErr } = await supabase.functions.invoke('queue-podcast-job', { body: payload });
    
    if (queueRes?.success) {
      toast({ title: "¡En Producción!", description: "Tu NicePod se está horneando.", action: <CheckCircle2 className="h-5 w-5 text-green-500"/> });
      clearDraft();
      router.push('/podcasts?tab=library');
    } else {
      toast({ title: "Fallo en cola", description: queueErr?.message || "Revisa tu conexión.", variant: "destructive" });
    }
  }, [supabase, user, router, clearDraft, toast]);

  // Callback para errores de validación (Debug visual)
  const onInvalid = useCallback((errors: any) => {
    console.error("Form Validation Failed:", errors);
    toast({
      title: "Configuración incompleta",
      description: "Asegúrate de haber completado todos los pasos antes de producir.",
      variant: "destructive"
    });
  }, [toast]);

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
        const currentStyle = getValues('style');
        if (currentStyle === 'solo') nextState = 'SOLO_TALK_INPUT';
        else if (currentStyle === 'link') nextState = 'LINK_POINTS_INPUT';
        else if (currentStyle === 'archetype') nextState = 'ARCHETYPE_SELECTION';
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

    if (nextState && (fieldsToValidate.length === 0 || await trigger(fieldsToValidate))) transitionTo(nextState);
  };

  const handleGenerateNarratives = useCallback(async () => {
    setIsLoadingNarratives(true);
    try {
      const vals = getValues();
      const { data: res } = await supabase.functions.invoke('generate-narratives', {
        body: { topicA: vals.link_topicA, topicB: vals.link_topicB, catalyst: vals.link_catalyst }
      });
      if (res?.narratives) { setNarrativeOptions(res.narratives); transitionTo('NARRATIVE_SELECTION'); }
    } finally { setIsLoadingNarratives(false); }
  }, [supabase, getValues, transitionTo]);

  // --- UI METRICS ---

  const metrics = useMemo(() => {
    if (!isMounted) return { step: 0, total: 1, percent: 0, isInitial: true };
    const path = MASTER_FLOW_PATHS[formData.purpose] || MASTER_FLOW_PATHS.learn;
    const steps = path.filter(s => s !== 'SELECTING_PURPOSE');
    const idx = (steps as string[]).indexOf(currentFlowState);
    return {
      step: idx !== -1 ? idx + 1 : 1,
      total: steps.length,
      percent: idx !== -1 ? Math.round(((idx + 1) / steps.length) * 100) : 0,
      isInitial: currentFlowState === 'SELECTING_PURPOSE'
    };
  }, [currentFlowState, formData.purpose, isMounted]);

  if (!isMounted) return null;

  return (
    <CreationContext.Provider value={{ updateFormData, transitionTo, goBack }}>
      <FormProvider {...formMethods}>
        <div className="fixed inset-0 flex flex-col bg-transparent overflow-hidden h-[100dvh]">
            
            {/* 1. Progress Bar (Top Layer) */}
            {!metrics.isInitial && !isGeneratingScript && (
              <div className="flex-shrink-0 w-full pt-14 pb-4 px-6 md:pt-10 z-50">
                <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-top-2 duration-500">
                    <div className="flex justify-between items-center mb-3">
                        <div className="flex flex-col">
                            <h1 className="text-xl md:text-2xl font-black tracking-tighter text-foreground flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-primary animate-pulse" /> CONSTRUCCIÓN
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

            {/* 2. Main Content (Scrollable) */}
            <main className="flex-1 overflow-hidden flex flex-col items-center">
                <div className={cn("w-full h-full flex flex-col transition-all duration-700", metrics.isInitial ? "max-w-5xl" : "max-w-4xl px-4")}>
                    <Card className={cn("flex-1 flex flex-col overflow-hidden border-0 shadow-none relative", !metrics.isInitial && "bg-card/40 backdrop-blur-3xl rounded-3xl border border-border/40 shadow-2xl")}>
                        <CardContent className="p-0 flex-1 flex flex-col h-full overflow-hidden">
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

            {/* 3. Footer (Action Layer) */}
            <footer className="flex-shrink-0 w-full p-4 md:p-8 bg-transparent z-50">
                <div className="max-w-4xl mx-auto">
                    {!metrics.isInitial && !isGeneratingScript && (
                        <div className="flex justify-between items-center gap-4">
                            <Button type="button" variant="ghost" onClick={goBack} disabled={isSubmitting} className="h-12 px-6 rounded-xl font-bold text-muted-foreground hover:bg-white/10 transition-all">
                                <ChevronLeft className="mr-1 h-4 w-4" /> ANTERIOR
                            </Button>
                            
                            <div className="flex items-center gap-3">
                                {currentFlowState === 'DETAILS_STEP' ? (
                                    <Button type="button" onClick={handleNextTransition} className="bg-primary text-white rounded-full px-8 h-12 font-bold shadow-lg shadow-primary/20">
                                        <FileText className="mr-2 h-4 w-4" /> CREAR BORRADOR
                                    </Button>
                                ) : currentFlowState === 'FINAL_STEP' ? (
                                    <Button type="button" onClick={handleSubmit(handleFinalSubmit, onInvalid)} disabled={isSubmitting} className="bg-primary text-white rounded-full px-10 h-12 font-black shadow-xl shadow-primary/30 group active:scale-95 transition-all">
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
            
            <div className={cn("transition-all duration-300", currentPodcast ? "h-24" : "h-0")} />
        </div>
      </FormProvider>
    </CreationContext.Provider>
  );

  function renderCurrentStep() {
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
  }
}