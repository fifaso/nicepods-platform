// components/create-flow/solo-talk-step.tsx
// VERSIÓN: 8.0 (Keyboard Logic: Hard-Coded Compact Mode)

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

  // Scroll táctico para asegurar que el área activa esté visible
  useEffect(() => {
    if (isFocused && textareaRef.current) {
      // Pequeño delay para dar tiempo al teclado a salir
      setTimeout(() => {
        textareaRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
      }, 300);
    }
  }, [isFocused]);

  return (
    <div className="flex flex-col h-full w-full animate-fade-in px-2 md:px-6 overflow-hidden">
      
      {/* 
         HEADER: Colapsa totalmente (h-0) al escribir.
         Usamos overflow-hidden para asegurar que el contenido interno no ocupe espacio invisible.
      */}
      <div 
        className={cn(
          "flex-shrink-0 text-center transition-all duration-300 ease-in-out overflow-hidden",
          isFocused ? "h-0 opacity-0 m-0 p-0" : "py-2 md:py-4 h-auto opacity-100"
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
         ÁREA DE TRABAJO (LA CLAVE DE LA SOLUCIÓN):
         - Estado Normal (!isFocused): 'flex-1'. Ocupa todo el alto disponible.
         - Estado Teclado (isFocused): 'h-[160px] flex-none'. 
           Forzamos una altura fija PEQUEÑA. Esto libera el espacio inferior para el teclado.
      */}
      <div className={cn(
          "flex flex-col relative rounded-xl overflow-hidden bg-white/50 dark:bg-black/20 border border-black/5 dark:border-white/10 backdrop-blur-md shadow-sm transition-all duration-300 ease-in-out",
          isFocused ? "h-[160px] flex-none" : "flex-1 min-h-0"
        )}
      >
        
        <FormField
          control={control}
          name="solo_motivation"
          render={({ field }) => (
            <FormItem className="flex-1 flex flex-col h-full w-full min-h-0 space-y-0 relative">
              
              <FormControl>
                {/* 
                   TEXTAREA:
                   - pb-20: Padding inferior grande para que el texto nunca quede tapado por los botones de voz.
                */}
                <Textarea
                  placeholder="Ej: Quiero explorar el impacto accidental de la ciencia..."
                  className="flex-1 w-full h-full resize-none border-0 focus-visible:ring-0 text-base md:text-xl leading-relaxed p-4 md:p-6 bg-transparent text-foreground placeholder:text-muted-foreground/50 scrollbar-hide pb-24" 
                  {...field}
                  ref={(e) => {
                    field.ref(e);
                    textareaRef.current = e;
                  }}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => {
                    setIsFocused(false);
                    field.onBlur();
                  }}
                />
              </FormControl>
              
              {/* 
                 BOTONERA DE VOZ (Absolute Bottom):
                 Se pega al fondo de ESTE contenedor (que ahora mide 160px cuando escribes).
                 Al ser absoluta sobre un contenedor pequeño, siempre estará visible encima del teclado.
              */}
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-white via-white/95 to-transparent dark:from-black dark:via-black/95 dark:to-transparent pt-8 z-20">
                 <VoiceInput onTextGenerated={handleVoiceInput} className="w-full" />
                 <FormMessage className="mt-1 text-center text-[10px] text-red-500 dark:text-red-400" />
              </div>

            </FormItem>
          )}
        />
      </div>
      
      {/* Relleno flexible opcional: Empuja el contenido hacia arriba cuando hay espacio de sobra */}
      {isFocused && <div className="flex-1" />}

    </div>
  );
}