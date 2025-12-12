// components/create-flow/solo-talk-step.tsx
// VERSIÓN: 14.0 (UX Final: Visible Header + Compact Mode)

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

  // Scroll suave al enfocar
  useEffect(() => {
    if (isFocused && textareaRef.current) {
      setTimeout(() => {
        textareaRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
      }, 300);
    }
  }, [isFocused]);

  return (
    // CONTENEDOR PRINCIPAL: h-full respeta el DVH del padre
    <div className="flex flex-col h-full w-full animate-fade-in px-2 md:px-6 overflow-hidden">
      
      {/* 
         HEADER: SIEMPRE VISIBLE
         - Al enfocar: Reducimos padding (py-1) y tamaño de texto para ganar espacio.
         - Sin enfocar: Diseño aireado original.
      */}
      <div 
        className={cn(
          "flex-shrink-0 text-center transition-all duration-300 ease-in-out overflow-hidden",
          isFocused ? "py-1" : "py-2 md:py-4"
        )}
      >
        <h2 className={cn(
            "font-bold tracking-tight text-foreground drop-shadow-sm truncate transition-all",
            isFocused ? "text-base" : "text-lg md:text-2xl"
        )}>
          Cuéntanos tu idea
        </h2>
        <p className={cn(
            "text-muted-foreground font-medium mt-0.5 truncate transition-all",
            isFocused ? "text-[0px] h-0 opacity-0" : "text-[10px] md:text-sm h-auto opacity-100"
        )}>
          {/* Ocultamos el subtítulo al escribir para ganar esa línea extra */}
          Habla o escribe libremente.
        </p>
      </div>

      <div className="hidden">
        <FormField control={control} name="solo_topic" render={({ field }) => <FormItem><FormControl><Input {...field} /></FormControl></FormItem>} />
      </div>

      {/* 
         ÁREA DE TRABAJO (Elástica):
         - flex-1: Ocupa todo el espacio entre el Header y el final.
         - min-h-0: Permite encogerse.
      */}
      <div className="flex-1 flex flex-col min-h-0 relative rounded-xl overflow-hidden bg-white/50 dark:bg-black/20 border border-black/5 dark:border-white/10 backdrop-blur-md shadow-sm transition-all duration-300">
        
        <FormField
          control={control}
          name="solo_motivation"
          render={({ field }) => (
            <FormItem className="flex-1 flex flex-col h-full w-full min-h-0 space-y-0">
              
              <FormControl>
                {/* 
                   TEXTAREA:
                   - flex-1: Se estira.
                   - min-h-[80px]: Garantiza un mínimo de visión.
                */}
                <Textarea
                  placeholder="Ej: Quiero explorar el impacto accidental de la ciencia..."
                  className="flex-1 w-full h-full resize-none border-0 focus-visible:ring-0 text-base md:text-xl leading-relaxed p-4 md:p-6 bg-transparent text-foreground placeholder:text-muted-foreground/50 scrollbar-hide min-h-[80px]" 
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
              
              {/* BOTONERA VOZ: Siempre visible al pie */}
              <div className={cn(
                  "flex-shrink-0 bg-gradient-to-t from-white/95 via-white/90 dark:from-black/90 dark:via-black/80 to-transparent border-t border-black/5 dark:border-white/5 backdrop-blur-md z-10 transition-all",
                  isFocused ? "p-2" : "p-3 md:p-4"
              )}>
                 <VoiceInput onTextGenerated={handleVoiceInput} className="w-full" />
                 
                 {/* Ocultamos el mensaje de error al escribir para ganar espacio */}
                 <div className={cn("transition-all duration-200 overflow-hidden", isFocused ? "h-0 opacity-0" : "h-auto opacity-100")}>
                    <FormMessage className="mt-1 text-center text-[10px] text-red-500 dark:text-red-400" />
                 </div>
              </div>

            </FormItem>
          )}
        />
      </div>
      
      {/* Espaciador mínimo para separar del footer global */}
      <div className="h-2 flex-shrink-0" />

    </div>
  );
}