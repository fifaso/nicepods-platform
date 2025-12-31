// components/create-flow/steps/solo-talk-step.tsx
// VERSIÓN: 1.0 (Modular Standard - Loop-Free Layout)

"use client";

import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { VoiceInput } from "@/components/ui/voice-input";
import { Input } from "@/components/ui/input";

/**
 * SoloTalkStep
 * Gestiona la entrada de texto y voz para monólogos.
 * Diseño optimizado para no interferir con el ciclo de renderizado del padre.
 */
export function SoloTalkStep() {
  const { control, setValue, watch } = useFormContext<PodcastCreationData>();
  const motivationValue = watch('solo_motivation');

  // Generación automática de título sugerido basada en la idea
  useEffect(() => {
    if (motivationValue && motivationValue.length > 10) {
      const autoTopic = motivationValue.length > 60 
        ? motivationValue.substring(0, 60) + "..." 
        : motivationValue;
      setValue('solo_topic', autoTopic, { shouldValidate: true });
    }
  }, [motivationValue, setValue]);

  const handleVoiceInput = (text: string) => {
    const currentText = motivationValue || '';
    const newText = currentText ? `${currentText} ${text}` : text;
    setValue('solo_motivation', newText, { 
      shouldValidate: true, 
      shouldDirty: true 
    });
  };

  return (
    <div className="flex flex-col w-full h-full animate-in fade-in duration-500 px-4 md:px-6">
      
      {/* HEADER DE FASE */}
      <div className="flex-shrink-0 py-4 text-center">
        <h2 className="text-xl md:text-2xl font-black tracking-tight text-foreground">
          Cuéntanos tu idea
        </h2>
        <p className="text-xs text-muted-foreground font-medium mt-1">
          Habla o escribe libremente para el Agente AI.
        </p>
      </div>

      {/* Campo oculto para el título técnico */}
      <div className="hidden">
        <FormField 
            control={control} 
            name="solo_topic" 
            render={({ field }) => <FormItem><FormControl><Input {...field} /></FormControl></FormItem>} 
        />
      </div>

      {/* ÁREA DE ESCRITURA: Altura controlada por CSS DVH del padre */}
      <div className="flex-1 flex flex-col min-h-0 bg-white/5 dark:bg-black/20 rounded-2xl border border-border/40 backdrop-blur-md overflow-hidden mb-4 shadow-inner">
        <FormField
          control={control}
          name="solo_motivation"
          render={({ field }) => (
            <FormItem className="flex-1 flex flex-col min-h-0 space-y-0">
              <FormControl className="flex-1 min-h-0">
                <Textarea
                  placeholder="Ej: Quiero explorar cómo la arquitectura invisible influye en nuestro estado de ánimo diario..."
                  className="flex-1 w-full resize-none border-0 focus-visible:ring-0 text-base md:text-lg leading-relaxed p-6 bg-transparent text-foreground placeholder:text-muted-foreground/30 custom-scrollbar" 
                  {...field}
                />
              </FormControl>
              
              {/* ACCIÓN DE VOZ */}
              <div className="p-4 bg-gradient-to-t from-background/80 to-transparent border-t border-border/5">
                 <VoiceInput onTextGenerated={handleVoiceInput} className="w-full" />
                 <FormMessage className="mt-2 text-center text-[10px]" />
              </div>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}