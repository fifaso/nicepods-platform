// components/create-flow/solo-talk-step.tsx
// VERSIÓN: 20.0 (Ultimate Fix: Visual Viewport Binding & Native Feel)

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
  
  // Estado para la altura exacta del área visible
  const [viewportHeight, setViewportHeight] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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

  // [LÓGICA CORE V20] Detección precisa del área visible real
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      // visualViewport.height es la altura REAL libre de teclado y barras del navegador
      if (window.visualViewport) {
        // Restamos un pequeño margen para el footer global si es necesario, 
        // o usamos el 100% de lo visible si queremos ocupar todo.
        // Aquí usamos offsetTop para calcular cuánto espacio queda desde donde empieza el componente.
        const offsetTop = containerRef.current?.getBoundingClientRect().top || 0;
        // La altura disponible es el viewport total menos lo que ya ocupamos arriba (navbar)
        const availableHeight = window.visualViewport.height - Math.max(0, offsetTop);
        
        setViewportHeight(availableHeight);
      }
    };

    // Escuchamos el evento específico de visualViewport (mejor que window.resize)
    window.visualViewport?.addEventListener('resize', handleResize);
    window.visualViewport?.addEventListener('scroll', handleResize);
    
    // Ejecutar al inicio
    handleResize();

    return () => {
      window.visualViewport?.removeEventListener('resize', handleResize);
      window.visualViewport?.removeEventListener('scroll', handleResize);
    };
  }, []);

  return (
    // CONTENEDOR PRINCIPAL
    // style={{ height }}: Esto es lo que garantiza la flexibilidad real.
    // Si sale el teclado, esta altura cambia a píxeles exactos, forzando el re-cálculo de Flexbox.
    <div 
        ref={containerRef}
        className="flex flex-col w-full animate-fade-in px-2 md:px-6 overflow-hidden"
        style={{ 
            height: viewportHeight ? `${viewportHeight}px` : '100%',
            // En desktop o carga inicial, usamos 100% del padre. En móvil con teclado, usamos píxeles.
            maxHeight: '100%' 
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

      {/* ÁREA DE TRABAJO (Elástica dentro de la altura forzada) */}
      <div className="flex-1 flex flex-col min-h-0 relative rounded-xl overflow-hidden bg-white/50 dark:bg-black/20 border border-black/5 dark:border-white/10 backdrop-blur-md shadow-sm">
        
        <FormField
          control={control}
          name="solo_motivation"
          render={({ field }) => (
            <FormItem className="flex flex-col h-full w-full min-h-0 space-y-0">
              
              <FormControl>
                {/* 
                   TEXTAREA
                   - flex-1: Ocupa todo el espacio que deja el Header y la Botonera dentro de la altura calculada.
                */}
                <Textarea
                  placeholder="Ej: Quiero explorar el impacto accidental de la ciencia..."
                  className="flex-1 w-full resize-none border-0 focus-visible:ring-0 text-base md:text-xl leading-relaxed p-4 md:p-6 bg-transparent text-foreground placeholder:text-muted-foreground/50 scrollbar-hide min-h-0" 
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

      {/* Espaciador final para dar aire respecto al borde inferior/teclado */}
      <div className="h-2 flex-shrink-0" />

    </div>
  );
}