// components/create-flow/QuestionStep.tsx
// VERSIÓN FINAL ADAPTATIVA: Contraste perfecto Light/Dark y consistencia visual.

"use client";

import { useFormContext } from "react-hook-form";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { VoiceInput } from "@/components/ui/voice-input";

export function QuestionStep() {
  const { control, setValue, getValues } = useFormContext<PodcastCreationData>();

  const handleVoiceInput = (text: string) => {
    const currentText = getValues('question_to_answer') || '';
    const newText = currentText ? `${currentText} ${text}` : text;
    setValue('question_to_answer', newText, { shouldValidate: true, shouldDirty: true });
  };

  return (
    <div className="flex flex-col h-full w-full animate-fade-in px-2 md:px-6 pb-2">
      
      {/* CABECERA ADAPTATIVA: 'text-foreground' para legibilidad en ambos modos */}
      <div className="flex-shrink-0 py-1 md:py-4 text-center">
        <h2 className="text-lg md:text-2xl font-bold tracking-tight text-foreground drop-shadow-sm md:drop-shadow-none">
          Responde una Pregunta
        </h2>
        <p className="text-[10px] md:text-sm text-muted-foreground font-medium mt-0.5 md:mt-1">
          Formula tu duda con claridad.
        </p>
      </div>

      {/* ÁREA DE ESCRITURA ADAPTATIVA:
          - Light: bg-white/50 (Vidrio Claro)
          - Dark: dark:bg-black/20 (Vidrio Oscuro)
      */}
      <div className="flex-grow flex flex-col min-h-0 relative rounded-xl overflow-hidden bg-white/50 dark:bg-black/20 border border-black/5 dark:border-white/10 backdrop-blur-md shadow-sm">
        <FormField
          control={control}
          name="question_to_answer"
          render={({ field }) => (
            <FormItem className="flex-1 flex flex-col h-full space-y-0">
              
              <FormControl>
                <Textarea
                  placeholder="Ej: ¿Cómo funciona la edición genética con CRISPR?..."
                  // Texto y Placeholder adaptativos
                  className="flex-1 w-full h-full resize-none border-0 focus-visible:ring-0 text-base md:text-xl leading-relaxed p-4 md:p-6 bg-transparent text-foreground placeholder:text-muted-foreground/50 scrollbar-hide"
                  {...field}
                />
              </FormControl>
              
              {/* BOTONERA ADAPTATIVA:
                  - Degradado: De Blanco (Light) o Negro (Dark) a transparente.
              */}
              <div className="flex-shrink-0 p-3 md:p-4 bg-gradient-to-t from-white/80 via-white/40 dark:from-black/40 dark:via-black/20 to-transparent border-t border-black/5 dark:border-white/5 backdrop-blur-sm">
                 <VoiceInput onTextGenerated={handleVoiceInput} className="w-full" />
                 <FormMessage className="mt-1 text-center text-[10px] text-red-500 dark:text-red-400" />
              </div>

            </FormItem>
          )}
        />
      </div>
    </div>
  );
}