// components/podcast-creation-form.tsx
"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

// Importamos las herramientas profesionales para la gestión de formularios.
import { useForm, FormProvider, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Importamos nuestro "libro de reglas" (schema) y el tipo de datos del formulario.
import { PodcastCreationSchema, PodcastCreationData } from "@/lib/validation/podcast-schema";

// Importamos los componentes de UI y los iconos necesarios.
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Heart, Loader2 } from "lucide-react";

// Importamos todos los componentes que representan cada paso del flujo.
import { StyleSelectionStep } from "./create-flow/style-selection";
import { SoloTalkStep } from "./create-flow/solo-talk-step";
import { LinkPointsStep } from "./create-flow/link-points";
import { NarrativeSelectionStep } from "./create-flow/narrative-selection";
import { DetailsStep } from "./create-flow/details-step";
import { FinalStep } from "./create-flow/final-step";

// Definimos la estructura del objeto de una opción de narrativa para claridad de tipos.
export interface NarrativeOption { 
  title: string; 
  thesis: string; 
}

export function PodcastCreationForm() {
  // Hooks estándar de React y Next.js para navegación y notificaciones.
  const router = useRouter();
  const { toast } = useToast();
  // Nuestro hook personalizado para obtener información de autenticación y el cliente de Supabase.
  const { supabase } = useAuth();
  
  // Estados locales para controlar la lógica de la interfaz de usuario.
  const [step, setStep] = useState(1); // Controla el paso actual del formulario multi-paso.
  const [isSubmitting, setIsSubmitting] = useState(false); // Controla el estado de carga al enviar.
  const [narrativeOptions, setNarrativeOptions] = useState<NarrativeOption[]>([]); // Almacena las narrativas generadas por la IA.

  // Inicialización del manejador de formularios profesional (react-hook-form).
  const formMethods = useForm<PodcastCreationData>({
    // Conectamos nuestro "libro de reglas" de Zod para la validación automática.
    resolver: zodResolver(PodcastCreationSchema),
    // El modo 'onChange' valida los campos a medida que el usuario escribe, mejorando la UX.
    mode: "onChange",
    // Definimos los valores iniciales para todos los campos del formulario.
    // Es crucial inicializar todos los campos para evitar errores de "componente no controlado".
    defaultValues: {
      style: undefined,
      solo_topic: '',
      solo_motivation: '',
      link_topicA: '',
      link_topicB: '',
      link_catalyst: '',
      link_selectedNarrative: null,
      link_selectedTone: undefined, // Usamos 'undefined' para que el placeholder del Select funcione correctamente.
      duration: '',
      narrativeDepth: '',
      tags: [],
    }
  });

  // Función para que los componentes hijos (como StyleSelectionStep) puedan actualizar el estado del formulario.
  const updateFormData = useCallback((data: Partial<PodcastCreationData>) => {
    for (const key in data) {
      // Usamos 'as keyof' para asegurar a TypeScript que la clave es válida para nuestro tipo de datos.
      formMethods.setValue(
        key as keyof PodcastCreationData, 
        data[key as keyof PodcastCreationData], 
        { shouldValidate: true } // Pedimos que se re-valide el formulario tras el cambio.
      );
    }
  }, [formMethods]);
  
  // Funciones simples para navegar entre los pasos.
  const handleNext = () => setStep(previousStep => previousStep + 1);
  const handleBack = () => setStep(previousStep => previousStep - 1);

  // Función asíncrona para llamar a la Edge Function que genera las narrativas.
  const handleGenerateNarratives = async () => {
    setIsSubmitting(true);
    try {
      const { link_topicA, link_topicB, link_catalyst } = formMethods.getValues();
      const { data, error } = await supabase.functions.invoke('generate-narratives', { body: { topicA: link_topicA, topicB: link_topicB, catalyst: link_catalyst } });
      if (error) throw new Error(error.message);
      if (!data.narratives || data.narratives.length === 0) throw new Error("La IA no pudo generar narrativas. Intenta ajustar tus temas.");
      setNarrativeOptions(data.narratives);
      handleNext(); // Si todo va bien, avanzamos al siguiente paso.
    } catch (error: any) {
      toast({ title: "Falló la Generación de Narrativas", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // La función que se ejecuta cuando el formulario se envía y *pasa la validación de Zod*.
  const onSubmit: SubmitHandler<PodcastCreationData> = useCallback(async (formData) => {
    setIsSubmitting(true);
    let payload: object;
    
    // Construimos el objeto 'payload' que enviaremos a la Edge Function,
    // basándonos en el estilo seleccionado por el usuario.
    if (formData.style === 'solo') {
      payload = { style: 'solo', inputs: { topic: formData.solo_topic, motivation: formData.solo_motivation, duration: formData.duration, narrativeDepth: formData.narrativeDepth, tags: formData.tags } };
    } else if (formData.style === 'link' && formData.link_selectedNarrative) {
      payload = { style: 'link', inputs: { narrative: formData.link_selectedNarrative, tone: formData.link_selectedTone, duration: formData.duration, narrativeDepth: formData.narrativeDepth, tags: formData.tags } };
    } else {
      toast({ title: "Error", description: "Datos del formulario inválidos.", variant: "destructive" });
      setIsSubmitting(false);
      return;
    }

    try {
      const { error } = await supabase.functions.invoke('queue-podcast-job', { body: payload });
      if (error) { throw new Error(error.message); }
      toast({ title: "¡Podcast Encolado!", description: "Tu idea ha sido enviada a nuestros agentes de IA." });
      router.push(`/dashboard/creations`);
    } catch (error: any) {
      toast({ title: "Falló al Encolar el Trabajo", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }, [supabase, toast, router]);

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;
  
  // Función que decide qué componente de paso mostrar basándose en el estado 'step' y el 'style' seleccionado.
  const renderStep = () => {
    switch (step) {
      case 1: 
        return <StyleSelectionStep updateFormData={updateFormData} onNext={handleNext} />;
      case 2:
        const style = formMethods.watch('style');
        if (style === 'solo') return <SoloTalkStep />;
        if (style === 'link') return <LinkPointsStep />;
        return null; // No mostrar nada si aún no se ha seleccionado un estilo.
      case 3:
        const currentStyle = formMethods.watch('style');
        if (currentStyle === 'solo') return <DetailsStep />;
        if (currentStyle === 'link') return <NarrativeSelectionStep narrativeOptions={narrativeOptions} />;
        return null;
      case 4: 
        return <FinalStep />;
      default: 
        return <div>Error: Paso inválido.</div>;
    }
  };

  return (
    // 'FormProvider' es un componente mágico que actúa como un "Wi-Fi" para el formulario.
    // Expone todos los 'formMethods' a cualquier componente hijo que quiera conectarse,
    // sin necesidad de pasar props manualmente.
    <FormProvider {...formMethods}>
      <div className="bg-gradient-to-br from-purple-100/80 via-blue-100/80 to-indigo-100/80 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 py-4 rounded-xl shadow-lg">
          <form onSubmit={formMethods.handleSubmit(onSubmit)}>
              <div className="max-w-4xl mx-auto px-4 flex flex-col">
                  <div className="mb-6 flex-shrink-0">
                      <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-800 dark:text-gray-300">Paso {step} de {totalSteps}</span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">{Math.round(progress)}% completado</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                  </div>
                  <Card className="glass-card border border-white/40 dark:border-white/20 shadow-glass backdrop-blur-xl flex-1 flex flex-col">
                      <CardContent className="p-6 flex-1 flex flex-col">{renderStep()}</CardContent>
                  </Card>
                  <div className="flex justify-between items-center mt-6 flex-shrink-0">
                      <Button type="button" variant="outline" onClick={handleBack} disabled={step === 1} className="bg-white/80 dark:bg-gray-800/50">
                          <ChevronLeft className="mr-2 h-4 w-4" />Atrás
                      </Button>
                      <div className="ml-auto">
                          {step === 2 && formMethods.watch('style') === 'link' ? (
                              <Button type="button" size="lg" onClick={handleGenerateNarratives} disabled={isSubmitting || !formMethods.watch('link_topicA') || !formMethods.watch('link_topicB')}>
                                  {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Generando...</> : 'Generar Narrativas'}
                              </Button>
                          ) : step < totalSteps ? (
                              <Button type="button" onClick={handleNext}>
                                  Siguiente <ChevronRight className="ml-2 h-4 w-4" />
                              </Button>
                          ) : (
                              <Button type="submit" disabled={isSubmitting}>
                                  {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creando...</> : <><Heart className="mr-2 h-4 w-4" />Crear Podcast</>}
                              </Button>
                          )}
                      </div>
                  </div>
              </div>
          </form>
      </div>
    </FormProvider>
  );
}