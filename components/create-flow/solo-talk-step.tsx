// components/create-flow/solo-talk-step.tsx
// VERSIÓN: 17.0 (Final Architecture: Absolute Inset Strategy & Focus State)

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

  // Volvemos a usar estado para control total de la UI al escribir
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

  // Scroll táctico al enfocar
  useEffect(() => {
    if (isFocused && textareaRef.current) {
      setTimeout(() => {
        // scrollIntoView con 'center' ayuda a que el teclado no tape el input
        textareaRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
      }, 300);
    }
  }, [isFocused]);

  return (
    <div className="flex flex-col h-full w-full animate-fade-in px-2 md:px-6 overflow-hidden">
      
      {/* 
         BLOQUE 1: HEADER
         - Estrategia: Si hay foco (teclado), lo ocultamos (hidden).
         - Ganancia: ~60-80px de espacio vertical crítico.
      */}
      <div 
        className={cn(
          "flex-shrink-0 text-center transition-all duration-200",
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
         BLOQUE 2: ÁREA DE TRABAJO (Elástica)
         - flex-1: Toma el espacio disponible.
         - min-h-0: Permite contracción.
         - flex-col: Organiza Textarea y Botones verticalmente.
      */}
      <div className="flex-1 flex flex-col min-h-0 relative rounded-xl overflow-hidden bg-white/50 dark:bg-black/20 border border-black/5 dark:border-white/10 backdrop-blur-md shadow-sm">
        
        <FormField
          control={control}
          name="solo_motivation"
          render={({ field }) => (
            <FormItem className="flex flex-col h-full w-full space-y-0">
              
              <FormControl>
                {/* 
                   CONTENEDOR DEL TEXTAREA (La Magia V17)
                   - flex-1 relative: Este div define el tamaño disponible para el texto.
                */}
                <div className="flex-1 relative w-full min-h-[80px]">
                    {/* 
                       TEXTAREA ABSOLUTO
                       - absolute inset-0: Fuerza al textarea a tener EXACTAMENTE el tamaño de su padre.
                       - No puede empujar. No puede crecer más allá. Si hay mucho texto, scroll interno.
                    */}
                    <Textarea
                      placeholder="Ej: Quiero explorar el impacto accidental de la ciencia..."
                      className="absolute inset-0 w-full h-full resize-none border-0 focus-visible:ring-0 text-base md:text-xl leading-relaxed p-4 md:p-6 bg-transparent text-foreground placeholder:text-muted-foreground/50 scrollbar-hide" 
                      {...field}
                      ref={(e) => {
                        field.ref(e);
                        textareaRef.current = e;
                      }}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => {
                        // Pequeño delay para evitar saltos si se toca un botón de la propia UI
                        setTimeout(() => setIsFocused(false), 100);
                        field.onBlur();
                      }}
                    />
                </div>
              </FormControl>
              
              {/* 
                 BLOQUE 3: BOTONERA VOZ
                 - flex-shrink-0: Rígido.
                 - z-10: Por si acaso.
              */}
              <div className="flex-shrink-0 p-2 md:p-4 bg-gradient-to-t from-white/95 via-white/90 dark:from-black/90 dark:via-black/80 to-transparent border-t border-black/5 dark:border-white/5 backdrop-blur-md z-10">
                 <VoiceInput onTextGenerated={handleVoiceInput} className="w-full" />
                 
                 {/* Ocultamos mensaje de error al escribir para ahorrar más espacio si es necesario */}
                 {!isFocused && (
                   <FormMessage className="mt-1 text-center text-[10px] text-red-500 dark:text-red-400" />
                 )}
              </div>

            </FormItem>
          )}
        />
      </div>

      {/* Espaciador de seguridad para el Footer Global */}
      <div className={cn("flex-shrink-0 transition-all", isFocused ? "h-1" : "h-2")} />

    </div>
  );
}