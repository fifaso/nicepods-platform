// components/create-flow/solo-talk-step.tsx
// VERSIÓN FINAL PREMIUM: Diseño coherente con Dashboard, tipografía legible y uso eficiente del espacio.

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
  
  // 1. Observamos el contenido para sincronización
  const motivationValue = watch('solo_motivation');

  // 2. Sincronización Automática en segundo plano (Titulo)
  useEffect(() => {
    if (motivationValue) {
      const autoTopic = motivationValue.length > 50 
        ? motivationValue.substring(0, 50) + "..." 
        : motivationValue;
      setValue('solo_topic', autoTopic, { shouldValidate: true });
    }
  }, [motivationValue, setValue]);

  // 3. Handler para input de voz
  const handleVoiceInput = (text: string) => {
    const currentText = motivationValue || '';
    const newText = currentText ? `${currentText} ${text}` : text;
    setValue('solo_motivation', newText, { shouldValidate: true, shouldDirty: true });
  };

  return (
    // W-FULL es crítico aquí para respetar el ancho del menú superior
    <div className="flex flex-col h-full w-full animate-fade-in">
      
      {/* CABECERA INTEGRADA: Alineada y limpia */}
      <div className="flex-shrink-0 py-4 text-left">
        <h2 className="text-2xl font-bold tracking-tight text-white">
          Cuéntanos tu idea
        </h2>
        <p className="text-sm text-white/60 font-medium mt-1">
          Habla o escribe libremente. La IA estructurará el contenido.
        </p>
      </div>

      {/* Input Oculto para validación */}
      <div className="hidden">
        <FormField 
          control={control} 
          name="solo_topic" 
          render={({ field }) => <FormItem><FormControl><Input {...field} /></FormControl></FormItem>} 
        />
      </div>

      {/* ÁREA DE TRABAJO PRINCIPAL */}
      {/* Usamos flex-grow para ocupar todo el alto disponible sin scroll en la pagina */}
      <div className="flex-grow flex flex-col min-h-0 relative rounded-2xl overflow-hidden bg-black/20 border border-white/5 shadow-inner">
        <FormField
          control={control}
          name="solo_motivation"
          render={({ field }) => (
            <FormItem className="flex-1 flex flex-col h-full space-y-0">
              
              <FormControl>
                {/* TEXTAREA: Estilo "Editor Premium". Texto grande, sin bordes de foco. */}
                <Textarea
                  placeholder="Ej: Quiero explorar el impacto accidental de la ciencia en la vida moderna..."
                  className="flex-1 w-full h-full resize-none border-0 focus-visible:ring-0 text-lg md:text-xl leading-relaxed p-6 bg-transparent text-white placeholder:text-white/20 scrollbar-hide"
                  {...field}
                />
              </FormControl>
              
              {/* BARRA DE CONTROL DE VOZ */}
              {/* Fondo con degradado sutil para separar visualmente del texto sin cortar bruscamente */}
              <div className="flex-shrink-0 p-4 bg-gradient-to-t from-black/60 via-black/40 to-transparent border-t border-white/5">
                 <VoiceInput onTextGenerated={handleVoiceInput} className="w-full" />
                 <FormMessage className="mt-2 text-center text-xs text-red-400" />
              </div>

            </FormItem>
          )}
        />
      </div>
    </div>
  );
}