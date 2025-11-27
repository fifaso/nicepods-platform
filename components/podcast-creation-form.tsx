// components/podcast-creation-form.tsx
// VERSIÓN CON EDITOR DE GUION: Integra la fase de generación de borrador y edición manual.

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
import { ChevronLeft, ChevronRight, Wand2, Loader2, FileText } from "lucide-react";

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
// [NUEVO] Importamos el paso del editor
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
  | 'SCRIPT_EDITING' // [NUEVO ESTADO]
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
  
  // Estado de carga para la generación del borrador
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

  // [NUEVO] Función para llamar a la IA y generar el borrador
  const handleGenerateDraft = async () => {
    setIsGeneratingScript(true);
    try {
      const currentData = getValues();
      
      // Construimos el payload de "Materia Prima" para el arquitecto
      const draftPayload = {
        purpose: currentData.purpose,
        style: currentData.style,
        duration: currentData.duration,
        depth: currentData.narrativeDepth,
        // Enviamos todo lo que tengamos, la Edge Function sabrá qué usar
        raw_inputs: {
          solo_topic: currentData.solo_topic,
          solo_motivation: currentData.solo_motivation,
          legacy_lesson: currentData.legacy_lesson,
          question: currentData.question_to_answer,
          archetype_topic: currentData.archetype_topic,
          archetype_goal: currentData.archetype_goal,
          archetype: currentData.selectedArchetype,
          // Explorar es un caso especial con datos estructurados
          topicA: currentData.link_topicA,
          topicB: currentData.link_topicB,
          catalyst: currentData.link_catalyst
        }
      };

      const { data, error } = await supabase.functions.invoke('generate-script-draft', {
        body: draftPayload
      });

      if (error) throw new Error(error.message);
      if (!data?.success) throw new Error(data?.error || "Error generando borrador");

      // Guardamos el borrador en el estado del formulario
      setValue('final_title', data.draft.suggested_title);
      setValue('final_script', data.draft.script_body);

      // Avanzamos al editor
      transitionTo('SCRIPT_EDITING');

    } catch (error) {
      console.error("Error draft:", error);
      toast({ 
        title: "Error al crear borrador", 
        description: "Hubo un problema con la IA. Intenta de nuevo.", 
        variant: "destructive" 
      });
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const handleNextTransition = async () => {
    let fieldsToValidate: (keyof PodcastCreationData)[] = [];
    let nextState: FlowState | null = null; // Usamos null para indicar lógica custom

    switch(currentFlowState) {
      case 'SOLO_TALK_INPUT': fieldsToValidate = ['solo_topic', 'solo_motivation']; nextState = 'DETAILS_STEP'; break;
      case 'ARCHETYPE_INPUT': fieldsToValidate = ['selectedArchetype', 'archetype_topic', 'archetype_goal']; nextState = 'DETAILS_STEP'; break;
      case 'LINK_POINTS_INPUT':
        const isLinkPointsValid = await trigger(['link_topicA', 'link_topicB']);
        if (isLinkPointsValid) await handleGenerateNarratives();
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
      
      // [MODIFICACIÓN CRÍTICA]: De Detalles pasamos a Generar Borrador -> Editor
      case 'DETAILS_STEP': 
        const isDetailsValid = await trigger(['duration', 'narrativeDepth', 'selectedAgent']);
        if (isDetailsValid) {
          await handleGenerateDraft(); // Llamada Síncrona a la IA
        }
        return; // Detenemos el flujo estándar aquí

      // [NUEVO]: Del editor pasamos al estudio de audio
      case 'SCRIPT_EDITING':
        fieldsToValidate = ['final_title', 'final_script']; 
        nextState = 'AUDIO_STUDIO_STEP'; 
        break;

      case 'AUDIO_STUDIO_STEP': fieldsToValidate = ['voiceGender', 'voiceStyle', 'voicePace', 'speakingRate']; nextState = 'FINAL_STEP'; break;
    }

    if (nextState) {
      const isStepValid = await trigger(fieldsToValidate);
      if (isStepValid) transitionTo(nextState);
    }
  };

  // ... (handleGenerateNarratives se mantiene igual)
  const handleGenerateNarratives = useCallback(async () => {
    if (!supabase) { toast({ title: "Error de Conexión", variant: "destructive" }); return; }
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
      toast({ title: "Error", description: "No se pudieron generar narrativas.", variant: "destructive" });
    } finally {
      setIsLoadingNarratives(false);
    }
  }, [supabase, getValues, transitionTo, toast]);

  const handleFinalSubmit: SubmitHandler<PodcastCreationData> = useCallback(async (formData) => {
    if (!supabase || !user) { toast({ title: "Error de Autenticación", variant: "destructive" }); return; }

    let jobInputs: Record<string, any> = {};
    // ... (Lógica de jobInputs se mantiene para retrocompatibilidad, pero añadimos el script final) ...
    // Simplificamos la lógica anterior ya que ahora tenemos un Script Final Validado
    
    // Mantenemos la estructura original de inputs por si el backend necesita contexto
    switch (formData.purpose) {
        case 'learn':
        case 'freestyle':
            if (formData.style === 'solo' || formData.style === 'archetype') {
                jobInputs = { topic: formData.solo_topic, motivation: formData.solo_motivation }; // Simplificado
            }
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
      // [CAMBIO CLAVE]: Enviamos el guion editado y el título final
      final_script: formData.final_script,
      final_title: formData.final_title,
      inputs: {
        ...jobInputs,
        duration: formData.duration,
        depth: formData.narrativeDepth,
        tags: formData.tags,
        generateAudioDirectly: formData.generateAudioDirectly,
        voiceGender: formData.voiceGender,
        voiceStyle: formData.voiceStyle,
        voicePace: formData.voicePace,
        speakingRate: formData.speakingRate,
      },
    };

    if (payload.purpose === 'inspire') { payload.style = 'archetype'; payload.agentName = formData.selectedArchetype; }
    
    const { data, error } = await supabase.functions.invoke('queue-podcast-job', { body: payload });

    if (error || (data && !data.success)) {
      toast({ title: "Error al Enviar", description: data?.error?.message || error?.message, variant: "destructive" });
      return;
    }

    toast({ title: "¡Produciendo Podcast!", description: "El audio se está generando con tu guion aprobado." });
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
      // [NUEVO RENDER]
      case 'SCRIPT_EDITING': return <ScriptEditorStep />;
      case 'AUDIO_STUDIO_STEP': return <AudioStudio />;
      case 'FINAL_STEP': return <FinalStep />;
      default: return null;
    }
  };

  const flowPaths: Record<string, FlowState[]> = {
    // Actualizamos las rutas para incluir la edición
    learn: ['SELECTING_PURPOSE', 'LEARN_SUB_SELECTION', 'SOLO_TALK_INPUT', 'DETAILS_STEP', 'SCRIPT_EDITING', 'AUDIO_STUDIO_STEP', 'FINAL_STEP'],
    inspire: ['SELECTING_PURPOSE', 'INSPIRE_SUB_SELECTION', 'ARCHETYPE_INPUT', 'DETAILS_STEP', 'SCRIPT_EDITING', 'AUDIO_STUDIO_STEP', 'FINAL_STEP'],
    explore: ['SELECTING_PURPOSE', 'LINK_POINTS_INPUT', 'NARRATIVE_SELECTION', 'DETAILS_STEP', 'SCRIPT_EDITING', 'AUDIO_STUDIO_STEP', 'FINAL_STEP'],
    reflect: ['SELECTING_PURPOSE', 'LEGACY_INPUT', 'DETAILS_STEP', 'SCRIPT_EDITING', 'AUDIO_STUDIO_STEP', 'FINAL_STEP'],
    answer: ['SELECTING_PURPOSE', 'QUESTION_INPUT', 'DETAILS_STEP', 'SCRIPT_EDITING', 'AUDIO_STUDIO_STEP', 'FINAL_STEP'],
    freestyle: ['SELECTING_PURPOSE', 'FREESTYLE_SELECTION'],
  };
  
  const currentPath = flowPaths[formData.purpose] || [];
  const currentStepIndex = history.length;
  const progress = Math.min((currentStepIndex / (currentPath.length || 7)) * 100, 100); 
  const isFinalStep = currentFlowState === 'FINAL_STEP';
  const isSelectingPurpose = currentFlowState === 'SELECTING_PURPOSE';

  return (
    <CreationContext.Provider value={{ updateFormData, transitionTo, goBack }}>
      <FormProvider {...formMethods}>
        <form onSubmit={(e) => e.preventDefault()} className="h-full">
            <div className="h-[calc(100vh-4rem)] flex flex-col py-0 md:py-4 bg-transparent">
                <div className="w-full max-w-4xl mx-auto px-2 md:px-4 flex flex-col flex-grow h-full overflow-hidden">
                    
                    <Card className={`flex-1 flex flex-col overflow-hidden relative transition-all duration-500
                        ${isSelectingPurpose 
                            ? "bg-transparent border-0 shadow-none rounded-none" 
                            : "border-0 md:border border-white/40 dark:border-white/10 shadow-none md:shadow-glass backdrop-blur-xl bg-transparent md:bg-background/40 rounded-none md:rounded-xl"
                        }`}
                    >
                        {!isSelectingPurpose && (
                            <div className="absolute top-0 left-0 w-full h-1 bg-secondary/30 z-10">
                                <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500" style={{ width: `${progress}%` }} />
                            </div>
                        )}

                        <CardContent className="p-0 flex-1 flex flex-col h-full overflow-hidden relative">
                          <div className="flex-1 overflow-hidden h-full flex flex-col">
                             {renderCurrentStep()}
                          </div>
                        </CardContent>

                        {!isSelectingPurpose && (
                           <div className="flex-shrink-0 p-3 md:p-4 border-t border-border/40 bg-background/80 backdrop-blur-md flex justify-between items-center z-20">
                               <Button type="button" variant="ghost" onClick={goBack} disabled={isSubmitting || isGeneratingScript}>
                                   <ChevronLeft className="mr-2 h-4 w-4" />Atrás
                               </Button>
                               <div className="ml-auto">
                                   {currentFlowState === 'LINK_POINTS_INPUT' ? (
                                       <Button type="button" onClick={handleNextTransition} disabled={isLoadingNarratives}>
                                           {isLoadingNarratives && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>} Generar Narrativas
                                       </Button>
                                   ) : currentFlowState === 'DETAILS_STEP' ? (
                                       // [BOTÓN ESPECIAL]: Generar Borrador
                                       <Button type="button" onClick={handleNextTransition} disabled={isGeneratingScript} className="bg-primary text-white">
                                           {isGeneratingScript ? (
                                             <>
                                               <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Escribiendo Guion...
                                             </>
                                           ) : (
                                             <>
                                               <FileText className="mr-2 h-4 w-4" /> Generar Borrador
                                             </>
                                           )}
                                       </Button>
                                   ) : isFinalStep ? (
                                       <Button type="button" onClick={handleSubmit(handleFinalSubmit)} disabled={isSubmitting} className="bg-gradient-to-r from-primary to-purple-600 text-white shadow-md">
                                           {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                                           Producir Podcast
                                       </Button>
                                   ) : (
                                       <Button type="button" onClick={handleNextTransition}>
                                           Siguiente <ChevronRight className="ml-2 h-4 w-4" />
                                       </Button>
                                   )}
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