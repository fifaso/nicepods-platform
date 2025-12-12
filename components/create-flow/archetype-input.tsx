"use client";

import { useEffect, useRef } from "react";
import { useFormContext } from "react-hook-form";
import { PodcastCreationData } from "@/lib/validation/podcast-schema";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { VoiceInput } from "@/components/ui/voice-input";
import { Input } from "@/components/ui/input";
import { useMobileViewport } from "@/hooks/use-mobile-viewport";
// Importamos las opciones del paso anterior para mostrar el icono correcto
import { archetypeOptions } from "./archetype-step"; 

export function ArchetypeInputStep() {
  const { control, setValue, watch, getValues } = useFormContext<PodcastCreationData>();
  const goalValue = watch('archetype_goal');
  const selectedArchetype = watch('selectedArchetype');
  
  // [ESTÁNDAR V20] Hook de Viewport
  const containerRef = useRef<HTMLDivElement>(null);
  const viewportHeight = useMobileViewport(containerRef);

  useEffect(() => {
    if (goalValue) {
      const autoTopic = goalValue.length > 50 
        ? goalValue.substring(0, 50) + "..." 
        : goalValue;
      setValue('archetype_topic', autoTopic, { shouldValidate: true });
    }
  }, [goalValue, setValue]);

  const handleVoiceGoal = (text: string) => {
    const currentText = getValues('archetype_goal') || '';
    const newText = currentText ? `${currentText} ${text}` : text;
    setValue('archetype_goal', newText, { shouldValidate: true, shouldDirty: true });
  };

  const currentArchetype = archetypeOptions.find(opt => opt.value === selectedArchetype);

  return (
    // [ESTÁNDAR V20] Contenedor Raíz
    <div 
        ref={containerRef}
        className="flex flex-col w-full animate-fade-in px-2 md:px-6 overflow-hidden"
        style={{ 
            height: viewportHeight ? `${viewportHeight}px` : '100%', 
            maxHeight: '100%' 
        }}
    >
      
      {/* HEADER RÍGIDO */}
      <div className="flex-shrink-0 py-2 md:py-4 text-center">
        <h2 className="text-lg md:text-2xl font-bold tracking-tight text-foreground drop-shadow-sm truncate">
          Desarrolla tu Historia
        </h2>
        
        {/* Banner de Contexto (Siempre visible, no se oculta) */}
        {currentArchetype && (
            <div className="inline-flex items-center justify-center mt-1 px-3 py-1 bg-white/50 dark:bg-white/10 rounded-full border border-black/5 dark:border-white/10 backdrop-blur-md shadow-sm">
                <span className="text-primary mr-2">
                    {/* Renderizamos el icono dinámicamente */}
                    <currentArchetype.icon className="h-4 w-4" />
                </span>
                <span className="text-xs text-muted-foreground font-medium">
                    Modo: {currentArchetype.title}
                </span>
            </div>
        )}
      </div>

      <div className="hidden">
        <FormField control={control} name="archetype_topic" render={({ field }) => <FormItem><FormControl><Input {...field} /></FormControl></FormItem>} />
      </div>

      {/* ÁREA DE TRABAJO ELÁSTICA */}
      <div className="flex-1 flex flex-col min-h-0 relative rounded-xl overflow-hidden bg-white/50 dark:bg-black/20 border border-black/5 dark:border-white/10 backdrop-blur-md shadow-sm">
        
        <FormField
          control={control}
          name="archetype_goal"
          render={({ field }) => (
            // [ESTÁNDAR V20] Cadena Flexbox
            <FormItem className="flex-1 flex flex-col h-full w-full min-h-0 space-y-0">
              
              <FormControl className="flex-1 flex flex-col min-h-0">
                <Textarea
                  placeholder={`Escribe aquí... La IA adaptará tu texto al estilo de "${currentArchetype?.title || 'tu arquetipo'}"...`}
                  className="flex-1 w-full resize-none border-0 focus-visible:ring-0 text-base md:text-xl leading-relaxed p-4 md:p-6 bg-transparent text-foreground placeholder:text-muted-foreground/50 scrollbar-hide min-h-0"
                  {...field}
                />
              </FormControl>
              
              {/* BOTONERA RÍGIDA */}
              <div className="flex-shrink-0 p-3 md:p-4 bg-gradient-to-t from-white/95 via-white/90 dark:from-black/90 dark:via-black/80 to-transparent border-t border-black/5 dark:border-white/5 backdrop-blur-md z-10">
                 <VoiceInput onTextGenerated={handleVoiceGoal} className="w-full" />
                 <FormMessage className="mt-1 text-center text-[10px] text-red-500 dark:text-red-400" />
              </div>

            </FormItem>
          )}
        />
      </div>
      
      {/* ESPACIADOR FINAL */}
      <div className="h-2 flex-shrink-0" />
    </div>
  );
}