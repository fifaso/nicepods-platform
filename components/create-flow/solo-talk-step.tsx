// components/create-flow/solo-talk-step.tsx
// VERSIÓN: 5.0 (Keyboard Mastery: Flex-Shrink Priority Layout)

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

  // Scroll defensivo para asegurar visibilidad
  useEffect(() => {
    if (isFocused && textareaRef.current) {
      // Pequeño delay para permitir que el teclado termine de subir
      setTimeout(() => {
        textareaRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
      }, 300);
    }
  }, [isFocused]);

  return (
    // CONTENEDOR PRINCIPAL: h-full fuerza a ocupar solo el espacio visible (reducido por teclado)
    <div className="flex flex-col h-full w-full animate-fade-in px-2 md:px-6 pb-0 overflow-hidden">
      
      {/* HEADER: Se oculta completamente al enfocar para ceder espacio */}
      <div 
        className={cn(
          "flex-shrink-0 text-center transition-all duration-200 overflow-hidden",
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

      {/* ÁREA DE TRABAJO: Flex Column */}
      <div className="flex-grow flex flex-col min-h-0 relative rounded-xl overflow-hidden bg-white/50 dark:bg-black/20 border border-black/5 dark:border-white/10 backdrop-blur-md shadow-sm">
        
        <FormField
          control={control}
          name="solo_motivation"
          render={({ field }) => (
            <FormItem className="flex-1 flex flex-col h-full space-y-0 w-full min-h-0">
              
              <FormControl>
                {/* TEXTAREA: Es el único elemento elástico (flex-1) */}
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
                    setIsFocused(false);
                    field.onBlur();
                  }}
                />
              </FormControl>
              
              {/* BOTONERA: Rígida (flex-shrink-0). Siempre visible al fondo del contenedor */}
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