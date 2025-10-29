// components/podcast-creation-form.tsx
// VERSIÓN FINAL CON MANEJO DE ERRORES DE VALIDACIÓN EXPLÍCITO

"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
// [INTERVENCIÓN QUIRÚRGICA #1]: Se importa `FieldErrors` para el tipado del manejador de errores.
import { useForm, FormProvider, SubmitHandler, FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PodcastCreationSchema, PodcastCreationData } from "@/lib/validation/podcast-schema";
import { soloTalkAgents, linkPointsAgents } from "@/lib/agent-config";

// ... (resto de importaciones y componente hasta la función de envío)

export function PodcastCreationForm() {
  // ... (toda la lógica hasta `handleFinalSubmit`)

  const handleFinalSubmit: SubmitHandler<PodcastCreationData> = useCallback(async (formData) => {
    // ... (esta función no cambia)
  }, [supabase, user, toast, router]);

  // [INTERVENCIÓN QUIRÚRGICA #2]: Se crea el manejador de errores de validación.
  const onValidationErrors = (errors: FieldErrors<PodcastCreationData>) => {
    console.error("Errores de validación del formulario:", errors);
    toast({
      title: "Formulario incompleto",
      description: "Parece que faltan algunos datos o hay errores. Por favor, retrocede y revisa los pasos anteriores.",
      variant: "destructive",
    });
  };

  // ... (resto del componente hasta el JSX final)

  return (
    <FormProvider {...formMethods}>
      {/* El `onSubmit` del <form> ahora está vacío, el envío es 100% explícito */}
      <form onSubmit={(e) => e.preventDefault()}>
          <div className="bg-gradient-to-br from-purple-100/80 ...">
              <div className="max-w-4xl mx-auto px-4 flex flex-col">
                  {/* ... (resto del JSX hasta los botones de navegación) ... */}
                  <div className="flex justify-between items-center mt-6 flex-shrink-0">
                      <Button type="button" variant="outline" onClick={goToPreviousStep} disabled={currentStep === 1 || isSubmitting || isLoadingNarratives}>
                          <ChevronLeft className="mr-2 h-4 w-4" />Atrás
                      </Button>
                      <div className="ml-auto">
                          {currentStep === 2 && currentStyle === 'link' ? (
                              <Button type="button" size="lg" onClick={handleGenerateNarrativesClick} disabled={isLoadingNarratives}>
                                  {isLoadingNarratives ? <><Loader2 .../>Generando...</> : 'Generar Narrativas'}
                              </Button>
                          ) : currentStep < totalSteps ? (
                              <Button type="button" onClick={handleStepNavigation}>
                                  Siguiente <ChevronRight className="ml-2 h-4 w-4" />
                              </Button>
                          ) : (
                              // [INTERVENCIÓN QUIRÚRGICA #3]: El botón final ahora llama a `handleSubmit` con ambos manejadores.
                              <Button type="button" onClick={handleSubmit(handleFinalSubmit, onValidationErrors)} disabled={isSubmitting}>
                                  {isSubmitting ? <><Loader2 ... />Encolando Idea...</> : <><Wand2 ... />Crear Guion y Audio</>}
                              </Button>
                          )}
                      </div>
                  </div>
              </div>
          </div>
      </form>
    </FormProvider>
  );
}