// components/create-flow/solo-talk-step.tsx
// VERSIÓN: 21.0 (UX Final: Native Physics Animation & Frame Sync)

"use client";

import { useEffect, useState, useRef } from "react";
import { useFormContext } from "react-hook-form";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { VoiceInput } from "@/components/ui/voice-input";
import { Input } from "@/components/ui/input";

export function SoloTalkStep() {
  const { control, setValue, watch } = useFormContext<PodcastCreationData>();
  const motivationValue = watch('solo_motivation');
  
  const [viewportHeight, setViewportHeight] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // Ref para controlar el bucle de animación y evitar actualizaciones innecesarias
  const rafRef = useRef<number | null>(null);

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

  // [MEJORA V21]: Sincronización de Frames
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateHeight = () => {
      if (window.visualViewport && containerRef.current) {
        const offsetTop = containerRef.current.getBoundingClientRect().top;
        // Calculamos el espacio disponible exacto
        const availableHeight = window.visualViewport.height - Math.max(0, offsetTop);
        setViewportHeight(availableHeight);
      }
    };

    const onResize = () => {
      // Cancelamos el frame anterior si aún no se ejecutó, para evitar trabajo doble
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      
      // Agendamos la actualización para el próximo "pintado" del navegador
      rafRef.current = requestAnimationFrame(updateHeight);
    };

    window.visualViewport?.addEventListener('resize', onResize);
    window.visualViewport?.addEventListener('scroll', onResize);
    
    // Medición inicial inmediata
    updateHeight();

    return () => {
      window.visualViewport?.removeEventListener('resize', onResize);
      window.visualViewport?.removeEventListener('scroll', onResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    // CONTENEDOR PRINCIPAL
    <div 
        ref={containerRef}
        className="flex flex-col w-full animate-fade-in px-2 md:px-6 overflow-hidden"
        style={{ 
            height: viewportHeight ? `${viewportHeight}px` : '100%',
            maxHeight: '100%',
            // [MEJORA V21]: Transición CSS para suavizar cualquier salto de cálculo JS.
            // Usamos una curva cubic-bezier que imita la fricción física de iOS.
            transition: 'height 0.3s cubic-bezier(0.32, 0.72, 0, 1)'
        }}
    >
      
      {/* HEADER (Rígido) */}
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

      {/* ÁREA DE TRABAJO (Elástica) */}
      <div className="flex-1 flex flex-col min-h-0 relative rounded-xl overflow-hidden bg-white/50 dark:bg-black/20 border border-black/5 dark:border-white/10 backdrop-blur-md shadow-sm">
        
        <FormField
          control={control}
          name="solo_motivation"
          render={({ field }) => (
            <FormItem className="flex flex-col h-full w-full min-h-0 space-y-0">
              
              <FormControl>
                <Textarea
                  placeholder="Ej: Quiero explorar el impacto accidental de la ciencia..."
                  // Añadimos 'transition-all' al textarea también para que acompañe el movimiento
                  className="flex-1 w-full resize-none border-0 focus-visible:ring-0 text-base md:text-xl leading-relaxed p-4 md:p-6 bg-transparent text-foreground placeholder:text-muted-foreground/50 scrollbar-hide min-h-0 transition-all duration-300 ease-out" 
                  {...field}
                />
              </FormControl>
              
              {/* BOTONERA VOZ (Rígida) */}
              <div className="flex-shrink-0 p-3 md:p-4 bg-gradient-to-t from-white/95 via-white/90 dark:from-black/90 dark:via-black/80 to-transparent border-t border-black/5 dark:border-white/5 backdrop-blur-md z-10">
                 <VoiceInput onTextGenerated={handleVoiceInput} className="w-full" />
                 <FormMessage className="mt-1 text-center text-[10px] text-red-500 dark:text-red-400" />
              </div>

            </FormItem>
          )}
        />
      </div>

      {/* Espaciador final */}
      <div className="h-2 flex-shrink-0" />

    </div>
  );
}