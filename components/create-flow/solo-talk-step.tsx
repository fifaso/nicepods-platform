// components/create-flow/solo-talk-step.tsx
// VERSIÓN: 2.0 (Mobile Keyboard Safe: Elastic Layout)

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
    <div className="flex flex-col h-full w-full animate-fade-in px-2 md:px-6 pb-2 overflow-hidden">
      
      {/* 
         CABECERA COLAPSIBLE:
         Usamos 'flex-shrink' para que si el teclado aprieta mucho, este título 
         ceda espacio antes que el área de texto o los botones.
      */}
      <div className="flex-shrink flex-col py-2 md:py-4 text-center min-h-0 transition-all duration-300">
        <h2 className="text-lg md:text-2xl font-bold tracking-tight text-foreground drop-shadow-sm truncate">
          Cuéntanos tu idea
        </h2>
        <p className="text-[10px] md:text-sm text-muted-foreground font-medium mt-0.5 md:mt-1 truncate">
          Habla o escribe libremente.
        </p>
      </div>

      <div className="hidden">
        <FormField control={control} name="solo_topic" render={({ field }) => <FormItem><FormControl><Input {...field} /></FormControl></FormItem>} />
      </div>

      {/* 
         ÁREA DE TRABAJO ELÁSTICA:
         - flex-grow: Ocupa todo el espacio disponible.
         - min-h-0: CRÍTICO. Permite que el contenedor se encoja por debajo del tamaño de su contenido hijo.
         Esto es lo que permite que el scroll aparezca DENTRO del textarea y no en la página entera.
      */}
      <div className="flex-grow flex flex-col min-h-0 relative rounded-xl overflow-hidden bg-white/50 dark:bg-black/20 border border-black/5 dark:border-white/10 backdrop-blur-md shadow-sm">
        <FormField
          control={control}
          name="solo_motivation"
          render={({ field }) => (
            <FormItem className="flex-1 flex flex-col h-full space-y-0 w-full min-h-0">
              
              <FormControl>
                {/* 
                   TEXTAREA SCROLLABLE:
                   - h-full: Intenta llenar el contenedor.
                   - resize-none: Evita tiradores de UI.
                   - touch-action-manipulation: Mejora respuesta táctil.
                */}
                <Textarea
                  placeholder="Ej: Quiero explorar el impacto accidental de la ciencia..."
                  className="flex-1 w-full h-full resize-none border-0 focus-visible:ring-0 text-base md:text-xl leading-relaxed p-4 md:p-6 bg-transparent text-foreground placeholder:text-muted-foreground/50 scrollbar-hide min-h-[80px]"
                  {...field}
                />
              </FormControl>
              
              {/* 
                 BOTONERA FIJA (STICKY BOTTOM):
                 - flex-shrink-0: Asegura que NUNCA se oculte ni se aplaste.
                 - bg-gradient: Asegura legibilidad sobre el texto si hubiera scroll.
              */}
              <div className="flex-shrink-0 p-3 md:p-4 bg-gradient-to-t from-white/95 via-white/80 dark:from-black/80 dark:via-black/60 to-transparent border-t border-black/5 dark:border-white/5 backdrop-blur-md z-10">
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