// components/create-flow/QuestionStep.tsx
// VERSIÓN PREMIUM: Lienzo abierto, Tipografía Grande, Botones Integrados.

"use client";

import { useFormContext } from "react-hook-form";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea"; // CAMBIO: Textarea en lugar de Input
import { VoiceInput } from "@/components/ui/voice-input";

export function QuestionStep() {
  const { control, setValue, getValues } = useFormContext<PodcastCreationData>();

  const handleVoiceInput = (text: string) => {
    const currentText = getValues('question_to_answer') || '';
    // Para preguntas, concatenamos con espacio para permitir dictado progresivo
    const newText = currentText ? `${currentText} ${text}` : text;
    setValue('question_to_answer', newText, { shouldValidate: true, shouldDirty: true });
  };

  return (
    <div className="flex flex-col h-full w-full animate-fade-in bg-transparent">
      
      {/* 1. CABECERA LIMPIA: Sin iconos gigantes, solo texto claro */}
      <div className="flex-shrink-0 pt-4 pb-2 px-4 text-center">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
          Responde una Pregunta
        </h2>
        <p className="text-xs text-white/50 mt-1 font-medium uppercase tracking-wider">
          Formula tu duda con claridad
        </p>
      </div>

      {/* 2. ÁREA DE ESCRITURA PRINCIPAL (Flex Grow) */}
      <div className="flex-grow flex flex-col min-h-0 px-2 md:px-6 pb-2">
        <FormField
          control={control}
          name="question_to_answer"
          render={({ field }) => (
            <FormItem className="flex-1 flex flex-col h-full space-y-0 bg-white/5 rounded-xl border border-white/10 shadow-inner relative overflow-hidden transition-all focus-within:border-white/20 focus-within:bg-white/10">
              
              {/* LIENZO DE ESCRITURA (Textarea Heroico) */}
              <FormControl>
                <Textarea
                  placeholder="Ej: ¿Cómo funciona la edición genética con CRISPR y qué implicaciones éticas tiene?..."
                  // Tipografía grande para preguntas importantes
                  className="flex-1 w-full resize-none border-0 focus-visible:ring-0 text-xl md:text-2xl leading-snug p-6 bg-transparent text-white placeholder:text-white/20 selection:bg-primary/30 scrollbar-hide font-medium"
                  {...field}
                />
              </FormControl>
              
              {/* 3. BARRA DE VOZ INTEGRADA (Abajo) */}
              <div className="flex-shrink-0 p-3 bg-black/20 backdrop-blur-md border-t border-white/5">
                 <VoiceInput onTextGenerated={handleVoiceInput} className="w-full" />
                 <FormMessage className="mt-2 text-center text-xs text-red-400 opacity-90" />
              </div>

            </FormItem>
          )}
        />
      </div>
    </div>
  );
}