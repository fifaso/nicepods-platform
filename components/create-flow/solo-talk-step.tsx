// components/create-flow/solo-talk-step.tsx
// VERSIÓN: 13.0 (Final Polish: Vertical Levitation & Precision Height)

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
  
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(0);

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

  // DETECCIÓN DE TECLADO (VISUAL VIEWPORT)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      // visualViewport es la altura real visible (excluyendo teclado)
      const vh = window.visualViewport?.height || window.innerHeight;
      const screenH = window.screen.height;
      setViewportHeight(vh);
      
      // Si la altura visible es < 75% de la pantalla total, hay teclado.
      const isCompact = vh < screenH * 0.75;
      setIsKeyboardOpen(isCompact);
    };

    window.visualViewport?.addEventListener('resize', handleResize);
    window.addEventListener('resize', handleResize);
    handleResize(); // Init

    return () => {
      window.visualViewport?.removeEventListener('resize', handleResize);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Scroll táctico para centrar el cursor
  useEffect(() => {
    if (isKeyboardOpen && textareaRef.current) {
      // Pequeño delay para dejar que el layout se asiente
      setTimeout(() => {
        textareaRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
      }, 200);
    }
  }, [isKeyboardOpen]);

  return (
    // CONTENEDOR PRINCIPAL
    // [CAMBIO CLAVE]: '-mt-6' cuando hay teclado.
    // Esto "tira" todo el componente hacia arriba, aprovechando el espacio vacío bajo la barra de progreso.
    <div className={cn(
        "flex flex-col h-full w-full animate-fade-in px-2 md:px-6 overflow-hidden transition-all duration-300 ease-out",
        isKeyboardOpen ? "-mt-6" : "mt-0"
    )}>
      
      {/* HEADER: Se oculta al escribir */}
      <div 
        className={cn(
          "flex-shrink-0 text-center transition-all duration-200 overflow-hidden",
          isKeyboardOpen ? "h-0 opacity-0 m-0 p-0" : "py-2 md:py-4 h-auto opacity-100"
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
         ÁREA DE TRABAJO (WRAPPER)
         - Altura Dinámica: Calculada en JS para precisión de píxel.
      */}
      <div 
        className={cn(
          "flex flex-col relative rounded-xl overflow-hidden bg-white/50 dark:bg-black/20 border border-black/5 dark:border-white/10 backdrop-blur-md shadow-sm transition-all duration-300 ease-out",
          isKeyboardOpen ? "flex-none" : "flex-1 min-h-0"
        )}
        // [AJUSTE MATEMÁTICO]: Usamos el 50% del viewport visible.
        // Esto deja el otro 50% libre para el Header Global (arriba) y Footer Global (abajo).
        style={isKeyboardOpen ? { height: `${viewportHeight * 0.50}px` } : undefined} 
      >
        
        <FormField
          control={control}
          name="solo_motivation"
          render={({ field }) => (
            <FormItem className="flex-1 flex flex-col h-full w-full min-h-0 space-y-0">
              
              <FormControl>
                {/* TEXTAREA FLEXIBLE */}
                <Textarea
                  placeholder="Ej: Quiero explorar el impacto accidental de la ciencia..."
                  className="flex-1 w-full h-full resize-none border-0 focus-visible:ring-0 text-base md:text-xl leading-relaxed p-4 md:p-6 bg-transparent text-foreground placeholder:text-muted-foreground/50 scrollbar-hide min-h-[40px]" 
                  {...field}
                  ref={(e) => {
                    field.ref(e);
                    textareaRef.current = e;
                  }}
                />
              </FormControl>
              
              {/* BOTONERA VOZ */}
              {/* Reducimos el padding (py-2) cuando hay teclado para ahorrar espacio vertical */}
              <div className={cn(
                  "flex-shrink-0 bg-gradient-to-t from-white/95 via-white/90 dark:from-black/90 dark:via-black/80 to-transparent border-t border-black/5 dark:border-white/5 backdrop-blur-md z-10",
                  isKeyboardOpen ? "p-2" : "p-3 md:p-4"
              )}>
                 <VoiceInput onTextGenerated={handleVoiceInput} className="w-full" />
                 {/* Ocultamos el mensaje de error si hay teclado para ganar espacio, a menos que sea crítico */}
                 {!isKeyboardOpen && (
                    <FormMessage className="mt-1 text-center text-[10px] text-red-500 dark:text-red-400" />
                 )}
              </div>

            </FormItem>
          )}
        />
      </div>

    </div>
  );
}