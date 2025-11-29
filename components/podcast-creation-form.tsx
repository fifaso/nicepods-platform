// components/podcast-creation-form.tsx
// VERSIÓN FINAL PREMIUM: Header Informativo, Footer Integrado y UX Robusta.

"use client";

import { useState, useCallback, createContext, useContext } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useForm, FormProvider, SubmitHandler, FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PodcastCreationSchema, PodcastCreationData } from "@/lib/validation/podcast-schema";
import { soloTalkAgents, linkPointsAgents } from "@/lib/agent-config";

import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Wand2, Loader2, FileText, AlertCircle } from "lucide-react";

// Importación de Pasos del Flujo
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
import { ArchetypeStep } from "./create-flow/archetype-step";
import { AudioStudio } from "./create-flow/audio-studio";
import { ScriptEditorStep } from "./create-flow/script-editor-step";

export interface NarrativeOption { 
  title: string; 
  thesis: string; 
}

export type FlowState = 
  | 'SELECTING_PURPOSE' | 'LEARN_SUB_SELECTION' | 'INSPIRE_SUB_SELECTION'
  | 'SOLO_TALK_INPUT' | 'ARCHETYPE_INPUT'
  | 'LINK_POINTS_INPUT' | 'NARRATIVE_SELECTION'
  | 'LEGACY_INPUT' | 'QUESTION_INPUT' | 'FREESTYLE_SELECTION'
  | 'DETAILS_STEP' 
  | 'SCRIPT_EDITING' 
  | 'AUDIO_STUDIO_STEP' | 'FINAL_STEP';

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
  
  const [currentFlowState, setCurrentFlowState] = useState<FlowState>('SELECTING_PURPOSE');
  const [history, setHistory] = useState<FlowState[]>(['SELECTING_PURPOSE']);
  
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [isLoadingNarratives, setIsLoadingNarratives] = useState(false);
  const [narrativeOptions, setNarrativeOptions] = useState<NarrativeOption[]>([]);

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
      selectedAgent: undefined,
      voiceGender: "Masculino",
      voiceStyle: "Calmado",
      voicePace: "Moderado",
      speakingRate: 1.0,
      tags: [],
      generateAudioDirectly: true,
      final_title: '',
      final_script: '',
    },
  });

  const { handleSubmit, trigger, getValues, setValue, watch } = formMethods;
  const { isSubmitting } = formMethods.formState;
  const formData = watch();

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
      case 'SOLO_TALK_INPUT': fieldsToValidate = ['solo_topic', 'solo_motivation']; nextState = 'DETAILS_STEP'; break;
      case 'ARCHETYPE_INPUT': fieldsToValidate = ['selectedArchetype', 'archetype_topic', 'archetype_goal']; nextState = 'DETAILS_STEP'; break;
      case 'LINK_POINTS_INPUT':
        const isLinkPointsValid = await trigger(['link_topicA', 'link_topicB']);
        if (isLinkPointsValid) await handleGenerateNarratives();
        else toast({ title: "Falta información", description: "Completa los temas para continuar.", variant: "destructive" });
        return;
      case 'NARRATIVE_SELECTION': fieldsToValidate = ['link_selectedNarrative', 'link_selectedTone']; nextState = 'DETAILS_STEP'; break;
      case 'FREESTYLE_SELECTION':
        const style = getValues('style');
        fieldsToValidate = ['style'];
        if (style === 'solo') nextState = 'SOLO_TALK_INPUT';
        else if (style === 'link') nextState = 'LINK_POINTS_INPUT';
        else if (style === 'archetype') nextState = 'ARCHETYPE_INPUT';
        break;
      case 'LEGACY_INPUT': fieldsToValidate = ['legacy_lesson']; nextState = 'DETAILS_STEP'; break;
      case 'QUESTION_INPUT': fieldsToValidate = ['question_to_answer']; nextState = 'DETAILS_STEP'; break;
      case 'DETAILS_STEP': 
        const isDetailsValid = await trigger(['duration', 'narrativeDepth', 'selectedAgent']);
        if (isDetailsValid) await handleGenerateDraft();
        else toast({ title: "Configuración incompleta", description: "Selecciona duración y profundidad.", variant: "destructive" });
        return;
      case 'SCRIPT_EDITING': fieldsToValidate = ['final_title', 'final_script']; nextState = 'AUDIO_STUDIO_STEP'; break;
      case 'AUDIO_STUDIO_STEP': fieldsToValidate = ['voiceGender', 'voiceStyle', 'voicePace', 'speakingRate']; nextState = 'FINAL_STEP'; break;
    }

    if (nextState) {
      const isStepValid = await trigger(fieldsToValidate);
      if (isStepValid) {
        transitionTo(nextState);
      } else {
        // [MEJORA UX]: Feedback explícito si la validación falla
        toast({ 
          title: "Falta completar este paso", 
          description: "Por favor revisa los campos requeridos.", 
          variant: "destructive",
          action: <AlertCircle className="h-5 w-5" />
        });
      }
    }
  };

  const handleGenerateNarratives = useCallback(async () => {
    if (!supabase) { toast({ title: "Error", variant: "destructive" }); return; }
    const { link_topicA, link_topicB, link_catalyst } = getValues();
    setIsLoadingNarratives(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-narratives', {
        body: { topicA: link_topicA, topicB: link_topicB, catalyst: link_catalyst }
      });
      if (error) throw new Error(error.message);
      if (data?.narratives) {
        setNarrativeOptions(data.narratives);
        transitionTo('NARRATIVE_SELECTION');
      }
    } catch (e) {
      toast({ title: "Error", description: "Falló la generación de narrativas.", variant: "destructive" });
    } finally {
      setIsLoadingNarratives(false);
    }
  }, [supabase, getValues, transitionTo, toast]);

  const handleFinalSubmit: SubmitHandler<PodcastCreationData> = useCallback(async (formData) => {
    if (!supabase || !user) { toast({ title: "Error Auth", variant: "destructive" }); return; }

    let jobInputs: Record<string, any> = {};
    switch (formData.purpose) {
        case 'learn':
        case 'freestyle':
            if (formData.style === 'solo' || formData.style === 'archetype') jobInputs = { topic: formData.solo_topic, motivation: formData.solo_motivation };
            break;
        case 'inspire': jobInputs = { topic: formData.archetype_topic, motivation: formData.archetype_goal }; break;
        case 'explore': jobInputs = { topicA: formData.link_topicA, topicB: formData.link_topicB, catalyst: formData.link_catalyst, narrative: formData.link_selectedNarrative, tone: formData.link_selectedTone }; break;
        case 'reflect': jobInputs = { topic: "Reflexión Personal", motivation: formData.legacy_lesson }; break;
        case 'answer': jobInputs = { topic: formData.question_to_answer, motivation: "Respuesta" }; break;
    }
    
    const payload = {
      purpose: formData.purpose,
      style: formData.style,
      agentName: formData.selectedAgent,
      final_script: formData.final_script,
      final_title: formData.final_title,
      inputs: { ...jobInputs, duration: formData.duration, depth: formData.narrativeDepth, tags: formData.tags, generateAudioDirectly: formData.generateAudioDirectly, voiceGender: formData.voiceGender, voiceStyle: formData.voiceStyle, voicePace: formData.voicePace, speakingRate: formData.speakingRate },
    };

    if (payload.purpose === 'inspire') { payload.style = 'archetype'; payload.agentName = formData.selectedArchetype; }
    
    const { data, error } = await supabase.functions.invoke('queue-podcast-job', { body: payload });
    if (error || !data?.success) { toast({ title: "Error", description: error?.message, variant: "destructive" }); return; }
    router.push('/podcasts?tab=library');
  }, [supabase, user, toast, router]);
  
  const renderCurrentStep = () => {
    switch (currentFlowState) {
      case 'SELECTING_PURPOSE': return <PurposeSelectionStep />;
      case 'LEARN_SUB_SELECTION': return <LearnSubStep />;
      case 'INSPIRE_SUB_SELECTION': return <InspireSubStep />;
      case 'LEGACY_INPUT': return <LegacyStep />;
      case 'QUESTION_INPUT': return <QuestionStep />;
      case 'SOLO_TALK_INPUT': return <SoloTalkStep />;
      case 'ARCHETYPE_INPUT': return <ArchetypeStep />;
      case 'LINK_POINTS_INPUT': return <LinkPointsStep />;
      case 'NARRATIVE_SELECTION': return <NarrativeSelectionStep narrativeOptions={narrativeOptions} />;
      case 'FREESTYLE_SELECTION': return <StyleSelectionStep />;
      case 'DETAILS_STEP': return <DetailsStep agents={formData.purpose === 'explore' ? linkPointsAgents : soloTalkAgents} />;
      case 'SCRIPT_EDITING': return <ScriptEditorStep />;
      case 'AUDIO_STUDIO_STEP': return <AudioStudio />;
      case 'FINAL_STEP': return <FinalStep />;
      default: return null;
    }
  };

  // Configuración de Rutas y Progreso
  const flowPaths: Record<string, FlowState[]> = {
    learn: ['SELECTING_PURPOSE', 'LEARN_SUB_SELECTION', 'SOLO_TALK_INPUT', 'DETAILS_STEP', 'SCRIPT_EDITING', 'AUDIO_STUDIO_STEP', 'FINAL_STEP'],
    inspire: ['SELECTING_PURPOSE', 'INSPIRE_SUB_SELECTION', 'ARCHETYPE_INPUT', 'DETAILS_STEP', 'SCRIPT_EDITING', 'AUDIO_STUDIO_STEP', 'FINAL_STEP'],
    explore: ['SELECTING_PURPOSE', 'LINK_POINTS_INPUT', 'NARRATIVE_SELECTION', 'DETAILS_STEP', 'SCRIPT_EDITING', 'AUDIO_STUDIO_STEP', 'FINAL_STEP'],
    reflect: ['SELECTING_PURPOSE', 'LEGACY_INPUT', 'DETAILS_STEP', 'SCRIPT_EDITING', 'AUDIO_STUDIO_STEP', 'FINAL_STEP'],
    answer: ['SELECTING_PURPOSE', 'QUESTION_INPUT', 'DETAILS_STEP', 'SCRIPT_EDITING', 'AUDIO_STUDIO_STEP', 'FINAL_STEP'],
    freestyle: ['SELECTING_PURPOSE', 'FREESTYLE_SELECTION'],
  };
  
  const currentPath = flowPaths[formData.purpose] || [];
  const currentStepIndex = history.length;
  // Calculamos progreso (Evitamos división por cero)
  const totalPasosEstimados = currentPath.length > 0 ? currentPath.length : 6;
  const progress = Math.min((currentStepIndex / totalPasosEstimados) * 100, 100);
  
  const isFinalStep = currentFlowState === 'FINAL_STEP';
  const isSelectingPurpose = currentFlowState === 'SELECTING_PURPOSE';

  return (
    <CreationContext.Provider value={{ updateFormData, transitionTo, goBack }}>
      <FormProvider {...formMethods}>
        <form onSubmit={(e) => e.preventDefault()} className="h-full">
            {/* ESTRUCTURA APP-SHELL FIJA */}
            <div className="h-[calc(100vh-4rem)] flex flex-col bg-transparent">
                
                <div className="w-full max-w-4xl mx-auto flex flex-col flex-grow h-full overflow-hidden relative">
                    
                    {/* --- HEADER DE PROGRESO (Solo visible si NO es selección) --- */}
                    {!isSelectingPurpose && (
                      <div className="flex-shrink-0 px-4 py-3 z-20 bg-gradient-to-b from-background/80 to-transparent backdrop-blur-sm">
                        <div className="flex justify-between items-center mb-2">
                           {/* Información rica para el usuario */}
                           <div className="flex flex-col">
                             <span className="text-sm font-bold text-foreground tracking-tight">Nuevo Podcast</span>
                             <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
                               Paso {currentStepIndex} de {totalPasosEstimados}
                             </span>
                           </div>
                           <div className="text-right text-xs font-mono text-primary/80 font-medium">
                             {Math.round(progress)}%
                           </div>
                        </div>
                        
                        {/* Barra de Progreso Premium (Glow y Gradiente) */}
                        <div className="h-2 w-full bg-secondary/30 rounded-full overflow-hidden shadow-inner">
                            <div 
                              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(168,85,247,0.5)]" 
                              style={{ width: `${progress}%` }} 
                            />
                        </div>
                      </div>
                    )}

                    {/* --- TARJETA CONTENEDORA (Cuerpo) --- */}
                    <Card className={`flex-1 flex flex-col overflow-hidden relative transition-all duration-500 border-0 shadow-none rounded-none
                        ${isSelectingPurpose 
                            ? "bg-transparent" 
                            : "bg-transparent" // El fondo ya lo da la página, aquí queremos transparencia para los inputs
                        }`}
                    >
                        <CardContent className="p-0 flex-1 flex flex-col h-full overflow-hidden relative">
                          {/* El contenido se renderiza aquí y gestiona su propio layout interno */}
                          <div className="flex-1 overflow-hidden h-full flex flex-col">
                             {renderCurrentStep()}
                          </div>
                        </CardContent>

                        {/* --- FOOTER DE NAVEGACIÓN (Solo visible si NO es selección) --- */}
                        {!isSelectingPurpose && (
                           <div className="flex-shrink-0 px-4 py-4 md:py-6 z-20 bg-gradient-to-t from-background via-background/90 to-transparent">
                               <div className="flex justify-between items-center gap-4">
                                   
                                   {/* Botón Atrás (Sutil) */}
                                   <Button 
                                     type="button" 
                                     variant="ghost" 
                                     onClick={goBack} 
                                     disabled={isSubmitting || isGeneratingScript}
                                     className="text-muted-foreground hover:text-foreground hover:bg-secondary/20"
                                   >
                                       <ChevronLeft className="mr-1 h-4 w-4" /> Atrás
                                   </Button>

                                   {/* Botón de Acción Principal (Heroico) */}
                                   <div className="flex-1 flex justify-end">
                                       {currentFlowState === 'LINK_POINTS_INPUT' ? (
                                           <Button type="button" onClick={handleNextTransition} disabled={isLoadingNarratives} className="w-full md:w-auto bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
                                               {isLoadingNarratives ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Wand2 className="mr-2 h-4 w-4" />}
                                               Generar Narrativas
                                           </Button>
                                       ) : currentFlowState === 'DETAILS_STEP' ? (
                                           <Button type="button" onClick={handleNextTransition} disabled={isGeneratingScript} className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20">
                                               {isGeneratingScript ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Escribiendo...</> : <><FileText className="mr-2 h-4 w-4" /> Generar Borrador</>}
                                           </Button>
                                       ) : isFinalStep ? (
                                           <Button type="button" onClick={handleSubmit(handleFinalSubmit)} disabled={isSubmitting} className="w-full md:w-auto bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-fuchsia-500/20 hover:scale-[1.02] transition-transform">
                                               {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                                               Producir Podcast
                                           </Button>
                                       ) : (
                                           <Button type="button" onClick={handleNextTransition} className="w-full md:w-auto min-w-[120px] bg-foreground text-background hover:bg-foreground/90 shadow-md">
                                               Siguiente <ChevronRight className="ml-1 h-4 w-4" />
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