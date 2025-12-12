// components/create-flow/solo-talk-step.tsx
// VERSIÓN: 16.0 (Flexbox Physics Fix: Basis-0 Strategy)

"use client";

import { useEffect, useRef } from "react";
import { useFormContext } from "react-hook-form";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { VoiceInput } from "@/components/ui/voice-input";
import { Input } from "@/components/ui/input";

export function SoloTalkStep() {
  const { control, setValue, watch } = useFormContext<PodcastCreationData>();
  const motivationValue = watch('solo_motivation');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

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
    // CONTENEDOR PRINCIPAL
    // Usamos flex-col y overflow-hidden para contener todo en el viewport visible.
    <div className="flex flex-col h-full w-full animate-fade-in px-2 md:px-6 overflow-hidden">
      
      {/* 
         BLOQUE 1: HEADER (Rígido)
         - flex-shrink-0: No se encoge.
         - hidden md:block: En móviles, cuando falta espacio vertical crítico (como al escribir),
           a veces es mejor ocultar esto via CSS puro media queries si la pantalla es muy corta, 
           pero por ahora lo mantenemos visible y dejamos que el textarea se sacrifique.
      */}
      <div className="flex-shrink-0 py-2 md:py-4 text-center">
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
         BLOQUE 2: ÁREA DE TRABAJO (Flexible)
         - flex-1: Ocupa el espacio.
         - min-h-0: Permite encogerse por debajo del contenido.
      */}
      <div className="flex-1 flex flex-col min-h-0 relative rounded-xl overflow-hidden bg-white/50 dark:bg-black/20 border border-black/5 dark:border-white/10 backdrop-blur-md shadow-sm">
        
        <FormField
          control={control}
          name="solo_motivation"
          render={({ field }) => (
            <FormItem className="flex flex-col h-full w-full space-y-0">
              
              <FormControl>
                {/* 
                   TEXTAREA - EL CAMBIO QUIRÚRGICO:
                   - flex-1 basis-0: Esto es vital. Le dice al flexbox que su tamaño base es 0, 
                     por lo que solo crecerá si sobra espacio real. Evita que empuje hacia afuera.
                   - min-h-[80px]: Mantenemos un mínimo de dignidad para escribir.
                */}
                <Textarea
                  placeholder="Ej: Quiero explorar el impacto accidental de la ciencia..."
                  className="flex-1 basis-0 w-full resize-none border-0 focus-visible:ring-0 text-base md:text-xl leading-relaxed p-4 md:p-6 bg-transparent text-foreground placeholder:text-muted-foreground/50 scrollbar-hide min-h-[60px]" 
                  {...field}
                  ref={(e) => {
                    field.ref(e);
                    textareaRef.current = e;
                  }}
                />
              </FormControl>
              
              {/* 
                 BLOQUE 3: BOTONERA VOZ (Rígido)
                 - flex-shrink-0: Asegura que NUNCA se oculte.
                 - z-10: Para que el texto pase por debajo si hay mucho scroll.
              */}
              <div className="flex-shrink-0 p-2 md:p-4 bg-gradient-to-t from-white/95 via-white/90 dark:from-black/90 dark:via-black/80 to-transparent border-t border-black/5 dark:border-white/5 backdrop-blur-md z-10">
                 <VoiceInput onTextGenerated={handleVoiceInput} className="w-full" />
                 <FormMessage className="mt-1 text-center text-[10px] text-red-500 dark:text-red-400" />
              </div>

            </FormItem>
          )}
        />
      </div>

      {/* Espaciador de seguridad para el Footer Global */}
      <div className="h-2 flex-shrink-0" />

    </div>
  );
}