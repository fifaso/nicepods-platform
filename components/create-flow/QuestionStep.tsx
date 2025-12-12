// components/create-flow/QuestionStep.tsx
// VERSIÓN: 2.1 (Mobile Viewport Sync & Flexbox Fix)

"use client";

import { useRef } from "react";
import { useFormContext } from "react-hook-form";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { VoiceInput } from "@/components/ui/voice-input";
import { useMobileViewport } from "@/hooks/use-mobile-viewport"; // [NUEVO]

export function QuestionStep() {
  const { control, setValue, getValues } = useFormContext<PodcastCreationData>();
  
  // [NUEVO] Hook de Viewport
  const containerRef = useRef<HTMLDivElement>(null);
  const viewportHeight = useMobileViewport(containerRef);

  const handleVoiceInput = (text: string) => {
    const currentText = getValues('question_to_answer') || '';
    const newText = currentText ? `${currentText} ${text}` : text;
    setValue('question_to_answer', newText, { shouldValidate: true, shouldDirty: true });
  };

  return (
    // CONTENEDOR PRINCIPAL: Vinculado a la altura visual real
    <div 
      ref={containerRef}
      className="flex flex-col w-full animate-fade-in px-2 md:px-6 overflow-hidden"
      style={{ 
        height: viewportHeight ? `${viewportHeight}px` : '100%', 
        maxHeight: '100%' 
      }}
    >
      
      {/* CABECERA (Rígida) */}
      <div className="flex-shrink-0 py-2 md:py-4 text-center">
        <h2 className="text-lg md:text-2xl font-bold tracking-tight text-foreground drop-shadow-sm md:drop-shadow-none">
          Responde una Pregunta
        </h2>
        <p className="text-[10px] md:text-sm text-muted-foreground font-medium mt-0.5 md:mt-1">
          Formula tu duda con claridad.
        </p>
      </div>

      {/* ÁREA DE TRABAJO (Elástica) */}
      <div className="flex-1 flex flex-col min-h-0 relative rounded-xl overflow-hidden bg-white/50 dark:bg-black/20 border border-black/5 dark:border-white/10 backdrop-blur-md shadow-sm">
        <FormField
          control={control}
          name="question_to_answer"
          render={({ field }) => (
            <FormItem className="flex flex-col h-full w-full min-h-0 space-y-0">
              
              <FormControl>
                {/* TEXTAREA: flex-1 + min-h-0 */}
                <Textarea
                  placeholder="Ej: ¿Cómo funciona la edición genética con CRISPR?..."
                  className="flex-1 w-full resize-none border-0 focus-visible:ring-0 text-base md:text-xl leading-relaxed p-4 md:p-6 bg-transparent text-foreground placeholder:text-muted-foreground/50 scrollbar-hide min-h-0"
                  {...field}
                />
              </FormControl>
              
              {/* BOTONERA (Rígida y Opaca) */}
              <div className="flex-shrink-0 p-3 md:p-4 bg-gradient-to-t from-white/95 via-white/90 dark:from-black/90 dark:via-black/80 to-transparent border-t border-black/5 dark:border-white/5 backdrop-blur-md z-10">
                 <VoiceInput onTextGenerated={handleVoiceInput} className="w-full" />
                 <FormMessage className="mt-1 text-center text-[10px] text-red-500 dark:text-red-400" />
              </div>

            </FormItem>
          )}
        />
      </div>

      {/* ESPACIADOR FINAL */}
      <div className="h-2 flex-shrink-0" />
    </div>
  );
}