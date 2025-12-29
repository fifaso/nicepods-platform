// components/podcast-creation-form.tsx
// VERSIÓN: 22.0 (Master Sovereign - Universal Stability & Full Context Recovery)

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

// Importación Dinámica para optimización
import dynamic from 'next/dynamic';

const ScriptEditorStep = dynamic(
  () => import('./create-flow/script-editor-step').then((mod) => mod.ScriptEditorStep),
  { 
    ssr: false, 
    loading: () => (
      <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground animate-pulse">
        <Loader2 className="h-10 w-10 animate-spin mb-4 text-primary/40" />
        <span className="text-xs font-bold tracking-widest uppercase opacity-40 text-center">Iniciando Estación Creativa</span>
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
  Compass
} from "lucide-react";
import { ToastAction } from "@/components/ui/toast"; 
import { cn } from "@/lib/utils";

// Importación de Pasos
import { PurposeSelectionStep } from "./create-flow/purpose-selection-step";
import { LocalDiscoveryStep } from "./create-flow/local-discovery-step"; 
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
  | 'SELECTING_PURPOSE' | 'LOCAL_DISCOVERY_STEP' | 'LEARN_SUB_SELECTION' 
  | 'INSPIRE_SUB_SELECTION' | 'SOLO_TALK_INPUT' | 'ARCHETYPE_SELECTION' 
  | 'ARCHETYPE_GOAL' | 'LINK_POINTS_INPUT' | 'NARRATIVE_SELECTION' 
  | 'LEGACY_INPUT' | 'QUESTION_INPUT' | 'FREESTYLE_SELECTION' 
  | 'DETAILS_STEP' | 'TONE_SELECTION' | 'SCRIPT_EDITING' 
  | 'AUDIO_STUDIO_STEP' | 'FINAL_STEP';

interface CreationContextType {
  updateFormData: (data: Partial<PodcastCreationData>) => void;
  transitionTo: (state: FlowState) => void;
  goBack: () => void;
}

const CreationContext = createContext<CreationContextType | undefined>(undefined);
export const useCreationContext = () => {
  const context = useContext(CreationContext);
  if (!context) throw new Error("useCreationContext missing provider");
  return context;
};

const MASTER_FLOW_PATHS: Record<string, FlowState[]> = {
  learn: ['SELECTING_PURPOSE', 'LEARN_SUB_SELECTION', 'SOLO_TALK_INPUT', 'TONE_SELECTION', 'DETAILS_STEP', 'SCRIPT_EDITING', 'AUDIO_STUDIO_STEP', 'FINAL_STEP'],
  explore: ['SELECTING_PURPOSE', 'LINK_POINTS_INPUT', 'NARRATIVE_SELECTION', 'TONE_SELECTION', 'DETAILS_STEP', 'SCRIPT_EDITING', 'AUDIO_STUDIO_STEP', 'FINAL_STEP'],
  reflect: ['SELECTING_PURPOSE', 'LEGACY_INPUT', 'TONE_SELECTION', 'DETAILS_STEP', 'SCRIPT_EDITING', 'AUDIO_STUDIO_STEP', 'FINAL_STEP'],
  answer: ['SELECTING_PURPOSE', 'QUESTION_INPUT', 'TONE_SELECTION', 'DETAILS_STEP', 'SCRIPT_EDITING', 'AUDIO_STUDIO_STEP', 'FINAL_STEP'],
  local_soul: ['SELECTING_PURPOSE', 'LOCAL_DISCOVERY_STEP', 'DETAILS_STEP', 'SCRIPT_EDITING', 'AUDIO_STUDIO_STEP', 'FINAL_STEP'],
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
  const [isAnalyzingLocal, setIsAnalyzingLocal] = useState(false);
  const [isLoadingNarratives, setIsLoadingNarratives] = useState(false);
  const [narrativeOptions, setNarrativeOptions] = useState<any[]>([]);
  const [hasRestorableData, setHasRestorableData] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);

  const formMethods = useForm<PodcastCreationData | any>({
    resolver: zodResolver(PodcastCreationSchema),
    mode: "onChange",
    defaultValues: {
      purpose: "learn",
      agentName: 'solo-talk-analyst',
      sources: [],
      inputs: {}, // [FIX]: Inicialización para evitar spread de undefined
      generateAudioDirectly: true,
    },
  });

  const { handleSubmit, trigger, getValues, setValue, watch } = formMethods;
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

  // --- MÉTODOS DE TRANSICIÓN ---

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
      const finalKey = key === 'selectedAgent' ? 'agentName' : key;
      setValue(finalKey as any, value, { shouldValidate: true });
    });
  }, [setValue]);

  // --- LÓGICA DE INTELIGENCIA ---

  const handleAnalyzeLocal = async () => {
    if (!formData.location && !formData.imageContext) {
      toast({ title: "Acción requerida", description: "GPS o Imagen necesaria.", variant: "destructive" });
      return;
    }
    setIsAnalyzingLocal(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-local-discovery', {
        body: {
          latitude: formData.location?.latitude || 0,
          longitude: formData.location?.longitude || 0,
          lens: formData.selectedTone || 'Tesoros Ocultos',
          image_base64: formData.imageContext
        }
      });
      if (error || !data.success) throw new Error("Fallo en descubrimiento.");
      setValue('discovery_context', data.dossier);
      setValue('sources', data.sources || []);
      setValue('solo_topic', data.poi || "Descubrimiento Local");
      setValue('agentName', 'local-concierge-v1');
      transitionTo('DETAILS_STEP');
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setIsAnalyzingLocal(false);
    }
  };

  const handleGenerateDraft = async () => {
    setIsGeneratingScript(true);
    try {
      const data = getValues();
      const payload = {
        purpose: data.purpose,
        style: data.style || 'solo',
        duration: data.duration,
        depth: data.narrativeDepth,
        tone: data.purpose === 'inspire' ? data.selectedArchetype : (data.agentName || data.selectedTone),
        raw_inputs: {
          ...(data.inputs || {}), // [FIX]: Spread seguro
          topic: data.solo_topic || data.question_to_answer || data.link_topicA,
          motivation: data.solo_motivation || data.legacy_lesson || data.link_catalyst,
          location: data.location
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

  const handleFinalSubmit: SubmitHandler<any> = useCallback(async (data) => {
    if (!supabase || !user) return;
    const payload = {
      purpose: data.purpose,
      agentName: data.agentName || data.selectedTone || 'script-architect-v1',
      final_script: data.final_script,
      final_title: data.final_title,
      sources: data.sources || [],
      inputs: { ...data }
    };
    const { data: res } = await supabase.functions.invoke('queue-podcast-job', { body: payload });
    if (res?.success) { clearDraft(); router.push('/podcasts?tab=library'); }
  }, [supabase, user, router, clearDraft]);

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
      const vals = getValues();
      const { data } = await supabase.functions.invoke('generate-narratives', {
        body: { topicA: vals.link_topicA, topicB: vals.link_topicB, catalyst: vals.link_catalyst }
      });
      if (data?.narratives) { setNarrativeOptions(data.narratives); transitionTo('NARRATIVE_SELECTION'); }
    } finally { setIsLoadingNarratives(false); }
  }, [supabase, getValues, transitionTo]);

  // --- RENDERING LOGIC ---

  const metrics = useMemo(() => {
    if (!isMounted) return { percent: 0, isInitial: true };
    const path = MASTER_FLOW_PATHS[formData.purpose] || MASTER_FLOW_PATHS.learn;
    const steps = path.filter(s => s !== 'SELECTING_PURPOSE');
    const idx = (steps as string[]).indexOf(currentFlowState);
    return {
      percent: idx !== -1 ? Math.round(((idx + 1) / steps.length) * 100) : 0,
      isInitial: currentFlowState === 'SELECTING_PURPOSE'
    };
  }, [currentFlowState, formData.purpose, isMounted]);

  const renderCurrentStep = () => {
    if (!isMounted) return null;
    switch (currentFlowState) {
      case 'SELECTING_PURPOSE': return <PurposeSelectionStep />;
      case 'LOCAL_DISCOVERY_STEP': return <LocalDiscoveryStep />;
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
        <div className="fixed inset-0 flex flex-col bg-transparent overflow-hidden h-[100dvh]">
            <div className="flex-shrink-0 w-full pt-28 pb-4 px-6 md:pt-14">
                <div className="max-w-4xl mx-auto">
                    {!metrics.isInitial && !isGeneratingScript && (
                      <div className="animate-in fade-in slide-in-from-top-2 duration-700">
                        <div className="flex justify-between items-center mb-3">
                            <h1 className="text-xl md:text-2xl font-black tracking-tighter text-foreground/90 uppercase">CONSTRUCCIÓN</h1>
                            <div className="text-xs font-mono font-bold text-primary bg-primary/10 px-2 py-1 rounded">{metrics.percent}%</div>
                        </div>
                        <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-primary transition-all duration-1000" style={{ width: `${metrics.percent}%` }} /></div>
                      </div>
                    )}
                </div>
            </div>
            <main className="flex-1 overflow-hidden flex flex-col items-center justify-center">
                <div className={cn("w-full h-full flex flex-col transition-all duration-700", metrics.isInitial ? "max-w-5xl" : "max-w-4xl px-4")}>
                    <Card className={cn("flex-1 flex flex-col overflow-hidden border-0 shadow-none relative", !metrics.isInitial ? "bg-card/40 backdrop-blur-3xl rounded-3xl border border-border/40 shadow-2xl" : "bg-transparent")}>
                        <CardContent className="p-0 flex-1 flex flex-col h-full overflow-hidden">{isGeneratingScript ? <DraftGenerationLoader formData={formData} /> : renderCurrentStep()}</CardContent>
                    </Card>
                </div>
            </main>
            <footer className="flex-shrink-0 w-full p-6 md:p-8 bg-transparent z-50">
                <div className="max-w-4xl mx-auto">
                    {!metrics.isInitial && !isGeneratingScript && (
                        <div className="flex justify-between items-center gap-4">
                            <Button type="button" variant="ghost" onClick={goBack} disabled={isSubmitting || isAnalyzingLocal} className="h-12 px-6 rounded-xl font-bold text-muted-foreground/80 hover:bg-white/10 transition-all">ANTERIOR</Button>
                            <div className="flex items-center gap-3">
                                {currentFlowState === 'LOCAL_DISCOVERY_STEP' ? (
                                    <Button type="button" onClick={handleAnalyzeLocal} disabled={isAnalyzingLocal} className="bg-primary text-white rounded-full px-10 h-14 font-black shadow-lg flex items-center gap-2 transition-all active:scale-95">
                                        {isAnalyzingLocal ? <Loader2 className="h-5 w-5 animate-spin" /> : <Compass className="h-5 w-5 animate-pulse" />} INTERPRETAR MI MUNDO
                                    </Button>
                                ) : currentFlowState === 'DETAILS_STEP' ? (
                                    <Button type="button" onClick={handleNextTransition} className="bg-primary text-white rounded-full px-8 h-12 font-bold shadow-lg">BORRADOR</Button>
                                ) : currentFlowState === 'FINAL_STEP' ? (
                                    <Button type="button" onClick={handleSubmit(handleFinalSubmit)} disabled={isSubmitting} className="bg-primary text-white rounded-full px-10 h-12 font-black shadow-xl group transition-all active:scale-95">
                                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4 group-hover:rotate-12 transition-transform" />} PRODUCIR
                                    </Button>
                                ) : (
                                    <Button type="button" onClick={handleNextTransition} className="bg-foreground text-background rounded-full px-8 h-12 font-bold hover:opacity-90">SIGUIENTE</Button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </footer>
            <div className={cn("transition-all duration-500", currentPodcast ? "h-24" : "h-0")} />
        </div>
      </FormProvider>
    </CreationContext.Provider>
  );
}