// components/create-flow/solo-talk-step.tsx
// VERSIÓN: 12.0 (Keyboard Logic: Visual Viewport Listener)

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

  // DETECCIÓN INTELIGENTE DE TECLADO (VISUAL VIEWPORT)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      const vh = window.visualViewport?.height || window.innerHeight;
      setViewportHeight(vh);
      
      // Si la altura visible es significativamente menor que la pantalla total, asumimos teclado.
      // (Ajuste empírico: Si perdemos más del 25% de la pantalla)
      const isCompact = vh < window.screen.height * 0.75;
      setIsKeyboardOpen(isCompact);
    };

    // Escuchamos tanto el resize normal como el visualViewport (específico para teclados móviles)
    window.visualViewport?.addEventListener('resize', handleResize);
    window.addEventListener('resize', handleResize);
    
    // Inicialización
    handleResize();

    return () => {
      window.visualViewport?.removeEventListener('resize', handleResize);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Scroll táctico cuando se abre el teclado
  useEffect(() => {
    if (isKeyboardOpen && textareaRef.current) {
      setTimeout(() => {
        textareaRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
      }, 100);
    }
  }, [isKeyboardOpen]);

  return (
    <div className="flex flex-col h-full w-full animate-fade-in px-2 md:px-6 overflow-hidden">
      
      {/* 
         HEADER: 
         - Se oculta si detectamos teclado abierto para maximizar espacio.
      */}
      <div 
        className={cn(
          "flex-shrink-0 text-center transition-all duration-200 ease-out overflow-hidden",
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
         ÁREA DE TRABAJO (WRAPPER):
         - Si hay teclado: Altura Fija Calculada (Viewport height - Espacio de botones).
         - Si no hay teclado: flex-1 (Ocupa todo).
         
         Usamos style inline para altura dinámica precisa basada en el viewport real.
      */}
      <div 
        className={cn(
          "flex flex-col relative rounded-xl overflow-hidden bg-white/50 dark:bg-black/20 border border-black/5 dark:border-white/10 backdrop-blur-md shadow-sm transition-all duration-200",
          isKeyboardOpen ? "flex-none" : "flex-1 min-h-0"
        )}
        style={isKeyboardOpen ? { height: `${viewportHeight * 0.55}px` } : undefined} 
      >
        
        <FormField
          control={control}
          name="solo_motivation"
          render={({ field }) => (
            <FormItem className="flex-1 flex flex-col h-full w-full min-h-0 space-y-0">
              
              <FormControl>
                {/* 
                   TEXTAREA:
                   - Ocupa todo el espacio disponible dentro del wrapper ajustado.
                */}
                <Textarea
                  placeholder="Ej: Quiero explorar el impacto accidental de la ciencia..."
                  className="flex-1 w-full h-full resize-none border-0 focus-visible:ring-0 text-base md:text-xl leading-relaxed p-4 md:p-6 bg-transparent text-foreground placeholder:text-muted-foreground/50 scrollbar-hide min-h-[50px]" 
                  {...field}
                  ref={(e) => {
                    field.ref(e);
                    textareaRef.current = e;
                  }}
                />
              </FormControl>
              
              {/* BOTONERA VOZ */}
              <div className="flex-shrink-0 p-2 md:p-4 bg-gradient-to-t from-white/95 via-white/90 dark:from-black/90 dark:via-black/80 to-transparent border-t border-black/5 dark:border-white/5 backdrop-blur-md z-10">
                 <VoiceInput onTextGenerated={handleVoiceInput} className="w-full" />
                 <FormMessage className="mt-1 text-center text-[10px] text-red-500 dark:text-red-400" />
              </div>

            </FormItem>
          )}
        />
      </div>

      {/* Espaciador dinámico */}
      {isKeyboardOpen && <div className="h-1 flex-shrink-0" />}

    </div>
  );
}