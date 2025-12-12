// components/create-flow/solo-talk-step.tsx
// VERSIÓN: 11.0 (Final Fix: Rigid Height on Focus)

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

  // Scroll al enfocar para asegurar que el input quede centrado
  useEffect(() => {
    if (isFocused && textareaRef.current) {
      setTimeout(() => {
        textareaRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
      }, 300);
    }
  }, [isFocused]);

  return (
    <div className="flex flex-col h-full w-full animate-fade-in px-2 md:px-6 overflow-hidden">
      
      {/* 
         HEADER: 
         - isFocused: hidden (Desaparece del DOM para liberar píxeles reales)
         - !isFocused: visible y con padding
      */}
      <div 
        className={cn(
          "flex-shrink-0 text-center transition-all duration-200 ease-in-out",
          isFocused ? "hidden" : "block py-2 md:py-4"
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
         - Normal: flex-1 min-h-0 (Ocupa todo el alto).
         - Foco: h-auto flex-none (Se encoge al tamaño de su contenido).
      */}
      <div className={cn(
          "flex flex-col relative rounded-xl overflow-hidden bg-white/50 dark:bg-black/20 border border-black/5 dark:border-white/10 backdrop-blur-md shadow-sm transition-all duration-300",
          isFocused ? "h-auto flex-none" : "flex-1 min-h-0"
        )}
      >
        
        <FormField
          control={control}
          name="solo_motivation"
          render={({ field }) => (
            <FormItem className="flex flex-col h-full w-full space-y-0">
              
              <FormControl>
                {/* 
                   TEXTAREA:
                   - Normal: flex-1 (Se estira).
                   - Foco: h-32 (128px fijo). 
                   Esto es la clave. Al tener altura fija pequeña, deja espacio físico
                   para que el teclado NO tape los botones de abajo.
                */}
                <Textarea
                  placeholder="Ej: Quiero explorar el impacto accidental de la ciencia..."
                  className={cn(
                    "w-full resize-none border-0 focus-visible:ring-0 text-base md:text-xl leading-relaxed p-4 md:p-6 bg-transparent text-foreground placeholder:text-muted-foreground/50 scrollbar-hide transition-all duration-300",
                    isFocused ? "h-32" : "flex-1 h-full min-h-0"
                  )}
                  {...field}
                  ref={(e) => {
                    field.ref(e);
                    textareaRef.current = e;
                  }}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => {
                    setTimeout(() => setIsFocused(false), 150);
                    field.onBlur();
                  }}
                />
              </FormControl>
              
              {/* BOTONERA VOZ: Siempre visible al final del bloque */}
              <div className="flex-shrink-0 p-2 md:p-4 bg-gradient-to-t from-white/95 via-white/90 dark:from-black/90 dark:via-black/80 to-transparent border-t border-black/5 dark:border-white/5 backdrop-blur-md z-10">
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