// components/create-flow/solo-talk-step.tsx
// VERSIÓN FINAL: Cero Scroll, Contraste Alto y Legibilidad Máxima.

"use client";

import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { VoiceInput } from "@/components/ui/voice-input";
import { Input } from "@/components/ui/input";

export function SoloTalkStep() {
  const { control, setValue, watch } = useFormContext<PodcastCreationData>();
  const motivationValue = watch('solo_motivation');

  useEffect(() => {
    if (motivationValue) {
      const autoTopic = motivationValue.length > 50 
        ? motivationValue.substring(0, 50) + "..." 
        : motivationValue;
      setValue('solo_topic', autoTopic, { shouldValidate: true });
    }
  }, [motivationValue, setValue]);

  const handleVoiceInput = (text: string) => {
    const currentText = motivationValue || '';
    const newText = currentText ? `${currentText} ${text}` : text;
    setValue('solo_motivation', newText, { shouldValidate: true, shouldDirty: true });
  };

  return (
    <div className="flex flex-col h-full w-full animate-fade-in px-2 md:px-6 pb-2">
      
      {/* CABECERA COMPACTA: py-1 en móvil es vital para ganar espacio */}
      <div className="flex-shrink-0 py-1 md:py-4 text-center">
        <h2 className="text-lg md:text-2xl font-bold tracking-tight text-white drop-shadow-md">
          Cuéntanos tu idea
        </h2>
        <p className="text-[10px] md:text-sm text-white/80 font-medium mt-0.5 md:mt-1">
          Habla o escribe libremente.
        </p>
      </div>

      <div className="hidden">
        <FormField control={control} name="solo_topic" render={({ field }) => <FormItem><FormControl><Input {...field} /></FormControl></FormItem>} />
      </div>

      {/* ÁREA DE TRABAJO:
          - flex-grow: Ocupa todo el espacio restante.
          - bg-black/20: Fondo oscuro para garantizar contraste en modo claro.
          - overflow-hidden: Evita que el contenedor crezca, forzando scroll interno del textarea si es necesario.
      */}
      <div className="flex-grow flex flex-col min-h-0 relative rounded-xl overflow-hidden bg-black/20 border border-white/10 backdrop-blur-sm shadow-inner">
        <FormField
          control={control}
          name="solo_motivation"
          render={({ field }) => (
            <FormItem className="flex-1 flex flex-col h-full space-y-0">
              
              <FormControl>
                <Textarea
                  placeholder="Ej: Quiero explorar el impacto accidental de la ciencia..."
                  // text-base en móvil para que quepa más texto sin scroll
                  className="flex-1 w-full h-full resize-none border-0 focus-visible:ring-0 text-base md:text-xl leading-relaxed p-4 md:p-6 bg-transparent text-white placeholder:text-white/40 scrollbar-hide"
                  {...field}
                />
              </FormControl>
              
              {/* BOTONERA */}
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