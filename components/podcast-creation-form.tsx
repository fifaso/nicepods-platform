// components/podcast-creation-form.tsx
// VERSIÓN: 13.0 (Master Orchestrator - Full Synchronization & Source Provenance)

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
      <div className="h-64 w-full flex flex-col items-center justify-center text-muted-foreground animate-pulse">
        <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
        <span className="text-sm font-bold tracking-widest uppercase opacity-50">Abriendo Estación de Edición</span>
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
  Sparkles
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
  if (!context) throw new Error("useCreationContext debe ser usado dentro de un CreationFormProvider");
  return context;
};

// Definición Maestra de Rutas (Fuera del componente para evitar re-renders)
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

  const formMethods = useForm<PodcastCreationData>({
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
        title: "Sesión recuperada",
        description: "¿Deseas continuar con tu progreso previo?",
        duration: 8000,
        action: (
          <div className="flex gap-2">
            <ToastAction altText="Limpiar" onClick={() => { discardSession(); setHasRestorableData(false); }}>Limpiar</ToastAction>
            <ToastAction altText="Retomar" onClick={() => { restoreSession(); setHasRestorableData(false); }} className="bg-primary text-white font-bold">Continuar</ToastAction>
          </div>
        ),
      });
    }
  }, [hasRestorableData, isMounted, toast, restoreSession, discardSession]);

  // --- MÉTODOS DE TRANSICIÓN ---

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
      // Sincronización de nombres (selectedAgent -> agentName)
      const targetKey = key === 'selectedAgent' ? 'agentName' : key;
      setValue(targetKey as keyof PodcastCreationData, value, { shouldValidate: true });
    });
  };

  // --- LÓGICA DE INTELIGENCIA ---

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
          topic: data.solo_topic || data.archetype_topic || data.question_to_answer || data.link_topicA,
          motivation: data.solo_motivation || data.archetype_goal || data.legacy_lesson || data.link_catalyst,
          archetype: data.selectedArchetype
        }
      };

      const { data: aiResponse, error } = await supabase.functions.invoke('generate-script-draft', { body: payload });
      if (error || !aiResponse?.success) throw new Error(aiResponse?.error || "Fallo en la síntesis de IA.");

      // CUSTODIA DE DATOS
      setValue('final_title', aiResponse.draft.suggested_title);
      setValue('final_script', aiResponse.draft.script_body);
      setValue('sources', aiResponse.draft.sources || []);

      transitionTo('SCRIPT_EDITING');
    } catch (e: any) {
      toast({ title: "Error Creativo", description: e.message, variant: "destructive" });
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const handleFinalSubmit: SubmitHandler<PodcastCreationData> = useCallback(async (data) => {
    if (!supabase || !user) return;
    
    // Determinación final del agente basada en la tabla ai_prompts
    const finalAgent = data.purpose === 'inspire' ? data.selectedArchetype : (data.agentName || data.selectedTone || 'script-architect-v1');

    const payload = {
      purpose: data.purpose,
      style: data.style || (data.purpose === 'inspire' ? 'archetype' : 'solo'),
      agentName: finalAgent,
      final_script: data.final_script,
      final_title: data.final_title,
      sources: data.sources || [], // Transparencia total
      inputs: { ...data }
    };
    
    const { data: queueRes, error } = await supabase.functions.invoke('queue-podcast-job', { body: payload });
    
    if (queueRes?.success) {
      toast({ title: "¡En Producción!", description: "Tu NicePod se está horneando.", action: <CheckCircle2 className="h-5 w-5 text-green-500"/> });
      clearDraft();
      router.push('/podcasts?tab=library');
    } else {
      toast({ title: "Error", description: error?.message || "Fallo al encolar el trabajo.", variant: "destructive" });
    }
  }, [supabase, user, router, clearDraft, toast]);

  // --- RENDERIZADO ---

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

  // CÁLCULO DE PROGRESO (Fix Imagen 42)
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
        <div className="flex flex-col h-full w-full max-w-6xl mx-auto px-4 py-4 md:py-10">
            
            {/* Header de Progreso Elite */}
            {isMounted && !progressMetrics.isInitial && !isGeneratingScript && (
              <div className="w-full max-w-4xl mx-auto mb-6 md:mb-10 animate-in fade-in slide-in-from-top-4">
                <div className="flex justify-between items-end mb-3">
                   <div className="flex items-center gap-2">
                     <div className="p-1.5 bg-primary/10 rounded-lg"><Sparkles className="h-4 w-4 text-primary animate-pulse" /></div>
                     <h2 className="text-sm font-black uppercase tracking-widest text-foreground/70">Diseño de Podcast</h2>
                   </div>
                   <div className="text-xs font-mono font-bold text-primary bg-primary/5 px-2 py-1 rounded-md border border-primary/10">
                    {progressMetrics.percent}%
                   </div>
                </div>
                <div className="h-1.5 w-full bg-secondary/30 rounded-full overflow-hidden border border-white/5">
                    <div className="h-full bg-primary transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(168,85,247,0.4)]" style={{ width: `${progressMetrics.percent}%` }} />
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

                {/* Footer de Navegación Master */}
                {isMounted && !progressMetrics.isInitial && !isGeneratingScript && (
                    <div className="p-4 md:p-8 border-t border-border/10 flex justify-between items-center bg-background/30 backdrop-blur-md">
                        <Button type="button" variant="ghost" onClick={goBack} disabled={isSubmitting} className="h-12 px-6 rounded-2xl hover:bg-secondary/40 transition-all font-bold text-muted-foreground hover:text-foreground">
                            <ChevronLeft className="mr-2 h-4 w-4" /> ANTERIOR
                        </Button>
                        <div className="flex gap-4">
                            {currentFlowState === 'DETAILS_STEP' ? (
                                <Button type="button" onClick={handleGenerateDraft} className="bg-primary text-white rounded-full px-10 h-14 font-black shadow-lg shadow-primary/20 hover:scale-[1.03] active:scale-95 transition-all">
                                    <FileText className="mr-2 h-5 w-5" /> CREAR BORRADOR
                                </Button>
                            ) : currentFlowState === 'FINAL_STEP' ? (
                                <Button type="button" onClick={handleSubmit(handleFinalSubmit)} disabled={isSubmitting} className="bg-primary text-white rounded-full px-12 h-14 font-black shadow-2xl shadow-primary/40 active:scale-95 transition-all group">
                                    {isSubmitting ? <Loader2 className="mr-3 h-5 w-5 animate-spin" /> : <Wand2 className="mr-3 h-5 w-5 group-hover:rotate-12 transition-transform" />}
                                    INICIAR PRODUCCIÓN
                                </Button>
                            ) : (
                                <Button type="button" onClick={handleNextTransition} className="bg-foreground text-background rounded-full px-10 h-14 font-black hover:opacity-90 transition-all active:scale-95">
                                    CONTINUAR <ChevronRight className="ml-2 h-4 w-4" />
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