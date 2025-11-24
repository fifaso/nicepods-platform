// components/create-flow/solo-talk-step.tsx
// VERSIÓN MAESTRA: Input Heroico, Título Automático, Diseño Sin Scroll.

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
  
  // 1. Observamos el contenido del área de texto
  const motivationValue = watch('solo_motivation');

  // 2. Sincronización Automática (El Cerebro Oculto)
  // Cada vez que la motivación cambia, actualizamos el 'topic' invisible
  // para cumplir con los requisitos de validación del backend.
  useEffect(() => {
    if (motivationValue) {
      // Tomamos los primeros 50 caracteres como "título provisional"
      const autoTopic = motivationValue.length > 50 
        ? motivationValue.substring(0, 50) + "..." 
        : motivationValue;
      
      setValue('solo_topic', autoTopic, { shouldValidate: true });
    }
  }, [motivationValue, setValue]);

  // 3. Manejador de Voz
  const handleVoiceInput = (text: string) => {
    const currentText = motivationValue || '';
    // Añade un espacio si ya existe texto para que no quede pegado
    const newText = currentText ? `${currentText} ${text}` : text;
    setValue('solo_motivation', newText, { shouldValidate: true, shouldDirty: true });
  };

  return (
    <div className="flex flex-col h-full w-full animate-fade-in bg-transparent">
      
      {/* CABECERA LIMPIA Y COMPACTA */}
      <div className="flex-shrink-0 pt-4 pb-4 px-4 text-center">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
          Describe tu Idea
        </h2>
        <p className="text-xs text-white/50 mt-1 font-medium uppercase tracking-wider">
          Tu voz se convertirá en estructura
        </p>
      </div>

      {/* CAMPO OCULTO (Vital para que el formulario funcione internamente) */}
      <div className="hidden">
        <FormField 
          control={control} 
          name="solo_topic" 
          render={({ field }) => <FormItem><FormControl><Input {...field} /></FormControl></FormItem>} 
        />
      </div>

      {/* ÁREA DE TRABAJO PRINCIPAL (Flex Grow para ocupar todo el espacio) */}
      <div className="flex-grow flex flex-col min-h-0 px-2 md:px-6 pb-2">
        <FormField
          control={control}
          name="solo_motivation"
          render={({ field }) => (
            <FormItem className="flex-1 flex flex-col h-full space-y-0 bg-white/5 rounded-xl border border-white/10 shadow-inner relative overflow-hidden transition-all focus-within:border-white/20 focus-within:bg-white/10">
              
              {/* LIENZO DE ESCRITURA INFINITO */}
              <FormControl>
                <Textarea
                  placeholder="Empieza a escribir aquí o usa los botones de dictado por voz abajo"
                  className="flex-1 w-full resize-none border-0 focus-visible:ring-0 text-base md:text-lg leading-relaxed p-5 bg-transparent text-white placeholder:text-white/20 selection:bg-primary/30 scrollbar-hide"
                  {...field}
                />
              </FormControl>
              
              {/* BARRA DE HERRAMIENTAS DE VOZ (Anclada abajo) */}
              <div className="flex-shrink-0 p-3 bg-black/20 backdrop-blur-md border-t border-white/5">
                 <VoiceInput onTextGenerated={handleVoiceInput} className="w-full" />
                 {/* Mensaje de error sutil si falla la validación */}
                 <FormMessage className="mt-2 text-center text-xs text-red-400 opacity-90" />
              </div>

            </FormItem>
          )}
        />
      </div>
    </div>
  );
}