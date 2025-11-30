// components/create-flow/QuestionStep.tsx
// VERSIÓN FINAL ESTANDARIZADA: Coherencia total con SoloTalkStep y optimización móvil.

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
      
      {/* CABECERA COMPACTA: Igual que en SoloTalk para consistencia */}
      <div className="flex-shrink-0 py-1 md:py-4 text-center">
        <h2 className="text-lg md:text-2xl font-bold tracking-tight text-white drop-shadow-md">
          Responde una Pregunta
        </h2>
        <p className="text-[10px] md:text-sm text-white/80 font-medium mt-0.5 md:mt-1">
          Formula tu duda con claridad.
        </p>
      </div>

      {/* ÁREA DE ESCRITURA: Patrón "Glass Surface" oscuro */}
      <div className="flex-grow flex flex-col min-h-0 relative rounded-xl overflow-hidden bg-black/20 border border-white/10 backdrop-blur-sm shadow-inner">
        <FormField
          control={control}
          name="question_to_answer"
          render={({ field }) => (
            <FormItem className="flex-1 flex flex-col h-full space-y-0">
              
              <FormControl>
                <Textarea
                  placeholder="Ej: ¿Cómo funciona la edición genética con CRISPR?..."
                  className="flex-1 w-full h-full resize-none border-0 focus-visible:ring-0 text-base md:text-xl leading-relaxed p-4 md:p-6 bg-transparent text-white placeholder:text-white/40 scrollbar-hide"
                  {...field}
                />
              </FormControl>
              
              {/* BOTONERA CON DEGRADADO SUAVE */}
              <div className="flex-shrink-0 p-3 bg-black/40 backdrop-blur-md border-t border-white/5">
                 <VoiceInput onTextGenerated={handleVoiceInput} className="w-full" />
                 <FormMessage className="mt-1 text-center text-[10px] text-red-300" />
              </div>

            </FormItem>
          )}
        />
      </div>
    </div>
  );
}