// components/create-flow/solo-talk-step.tsx
// VERSIÓN: 9.0 (Keyboard Master: Strict Compact Flow for Footer Visibility)

"use client";

import { useEffect, useState, useRef } from "react";
import { useFormContext } from "react-hook-form";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { VoiceInput } from "@/components/ui/voice-input";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function SoloTalkStep() {
  const { control, setValue, watch } = useFormContext<PodcastCreationData>();
  const motivationValue = watch('solo_motivation');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  
  // Estado de foco para detectar teclado
  const [isFocused, setIsFocused] = useState(false);

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

  // Scroll táctico: Al enfocar, aseguramos que el input esté a la vista
  useEffect(() => {
    if (isFocused && textareaRef.current) {
      setTimeout(() => {
        textareaRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
      }, 300);
    }
  }, [isFocused]);

  return (
    // CONTENEDOR PRINCIPAL
    // Usamos flex-col para apilar elementos.
    <div className="flex flex-col h-full w-full animate-fade-in px-2 md:px-6 overflow-hidden">
      
      {/* 
         HEADER: 
         Clase 'hidden' aplicada directamente si hay foco. 
         Esto elimina el nodo del layout visual inmediatamente, recuperando ~100px.
      */}
      <div 
        className={cn(
          "flex-shrink-0 py-2 md:py-4 text-center transition-opacity duration-200",
          isFocused ? "hidden" : "block"
        )}
      >
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
         ÁREA DE TRABAJO (WRAPPER):
         - Estado Normal (!isFocused): 'flex-1'. Ocupa todo el espacio vertical disponible.
         - Estado Teclado (isFocused): 'h-[180px] shrink-0'.
           Al fijar la altura en 180px, forzamos a que el bloque sea pequeño.
           Esto permite que el Footer del componente padre (que viene después en el DOM)
           suba y se coloque justo debajo de este bloque, visible sobre el teclado.
      */}
      <div className={cn(
          "flex flex-col relative rounded-xl overflow-hidden bg-white/50 dark:bg-black/20 border border-black/5 dark:border-white/10 backdrop-blur-md shadow-sm transition-all duration-300",
          isFocused ? "h-[180px] shrink-0" : "flex-1 min-h-0"
        )}
      >
        <FormField
          control={control}
          name="solo_motivation"
          render={({ field }) => (
            <FormItem className="flex-1 flex flex-col h-full w-full min-h-0 space-y-0">
              
              <FormControl>
                {/* 
                   TEXTAREA: 
                   - flex-1: Ocupa el espacio restante dentro del Wrapper (después de los botones).
                */}
                <Textarea
                  placeholder="Ej: Quiero explorar el impacto accidental de la ciencia..."
                  className="flex-1 w-full h-full resize-none border-0 focus-visible:ring-0 text-base md:text-xl leading-relaxed p-4 md:p-6 bg-transparent text-foreground placeholder:text-muted-foreground/50 scrollbar-hide min-h-0" 
                  {...field}
                  ref={(e) => {
                    field.ref(e);
                    textareaRef.current = e;
                  }}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => {
                    // Pequeño delay para no cerrar si el usuario toca el botón de voz
                    setTimeout(() => setIsFocused(false), 100); 
                    field.onBlur();
                  }}
                />
              </FormControl>
              
              {/* 
                 BOTONERA DE VOZ (Flujo Normal):
                 - flex-shrink-0: No se encoge.
                 - relative: Está en el flujo normal, empujando el footer hacia abajo.
              */}
              <div className="flex-shrink-0 p-2 md:p-4 bg-gradient-to-t from-white/90 via-white/80 dark:from-black/90 dark:via-black/80 to-transparent border-t border-black/5 dark:border-white/5 backdrop-blur-md z-10">
                 <VoiceInput onTextGenerated={handleVoiceInput} className="w-full" />
                 <FormMessage className="mt-1 text-center text-[10px] text-red-500 dark:text-red-400" />
              </div>

            </FormItem>
          )}
        />
      </div>

      {/* Espaciador flexible inferior (solo activo cuando hay foco para empujar todo hacia arriba si sobra espacio) */}
      {isFocused && <div className="flex-1" />}

    </div>
  );
}