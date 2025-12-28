// components/podcast-creation-form.tsx
// VERSIÓN: 11.0 (Crystal Architecture - Background Fix & Source Provenance)

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

import dynamic from 'next/dynamic';

const ScriptEditorStep = dynamic(
  () => import('./create-flow/script-editor-step').then((mod) => mod.ScriptEditorStep),
  { 
    ssr: false, 
    loading: () => (
      <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground animate-pulse">
        <Loader2 className="h-10 w-10 animate-spin mb-4 text-primary/40" />
        <span className="text-xs font-bold tracking-widest uppercase opacity-40 text-center">Iniciando Estudio</span>
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

// Pasos del flujo
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
  if (!context) throw new Error("Context Error");
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
      const targetKey = key === 'selectedAgent' ? 'agentName' : key;
      setValue(targetKey as any, value, { shouldValidate: true });
    });
  }, [setValue]);

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
      if (error || !res?.success) throw new Error("IA no disponible.");

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
    const finalAgent = data.purpose === 'inspire' ? data.selectedArchetype : (data.agentName || data.selectedTone);
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

  const metrics = useMemo(() => {
    const path = MASTER_FLOW_PATHS[formData.purpose] || MASTER_FLOW_PATHS.learn;
    const steps = path.filter(s => s !== 'SELECTING_PURPOSE');
    const idx = (steps as string[]).indexOf(currentFlowState);
    return {
      percent: idx !== -1 ? Math.round(((idx + 1) / steps.length) * 100) : 0,
      isInitial: currentFlowState === 'SELECTING_PURPOSE'
    };
  }, [currentFlowState, formData.purpose]);

  if (!isMounted) return null;

  return (
    <CreationContext.Provider value={{ updateFormData, transitionTo, goBack }}>
      <FormProvider {...formMethods}>
        {/* FIX: Eliminamos bg-background para dejar ver el fondo global de la app */}
        <div className="fixed inset-0 flex flex-col bg-transparent overflow-hidden h-[100dvh]">
            
            {/* 1. TOP BAR: Ajustado para no tapar el fondo */}
            <div className="flex-shrink-0 w-full pt-20 pb-4 px-6 md:pt-12">
                <div className="max-w-4xl mx-auto">
                    {!metrics.isInitial && !isGeneratingScript && (
                      <div className="animate-in fade-in slide-in-from-top-2">
                        <div className="flex justify-between items-center mb-3">
                            <h1 className="text-xl md:text-2xl font-black tracking-tighter text-foreground/90">CONSTRUCCIÓN</h1>
                            <div className="text-xs font-mono font-bold text-primary bg-primary/10 px-2 py-1 rounded">{metrics.percent}%</div>
                        </div>
                        <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${metrics.percent}%` }} />
                        </div>
                      </div>
                    )}
                </div>
            </div>

            {/* 2. BODY: Contenido transparente */}
            <main className="flex-1 overflow-hidden flex flex-col items-center justify-center px-4">
                <div className={cn("w-full h-full flex flex-col max-w-4xl transition-all duration-700")}>
                    {/* El Card es lo único que tiene fondo semitransparente */}
                    <Card className={cn(
                        "flex-1 flex flex-col overflow-hidden border-0 shadow-none relative",
                        !metrics.isInitial ? "bg-card/40 backdrop-blur-3xl rounded-3xl border border-border/40 shadow-2xl" : "bg-transparent"
                    )}>
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

            {/* 3. NAVIGATION: Footer flotante */}
            <footer className="flex-shrink-0 w-full p-6 md:p-8 bg-transparent">
                <div className="max-w-4xl mx-auto">
                    {!metrics.isInitial && !isGeneratingScript && (
                        <div className="flex justify-between items-center gap-4">
                            <Button type="button" variant="ghost" onClick={goBack} disabled={isSubmitting} className="h-12 px-6 rounded-xl font-bold text-muted-foreground/80 hover:bg-white/10 transition-all">
                                <ChevronLeft className="mr-1 h-4 w-4" /> ATRÁS
                            </Button>
                            
                            <div className="flex items-center gap-3">
                                {currentFlowState === 'DETAILS_STEP' ? (
                                    <Button type="button" onClick={handleNextTransition} className="bg-primary text-white rounded-full px-8 h-12 font-bold shadow-lg">
                                        <FileText className="mr-2 h-4 w-4" /> GENERAR BORRADOR
                                    </Button>
                                ) : currentFlowState === 'FINAL_STEP' ? (
                                    <Button type="button" onClick={handleSubmit(handleFinalSubmit)} disabled={isSubmitting} className="bg-primary text-white rounded-full px-10 h-12 font-black active:scale-95 transition-all">
                                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                                        PRODUCIR
                                    </Button>
                                ) : (
                                    <Button type="button" onClick={handleNextTransition} className="bg-foreground text-background rounded-full px-8 h-12 font-bold">
                                        SIGUIENTE <ChevronRight className="ml-1 h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </footer>
            <div className={cn("transition-all", currentPodcast ? "h-24" : "h-0")} />
        </div>
      </FormProvider>
    </CreationContext.Provider>
  );
}